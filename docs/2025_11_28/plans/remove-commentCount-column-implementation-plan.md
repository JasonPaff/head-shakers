# Implementation Plan: Remove Denormalized commentCount Column from Collections Table

**Generated**: 2025-11-28
**Original Request**: I'd like you to remove the commentCount column from the collections database. Any queries that were using the commentCount field should instead include the proper joins to fetch that information differently.

**Refined Request**: Remove the denormalized commentCount column from the collections table in the PostgreSQL database schema and update all dependent code to fetch comment counts dynamically through proper SQL joins instead. This change involves updating the Drizzle ORM schema definition to remove the commentCount column, generating and executing a new database migration through Neon serverless to alter the collections table, and updating all Drizzle queries in the queries layer that currently select or reference the commentCount field to instead join with the comments table and use SQL aggregation functions (such as COUNT) to calculate comment counts on-the-fly.

## Overview

**Estimated Duration**: 3-4 hours
**Complexity**: Medium
**Risk Level**: Medium

## Quick Summary

Remove the denormalized `commentCount` column from the `collections` table schema and update all dependent code to fetch comment counts dynamically through SQL joins with the `comments` table. This refactoring will eliminate data duplication and ensure comment counts are always accurate without relying on increment/decrement operations that can drift out of sync.

## Prerequisites

- [ ] Database backup completed (Neon serverless handles this automatically)
- [ ] All pending changes committed or stashed
- [ ] Development environment running with access to test database

## Implementation Steps

### Step 1: Update Collections Schema

**What**: Remove commentCount column and related indexes/constraints from collections.schema.ts
**Why**: The schema definition is the source of truth for database structure and must be updated first before generating migrations
**Confidence**: High

**Files to Modify:**
- `src/lib/db/schema/collections.schema.ts` - Remove commentCount column definition, two indexes, and check constraint

**Changes:**
- Remove line 21: `commentCount: integer('comment_count').default(DEFAULTS.COLLECTION.COMMENT_COUNT).notNull()`
- Remove line 54: `index('collections_comment_count_desc_idx').on(sql`${table.commentCount} DESC`)`
- Remove line 55: `index('collections_public_comment_count_idx').on(table.isPublic, sql`${table.commentCount} DESC`)`
- Remove line 61: `check('collections_comment_count_non_negative', sql`${table.commentCount} >= 0`)`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] commentCount column removed from schema definition
- [ ] Both commentCount indexes removed
- [ ] Check constraint removed
- [ ] All validation commands pass
- [ ] No TypeScript errors in schema file

---

### Step 2: Generate Database Migration

**What**: Generate Drizzle migration to drop column, indexes, and constraint from database
**Why**: Migration file translates schema changes into SQL statements that can be applied to the database
**Confidence**: High

**Files to Create:**
- Migration file will be auto-generated in `src/lib/db/migrations/` with timestamp prefix

**Changes:**
- Run `npm run db:generate` to create migration file
- Verify generated migration contains DROP INDEX statements for both indexes
- Verify generated migration contains ALTER TABLE DROP CONSTRAINT statement
- Verify generated migration contains ALTER TABLE DROP COLUMN statement

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Migration file created with proper timestamp
- [ ] Migration drops `collections_comment_count_desc_idx` index
- [ ] Migration drops `collections_public_comment_count_idx` index
- [ ] Migration drops `collections_comment_count_non_negative` constraint
- [ ] Migration drops `comment_count` column
- [ ] All validation commands pass

---

### Step 3: Update CollectionsQuery - getBrowseCategoriesAsync

**What**: Replace commentCount column selection with dynamic COUNT aggregation via SQL subquery
**Why**: This method returns collection data with comment counts for browse categories - must calculate dynamically
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Update lines 445, 494, 539, 586

**Changes:**
- Remove `commentCount: collections.commentCount` from both SELECT statements (lines 445, 539)
- Add new computed field using pattern from existing `totalItems` calculation (lines 467-472, 560-565)
- Replace `commentCount: row.commentCount` in transformation (lines 494, 586)
- Use SQL subquery: `SELECT COUNT(*)::integer FROM comments WHERE target_id = collections.id AND target_type = 'collection' AND deleted_at IS NULL`

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] commentCount replaced with dynamic SQL COUNT in both query branches (with category filter and without)
- [ ] SQL subquery properly filters by target_id, target_type, and deleted_at
- [ ] Result transformation updated to use computed commentCount
- [ ] All validation commands pass
- [ ] No TypeScript errors related to commentCount

