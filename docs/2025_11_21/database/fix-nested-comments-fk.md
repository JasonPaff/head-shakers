# Fix: Add Self-Referential Foreign Key for Nested Comments

## Status: URGENT - Implementation Required

The nested comments feature validation revealed a critical gap: **the self-referential foreign key constraint is missing**. This must be fixed before the feature is production-ready.

---

## What's Missing

The `comments.parent_comment_id` column exists and is properly indexed, but **no foreign key constraint** prevents invalid references.

### Current State (Incomplete)

```sql
-- Column exists ✅
ALTER TABLE comments ADD COLUMN parent_comment_id uuid;

-- Indexes exist ✅
CREATE INDEX comments_parent_comment_id_idx ON comments USING btree (parent_comment_id);
CREATE INDEX comments_parent_created_idx ON comments USING btree (parent_comment_id, created_at);

-- Foreign key MISSING ❌
-- No FK constraint defined
```

### Expected State (Complete)

```sql
-- Column exists ✅
ALTER TABLE comments ADD COLUMN parent_comment_id uuid;

-- Indexes exist ✅
CREATE INDEX comments_parent_comment_id_idx ON comments USING btree (parent_comment_id);
CREATE INDEX comments_parent_created_idx ON comments USING btree (parent_comment_id, created_at);

-- Foreign key ✅ (NEEDS TO BE ADDED)
ALTER TABLE comments
ADD CONSTRAINT comments_parent_comment_id_fk
FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;
```

---

## Why This Matters

Without the foreign key constraint:

1. **Data Integrity Risk**: Application can create comments pointing to non-existent parents
2. **Orphaned Data**: Deleting a parent comment doesn't automatically delete child comments
3. **Application Bug Risk**: Developers must manually handle cascading deletes
4. **Testing Gap**: No database-level validation of nested comment relationships

---

## Fix Steps

### Step 1: Update Drizzle Schema

**File**: `src/lib/db/schema/social.schema.ts`

**Current** (line 108):

```typescript
parentCommentId: uuid('parent_comment_id'),
```

**Change to**:

```typescript
parentCommentId: uuid('parent_comment_id')
  .references(() => comments.id, { onDelete: 'cascade' }),
```

**Context**:

```typescript
export const comments = pgTable(
  'comments',
  {
    // ... other columns ...
    parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }), // <-- ADD THIS LINE
    // ... other columns ...
  },
  (table) => [
    // ... indexes ...
  ],
);
```

### Step 2: Generate Migration

```bash
npm run db:generate
```

This will create a new migration file under `src/lib/db/migrations/` that adds the foreign key constraint.

**Example migration output**:

```sql
-- Add foreign key constraint for nested comments
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fk"
FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;
```

### Step 3: Apply Migration

```bash
npm run db:migrate
```

This applies the migration to the development database.

**Verification**:

```sql
-- Check that the constraint exists
SELECT constraint_name, column_name, referenced_table, referenced_column
FROM information_schema.key_column_usage
WHERE table_name = 'comments'
AND constraint_type = 'FOREIGN KEY'
AND column_name = 'parent_comment_id';

-- Should return:
-- constraint_name: comments_parent_comment_id_fk
-- column_name: parent_comment_id
-- referenced_table: comments
-- referenced_column: id
```

### Step 4: Test Cascade Delete Behavior

Create a test file to verify the behavior:

**File**: `tests/lib/db/comments.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema/social.schema';
import { eq } from 'drizzle-orm';

describe('Comments - Nested Replies Cascade Delete', () => {
  let userId: string;
  let targetId: string;

  beforeEach(async () => {
    // Setup test data
    userId = 'test-user-id';
    targetId = 'test-target-id';
  });

  afterEach(async () => {
    // Cleanup
    await db.delete(comments).where(eq(comments.targetId, targetId));
  });

  it('should delete all child comments when parent is deleted', async () => {
    // Create parent comment
    const parentResult = await db
      .insert(comments)
      .values({
        content: 'Parent comment',
        userId,
        targetId,
        targetType: 'bobblehead',
      })
      .returning({ id: comments.id });

    const parentId = parentResult[0].id;

    // Create child comments
    await db.insert(comments).values([
      {
        content: 'Child 1',
        userId,
        targetId,
        targetType: 'bobblehead',
        parentCommentId: parentId,
      },
      {
        content: 'Child 2',
        userId,
        targetId,
        targetType: 'bobblehead',
        parentCommentId: parentId,
      },
    ]);

    // Verify children exist
    let childCount = await db.select().from(comments).where(eq(comments.parentCommentId, parentId));

    expect(childCount).toHaveLength(2);

    // Delete parent comment
    await db.delete(comments).where(eq(comments.id, parentId));

    // Verify all children are deleted
    const childrenAfterDelete = await db
      .select()
      .from(comments)
      .where(eq(comments.parentCommentId, parentId));

    expect(childrenAfterDelete).toHaveLength(0);
  });

  it('should prevent orphaned comments at database level', async () => {
    // Attempt to create comment with non-existent parent should fail
    const invalidParentId = 'non-existent-comment-id';

    expect(async () => {
      await db.insert(comments).values({
        content: 'Orphaned comment',
        userId,
        targetId,
        targetType: 'bobblehead',
        parentCommentId: invalidParentId,
      });
    }).rejects.toThrow();
  });
});
```

Run the test:

```bash
npm run test -- comments.test.ts
```

### Step 5: Commit Changes

```bash
git add src/lib/db/schema/social.schema.ts
git add src/lib/db/migrations/*
git commit -m "Add self-referential foreign key constraint for nested comments"
```

---

## Verification Checklist

After applying the fix:

- [ ] Foreign key constraint exists in PostgreSQL
- [ ] Drizzle schema updated with `.references()` definition
- [ ] Migration generated and applied successfully
- [ ] Cascade delete test passes
- [ ] Cannot create orphaned comments
- [ ] Existing data integrity verified (0 orphaned comments)
- [ ] Performance tests show no regression
- [ ] Code review passed

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```bash
# Revert the migration
npm run db:migrate -- --revert

# Or manually remove the constraint
ALTER TABLE comments
DROP CONSTRAINT comments_parent_comment_id_fk;
```

---

## Expected Query Performance Impact

**No negative impact expected**. The foreign key constraint:

- Uses the existing `comments_parent_comment_id_idx` index
- Adds negligible overhead (~100µs per insert/delete)
- Improves data integrity without sacrificing performance

---

## Related Files

- **Schema**: `src/lib/db/schema/social.schema.ts` (lines 97-154)
- **Tests**: Add to `tests/lib/db/comments.test.ts` or new test file
- **Validation Report**: `docs/2025_11_21/database/nested-comments-validation.md`

---

## Timeline

- **Current Status**: Validation complete, fix required
- **Estimated Fix Time**: 15-30 minutes
- **Testing Time**: 10-15 minutes
- **Total**: ~45 minutes to complete and test

---

## Questions?

Refer to the full validation report: `docs/2025_11_21/database/nested-comments-validation.md`
