# Implementation Plan: Remove Denormalized totalItems Column from Collections Table

Generated: 2025-11-28
Original Request: "I'd like you to remove the totalItems column from the collections database. Any queries that were using the totalItems field should instead include the proper joins to fetch that information in a differently."

## Overview

**Estimated Duration**: 2-3 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Remove the denormalized `totalItems` column from the collections table and replace all references with dynamic COUNT aggregations on the bobbleheads table, ensuring proper filtering for non-deleted bobbleheads per permission rules. This eliminates manual synchronization complexity while maintaining accurate item counts.

## Prerequisites

- [ ] Database backup completed (recommended before migration)
- [ ] Understanding of Drizzle ORM COUNT aggregations with JOINs
- [ ] Familiarity with existing permission filtering patterns in BaseQuery

## Implementation Steps

### Step 1: Update Schema Definition to Remove totalItems Column

**What**: Remove the totalItems column definition and its check constraint from collections.schema.ts
**Why**: This is the source of truth for the database structure and must be updated first before migration
**Confidence**: High

**Files to Modify:**
- `src/lib/db/schema/collections.schema.ts` - Remove totalItems column definition and check constraint

**Changes:**
- Remove totalItems column definition
- Remove check constraint `collections_total_items_non_negative`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] totalItems column definition removed from collections schema
- [ ] Check constraint removed from schema
- [ ] All validation commands pass

---

### Step 2: Remove totalItems Default Constant

**What**: Remove the TOTAL_ITEMS default value from constants/defaults.ts
**Why**: The constant is no longer needed after removing the column
**Confidence**: High

**Files to Modify:**
- `src/lib/constants/defaults.ts` - Remove TOTAL_ITEMS from COLLECTION defaults

**Changes:**
- Remove `TOTAL_ITEMS: 0` from DEFAULTS.COLLECTION

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] TOTAL_ITEMS constant removed from DEFAULTS.COLLECTION
- [ ] All validation commands pass

---

### Step 3: Update Validation Schema to Remove totalItems Omission

**What**: Remove totalItems from the omit list in insertCollectionSchema since the field no longer exists
**Why**: Keeps validation schema in sync with actual database schema
**Confidence**: High

**Files to Modify:**
- `src/lib/validations/collections.validation.ts` - Remove totalItems from omit list

**Changes:**
- Remove `totalItems: true` from the omit object

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] totalItems removed from insertCollectionSchema omit list
- [ ] All validation commands pass

---

### Step 4: Update getBrowseCategoriesAsync Query with Dynamic Count

**What**: Replace totalItems selection with dynamic COUNT aggregation on bobbleheads table
**Why**: This query displays collection metadata in browse categories view
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Update getBrowseCategoriesAsync method

**Changes:**
- Replace `totalItems: collections.totalItems` with dynamic COUNT subquery
- Add SQL subquery counting non-deleted bobbleheads for each collection
- Update transformation functions to use the computed count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Both occurrences in getBrowseCategoriesAsync replaced with COUNT subquery
- [ ] Subquery filters for deletedAt IS NULL
- [ ] All validation commands pass

---

### Step 5: Update getBrowseCollectionsAsync Query with Dynamic Count

**What**: Replace totalItems selection with dynamic COUNT aggregation on bobbleheads table
**Why**: This query displays collection metadata in browse collections view
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Update getBrowseCollectionsAsync method

**Changes:**
- Replace `totalItems: collections.totalItems` with dynamic COUNT subquery
- Add SQL subquery counting non-deleted bobbleheads
- Update transformation to use the computed count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] totalItems replaced with COUNT subquery in getBrowseCollectionsAsync
- [ ] Subquery filters for deletedAt IS NULL
- [ ] All validation commands pass

---

### Step 6: Update getCollectionMetadata Query with Dynamic Count

**What**: Replace totalItems selection with dynamic COUNT aggregation on bobbleheads table
**Why**: This query provides metadata for SEO and social sharing
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Update getCollectionMetadata method

