# Technical Reference: Slug-Based URL Migration

**Document Version**: 1.0
**Date**: 2025-11-13
**Audience**: Developers, Database Administrators

---

## Table of Contents

1. [Schema Specifications](#schema-specifications)
2. [Migration SQL](#migration-sql)
3. [Constraint Rules](#constraint-rules)
4. [Index Specifications](#index-specifications)
5. [Slug Generation](#slug-generation)
6. [Query Examples](#query-examples)
7. [Performance Notes](#performance-notes)
8. [Troubleshooting](#troubleshooting)

---

## Schema Specifications

### Bobbleheads Table

```sql
Column Name:    slug
Data Type:      VARCHAR(100)
Nullable:       TRUE
Default Value:  NULL
Constraints:    UNIQUE
Index:          bobbleheads_slug_idx (BTREE)
```

**Properties**:

- Global uniqueness across all bobbleheads
- Each bobblehead has one distinct, shareable URL slug
- Descriptive and human-readable identifier

**Storage**: VARCHAR(100) supports slugs up to 100 characters

- Typical slug: 15-40 characters
- Reserve capacity for long names

---

### Collections Table

```sql
Column Name:    slug
Data Type:      VARCHAR(100)
Nullable:       TRUE
Default Value:  NULL
Constraints:    UNIQUE (user_id, slug) [Composite]
Index:          collections_slug_idx (BTREE)
```

**Properties**:

- Unique per user (composite constraint)
- Users can have collections named "My Collection"
- Same slug name reusable across different users
- Primary key for user-specific collection URLs

**Scope**: (user_id, slug) uniqueness ensures:

- User A: "my-collection-a1b2" is unique
- User B: Can also have "my-collection-x9y8" without conflict

---

### Sub Collections Table

```sql
Column Name:    slug
Data Type:      VARCHAR(100)
Nullable:       FALSE
Default Value:  'temp'
Constraints:    UNIQUE (collection_id, slug) [Composite]
Indexes:
  - sub_collections_slug_idx (BTREE)
  - sub_collections_collection_slug_unique (BTREE, UNIQUE)
```

**Properties**:

- Unique per collection (composite constraint)
- NOT NULL to ensure all records have slugs
- Sub-collections scoped within a collection
- Cannot have duplicate slugs within same collection

**Scope**: (collection_id, slug) uniqueness ensures:

- Collection A: "vintage-items-x1y2" is unique
- Collection B: Can also have "vintage-items-z9w8" without conflict

---

## Migration SQL

### Complete Transaction

```sql
BEGIN;

-- Step 1: Add slug column to sub_collections table
ALTER TABLE "sub_collections"
  ADD COLUMN "slug" VARCHAR(100) NOT NULL DEFAULT 'temp';

-- Step 2: Populate slug values for sub_collections
UPDATE "sub_collections"
SET "slug" = LOWER(REGEXP_REPLACE(
  CONCAT(name, '-', SUBSTRING(id::text, 1, 8)),
  '[^a-z0-9\-]+',
  '-',
  'g'
));

-- Step 3: Populate null slug values in collections
UPDATE "collections"
SET "slug" = LOWER(REGEXP_REPLACE(
  CONCAT(name, '-', SUBSTRING(id::text, 1, 8)),
  '[^a-z0-9\-]+',
  '-',
  'g'
))
WHERE "slug" IS NULL;

-- Step 4: Create index for sub_collections slug lookups
CREATE INDEX "sub_collections_slug_idx"
ON "sub_collections" USING BTREE ("slug");

-- Step 5: Create composite unique index for sub_collections
CREATE UNIQUE INDEX "sub_collections_collection_slug_unique"
ON "sub_collections" USING BTREE ("collection_id", "slug");

-- Step 6: Add unique constraint to bobbleheads slug
ALTER TABLE "bobbleheads"
ADD CONSTRAINT "bobbleheads_slug_unique" UNIQUE("slug");

-- Step 7: Add composite unique constraint to collections
ALTER TABLE "collections"
ADD CONSTRAINT "collections_user_slug_unique" UNIQUE("user_id", "slug");

COMMIT;
```

---

## Constraint Rules

### Bobbleheads - Global Unique

```sql
CONSTRAINT "bobbleheads_slug_unique" UNIQUE("slug")
```

**Rule**: Each bobblehead must have a unique slug

- Prevents duplicate URLs
- Enables direct slug-based lookup
- Example: `/bobbleheads/super-saiyan-a1b2c3d4`

**Violation Handling**: INSERT/UPDATE fails if slug already exists

---

### Collections - User-Scoped Unique

```sql
CONSTRAINT "collections_user_slug_unique" UNIQUE("user_id", "slug")
```

**Rule**: Slugs unique per user, but reusable across users

- User A can have `"my-collection-a1b2"`
- User B can also have `"my-collection-x9y8"`
- User A cannot have duplicate `"my-collection-a1b2"` (different slug)

**Enforcement**: PostgreSQL enforces at INSERT/UPDATE

- Checks both user_id AND slug together
- NULL handling: If user_id is NULL, constraint is ignored (per SQL standard)

---

### Sub Collections - Collection-Scoped Unique

```sql
CONSTRAINT "sub_collections_collection_slug_unique" UNIQUE("collection_id", "slug")
```

**Rule**: Slugs unique per collection, but reusable across collections

- Collection A can have `"vintage-items-x1y2"`
- Collection B can also have `"vintage-items-z9w8"`
- Collection A cannot have duplicate `"vintage-items-x1y2"` (different slug)

**Enforcement**: PostgreSQL enforces at INSERT/UPDATE

- Hierarchical scoping prevents conflicts in URL routing
- Example: `/user/collection-a/vintage-items-x1y2`

---

## Index Specifications

### Index: bobbleheads_slug_idx

```sql
CREATE INDEX "bobbleheads_slug_idx"
ON public.bobbleheads USING BTREE ("slug");
```

**Properties**:

- Type: BTREE (standard for string searches)
- Column: slug (VARCHAR(100))
- Size: ~16 kB
- Purpose: Fast lookups by slug
- Query Type: Optimal for `WHERE slug = 'value'`

---

### Index: collections_slug_idx

```sql
CREATE INDEX "collections_slug_idx"
ON public.collections USING BTREE ("slug");
```

**Properties**:

- Type: BTREE
- Column: slug (VARCHAR(100))
- Size: ~16 kB
- Purpose: Support for filtered queries
- Query Pattern: Used with user_id filter

---

### Index: sub_collections_slug_idx

```sql
CREATE INDEX "sub_collections_slug_idx"
ON public.sub_collections USING BTREE ("slug");
```

**Properties**:

- Type: BTREE
- Column: slug (VARCHAR(100))
- Size: ~16 kB
- Purpose: Support for collection-level lookups
- Query Pattern: WHERE collection_id = X AND slug = 'Y'

---

### Unique Index: sub_collections_collection_slug_unique

```sql
CREATE UNIQUE INDEX "sub_collections_collection_slug_unique"
ON public.sub_collections USING BTREE ("collection_id", "slug");
```

**Properties**:

- Type: UNIQUE BTREE
- Columns: (collection_id, slug) composite
- Size: ~16 kB
- Purpose: Enforce composite uniqueness + fast lookups
- Query Pattern: Efficient for scoped slug lookups

---

## Slug Generation

### Algorithm

```typescript
function generateSlug(name: string, id: UUID): string {
  // 1. Combine name with first 8 chars of UUID
  const combined = `${name}-${id.toString().substring(0, 8)}`;

  // 2. Convert to lowercase
  const lowercased = combined.toLowerCase();

  // 3. Replace non-alphanumeric with hyphens
  const slug = lowercased.replace(/[^a-z0-9\-]+/g, '-');

  // 4. Return cleaned slug (max 100 chars)
  return slug.substring(0, 100);
}
```

### PostgreSQL Implementation

```sql
LOWER(REGEXP_REPLACE(
  CONCAT(name, '-', SUBSTRING(id::text, 1, 8)),
  '[^a-z0-9\-]+',
  '-',
  'g'
))
```

### Examples

```
Input: name="My Collection", id="a1b2c3d4-..."
Output: "my-collection-a1b2c3d4"

Input: name="Sports & Heroes", id="e5f6g7h8-..."
Output: "sports-heroes-e5f6g7h8"

Input: name="2024 Favorites!", id="l3m4n5o6-..."
Output: "2024-favorites-l3m4n5o6"

Input: name="Café Collection", id="p7q8r9s0-..."
Output: "cafe-collection-p7q8r9s0"
```

### Behavior

**URL-Safe Characters**:

- Lowercase letters (a-z)
- Numbers (0-9)
- Hyphens (-)

**Transformed Characters**:

- Spaces → Hyphens
- Underscores → Hyphens
- Accented characters → Base character
- Special characters → Hyphens
- Consecutive hyphens → Single hyphen

**UUID Inclusion**:

- First 8 characters of UUID appended
- Provides collision prevention
- Makes slug more unique while staying readable

---

## Query Examples

### Find Bobblehead by Slug

```sql
SELECT * FROM bobbleheads
WHERE slug = 'super-saiyan-a1b2c3d4';
```

**Expected Result**: 1 row (unique constraint enforced)
**Index Used**: bobbleheads_slug_idx

---

### Find User's Collections by Slug

```sql
SELECT * FROM collections
WHERE user_id = $1 AND slug = 'my-collection-a1b2c3d4';
```

**Expected Result**: 1 row (user_id + slug unique)
**Indexes Used**: collections_user_id_idx, collections_slug_idx

---

### Find Sub Collection by Path

```sql
SELECT sc.* FROM sub_collections sc
JOIN collections c ON sc.collection_id = c.id
WHERE c.user_id = $1
  AND c.slug = 'my-collection-a1b2c3d4'
  AND sc.slug = 'vintage-items-x1y2';
```

**Expected Result**: 1 row (scoped lookup)
**Indexes Used**: collections_user_slug_unique, sub_collections_collection_slug_unique

---

### Get All Collections for User

```sql
SELECT * FROM collections
WHERE user_id = $1
ORDER BY created_at DESC;
```

**No Slug Filter**: Full list for user
**Index Used**: collections_user_id_idx

---

### Check Slug Availability for New Collection

```sql
SELECT COUNT(*) FROM collections
WHERE user_id = $1 AND slug = $2;
```

**Expected Result**: 0 (slug available) or >0 (slug taken)
**Use Case**: Validate slug before INSERT

---

## Performance Notes

### Index Performance

**Single Column Lookups**:

- Query: `WHERE slug = 'value'`
- Complexity: O(log n)
- Estimated Rows: 1

**Composite Lookups**:

- Query: `WHERE collection_id = X AND slug = 'Y'`
- Complexity: O(log n) with pre-filtered collection_id
- Estimated Rows: 1 (enforced by constraint)

**Full Table Scans**:

- Avoided when using indexed columns
- Avoid queries like `WHERE slug LIKE 'value%'` if possible

---

### Constraint Overhead

**INSERT Performance Impact**: <1ms per insert

- Constraint check: O(log n) via index
- No blocking expected

**UPDATE Performance Impact**: <1ms per update

- If slug changes: Constraint validated
- If slug unchanged: No constraint re-check

**Storage Impact**: Minimal

- VARCHAR(100) = 100 bytes maximum
- 12 records × 100 bytes = 1.2 kB data
- Index overhead: ~48 kB total (amortized)

---

## Troubleshooting

### Duplicate Slug Error

**Error**: `duplicate key value violates unique constraint`

**Cause**: Attempting INSERT/UPDATE with duplicate slug

**Solution**:

1. Check existing slugs for the scope:
   ```sql
   SELECT slug FROM collections WHERE user_id = $1;
   ```
2. Generate alternative slug (append number, adjust name)
3. Retry with new slug value

---

### NULL Slug Values

**Error**: `violates not-null constraint`

**Cause**: Attempting INSERT into sub_collections without slug

**Solution**:

1. Always provide slug value for sub_collections
2. Use slug generation function before INSERT
3. Verify application generates slugs before database operations

---

### Index Not Used

**Symptom**: Query slower than expected

**Check**:

```sql
EXPLAIN ANALYZE
SELECT * FROM collections
WHERE user_id = $1 AND slug = $2;
```

**Expected Plan**: Index Scan using collections_user_slug_unique

**If Full Scan Occurs**:

1. Check statistics: `ANALYZE collections;`
2. Check index integrity: `REINDEX INDEX collections_slug_idx;`
3. Review query optimizer settings

---

### Performance Degradation

**Symptom**: Slug lookups getting slower

**Root Causes**:

1. Missing statistics: Run `ANALYZE` on affected tables
2. Bloated indexes: Run `VACUUM FULL` + `REINDEX`
3. Index fragmentation: Rebuild with `REINDEX`

**Monitoring**:

```sql
SELECT schemaname, tablename, idx, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx LIKE '%slug%';
```

---

## Best Practices

1. **Always Generate Slugs**: Use consistent algorithm for all tables
2. **Validate Slugs**: Check availability before INSERT
3. **Preserve Slugs**: Don't modify slugs after creation (breaks URLs)
4. **Monitor Indexes**: Track index usage and performance
5. **Document URLs**: Keep URL patterns documented for frontend developers
6. **Test Edge Cases**: Special characters, long names, duplicates

---

**End of Technical Reference**
