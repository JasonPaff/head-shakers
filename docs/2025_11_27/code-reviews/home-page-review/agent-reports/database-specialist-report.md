# Database Specialist Report

## Files Reviewed

- src/lib/queries/featured-content/featured-content-query.ts (3 methods)
- src/lib/queries/bobbleheads/bobbleheads-query.ts (1 method)
- src/lib/queries/collections/collections.query.ts (1 method)
- src/lib/queries/users/users-query.ts (1 method)

## Methods Reviewed

- `FeaturedContentQuery.getFeaturedBobbleheadAsync`
- `FeaturedContentQuery.getFeaturedCollectionsAsync`
- `FeaturedContentQuery.getTrendingBobbleheadsAsync`
- `BobbleheadsQuery.getBobbleheadCountAsync`
- `CollectionsQuery.getCollectionCountAsync`
- `UsersQuery.getUserCountAsync`

## Issues Found

### LOW Severity (3)

#### 1. Hard-coded Boolean in getFeaturedBobbleheadAsync

**File:Line**: `src/lib/queries/featured-content/featured-content-query.ts:371`
**Issue**: Uses `eq(featuredContent.isActive, true)` instead of `DEFAULTS.FEATURED_CONTENT.IS_ACTIVE`.
**Recommendation**: Use constant for consistency.

#### 2. Hard-coded Boolean in getFeaturedCollectionsAsync

**File:Line**: `src/lib/queries/featured-content/featured-content-query.ts:431`
**Issue**: Uses `eq(featuredContent.isActive, true)` instead of constant.
**Recommendation**: Use `DEFAULTS.FEATURED_CONTENT.IS_ACTIVE`.

#### 3. Hard-coded Boolean in getTrendingBobbleheadsAsync

**File:Line**: `src/lib/queries/featured-content/featured-content-query.ts:515`
**Issue**: Uses `eq(featuredContent.isActive, true)` instead of constant.
**Recommendation**: Use `DEFAULTS.FEATURED_CONTENT.IS_ACTIVE`.

### INFO (Observations)

#### 4. Missing Soft Delete Filter on Joins

**Files**: All three FeaturedContentQuery methods
**Observation**: Methods join with `bobbleheads`/`collections` but don't filter out soft-deleted entities. Could potentially return featured content pointing to deleted items.
**Note**: This may be intentional if featured content should remain visible even when source is soft-deleted, or if soft-delete cleanup handles this separately.

## Perfect Implementations (No Issues)

### BobbleheadsQuery.getBobbleheadCountAsync

**File:Line**: `src/lib/queries/bobbleheads/bobbleheads-query.ts:540-550`

- Extends BaseQuery class
- Uses QueryContext for database instance
- Method has `Async` suffix
- Returns number (appropriate for count)
- Uses `getDbInstance(context)`
- Applies soft delete filter via `buildSoftDeleteFilter`
- Proper type inference
- Returns 0 for empty result

### CollectionsQuery.getCollectionCountAsync

**File:Line**: `src/lib/queries/collections/collections.query.ts:789-799`

- Exemplary implementation
- All conventions followed

### UsersQuery.getUserCountAsync

**File:Line**: `src/lib/queries/users/users-query.ts:192-202`

- Exemplary implementation
- All conventions followed

## Positive Findings

1. **Excellent BaseQuery patterns**: All methods properly extend BaseQuery
2. **Consistent naming**: All methods follow `{verb}{Entity}Async` pattern
3. **Type safety**: Proper Drizzle type inference
4. **Performance optimization**: Appropriate INNER JOINs and LIMIT clauses
5. **Context handling**: All use `getDbInstance(context)`
6. **Null safety**: Count queries return 0 for empty results
7. **Permission filtering**: Count queries apply soft delete filters

## Methods Explicitly Skipped

### FeaturedContentQuery (10 of 13 methods skipped)

- createAsync, deleteAsync, findAllFeaturedContentForAdminAsync, findByIdAsync, findFeaturedContentByIdForAdminAsync, getActiveFeaturedContentAsync, getFooterFeaturedContentAsync, incrementViewCountAsync, toggleActiveAsync, updateAsync

### BobbleheadsQuery (29+ methods skipped)

- Only `getBobbleheadCountAsync` in scope

### CollectionsQuery (24+ methods skipped)

- Only `getCollectionCountAsync` in scope

### UsersQuery (14+ methods skipped)

- Only `getUserCountAsync` in scope