**Changes:**
- Replace `itemCount: collections.totalItems` with dynamic COUNT using LEFT JOIN
- Add LEFT JOIN to bobbleheads table with deletedAt filter
- Use COUNT aggregation as itemCount
- Add GROUP BY clause for proper aggregation

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] itemCount computed via COUNT aggregation with LEFT JOIN
- [ ] Proper GROUP BY clause added for aggregation
- [ ] Filters for deletedAt IS NULL in JOIN condition
- [ ] All validation commands pass

---

### Step 7: Update getFeaturedCollectionsAsync Query with Dynamic Count

**What**: Replace totalItems selection with dynamic COUNT aggregation on bobbleheads table
**Why**: This query displays featured collections on homepage
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/featured-content/featured-content-query.ts` - Update getFeaturedCollectionsAsync method

**Changes:**
- Replace `totalItems: collections.totalItems` with dynamic COUNT subquery
- Add SQL subquery counting non-deleted bobbleheads

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] totalItems replaced with COUNT subquery in getFeaturedCollectionsAsync
- [ ] Subquery filters for deletedAt IS NULL
- [ ] All validation commands pass

---

### Step 8: Update FeaturedCollectionData Type Definition

**What**: Keep totalItems field in FeaturedCollectionData type but update JSDoc to indicate it's computed
**Why**: The type is used by UI components and the data structure remains the same, just computed differently
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/featured-content/featured-content-query.ts` - Add JSDoc comment to totalItems field

**Changes:**
- Add JSDoc comment to document that totalItems is computed from non-deleted bobbleheads count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] JSDoc comment added to document computed nature
- [ ] Type signature unchanged to maintain compatibility
- [ ] All validation commands pass

---

### Step 9: Update Content Search Queries with Dynamic Count

**What**: Replace totalItems selection with dynamic COUNT aggregation in all content search queries
**Why**: Admin content search uses totalItems for collection display
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/content-search/content-search.query.ts` - Update findCollectionByIdAsync, searchCollectionsAsync, and searchPublicCollections methods

**Changes:**
- Replace `totalItems: collections.totalItems` with dynamic COUNT subquery in all three methods
- Add SQL subquery counting non-deleted bobbleheads

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All three occurrences replaced with COUNT subquery
- [ ] Subqueries filter for deletedAt IS NULL
- [ ] All validation commands pass

---

### Step 10: Update CollectionSearchResult Type Definition

**What**: Update JSDoc for totalItems field to indicate it's computed dynamically
**Why**: Documents the implementation change for future developers
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/content-search/content-search.query.ts` - Add JSDoc comment to totalItems field

**Changes:**
- Add JSDoc comment to document that totalItems is computed from non-deleted bobbleheads count

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] JSDoc comment added to document computed nature
- [ ] Type signature unchanged to maintain compatibility
- [ ] All validation commands pass

---

### Step 11: Update Seed Script to Remove totalItems References

**What**: Remove totalItems from sample collection data and remove updateAggregates function
**Why**: Seed data should not include the removed column
**Confidence**: High

**Files to Modify:**
- `src/lib/db/scripts/seed.ts` - Remove totalItems from sample data and updateAggregates function

**Changes:**
- Remove all `totalItems: X` entries from collection sample data
- Remove the entire updateAggregates function if it exists
- Remove any calls to updateAggregates function

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All totalItems references removed from seed data
- [ ] updateAggregates function removed if present
- [ ] All validation commands pass

---

### Step 12: Update Mock Data for Tests

**What**: Remove totalItems from mock collection data
**Why**: Test mocks should reflect actual data structure
**Confidence**: High

**Files to Modify:**
- `tests/mocks/data/collections.mock.ts` - Remove totalItems from mock objects

**Changes:**
- Remove totalItems field from all mock collection objects
- Update factory functions to not include totalItems

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All totalItems references removed from mock data
- [ ] Mock objects match updated schema
- [ ] All validation commands pass

---

### Step 13: Generate and Review Database Migration