---

### Step 4: Update CollectionsQuery - getBrowseCollectionsAsync

**What**: Replace commentCount column selection with dynamic COUNT aggregation via SQL subquery
**Why**: This method returns collection data for browse collections page - must calculate dynamically
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/collections/collections.query.ts` - Update lines 690, 737

**Changes:**
- Remove `commentCount: collections.commentCount` from SELECT statement (line 690)
- Add computed commentCount field using same SQL subquery pattern as Step 3
- Replace `commentCount: row.commentCount` in transformation (line 737)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] commentCount replaced with dynamic SQL COUNT in query
- [ ] SQL subquery matches pattern from Step 3
- [ ] Result transformation updated correctly
- [ ] All validation commands pass
- [ ] No TypeScript errors

---

### Step 5: Update FeaturedContentQuery - getFeaturedCollectionsAsync

**What**: Replace commentCount column selection with dynamic COUNT aggregation via SQL subquery
**Why**: This method returns featured collection data with comment counts - must calculate dynamically
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/featured-content/featured-content-query.ts` - Update line 398

**Changes:**
- Replace `comments: collections.commentCount` with computed SQL COUNT subquery
- Use existing pattern from totalItems calculation (lines 411-416) as reference
- Ensure SQL subquery joins comments table with proper filters

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] commentCount replaced with dynamic SQL COUNT
- [ ] SQL subquery properly structured
- [ ] All validation commands pass
- [ ] No TypeScript errors

---

### Step 6: Remove Increment/Decrement Comment Count Operations from SocialQuery

**What**: Delete incrementCommentCountAsync and decrementCommentCountAsync methods that update collections.commentCount
**Why**: These methods are no longer needed since commentCount is calculated dynamically
**Confidence**: High

**Files to Modify:**
- `src/lib/queries/social/social.query.ts` - Remove lines 96-119 (decrementCommentCountAsync) and lines 746-769 (incrementCommentCountAsync)

**Changes:**
- Delete entire `decrementCommentCountAsync` method (lines 96-119)
- Delete entire `incrementCommentCountAsync` method (lines 746-769)
- Keep only the bobblehead-related cases, remove collection-related switch cases

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Both methods completely removed
- [ ] Collection-related switch cases deleted
- [ ] Bobblehead operations remain intact
- [ ] All validation commands pass
- [ ] No orphaned imports or references

---

### Step 7: Update SocialFacade to Remove Comment Count Increment/Decrement Calls

**What**: Remove calls to incrementCommentCountAsync and decrementCommentCountAsync for collection targets
**Why**: These operations no longer exist and are not needed with dynamic counting
**Confidence**: High

**Files to Modify:**
- `src/lib/facades/social/social.facade.ts` - Update lines 88-128 (createComment), 135-219 (createCommentReply), 226-278 (deleteComment)

**Changes:**
- In `createComment` method: Keep increment call (still needed for bobbleheads), verify it handles both target types
- In `createCommentReply` method: Keep increment call (still needed for bobbleheads)
- In `deleteComment` method: Keep decrement call (still needed for bobbleheads)
- In `deleteCommentRepliesRecursive` private method: Keep decrement call (still needed for bobbleheads)
- No changes needed - methods still work for bobbleheads which retain commentCount

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] Increment/decrement calls verified to work for both bobblehead and collection targets
- [ ] No code changes needed (methods handle polymorphic targets)
- [ ] All validation commands pass
- [ ] No TypeScript errors

---

### Step 8: Remove COLLECTION.COMMENT_COUNT Default Constant

**What**: Remove the COLLECTION.COMMENT_COUNT default value from constants
**Why**: This constant is no longer used since the column doesn't exist
**Confidence**: High

**Files to Modify:**
- `src/lib/constants/defaults.ts` - Remove line 23

**Changes:**
- Remove `COMMENT_COUNT: 0` from COLLECTION object (line 23)
- Keep other COLLECTION defaults (IS_PUBLIC, LIKE_COUNT)

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] COMMENT_COUNT constant removed from COLLECTION defaults
- [ ] Other defaults remain intact
- [ ] All validation commands pass
- [ ] No import errors or broken references

---

### Step 9: Update Test Fixtures and Mock Data

**What**: Remove commentCount from collection factory and mock data
**Why**: Test data must match updated schema to prevent test failures
**Confidence**: High

**Files to Modify:**
- `tests/fixtures/collection.factory.ts` - Remove commentCount field
- `tests/mocks/data/collections.mock.ts` - Remove commentCount from mock objects

