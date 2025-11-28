# Step 2: Source & Test Discovery

## Step Metadata

- **Status**: Completed
- **Started**: 2025-11-27T00:01:00Z
- **Completed**: 2025-11-27T00:03:00Z
- **Duration**: ~120 seconds

## Refined Scope Used as Input

The home page consists of:

- HeroSection with PlatformStatsDisplay, FeaturedBobbleheadDisplay, AuthContent
- FeaturedCollectionsSection with FeaturedCollectionsDisplay
- TrendingBobbleheadsSection with TrendingBobbleheadsDisplay
- JoinCommunitySection
- Data operations: PlatformStatsFacade, FeaturedContentFacade

## Source Files Discovered

### CRITICAL - Main Page & Sections (5 files)

| File                                                                        | Category | Description                                           |
| --------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `src/app/(app)/(home)/page.tsx`                                             | Critical | Main home page entry point, orchestrates all sections |
| `src/app/(app)/(home)/components/sections/hero-section.tsx`                 | High     | Hero section with CTAs, AuthContent, stats            |
| `src/app/(app)/(home)/components/sections/featured-collections-section.tsx` | High     | Featured collections section                          |
| `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx` | High     | Trending bobbleheads section                          |
| `src/app/(app)/(home)/components/sections/join-community-section.tsx`       | High     | Join community section                                |

### HIGH - Async Data Fetching Components (4 files)

| File                                                                   | Category | Description                                   |
| ---------------------------------------------------------------------- | -------- | --------------------------------------------- |
| `src/app/(app)/(home)/components/async/platform-stats-async.tsx`       | High     | Server component fetches platform stats       |
| `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx`  | High     | Server component fetches featured bobblehead  |
| `src/app/(app)/(home)/components/async/featured-collections-async.tsx` | High     | Server component fetches featured collections |
| `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx` | High     | Server component fetches trending bobbleheads |

### HIGH - Display Components (4 files)

| File                                                                       | Category | Description                                         |
| -------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| `src/app/(app)/(home)/components/display/platform-stats-display.tsx`       | High     | Client component displays platform statistics       |
| `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx`  | High     | Client component displays featured bobblehead       |
| `src/app/(app)/(home)/components/display/featured-collections-display.tsx` | High     | Client component displays featured collections grid |
| `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx` | High     | Client component displays trending bobbleheads grid |

### HIGH - Skeleton Loading States (4 files)

| File                                                                         | Category | Description                               |
| ---------------------------------------------------------------------------- | -------- | ----------------------------------------- |
| `src/app/(app)/(home)/components/skeleton/platform-stats-skeleton.tsx`       | High     | Loading skeleton for platform stats       |
| `src/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton.tsx`  | High     | Loading skeleton for featured bobblehead  |
| `src/app/(app)/(home)/components/skeleton/featured-collections-skeleton.tsx` | High     | Loading skeleton for featured collections |
| `src/app/(app)/(home)/components/skeleton/trending-bobbleheads-skeleton.tsx` | High     | Loading skeleton for trending bobbleheads |

### HIGH - Business Logic Facades (2 files)

| File                                                          | Category | Description                                                     |
| ------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| `src/lib/facades/platform/platform-stats.facade.ts`           | High     | Facade for platform stats with Redis caching                    |
| `src/lib/facades/featured-content/featured-content.facade.ts` | High     | Facade for featured content (bobblehead, collections, trending) |

### HIGH - Database Queries (5 files)

| File                                                               | Category | Description                                |
| ------------------------------------------------------------------ | -------- | ------------------------------------------ |
| `src/lib/queries/featured-content/featured-content-query.ts`       | High     | Query class for featured content           |
| `src/lib/queries/featured-content/featured-content-transformer.ts` | Medium   | Transformer for featured content data      |
| `src/lib/queries/bobbleheads/bobbleheads-query.ts`                 | Medium   | BobbleheadsQuery.getBobbleheadCountAsync() |
| `src/lib/queries/collections/collections.query.ts`                 | Medium   | CollectionsQuery.getCollectionCountAsync() |
| `src/lib/queries/users/users-query.ts`                             | Medium   | UsersQuery.getUserCountAsync()             |

