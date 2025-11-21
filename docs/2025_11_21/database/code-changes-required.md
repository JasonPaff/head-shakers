# Code Changes Required - Nested Comments FK Fix

## Overview

One file needs modification to complete the nested comments feature.

---

## File 1: `src/lib/db/schema/social.schema.ts`

### Location

Line 108

### Current Code

```typescript
export const comments = pgTable(
  'comments',
  {
    content: varchar('content', { length: SCHEMA_LIMITS.COMMENT.CONTENT.MAX }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(DEFAULTS.COMMENT.IS_DELETED).notNull(),
    isEdited: boolean('is_edited').default(DEFAULTS.COMMENT.IS_EDITED).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.COMMENT.LIKE_COUNT).notNull(),
    parentCommentId: uuid('parent_comment_id'),  // ❌ MISSING FK REFERENCE
    targetId: uuid('target_id').notNull(),
    targetType: commentTargetTypeEnum('comment_target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
```

### Change Required

**Line 108 - Change from**:

```typescript
parentCommentId: uuid('parent_comment_id'),
```

**To**:

```typescript
parentCommentId: uuid('parent_comment_id')
  .references(() => comments.id, { onDelete: 'cascade' }),
```

### Full Updated Section

```typescript
export const comments = pgTable(
  'comments',
  {
    content: varchar('content', { length: SCHEMA_LIMITS.COMMENT.CONTENT.MAX }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(DEFAULTS.COMMENT.IS_DELETED).notNull(),
    isEdited: boolean('is_edited').default(DEFAULTS.COMMENT.IS_EDITED).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.COMMENT.LIKE_COUNT).notNull(),
    parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }), // ✅ FIXED - Added FK reference
    targetId: uuid('target_id').notNull(),
    targetType: commentTargetTypeEnum('comment_target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => [
    // ... rest of indexes and constraints remain unchanged
  ],
);
```

### Explanation

The change adds a foreign key reference from `comments.parentCommentId` to `comments.id`:

- `.references(() => comments.id)` - Creates self-referential foreign key
- `{ onDelete: 'cascade' }` - When parent comment is deleted, child comments are automatically deleted
- Maintains consistency with the existing `userId` foreign key pattern

---

## Verification: What This Change Does

### Before (Current)

```sql
-- Column exists but no constraint
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  parent_comment_id uuid,  -- Can reference anything or nothing
  -- other columns...
);

-- This would be allowed (bad):
INSERT INTO comments (id, content, user_id, target_id, target_type, parent_comment_id)
VALUES ('child-id', 'Reply', 'user-id', 'target-id', 'bobblehead', 'non-existent-parent-id');
```

### After (Fixed)

```sql
-- Column with foreign key constraint
CREATE TABLE comments (
  id uuid PRIMARY KEY,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  -- other columns...
);

-- This would be REJECTED (good):
INSERT INTO comments (id, content, user_id, target_id, target_type, parent_comment_id)
VALUES ('child-id', 'Reply', 'user-id', 'target-id', 'bobblehead', 'non-existent-parent-id');
-- ERROR: insert or update on table "comments" violates foreign key constraint

-- This is ALLOWED:
INSERT INTO comments (id, content, user_id, target_id, target_type, parent_comment_id)
VALUES ('child-id', 'Reply', 'user-id', 'target-id', 'bobblehead', 'valid-parent-id');
```

---

## Step-by-Step Implementation

### Step 1: Open the File

```bash
code src/lib/db/schema/social.schema.ts
```

### Step 2: Find Line 108

Search for: `parentCommentId: uuid('parent_comment_id'),`

### Step 3: Edit the Line

Replace:

```typescript
parentCommentId: uuid('parent_comment_id'),
```

With:

```typescript
parentCommentId: uuid('parent_comment_id')
  .references(() => comments.id, { onDelete: 'cascade' }),
```

### Step 4: Save File

Use Ctrl+S or File > Save

### Step 5: Generate Migration

```bash
npm run db:generate
```

This creates a new migration file with the SQL to add the foreign key constraint.

### Step 6: Review Migration

```bash
# List migration files
ls src/lib/db/migrations/

# The newest file should add the FK constraint
cat src/lib/db/migrations/0000_*.sql
```

Expected SQL:

```sql
-- Add self-referential foreign key for nested comments
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_fk"
FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;
```

### Step 7: Apply Migration

```bash
npm run db:migrate
```

### Step 8: Verify in Database

```bash
# Check the constraint exists
npm run db:exec -- "SELECT constraint_name FROM information_schema.table_constraints WHERE table_name='comments' AND constraint_type='FOREIGN KEY';"
```

Should output:

```
 constraint_name
 -----------
 comments_user_id_users_id_fk
 comments_parent_comment_id_fk  <-- This should now be present
```

---

## Syntax Comparison

### Comparing with Other FKs in the File

Your change follows the same pattern as existing foreign keys:

**Example 1 - users table follows**:

```typescript
export const follows = pgTable('follows', {
  followerId: uuid('follower_id')
    .references(() => users.id, { onDelete: 'cascade' }) // Same pattern
    .notNull(),
});
```

