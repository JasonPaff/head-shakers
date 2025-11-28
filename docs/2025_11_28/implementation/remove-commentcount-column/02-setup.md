# Setup and Routing

**Timestamp**: 2025-11-28
**Duration**: Phase 2 setup

## Extracted Steps Summary

12 steps identified from implementation plan

## Step Routing Table

| Step | Title | Specialist | Files |
|------|-------|------------|-------|
| 1 | Update Collections Schema | database-specialist | src/lib/db/schema/collections.schema.ts |
| 2 | Generate Database Migration | database-specialist | src/lib/db/migrations/* |
| 3 | Update getBrowseCategoriesAsync | database-specialist | src/lib/queries/collections/collections.query.ts |
| 4 | Update getBrowseCollectionsAsync | database-specialist | src/lib/queries/collections/collections.query.ts |
| 5 | Update getFeaturedCollectionsAsync | database-specialist | src/lib/queries/featured-content/featured-content-query.ts |
| 6 | Remove Increment/Decrement Operations | database-specialist | src/lib/queries/social/social.query.ts |
| 7 | Update SocialFacade | facade-specialist | src/lib/facades/social/social.facade.ts |
| 8 | Remove Default Constant | general-purpose | src/lib/constants/defaults.ts |
| 9 | Update Test Fixtures | test-infrastructure-specialist | tests/fixtures/collection.factory.ts, tests/mocks/data/collections.mock.ts |
| 10 | Update Integration Tests | integration-test-specialist | tests/integration/** |
| 11 | Run Database Migration | database-specialist | Database |
| 12 | Run Full Test Suite | test-executor | All tests |

## Specialist Assignment Breakdown

- **database-specialist**: Steps 1, 2, 3, 4, 5, 6, 11 (7 steps)
- **facade-specialist**: Step 7 (1 step)
- **general-purpose**: Step 8 (1 step)
- **test-infrastructure-specialist**: Step 9 (1 step)
- **integration-test-specialist**: Step 10 (1 step)
- **test-executor**: Step 12 (1 step)

## Todo List Created

15 items created including phases and individual steps

## Step Dependencies

- Steps 3-6, 7-10 depend on Step 1 (schema update)
- Step 11 (migration) should run after all code changes
- Step 12 (test suite) should run after migration

## Files Mentioned Per Step

### Step 1
- src/lib/db/schema/collections.schema.ts

### Step 2
- Migration file (auto-generated)

### Step 3-4
- src/lib/queries/collections/collections.query.ts

### Step 5
- src/lib/queries/featured-content/featured-content-query.ts

### Step 6
- src/lib/queries/social/social.query.ts

### Step 7
- src/lib/facades/social/social.facade.ts

### Step 8
- src/lib/constants/defaults.ts

### Step 9
- tests/fixtures/collection.factory.ts
- tests/mocks/data/collections.mock.ts

### Step 10
- tests/integration/queries/featured-content/featured-content-query.test.ts
- tests/integration/facades/featured-content/featured-content.facade.test.ts

## Checkpoint

Setup complete, beginning implementation with specialist subagents.