**What**: Generate Drizzle migration to drop the totalItems column and check constraint
**Why**: Database schema must be updated to match code changes
**Confidence**: High

**Files to Create:**
- New migration file in `src/lib/db/migrations/` - Generated by Drizzle

**Changes:**
- Run `npm run db:generate` to create migration
- Review generated migration SQL to ensure it drops the column and constraint correctly
- Verify migration includes DROP COLUMN and DROP CONSTRAINT statements

**Validation Commands:**
```bash
npm run db:generate
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Migration file generated successfully
- [ ] Migration includes DROP COLUMN statement for total_items
- [ ] Migration includes DROP CONSTRAINT statement for check constraint
- [ ] All validation commands pass

---

### Step 14: Update Integration Tests

**What**: Update integration tests to not expect totalItems in query results
**Why**: Tests must match updated query behavior
**Confidence**: Medium

**Files to Modify:**
- `tests/integration/queries/featured-content/featured-content-query.test.ts` - Update assertions
- `tests/integration/facades/featured-content/featured-content.facade.test.ts` - Update assertions

**Changes:**
- Update test assertions to verify totalItems is computed correctly
- Change expectations from static totalItems to dynamically computed counts
- Ensure tests verify counts match actual non-deleted bobblehead counts

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] All test assertions updated to expect computed totalItems
- [ ] Tests verify counts match non-deleted bobbleheads
- [ ] All validation commands pass

---

### Step 15: Run All Tests to Verify Changes

**What**: Execute complete test suite to ensure no regressions
**Why**: Validates that all changes work correctly together
**Confidence**: High

**Files to Modify:**
- None - verification step only

**Changes:**
- Run `npm run test` to execute all tests
- Verify all tests pass
- Address any failing tests by updating assertions or fixing queries

**Validation Commands:**
```bash
npm run test
```

**Success Criteria:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All component tests pass
- [ ] No TypeScript errors reported

---

### Step 16: Run Database Migration

**What**: Execute the generated migration against the database
**Why**: Applies the schema changes to remove totalItems column
**Confidence**: High

**Files to Modify:**
- None - database operation only

**Changes:**
- Run `npm run db:migrate` to apply migration
- Verify migration completes successfully
- Check database schema to confirm column is removed

**Validation Commands:**
```bash
npm run db:migrate
```

**Success Criteria:**
- [ ] Migration executes without errors
- [ ] total_items column removed from collections table
- [ ] collections_total_items_non_negative constraint removed
- [ ] Application starts without database errors

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] All tests pass `npm run test`
- [ ] Database migration executes successfully `npm run db:migrate`
- [ ] Application starts without errors after migration
- [ ] Browse collections page displays correct item counts
- [ ] Featured collections display shows correct item counts
- [ ] Admin content search shows correct collection item counts

## Notes

**Important Considerations:**

- **Performance Impact**: The dynamic COUNT aggregation adds a subquery to each collection query. For collections with many bobbleheads, this should still be performant due to PostgreSQL's query optimizer and proper indexing on bobbleheads.collectionId and deletedAt columns.

- **Migration Timing**: Run the migration during low-traffic period if possible, though the column drop should be nearly instantaneous on PostgreSQL.

- **Data Loss**: The totalItems column data will be permanently deleted. Since this is computed data (not source of truth), this is acceptable. The counts can always be recalculated from bobbleheads table.

- **Caching Implications**: If any caching layer stores totalItems separately, ensure those cache entries are invalidated after migration.

- **Rollback Strategy**: If issues arise, the migration can be rolled back by recreating the column and re-populating it with COUNT queries, though this should not be necessary.

- **Alternative Approaches Considered**:
  - Database VIEW: Could create a view with computed totalItems, but this adds complexity
  - Application-level caching: Could cache counts in Redis, but introduces cache invalidation complexity
  - Current approach (subquery) is simplest and most maintainable

- **Testing Recommendation**: After migration, manually verify collection item counts are accurate by comparing UI displays against direct database queries counting non-deleted bobbleheads.
