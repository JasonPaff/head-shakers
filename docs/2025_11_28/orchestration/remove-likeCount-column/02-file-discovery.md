# Step 2: File Discovery

**Status**: Complete
**Started**: 2025-11-28
**Duration**: ~15 seconds

## Input

Refined feature request from Step 1 describing removal of likeCount column and replacement with JOIN-based queries.

## Discovery Results Summary

- **Directories explored**: 8 (schema, queries, facades, actions, validations, components, services, tests)
- **Candidate files examined**: 45+
- **Highly relevant files found**: 28
- **Supporting files identified**: 15

## Discovered Files by Category

### Critical Priority (Schema & Database)

| File                                      | Priority  | Action Required                                                          |
| ----------------------------------------- | --------- | ------------------------------------------------------------------------ |
| `src/lib/db/schema/collections.schema.ts` | CRITICAL  | Remove likeCount column (line 28), index (line 53), constraint (line 60) |
| `src/lib/db/schema/social.schema.ts`      | Reference | Contains likes table for JOIN operations                                 |
| `src/lib/db/schema/bobbleheads.schema.ts` | Reference | Parallel structure pattern reference                                     |

### High Priority (Core Query Layer)

| File                                                         | Priority | Action Required                                       |
| ------------------------------------------------------------ | -------- | ----------------------------------------------------- |
| `src/lib/queries/collections/collections.query.ts`           | CRITICAL | Replace 8 likeCount references with LEFT JOIN + COUNT |
| `src/lib/queries/social/social.query.ts`                     | CRITICAL | Remove increment/decrement methods for collections    |
| `src/lib/queries/featured-content/featured-content-query.ts` | HIGH     | Update featured collections queries with JOIN         |

### High Priority (Facade Layer)

| File                                                          | Priority | Action Required                                   |
| ------------------------------------------------------------- | -------- | ------------------------------------------------- |
| `src/lib/facades/collections/collections.facade.ts`           | HIGH     | Verify dynamic like counts are properly fetched   |
| `src/lib/facades/social/social.facade.ts`                     | CRITICAL | Remove denormalized counter updates in toggleLike |
| `src/lib/facades/featured-content/featured-content.facade.ts` | MEDIUM   | Verify featured collection queries                |

### Medium Priority (Validation & Constants)

| File                                                   | Priority | Action Required                          |
| ------------------------------------------------------ | -------- | ---------------------------------------- |
| `src/lib/validations/collections.validation.ts`        | MEDIUM   | Verify drizzle-zod regeneration          |
| `src/lib/validations/browse-collections.validation.ts` | HIGH     | Ensure likeCount sort option still works |
| `src/lib/constants/defaults.ts`                        | MEDIUM   | Remove DEFAULTS.COLLECTION.LIKE_COUNT    |

### Low Priority (Server Actions)

| File                                                           | Priority | Action Required        |
| -------------------------------------------------------------- | -------- | ---------------------- |
| `src/lib/actions/collections/collections.actions.ts`           | LOW      | Test after refactoring |
| `src/lib/actions/featured-content/featured-content.actions.ts` | LOW      | Test after refactoring |

### Supporting Infrastructure

| File                                             | Priority | Action Required                           |
| ------------------------------------------------ | -------- | ----------------------------------------- |
| `src/lib/services/cache-revalidation.service.ts` | MEDIUM   | Verify cache invalidation on like changes |
| `src/lib/services/cache.service.ts`              | MEDIUM   | Verify cached like counts invalidation    |
| `src/lib/db/scripts/seed.ts`                     | MEDIUM   | Remove likeCount initialization           |

### Test Files

| File                                                                         | Priority | Action Required               |
| ---------------------------------------------------------------------------- | -------- | ----------------------------- |
| `tests/integration/facades/featured-content/featured-content.facade.test.ts` | HIGH     | Update likeCount references   |
| `tests/integration/queries/featured-content/featured-content-query.test.ts`  | HIGH     | Update featured content tests |
| `tests/unit/lib/validations/collections.validation.test.ts`                  | MEDIUM   | Verify validation tests       |
| `tests/integration/actions/collections.facade.test.ts`                       | MEDIUM   | Test facade operations        |

### Components (Display Only - Likely No Changes)

| File                                                                                       | Priority  | Notes                     |
| ------------------------------------------------------------------------------------------ | --------- | ------------------------- |
| `src/app/(app)/collections/[collectionSlug]/(collection)/components/collection-header.tsx` | LOW       | Receives data from facade |
| `src/app/(app)/browse/components/browse-collections-table.tsx`                             | LOW       | Displays from facade data |
| `src/components/ui/like-button.tsx`                                                        | Reference | Generic component         |

## Architecture Insights

### Current Denormalized Counter Pattern

1. User toggles like → `SocialFacade.toggleLike()`
2. Facade calls `SocialQuery.createLikeAsync()` or `deleteLikeAsync()`
3. Facade calls `SocialQuery.incrementLikeCountAsync()` or `decrementLikeCountAsync()`
4. Query updates denormalized counter on target entity

### New Dynamic Count Pattern

1. User toggles like → `SocialFacade.toggleLike()`
2. Facade calls `SocialQuery.createLikeAsync()` or `deleteLikeAsync()`
3. Cache invalidation triggers
4. Next query fetches count via LEFT JOIN + COUNT aggregation

### Available Indexes for JOIN

- Composite index on `(target_type, target_id)` in likes table
- Partial index for collection-specific likes

## Validation Results

- **Minimum Files**: ✅ 28 relevant files discovered (exceeds minimum of 3)
- **Comprehensive Coverage**: ✅ All architectural layers covered
- **File Validation**: ✅ All paths verified to exist
- **Categorization**: ✅ Files properly prioritized by implementation order
