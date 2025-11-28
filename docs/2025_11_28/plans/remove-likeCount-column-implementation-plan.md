# Implementation Plan: Remove Denormalized likeCount Column from Collections Table

**Generated**: 2025-11-28
**Original Request**: Remove the likeCount column from the collections database and use proper joins instead
**Refined Request**: Remove the denormalized likeCount column from the collections table in the Drizzle ORM schema and update all related database operations to fetch like counts dynamically through proper SQL joins with the likes table instead.

## Overview

**Estimated Duration**: 4-6 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

This plan removes the denormalized `likeCount` column from the `collections` table schema and updates all database operations to calculate like counts dynamically through SQL JOINs with the `likes` table. This improves data consistency by eliminating the denormalized counter that must be maintained through increment/decrement operations.

## Prerequisites

- [ ] Database backup completed
- [ ] All tests passing before starting
- [ ] Development environment running with database connection
- [ ] Confirm likes table has proper indexes for collection-specific queries (partial index on line 47-49 of social.schema.ts)

## Implementation Steps

### Step 1: Remove likeCount Column from Collections Schema

**What**: Remove the `likeCount` column definition, related index, and constraint from the collections schema
**Why**: This is the source of truth for the schema definition and must be updated first before any query changes
**Confidence**: High

**Files to Modify:**

- `src/lib/db/schema/collections.schema.ts` - Remove likeCount column, index, and constraint

**Changes:**

- Remove line 28: `likeCount: integer('like_count').default(DEFAULTS.COLLECTION.LIKE_COUNT).notNull(),`
- Remove line 53: `index('collections_public_like_count_idx').on(table.isPublic, sql\`${table.likeCount} DESC\`),`
- Remove line 60: `check('collections_like_count_non_negative', sql\`${table.likeCount} >= 0\`),`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Schema file has no TypeScript errors
- [ ] No references to `likeCount` remain in collections.schema.ts
- [ ] All validation commands pass

---

### Step 2: Remove LIKE_COUNT Default Constant

**What**: Remove the `LIKE_COUNT` constant from the COLLECTION defaults object
**Why**: This constant is no longer needed since the column no longer exists
**Confidence**: High

**Files to Modify:**

- `src/lib/constants/defaults.ts` - Remove LIKE_COUNT from COLLECTION defaults

**Changes:**

- Remove line 25: `LIKE_COUNT: 0,`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Constants file has no TypeScript errors
- [ ] DEFAULTS.COLLECTION.LIKE_COUNT no longer exists
- [ ] All validation commands pass

---

### Step 3: Remove Increment/Decrement Methods for Collections

**What**: Remove `incrementLikeCountAsync` and `decrementLikeCountAsync` methods for collection target type from SocialQuery
**Why**: These methods update the denormalized counter which no longer exists
**Confidence**: High

**Files to Modify:**

- `src/lib/queries/social/social.query.ts` - Remove collection cases from increment/decrement methods

**Changes:**

- In `decrementLikeCountAsync` method (lines 121-144): Remove case for `ENUMS.LIKE.TARGET_TYPE[1]` (collection case, lines 135-140)
- In `incrementLikeCountAsync` method (lines 771-794): Remove case for `ENUMS.LIKE.TARGET_TYPE[1]` (collection case, lines 785-790)
- Update TypeScript return type or method signature if needed to reflect that collections are no longer supported

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No TypeScript errors in social.query.ts
- [ ] increment/decrement methods no longer handle collection target type
- [ ] All validation commands pass

---

### Step 4: Remove Denormalized Counter Updates in SocialFacade

**What**: Remove the increment/decrement like count calls for collections in the `toggleLike` method
**Why**: The facade currently updates the denormalized counter when likes are toggled, which is no longer needed
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/social/social.facade.ts` - Remove counter update calls in toggleLike method

**Changes:**

- In `toggleLike` method (lines 737-801): Remove calls to `SocialQuery.decrementLikeCountAsync` (line 755) and `SocialQuery.incrementLikeCountAsync` (line 777) when targetType is 'collection'
- Keep the calls to `SocialQuery.getLikeCountAsync` for the actual dynamic count retrieval (lines 759 and 781)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] No TypeScript errors in social.facade.ts
- [ ] toggleLike method no longer updates denormalized counters for collections
- [ ] Dynamic like count retrieval still works via getLikeCountAsync
- [ ] All validation commands pass

---

### Step 5: Update Collections Browse Queries with Dynamic Counts

**What**: Replace direct `collections.likeCount` references with LEFT JOIN to likes table plus COUNT aggregation in browse queries
**Why**: These queries currently read from the denormalized column and need to calculate counts dynamically
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/collections/collections.query.ts` - Update getBrowseCategoriesAsync and getBrowseCollectionsAsync