**Changes:**
- Remove commentCount property from factory function
- Remove commentCount from all mock collection objects
- Ensure factory generates valid collections without commentCount

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] commentCount removed from factory
- [ ] commentCount removed from all mock objects
- [ ] All validation commands pass
- [ ] No TypeScript errors in test files

---

### Step 10: Update Integration Tests - Remove commentCount Assertions

**What**: Remove or update test assertions that verify commentCount values
**Why**: Tests will fail if they expect commentCount field that no longer exists
**Confidence**: Medium

**Files to Modify:**
- `tests/integration/queries/featured-content/featured-content-query.test.ts` - Remove commentCount assertions
- `tests/integration/facades/featured-content/featured-content.facade.test.ts` - Remove commentCount assertions

**Changes:**
- Search for `commentCount` or `comment_count` in test assertions
- Replace assertions with dynamic comment count queries where needed
- Remove assertions if comment count is not critical to test case
- Update test expectations to match new dynamic query results

**Validation Commands:**
```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**
- [ ] No test assertions reference commentCount field
- [ ] Tests updated to verify comment counts through dynamic queries if needed
- [ ] All validation commands pass
- [ ] No TypeScript errors in test files

---

### Step 11: Run Database Migration

**What**: Execute the generated migration against the database to drop the column
**Why**: Schema changes must be applied to database for application to work correctly
**Confidence**: High

**Changes:**
- Run `npm run db:migrate` to apply migration to database
- Verify migration completes without errors
- Check database schema to confirm column, indexes, and constraint removed

**Validation Commands:**
```bash
npm run db:migrate
```

**Success Criteria:**
- [ ] Migration executes successfully without errors
- [ ] Database no longer has comment_count column in collections table
- [ ] Both indexes removed from database
- [ ] Check constraint removed from database
- [ ] Migration recorded in migration history table

---

### Step 12: Run Full Test Suite

**What**: Execute complete test suite to verify all changes work correctly
**Why**: Comprehensive testing ensures no regressions or broken functionality
**Confidence**: Medium

**Changes:**
- Run `npm run test` to execute all unit, integration, and e2e tests
- Fix any failing tests related to collections or comments
- Verify all query results include computed commentCount values

**Validation Commands:**
```bash
npm run test
```

**Success Criteria:**
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All e2e tests pass
- [ ] No tests fail due to missing commentCount field
- [ ] Comment count calculations return correct values

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Database migration completes successfully
- [ ] All tests pass (`npm run test`)
- [ ] Manual verification: Browse collections page displays correct comment counts
- [ ] Manual verification: Featured collections show correct comment counts
- [ ] Manual verification: Creating/deleting comments updates counts correctly (for bobbleheads)

## Notes

**Important Considerations:**

1. **Migration Safety**: The migration will drop the column, indexes, and constraint. Neon serverless provides automatic backups, but this is a destructive change. The migration is straightforward but cannot be easily reversed without data loss.

2. **Performance Impact**: Dynamic COUNT queries will be slightly slower than reading a denormalized column. However, the existing queries already use similar patterns for `totalItems`, and proper indexing on the comments table (target_id, target_type, deleted_at) will keep performance acceptable.

3. **Bobblehead Behavior**: Bobbleheads still retain their commentCount column and increment/decrement operations. The SocialQuery methods handle both bobblehead and collection targets polymorphically, so no changes are needed to the increment/decrement logic.

4. **Validation Schema**: The `collections.validation.ts` file uses `createSelectSchema` from drizzle-zod which auto-generates schemas from Drizzle table definitions. Once the schema is updated, the validation schema will automatically regenerate without commentCount.

5. **Query Pattern**: Use the existing `getCommentCountAsync` method in SocialQuery as reference for the SQL COUNT pattern. The subquery should be: `SELECT COUNT(*)::integer FROM comments WHERE target_id = collections.id AND target_type = 'collection' AND deleted_at IS NULL`

6. **Test Data**: After updating test fixtures and mocks, any tests that create collections will no longer have commentCount. Tests should verify comment counts through the SocialQuery.getCommentCountAsync method instead.

**Assumptions Requiring Confirmation:**

1. **Low Confidence**: Step 10 test updates may require more investigation than estimated. Actual test assertions need to be examined to determine exact changes needed.

2. **Medium Confidence**: The BrowseCollectionRecord type definition may need updating if it explicitly includes commentCount. Check type definitions during implementation.

3. **High Confidence**: All other steps are well-understood and follow existing patterns in the codebase.
