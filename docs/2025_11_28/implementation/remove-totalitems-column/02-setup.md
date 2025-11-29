# Setup and Initialization

**Setup Start**: 2025-11-28
**Duration**: N/A

## Extracted Implementation Steps

16 steps identified from plan:

1. **Update Schema Definition** - Remove totalItems column definition and check constraint
2. **Remove totalItems Default Constant** - Remove TOTAL_ITEMS from DEFAULTS.COLLECTION
3. **Update Validation Schema** - Remove totalItems from omit list
4. **Update getBrowseCategoriesAsync** - Replace with dynamic COUNT
5. **Update getBrowseCollectionsAsync** - Replace with dynamic COUNT
6. **Update getCollectionMetadata** - Replace with dynamic COUNT using LEFT JOIN
7. **Update getFeaturedCollectionsAsync** - Replace with dynamic COUNT
8. **Update FeaturedCollectionData Type** - Add JSDoc documenting computed nature
9. **Update Content Search Queries** - Replace all 3 occurrences with COUNT
10. **Update CollectionSearchResult Type** - Add JSDoc documenting computed nature
11. **Update Seed Script** - Remove totalItems and updateAggregates function
12. **Update Mock Data** - Remove totalItems from mock objects
13. **Generate Database Migration** - Create migration to drop column
14. **Update Integration Tests** - Update assertions for computed counts
15. **Run All Tests** - Verify no regressions
16. **Run Database Migration** - Apply schema changes

## Step-Type Detection and Specialist Routing

| Step | Files                                                        | Detected Specialist            | Skills Auto-Loaded                               |
| ---- | ------------------------------------------------------------ | ------------------------------ | ------------------------------------------------ |
| 1    | `src/lib/db/schema/collections.schema.ts`                    | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 2    | `src/lib/constants/defaults.ts`                              | general-purpose                | None                                             |
| 3    | `src/lib/validations/collections.validation.ts`              | validation-specialist          | validation-schemas                               |
| 4    | `src/lib/queries/collections/collections.query.ts`           | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 5    | `src/lib/queries/collections/collections.query.ts`           | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 6    | `src/lib/queries/collections/collections.query.ts`           | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 7    | `src/lib/queries/featured-content/featured-content-query.ts` | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 8    | `src/lib/queries/featured-content/featured-content-query.ts` | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 9    | `src/lib/queries/content-search/content-search.query.ts`     | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 10   | `src/lib/queries/content-search/content-search.query.ts`     | database-specialist            | database-schema, drizzle-orm, validation-schemas |
| 11   | `src/lib/db/scripts/seed.ts`                                 | database-specialist            | database-schema, drizzle-orm                     |
| 12   | `tests/mocks/data/collections.mock.ts`                       | test-infrastructure-specialist | test-infrastructure, testing-base                |
| 13   | `src/lib/db/migrations/`                                     | database-specialist            | database-schema, drizzle-orm                     |
| 14   | `tests/integration/**/*.test.ts`                             | integration-test-specialist    | integration-testing, testing-base                |
| 15   | None (verification only)                                     | test-executor                  | None                                             |
| 16   | None (database operation)                                    | database-specialist            | database-schema, drizzle-orm                     |

## Step Dependencies

- Steps 1-3: Can be done in parallel (schema, constants, validation)
- Steps 4-10: Depend on step 1 (queries reference schema)
- Step 11: Depends on step 1
- Step 12: Depends on step 1
- Step 13: Must be done after steps 1-12
- Step 14: Must be done after steps 1-12
- Step 15: Must be done after all code changes (1-14)
- Step 16: Must be done last after tests pass

## Files Summary by Step

### Core Schema Changes (Steps 1-3)

- `src/lib/db/schema/collections.schema.ts`
- `src/lib/constants/defaults.ts`
- `src/lib/validations/collections.validation.ts`

### Query Updates (Steps 4-10)

- `src/lib/queries/collections/collections.query.ts`
- `src/lib/queries/featured-content/featured-content-query.ts`
- `src/lib/queries/content-search/content-search.query.ts`

### Supporting Files (Steps 11-12)

- `src/lib/db/scripts/seed.ts`
- `tests/mocks/data/collections.mock.ts`

### Migration & Testing (Steps 13-16)

- New migration file in `src/lib/db/migrations/`
- `tests/integration/queries/featured-content/featured-content-query.test.ts`
- `tests/integration/facades/featured-content/featured-content.facade.test.ts`

## Checkpoint

Setup complete. Beginning implementation with Step 1: Update Schema Definition.