**Changes:**

- In `getBrowseCategoriesAsync` method (lines 358-618):
  - Replace `likeCount: collections.likeCount` in select statement (line 462) with dynamic count using LEFT JOIN
  - Add LEFT JOIN to likes table with conditions: `eq(likes.targetId, collections.id), eq(likes.targetType, 'collection')`
  - Use `COUNT(likes.id)` or similar aggregation for like count
  - Add `collections.id` to GROUP BY clause
  - Replace line 501 `likeCount: row.likeCount` in result mapping
  - Replace line 593 `likeCount: row.likeCount` in second result mapping
- In `getBrowseCollectionsAsync` method (lines 620-769):
  - Replace `likeCount: collections.likeCount` in select statement (line 706) with dynamic count
  - Add LEFT JOIN to likes table
  - Use COUNT aggregation for like count
  - Add GROUP BY clause
  - Replace line 744 `likeCount: row.likeCount` in result mapping
- In `_getBrowseSortOrder` method (lines 963-977): Keep sortBy case for 'likeCount' but update to use the aggregated count column alias instead of `collections.likeCount`

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Browse queries use LEFT JOIN with likes table
- [ ] COUNT aggregation provides dynamic like counts
- [ ] GROUP BY includes all non-aggregated columns
- [ ] Sort by likeCount still works with aggregated column
- [ ] All validation commands pass

---

### Step 6: Update Featured Content Queries with Dynamic Counts

**What**: Replace `collections.likeCount` with dynamic JOIN-based count in featured content queries
**Why**: Featured content displays use collection like counts from the denormalized column
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/featured-content/featured-content-query.ts` - Update featured collections queries

**Changes:**

- In `getActiveFeaturedContentAsync` method (lines 281-339): Remove `bobbleheadLikes: bobbleheads.likeCount` from select (line 291) or add LEFT JOIN for collection likes if needed
- In `getFeaturedBobbleheadAsync` method (lines 347-380): Update `likes: bobbleheads.likeCount` (line 358) - this is for bobbleheads, verify if collections need updating
- In `getFeaturedCollectionsAsync` method (lines 389-450):
  - Replace `likes: collections.likeCount` in select (line 407) with dynamic count
  - Add LEFT JOIN to likes table for collections: `LEFT JOIN likes ON likes.target_id = collections.id AND likes.target_type = 'collection'`
  - Use COUNT aggregation: `COUNT(DISTINCT collection_likes.id) as like_count`
  - Note: There's already a LEFT JOIN to likes for user like status (lines 428-437), use alias to differentiate
  - Add GROUP BY clause with all non-aggregated columns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Featured collections query uses dynamic like counts via JOIN
- [ ] Existing user like status JOIN still works (uses different alias)
- [ ] COUNT aggregation correctly calculates like counts
- [ ] All validation commands pass

---

### Step 7: Generate and Apply Database Migration

**What**: Create and run a Drizzle migration to drop the likeCount column from the collections table
**Why**: The database schema must match the TypeScript schema definition
**Confidence**: High

**Files to Create:**

- Database migration file (auto-generated by drizzle-kit)

**Changes:**

- Run `npm run db:generate` to create migration for dropping the column
- Review the generated migration SQL to ensure it only drops the column, index, and constraint
- Run `npm run db:migrate` to apply the migration to the database
- Verify column is dropped using database inspection tool or query

**Validation Commands:**

```bash
npm run db:generate
npm run db:migrate
npm run typecheck
```

**Success Criteria:**

- [ ] Migration file generated successfully
- [ ] Migration drops likeCount column, index, and constraint
- [ ] Migration applied without errors
- [ ] Database schema matches TypeScript schema
- [ ] All validation commands pass

---

### Step 8: Update Integration Tests for Featured Content

**What**: Update test expectations to match dynamic like counts instead of denormalized column values
**Why**: Tests currently expect and assert on the old denormalized likeCount values
**Confidence**: Medium

**Files to Modify:**

- `tests/integration/facades/featured-content/featured-content.facade.test.ts` - Update assertions
- `tests/integration/queries/featured-content/featured-content-query.test.ts` - Update assertions

**Changes:**

- Search for assertions on `likeCount` or `likes` fields in test expectations
- Update test data setup to create likes in the likes table instead of setting denormalized counts
- Update assertions to verify dynamic counts match the number of like records created
- Ensure test factories create proper like records when testing featured content with likes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
npm run test tests/integration/facades/featured-content/
npm run test tests/integration/queries/featured-content/
```