**Example 2 - comments table user FK**:

```typescript
export const comments = pgTable('comments', {
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' }) // Same pattern
    .notNull(),
});
```

**Your change - comments table parent FK**:

```typescript
export const comments = pgTable('comments', {
  parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }), // Same pattern
  // Note: NOT .notNull() - parent_comment_id is nullable (allows top-level comments)
});
```

The only difference is:

- Parent FK is **not** `.notNull()` (allows NULL for top-level comments)
- User FK **is** `.notNull()` (every comment must have a creator)

---

## Before/After Diff

```diff
export const comments = pgTable(
  'comments',
  {
    content: varchar('content', { length: SCHEMA_LIMITS.COMMENT.CONTENT.MAX }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
    editedAt: timestamp('edited_at'),
    id: uuid('id').primaryKey().defaultRandom(),
    isDeleted: boolean('is_deleted').default(DEFAULTS.COMMENT.IS_DELETED).notNull(),
    isEdited: boolean('is_edited').default(DEFAULTS.COMMENT.IS_EDITED).notNull(),
    likeCount: integer('like_count').default(DEFAULTS.COMMENT.LIKE_COUNT).notNull(),
-   parentCommentId: uuid('parent_comment_id'),
+   parentCommentId: uuid('parent_comment_id')
+     .references(() => comments.id, { onDelete: 'cascade' }),
    targetId: uuid('target_id').notNull(),
    targetType: commentTargetTypeEnum('comment_target_type').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
```

---

## Common Questions

### Q: Will this affect existing comments?

**A**: No. This only adds a constraint going forward. Existing data is unaffected (and valid - all are top-level comments with NULL parent_comment_id).

### Q: Do I need to migrate data?

**A**: No. The migration only adds the constraint. No data changes needed.

### Q: Will this slow down queries?

**A**: No. The constraint uses the existing `comments_parent_comment_id_idx` index.

### Q: Can I rollback?

**A**: Yes. If needed: `npm run db:migrate -- --revert`

### Q: What if I make a typo?

**A**: The migration will fail with a clear error. Fix the code and rerun `npm run db:generate` and `npm run db:migrate`.

---

## Testing the Change

### Unit Test Example

Add to `tests/lib/db/comments.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { db } from '@/lib/db';
import { comments } from '@/lib/db/schema/social.schema';
import { eq } from 'drizzle-orm';

describe('Nested Comments - FK Constraint', () => {
  it('should reject invalid parent_comment_id', async () => {
    expect(async () => {
      await db.insert(comments).values({
        content: 'Reply to non-existent comment',
        userId: 'user-id',
        targetId: 'target-id',
        targetType: 'bobblehead',
        parentCommentId: 'non-existent-parent-id', // Invalid!
      });
    }).rejects.toThrow(); // FK constraint should reject this
  });

  it('should allow NULL parent_comment_id for top-level', async () => {
    const result = await db
      .insert(comments)
      .values({
        content: 'Top-level comment',
        userId: 'user-id',
        targetId: 'target-id',
        targetType: 'bobblehead',
        parentCommentId: null, // NULL = top-level, this is valid
      })
      .returning({ id: comments.id });

    expect(result).toHaveLength(1);
  });

  it('should cascade delete child comments', async () => {
    // Create parent
    const parent = await db
      .insert(comments)
      .values({
        content: 'Parent',
        userId: 'user-id',
        targetId: 'target-id',
        targetType: 'bobblehead',
      })
      .returning({ id: comments.id });

    // Create child
    await db.insert(comments).values({
      content: 'Child',
      userId: 'user-id',
      targetId: 'target-id',
      targetType: 'bobblehead',
      parentCommentId: parent[0].id,
    });

    // Delete parent
    await db.delete(comments).where(eq(comments.id, parent[0].id));

    // Child should also be deleted (cascade)
    const childCount = await db.select().from(comments).where(eq(comments.parentCommentId, parent[0].id));

    expect(childCount).toHaveLength(0);
  });
});
```

Run tests:

```bash
npm run test -- comments.test.ts
```

---

## Summary

- **File**: `src/lib/db/schema/social.schema.ts`
- **Line**: 108
- **Change**: Add `.references(() => comments.id, { onDelete: 'cascade' })`
- **Time**: 2 minutes to edit
- **Commands**: `npm run db:generate && npm run db:migrate`
- **Testing**: Run `npm run test`

That's it! One line change completes the nested comments feature.

---

## Related Files to Review

After making the change, you might want to check:

1. **Schema File**: `src/lib/db/schema/social.schema.ts`
2. **Validation Report**: `docs/2025_11_21/database/nested-comments-validation.md`
3. **Fix Guide**: `docs/2025_11_21/database/fix-nested-comments-fk.md`
4. **API Handler**: Look for comment-related server actions in `src/lib/actions/`
5. **Tests**: Check `tests/lib/db/` for comment tests

---

**Ready to implement? Start with the one-line change in `src/lib/db/schema/social.schema.ts`!**