### MEDIUM - Supporting UI Components (6 files)

| File                                                  | Category | Description                                    |
| ----------------------------------------------------- | -------- | ---------------------------------------------- |
| `src/components/ui/auth.tsx`                          | Medium   | AuthContent component for auth-aware rendering |
| `src/components/ui/button.tsx`                        | Medium   | Button component                               |
| `src/components/ui/badge.tsx`                         | Medium   | Badge component                                |
| `src/components/ui/skeleton.tsx`                      | Medium   | Base Skeleton component                        |
| `src/components/ui/conditional.tsx`                   | Medium   | Conditional rendering component                |
| `src/components/ui/error-boundary/error-boundary.tsx` | Medium   | ErrorBoundary wrapper                          |

### MEDIUM - Utilities (6 files)

| File                                | Category | Description                               |
| ----------------------------------- | -------- | ----------------------------------------- |
| `src/utils/auth-utils.ts`           | Medium   | Auth utilities including getUserIdAsync() |
| `src/lib/test-ids/generator.ts`     | Low      | Test ID generation                        |
| `src/lib/seo/metadata.utils.ts`     | Medium   | SEO metadata generation                   |
| `src/lib/seo/seo.constants.ts`      | Low      | SEO schema constants                      |
| `src/lib/utils/cloudinary.utils.ts` | Medium   | Cloudinary URL utilities                  |
| `src/lib/services/cache.service.ts` | Medium   | CacheService for Redis                    |

### LOW - Constants (5 files)

| File                                    | Category | Description                     |
| --------------------------------------- | -------- | ------------------------------- |
| `src/lib/constants/cache.ts`            | Low      | Cache TTL values                |
| `src/lib/constants/defaults.ts`         | Low      | Default values                  |
| `src/lib/constants/config.ts`           | Low      | Config limits                   |
| `src/lib/constants/cloudinary-paths.ts` | Low      | Cloudinary path constants       |
| `src/lib/constants/operations.ts`       | Low      | Operations constants for Sentry |

## Existing Test Files Discovered

### E2E Tests (2 files)

| File                                   | Covers    | Description                                 |
| -------------------------------------- | --------- | ------------------------------------------- |
| `tests/e2e/pages/home.page.ts`         | Home page | Page Object Model with locators and actions |
| `tests/e2e/specs/smoke/health.spec.ts` | Home page | Basic smoke test - page loads               |

### Component Tests (4 files - Generic UI)

| File                                    | Covers   | Description                       |
| --------------------------------------- | -------- | --------------------------------- |
| `tests/components/ui/button.test.tsx`   | Button   | Unit tests for Button component   |
| `tests/components/ui/badge.test.tsx`    | Badge    | Unit tests for Badge component    |
| `tests/components/ui/skeleton.test.tsx` | Skeleton | Unit tests for Skeleton component |
| `tests/components/ui/alert.test.tsx`    | Alert    | Unit tests for Alert component    |

## File Validation Results

- **Source Files Discovered**: 41 files
- **Existing Test Files**: 6 files (2 E2E, 4 component)
- **Minimum Requirement (3+ source files)**: ✓ Met (41 files)
- **All file paths verified**: ✓

## Architecture Pattern Identified

```
page.tsx
  → Section (Server)
    → ErrorBoundary
      → Suspense (fallback: Skeleton)
        → Async Component (Server)
          → Facade (with Redis cache)
            → Query (Drizzle ORM)
              → Database
          → Display Component (Client)
```

## Testing Gaps Preliminary

**No tests exist for:**

- Home page sections (4 components)
- Async data fetching components (4 components)
- Display components (4 components)
- Skeleton components (4 components)
- PlatformStatsFacade
- FeaturedContentFacade
- FeaturedContentQuery
- AuthContent component
- Cloudinary utilities used by displays