**Success Criteria:**

- [ ] All featured content facade tests pass
- [ ] All featured content query tests pass
- [ ] Tests verify dynamic like counts correctly
- [ ] All validation commands pass

---

### Step 9: Update Database Seed Script

**What**: Remove likeCount initialization from collection seed data
**Why**: Seed script should not set values for columns that no longer exist
**Confidence**: High

**Files to Modify:**

- `src/lib/db/scripts/seed.ts` - Remove likeCount from collection creation

**Changes:**

- Search for collection creation/insertion statements
- Remove any `likeCount: 0` or similar likeCount property assignments
- Ensure seed script creates like records in the likes table instead for test data

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Seed script has no TypeScript errors
- [ ] No likeCount property set on collection insertions
- [ ] Like records created in likes table if needed for seed data
- [ ] All validation commands pass

---

### Step 10: Verify Browse Collections Sort Still Works

**What**: Verify that sorting by likeCount in browse collections validation schema still functions with dynamic counts
**Why**: The validation schema allows sorting by likeCount, must ensure this works with aggregated counts
**Confidence**: High

**Files to Modify:**

- `src/lib/validations/browse-collections.validation.ts` - Verify schema (likely no changes needed)

**Changes:**

- Review line 14: `BROWSE_COLLECTIONS_SORT_BY` includes 'likeCount'
- Verify this still works with the aggregated count column from Step 5
- No code changes expected, but add comment if needed to document the dynamic count behavior
- Test manually or via integration test that sort by likeCount works

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Validation schema unchanged or has clarifying comments
- [ ] Sort by likeCount option still valid
- [ ] All validation commands pass

---

### Step 11: Verify Collections Facade Uses Dynamic Counts

**What**: Verify that CollectionsFacade methods correctly return dynamic like counts
**Why**: Ensure the facade layer properly exposes like counts from the updated queries
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/collections/collections.facade.ts` - Verify no changes needed

**Changes:**

- Review `browseCategories` method (lines 69-267) - should return results with dynamic counts from query layer
- Review `browseCollections` method (lines 272-471) - should return results with dynamic counts from query layer
- No code changes expected since facade delegates to query layer
- Verify that CollectionRecord type includes likeCount (if not, update type definition)

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Facade methods return collections with dynamic like counts
- [ ] No TypeScript errors in collections.facade.ts
- [ ] All validation commands pass

---

### Step 12: Run Full Test Suite and Verify

**What**: Run the complete test suite to catch any missed dependencies on the removed column
**Why**: Comprehensive validation that all code paths work with dynamic like counts
**Confidence**: High

**Files to Modify:**

- No files modified in this step

**Changes:**

- Run full test suite with `npm run test`
- Fix any failing tests that depend on the removed likeCount column
- Update test expectations to use dynamic counts
- Verify integration tests pass with real database queries

**Validation Commands:**

```bash
npm run test
npm run lint:fix
npm run typecheck
npm run build
```

**Success Criteria:**

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Production build succeeds
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All tests pass with `npm run test`
- [ ] Database migration successfully applied
- [ ] Production build completes with `npm run build`
- [ ] Manual verification: Browse collections page displays correct like counts
- [ ] Manual verification: Featured collections display correct like counts
- [ ] Manual verification: Toggling likes on collections updates counts correctly

## Notes

**Important Considerations:**

- The likes table already has proper indexes including a partial index for collection-specific likes (`likes_collection_target_idx` on line 47-49 of social.schema.ts), which will optimize the JOIN queries
- The sort by likeCount feature in browse collections will still work but may be slower since it requires aggregation - monitor query performance
- Cache invalidation patterns in CacheService should continue to work since they invalidate by collection ID
- This change improves data consistency by eliminating the dual-write problem where likes must update both the likes table and the denormalized counter

**Risk Mitigation:**

- Database backup is required before applying migration (reversible via backup restoration)
- The migration only drops a column and does not require data transformation
- Existing likes data in the likes table is preserved and will be used for dynamic counts
- If performance issues arise, consider adding a materialized view or computed column in the future

**Performance Considerations:**

- Browse queries with sorting by likeCount will require COUNT aggregation, which may be slower than reading a denormalized column
- The partial index on likes table for collections should mitigate most performance impact
- Monitor query execution times in production, especially for browse collections sorted by popularity
- Consider adding EXPLAIN ANALYZE to verify query plans use indexes effectively
