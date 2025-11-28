# Facade Specialist Report

## Files Reviewed

- src/lib/facades/platform/platform-stats.facade.ts (1 method)
- src/lib/facades/featured-content/featured-content.facade.ts (3 methods)

## Methods Reviewed

- `PlatformStatsFacade.getPlatformStatsAsync`
- `FeaturedContentFacade.getFeaturedBobbleheadAsync`
- `FeaturedContentFacade.getFeaturedCollectionsAsync`
- `FeaturedContentFacade.getTrendingBobbleheadsAsync`

## Issues Found

### MEDIUM Severity (3)

#### 1. Incorrect Cache TTL Configuration

**File:Line**: `src/lib/facades/platform/platform-stats.facade.ts:86`
**Issue**: Uses `CACHE_CONFIG.TTL.MEDIUM` (30 minutes) for platform statistics that change infrequently.
**Recommendation**: Platform statistics should use `CACHE_CONFIG.TTL.EXTENDED` (4 hours). Platform stats are "rarely changing" data.

#### 2. Incorrect Method Name in Error Context

**File:Line**: `src/lib/facades/featured-content/featured-content.facade.ts:198`
**Issue**: Error context uses method name `'getHeroFeaturedBobbleheadAsync'` but actual method is `getFeaturedBobbleheadAsync`.
**Recommendation**: Change to `method: 'getFeaturedBobbleheadAsync'` for consistency.

#### 3. Missing Cache-Miss Breadcrumb in getTrendingBobbleheadsAsync

**File:Line**: `src/lib/facades/featured-content/featured-content.facade.ts:367-371`
**Issue**: Only has pre-operation breadcrumb but no breadcrumb inside the cache callback. Should have both pre-operation (for all requests) and cache-miss breadcrumbs (for fresh fetches).
**Recommendation**: Add Sentry breadcrumb inside cache callback:

```typescript
Sentry.addBreadcrumb({
  category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
  data: { count: data.length },
  level: SENTRY_LEVELS.INFO,
  message: 'Trending bobbleheads fetched successfully from database',
});
```

### LOW Severity (1)

#### 4. Inconsistent Optional Parameter Pattern

**File:Line**: `src/lib/facades/featured-content/featured-content.facade.ts:220`
**Issue**: Parameter type is `userId?: null | string` but should use `string | undefined` pattern.
**Recommendation**: Change to `userId?: string` (removes `| null` union).

## Positive Findings

All reviewed methods demonstrate strong adherence to project conventions:

1. Proper `Async` suffix naming
2. Domain-specific cache helpers (not generic `CacheService.cached()`)
3. Correct operation constants (OPERATIONS.\*)
4. Pre-operation Sentry breadcrumbs for observability
5. Proper error handling with `createFacadeError`
6. JSDoc documentation present
7. Delegation to query methods (no raw SQL in facades)
8. Methods under complexity limits (<60 lines)
9. Named exports
10. User-specific caching in `getFeaturedCollectionsAsync`
11. Parallel Promise.all execution in `getPlatformStatsAsync`

## Methods Explicitly Skipped (Out of Scope)

- createAsync
- deleteAsync
- getActiveFeaturedContentAsync
- getAllFeaturedContentForAdmin
- getCollectionOfWeek
- getEditorPicks
- getFeaturedContentById
- getFeaturedContentByIdForAdmin
- getFooterFeaturedContentAsync
- getHomepageBanner
- getTrendingContent
- incrementViewCount
- toggleActiveAsync
- updateAsync
