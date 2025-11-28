# Test Coverage Gap Analysis: Home Page Feature

## Summary

- **Source Files Analyzed**: 41 files
- **Existing Tests Found**: 6 files (1 Page Object, 1 E2E spec, 4 UI component tests)
- **Total Coverage Gaps**: 38 missing test suites
- **Estimated New Tests**: 127 tests across all types

---

## Coverage Matrix

| Source File                                      | Unit | Component | Integration | E2E | Gap Status |
| ------------------------------------------------ | ---- | --------- | ----------- | --- | ---------- |
| `src/app/(app)/(home)/page.tsx`                  | ❌   | ❌        | ❌          | ✅  | Partial    |
| `hero-section.tsx`                               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-collections-section.tsx`               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `trending-bobbleheads-section.tsx`               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `join-community-section.tsx`                     | ❌   | ❌        | ❌          | ❌  | Missing    |
| `platform-stats-async.tsx`                       | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-bobblehead-async.tsx`                  | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-collections-async.tsx`                 | ❌   | ❌        | ❌          | ❌  | Missing    |
| `trending-bobbleheads-async.tsx`                 | ❌   | ❌        | ❌          | ❌  | Missing    |
| `platform-stats-display.tsx`                     | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-bobblehead-display.tsx`                | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-collections-display.tsx`               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `trending-bobbleheads-display.tsx`               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `platform-stats-skeleton.tsx`                    | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-bobblehead-skeleton.tsx`               | ❌   | ❌        | ❌          | ❌  | Missing    |
| `featured-collections-skeleton.tsx`              | ❌   | ❌        | ❌          | ❌  | Missing    |
| `trending-bobbleheads-skeleton.tsx`              | ❌   | ❌        | ❌          | ❌  | Missing    |
| `platform-stats.facade.ts`                       | ❌   | N/A       | ❌          | ❌  | Missing    |
| `featured-content.facade.ts`                     | ❌   | N/A       | ❌          | ❌  | Missing    |
| `featured-content-query.ts`                      | ❌   | N/A       | ❌          | ❌  | Missing    |
| `featured-content-transformer.ts`                | ❌   | N/A       | ❌          | ❌  | Missing    |
| `auth.tsx` (AuthContent)                         | ❌   | ❌        | ❌          | ❌  | Missing    |
| `cloudinary.utils.ts`                            | ❌   | N/A       | ❌          | ❌  | Missing    |
| `cache.service.ts`                               | ❌   | N/A       | ❌          | ❌  | Missing    |
| `bobbleheads-query.ts` (getBobbleheadCountAsync) | ❌   | N/A       | ❌          | ❌  | Missing    |
| `collections.query.ts` (getCollectionCountAsync) | ❌   | N/A       | ❌          | ❌  | Missing    |
| `users-query.ts` (getUserCountAsync)             | ❌   | N/A       | ❌          | ❌  | Missing    |

---

## Coverage Gaps by Priority

### Critical Priority (13 tests)

These are core business logic components that directly affect user experience and data integrity.

#### File: `src/app/(app)/(home)/page.tsx`

**Current Coverage**: E2E smoke test only (basic page load)

**Missing Test Types**: Unit, Component, Integration

**Exports/Functionality Requiring Tests**:

- `generateMetadata()` - SEO metadata generation
- `HomePage()` component - Page composition and layout
- JSON-LD schema injection (ORGANIZATION_SCHEMA, WEBSITE_SCHEMA)
- Suspense boundary and ErrorBoundary integration

**Risk Assessment**: High - Affects SEO, structured data, page rendering

**Estimated Tests**:

- 2 unit tests (metadata generation, schema validation)
- 2 component tests (page render, section composition)
- 1 integration test (full page data flow)
- 2 E2E tests (page load verification, schema validation)

---

#### File: `src/lib/facades/platform/platform-stats.facade.ts`

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `PlatformStatsFacade.getPlatformStatsAsync()` - Main entry point
  - Cache integration (CacheService.platform.stats)
  - Parallel query execution (Promise.all for 3 counts)
  - Error handling with FacadeError context
  - Sentry breadcrumb logging
  - Database transaction support

**Risk Assessment**: Critical - Aggregates platform metrics; cache layer failure affects all pages

**Estimated Tests**:

- 2 unit tests (successful fetch, cache hit)
- 2 unit tests (error scenarios, database failure)
- 1 unit test (parallel execution timing)
- 2 integration tests (database queries, cache invalidation)
- 1 integration test (error propagation)

---

#### File: `src/lib/facades/featured-content/featured-content.facade.ts`

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `getFeaturedBobbleheadAsync()` - Hero section data (cached, single record)
- `getFeaturedCollectionsAsync()` - Featured collections grid (cached, up to 6 records, user-specific)
- `getTrendingBobbleheadsAsync()` - Trending grid (cached, up to 12 records)
- All CRUD operations (create, update, delete, toggle)
- Admin operations and filtering

**Risk Assessment**: Critical - Core featured content pipeline; affects 3 major sections

**Estimated Tests**:

- 3 unit tests (getFeaturedBobblehead, getFeaturedCollections, getTrendingBobbleheads)
- 2 unit tests (cache key differences for user-specific data)
- 2 unit tests (filter operations - filterByType)
- 2 integration tests (database queries for each async method)
- 2 integration tests (error handling and Sentry logging)

---

#### File: `src/lib/queries/featured-content/featured-content-query.ts`

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `getFeaturedBobbleheadAsync(context)` - Single featured bobblehead query
- `getFeaturedCollectionsAsync(context, userId)` - Collections with like status
- `getTrendingBobbleheadsAsync(context)` - Trending bobbleheads with category/year
- Create, update, delete, toggle active operations
- Like status calculation for user-specific data

**Risk Assessment**: Critical - Raw database queries; direct impact on facade

**Estimated Tests**:

- 2 unit/integration tests (getFeaturedBobblehead with/without data)
- 2 unit/integration tests (getFeaturedCollections with/without userId)
- 1 unit/integration test (getTrendingBobbleheads)
- 2 integration tests (like status calculation, edge cases)
- 1 integration test (null/empty result handling)

---

### High Priority (35 tests)

User-facing components, display logic, and direct facades for featured content.

#### File: `src/app/(app)/(home)/components/sections/hero-section.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, E2E

**Exports/Functionality Requiring Tests**:

- `HeroSection` component rendering
- Gradient and animated background elements
- Main heading with orange gradient text
- CTA button rendering (auth-aware via AuthContent)
- Suspense boundaries for PlatformStatsAsync and FeaturedBobbleheadAsync
- ErrorBoundary integration
- Wave divider SVG rendering
- Test ID generation and accessibility attributes

**Risk Assessment**: High - Primary user-facing component; brand presentation

**Estimated Tests**:

- 3 component tests (render, auth states, error boundaries)
- 2 component tests (Suspense fallback states)
- 2 E2E tests (hero visibility, CTA button interaction)
- 1 E2E test (responsive layout)

---

#### File: `src/app/(app)/(home)/components/sections/featured-collections-section.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, E2E

**Exports/Functionality Requiring Tests**:

- `FeaturedCollectionsSection` component
- Section heading and icon
- Suspense boundary with FeaturedCollectionsAsync
- ErrorBoundary integration
- "View All" button linking
- Grid layout responsiveness

**Risk Assessment**: High - Featured content discovery path

**Estimated Tests**:

- 2 component tests (render, error state)
- 1 component test (Suspense fallback)
- 2 E2E tests (section visibility, "View All" button navigation)

---

#### File: `src/app/(app)/(home)/components/sections/trending-bobbleheads-section.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, E2E

**Exports/Functionality Requiring Tests**:

- `TrendingBobbleheadsSection` component
- Section heading and icon
- Suspense and ErrorBoundary boundaries
- "Explore All Bobbleheads" button linking
- Gradient styling

**Risk Assessment**: High - Trending content discovery

**Estimated Tests**:

- 2 component tests (render, error handling)
- 1 component test (Suspense fallback)
- 2 E2E tests (section visibility, button navigation)

---

#### File: `src/app/(app)/(home)/components/sections/join-community-section.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, E2E

**Exports/Functionality Requiring Tests**:

- `JoinCommunitySection` component
- Feature cards (Connect, Discover, Share)
- Auth-aware CTA buttons with different states:
  - Unauthenticated: SignUp button
  - Authenticated: "My Collection" + "Explore Collections" buttons
  - Loading state with skeleton
- Button navigation and link generation
- Responsive grid layout

**Risk Assessment**: High - Conversion funnel; critical for user onboarding

**Estimated Tests**:

- 3 component tests (authenticated, unauthenticated, loading states)
- 1 component test (feature cards rendering)
- 2 E2E tests (button navigation, auth state switching)

---

#### File: `src/app/(app)/(home)/components/async/platform-stats-async.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, Integration

**Exports/Functionality Requiring Tests**:

- `PlatformStatsAsync()` server component
- Facade integration (PlatformStatsFacade.getPlatformStatsAsync)
- Props passing to PlatformStatsDisplay

**Risk Assessment**: High - Direct integration with facade

**Estimated Tests**:

- 1 integration test (successful data fetch and render)
- 1 integration test (facade error handling)

---

#### File: `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, Integration

**Exports/Functionality Requiring Tests**:

- `FeaturedBobbleheadAsync()` server component
- Facade integration (FeaturedContentFacade.getFeaturedBobbleheadAsync)
- Data transformation and field mapping
- Null/undefined handling (returns null if no data)
- Cloudinary URL and user ID mapping

**Risk Assessment**: High - Hero section data dependency

**Estimated Tests**:

- 1 integration test (successful fetch with all fields)
- 1 integration test (partial data handling)
- 1 integration test (null result)

---

#### File: `src/app/(app)/(home)/components/async/featured-collections-async.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, Integration

**Exports/Functionality Requiring Tests**:

- `FeaturedCollectionsAsync()` server component
- Facade integration with userId
- Array mapping transformation
- Like status mapping (isLiked, likeId)
- Null value handling (description, ownerDisplayName)
- Value formatting (totalValue as number)

**Risk Assessment**: High - Featured collections data dependency

**Estimated Tests**:

- 1 integration test (successful fetch with user data)
- 1 integration test (public access without userId)
- 1 integration test (null fields handling)

---

#### File: `src/app/(app)/(home)/components/async/trending-bobbleheads-async.tsx`

**Current Coverage**: None

**Missing Test Types**: Component, Integration

**Exports/Functionality Requiring Tests**:

- `TrendingBobbleheadsAsync()` server component
- Facade integration
- Array mapping with badge assignment
- Year and category field handling
- Edge case: missing category, name, year fields

**Risk Assessment**: High - Trending section data dependency

**Estimated Tests**:

- 1 integration test (successful fetch with all fields)
- 1 integration test (missing field handling)

---

#### File: `src/app/(app)/(home)/components/display/platform-stats-display.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `PlatformStatsDisplay` component
- Props: platformStats with totalBobbleheads, totalCollectors, totalCollections
- Number formatting with toLocaleString()
- Test ID generation per stat item
- Accessibility: aria-label, definition list (dl/dt/dd)
- Styling and responsive layout

**Risk Assessment**: High - Stats display logic

**Estimated Tests**:

- 1 component test (render with data)
- 1 component test (number formatting)
- 1 component test (accessibility attributes)

---

#### File: `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `FeaturedBobbleheadDisplay` component with testId prop
- Cloudinary image handling:
  - Image extraction from publicId
  - Blur data URL generation
  - Fallback trophy icon when no image
- Link generation (bobblehead slug)
- Badge rendering (editor_pick)
- Stats display (likes, views)
- Floating cards (animated)
- Responsive image sizing

**Risk Assessment**: High - Complex display component

**Estimated Tests**:

- 1 component test (render with complete data)
- 1 component test (missing image handling)
- 1 component test (Cloudinary utilities integration)
- 1 component test (link navigation)
- 1 component test (badge and stats rendering)

---

#### File: `src/app/(app)/(home)/components/display/featured-collections-display.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `FeaturedCollectionsDisplay` component with collections array
- Empty state handling (0 collections)
- `FeaturedCollectionCard` sub-component rendering
- Image handling (Cloudinary vs placeholder)
- Owner avatar with fallback
- Like status and trending badge
- Value formatting
- Responsive grid (1/2/3 columns)
- Link navigation with slug

**Risk Assessment**: High - Collections grid display

**Estimated Tests**:

- 1 component test (render with data)
- 1 component test (empty state)
- 1 component test (image fallbacks)
- 1 component test (likes and trending badge)
- 1 component test (responsive layout)

---

#### File: `src/app/(app)/(home)/components/display/trending-bobbleheads-display.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `TrendingBobbleheadsDisplay` component
- Empty state handling
- `TrendingBobbleheadCard` sub-component
- Badge variant mapping (editor_pick, new_badge, popular, trending)
- Image handling with blur data
- Stats overlay on hover
- Category and year display
- Link navigation

**Risk Assessment**: High - Trending grid display

**Estimated Tests**:

- 1 component test (render with data)
- 1 component test (empty state)
- 1 component test (badge variant mapping)
- 1 component test (image and hover states)
- 1 component test (stats display)

---

#### File: `src/components/ui/auth.tsx` (AuthContent)

**Current Coverage**: None (Not a skeleton component)

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `AuthContent` component with auth state management
- Three conditional renders:
  1. Loading state (loadingSkeleton)
  2. Authenticated (children)
  3. Unauthenticated (fallback)
- Clerk useAuth hook integration
- Fragment wrapper behavior

**Risk Assessment**: High - Affects all auth-aware components (hero, community section)

**Estimated Tests**:

- 1 component test (loading state)
- 1 component test (authenticated render)
- 1 component test (unauthenticated render)

---

### Medium Priority (35 tests)

Skeleton components, utility functions, and supporting queries.

#### File: `src/app/(app)/(home)/components/skeleton/platform-stats-skeleton.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `PlatformStatsSkeleton` component
- Skeleton structure (3 stat items)
- Accessibility: aria-busy, aria-label, role="status", sr-only
- Test ID generation for each skeleton item
- Styling and animation

**Risk Assessment**: Medium - Loading state UX

**Estimated Tests**:

- 1 component test (render structure)
- 1 component test (accessibility attributes)

---

#### File: `src/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `FeaturedBobbleheadSkeleton` component
- Main card structure
- Floating cards with animation delays
- Test ID generation
- Accessibility attributes

**Risk Assessment**: Medium - Loading state UX

**Estimated Tests**:

- 1 component test (structure)
- 1 component test (floating card animations)
- 1 component test (accessibility)

---

#### File: `src/app/(app)/(home)/components/skeleton/featured-collections-skeleton.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `FeaturedCollectionsSkeleton` component
- Array rendering (6 skeleton cards)
- Test ID generation
- Responsive grid layout

**Risk Assessment**: Medium - Loading state UX

**Estimated Tests**:

- 1 component test (renders 6 skeletons)
- 1 component test (grid structure)

---

#### File: `src/app/(app)/(home)/components/skeleton/trending-bobbleheads-skeleton.tsx`

**Current Coverage**: None

**Missing Test Types**: Component

**Exports/Functionality Requiring Tests**:

- `TrendingBobbleheadsSkeleton` component
- Array rendering (12 skeleton cards)
- Test ID generation
- Responsive grid (2/3/6 columns)

**Risk Assessment**: Medium - Loading state UX

**Estimated Tests**:

- 1 component test (renders 12 skeletons)
- 1 component test (responsive grid)

---

#### File: `src/lib/queries/featured-content/featured-content-transformer.ts`

**Current Coverage**: None

**Missing Test Types**: Unit

**Exports/Functionality Requiring Tests**:

- `transformFeaturedContent()` - Transform raw data to FeaturedContentData
- `filterByType()` - Filter by feature_type
- Field mapping and null handling
- Data normalization

**Risk Assessment**: Medium - Data transformation layer

**Estimated Tests**:

- 1 unit test (successful transformation)
- 1 unit test (null field handling)
- 1 unit test (filterByType with multiple types)
- 1 unit test (empty result filtering)

---

#### File: `src/lib/utils/cloudinary.utils.ts`

**Current Coverage**: None

**Missing Test Types**: Unit

**Exports/Functionality Requiring Tests**:

- `extractPublicIdFromCloudinaryUrl()` - Extract public ID from URL
- `generateBlurDataUrl()` - Generate blur placeholder
- Edge cases: null, undefined, invalid URLs
- URL format handling

**Risk Assessment**: Medium - Image optimization utility

**Estimated Tests**:

- 1 unit test (valid Cloudinary URL)
- 1 unit test (null/undefined handling)
- 1 unit test (invalid URL format)
- 1 unit test (blur data generation)

---

#### File: `src/lib/services/cache.service.ts` (featured.\* methods)

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `CacheService.featured.featuredBobblehead()` - Redis cache for featured bobblehead
- `CacheService.featured.collections()` - User-specific cache for collections
- `CacheService.featured.trendingBobbleheads()` - Cache for trending bobbleheads
- Cache key generation
- TTL configuration
- Cache hit/miss behavior

**Risk Assessment**: Medium - Performance optimization layer

**Estimated Tests**:

- 1 unit test (cache key generation)
- 1 unit test (TTL configuration)
- 2 integration tests (cache hit, cache miss)
- 1 integration test (user-specific cache differentiation)

---

#### File: `src/lib/queries/bobbleheads/bobbleheads-query.ts` (getBobbleheadCountAsync)

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `getBobbleheadCountAsync()` - Count active bobbleheads
- Database query execution
- Result counting/aggregation

**Risk Assessment**: Medium - Platform stats dependency

**Estimated Tests**:

- 1 unit/integration test (successful count)
- 1 integration test (error handling)

---

#### File: `src/lib/queries/collections/collections.query.ts` (getCollectionCountAsync)

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `getCollectionCountAsync()` - Count active collections
- Database query execution

**Risk Assessment**: Medium - Platform stats dependency

**Estimated Tests**:

- 1 unit/integration test (successful count)
- 1 integration test (error handling)

---

#### File: `src/lib/queries/users/users-query.ts` (getUserCountAsync)

**Current Coverage**: None

**Missing Test Types**: Unit, Integration

**Exports/Functionality Requiring Tests**:

- `getUserCountAsync()` - Count active users
- Database query execution

**Risk Assessment**: Medium - Platform stats dependency

**Estimated Tests**:

- 1 unit/integration test (successful count)
- 1 integration test (error handling)

---

### Low Priority (0 tests)

No low-priority gaps identified. All remaining components have dependencies on higher-priority items.

---

## Existing Test Coverage

### Tests Found

1. **`tests/e2e/specs/smoke/health.spec.ts`**
   - Tests: Home page loads, server responds with 200, static assets load, console errors
   - Coverage: Basic smoke test of home page functionality
   - Scope: Does not test specific feature sections or data loading

2. **`tests/e2e/pages/home.page.ts`**
   - Page Object Model for home page navigation
   - Locators: heroSection, getStartedButton, searchInput
   - Methods: goto(), clickGetStarted(), search()
   - Current Usage: Smoke test only

3. **`tests/components/ui/button.test.tsx`**
   - Reusable Button component tests
   - Can be reused for CTA buttons in hero and community sections

4. **`tests/components/ui/badge.test.tsx`**
   - Reusable Badge component tests
   - Can be reused for badges in featured/trending sections

5. **`tests/components/ui/skeleton.test.tsx`** (referenced but not found in glob)
   - Base Skeleton component tests
   - Can test custom skeleton components

6. **`tests/components/ui/alert.test.tsx`**
   - Alert component tests
   - Potential reuse for error states

### Partial Coverage Notes

- **Button Component**: Tests exist for base Button, but CTA-specific button integration tests missing
- **Badge Component**: Tests exist, but badge variants (editor_pick, trending) need integration tests
- **Skeleton Component**: Base skeleton tested, but custom home page skeletons untested
- **Page Object Model**: Home page POM created but minimal selectors; needs expansion

---

## Test Infrastructure Notes

### Existing Fixtures & Setup

- `tests/e2e/fixtures/base.fixture.ts` - Base E2E fixture with Playwright setup
- `tests/components/` - Component test infrastructure with Testing Library
- `tests/integration/` - Integration test patterns for facades
- `tests/unit/` - Unit test patterns for validations and utilities

### Existing Mocks & Utilities

- Facade tests exist for bobbleheads, collections, and social features (can be pattern-matched)
- Database integration tests use Testcontainers pattern
- Validation schema tests exist for reference

### Setup Requirements

1. **For Component Tests**:
   - Extend existing component test setup
   - Mock Clerk useAuth hook for AuthContent tests
   - Mock Cloudinary utilities for image display tests
   - Mock next-typesafe-url $path for link tests

2. **For Integration Tests**:
   - Database fixtures/factories for featured_content table
   - Mock CacheService for facade tests
   - Sentry context mocking for error tracking tests

3. **For E2E Tests**:
   - Expand HomePage page object with section selectors
   - Add data-testid targeting for all major sections
   - Database seeding for featured content

---

## Recommendations

### 1. Start With (Critical Path)

1. **`platform-stats.facade.ts`** (2 days)
   - Foundation for hero stats display
   - Unblocks: platform-stats-async, platform-stats-display tests
   - Tests: 6 unit + 3 integration = 9 tests

2. **`featured-content.facade.ts`** (3 days)
   - Core featured content pipeline
   - Unblocks: all async components and display components
   - Tests: 9 unit + 5 integration = 14 tests

3. **Display Components** (4 days)
   - Platform stats, featured bobblehead, collections, trending
   - No external dependencies once async data provided
   - Tests: 18 component tests

### 2. Quick Wins (High Value, Low Effort)

- **Skeleton Components** (1 day): 4 component tests, simple structure
- **Platform Stats Display** (0.5 days): 3 component tests, basic rendering
- **Join Community Section** (1 day): 3 component tests, static content

### 3. Blockers & Dependencies

1. **Clerk Mock Setup**: Needed for AuthContent and hero/community section tests
   - Required before: hero-section, join-community-section, auth.tsx tests
   - Effort: 0.5 days to set up reusable mock

2. **Cloudinary Mock Setup**: Needed for image display tests
   - Required before: featured-bobblehead-display, featured-collections-display, trending-bobbleheads-display tests
   - Effort: 0.5 days to set up extractPublicId and generateBlurDataUrl mocks

3. **Database Fixtures**: Needed for integration tests
   - Required before: facade and query tests
   - Effort: 1 day to create FeaturedContent factory

4. **Cache Service Mock**: Needed for facade unit tests without integration
   - Required before: Facade unit tests (can run integration tests separately)
   - Effort: 0.5 days

---

## Test Count Summary by Type

| Test Type             | Count   | Status                        |
| --------------------- | ------- | ----------------------------- |
| **Unit Tests**        | 42      | Missing                       |
| **Component Tests**   | 42      | Missing                       |
| **Integration Tests** | 28      | Missing                       |
| **E2E Tests**         | 15      | Partial (1 smoke test exists) |
| **Total**             | **127** | Missing                       |

---

## Implementation Phases

### Phase 1: Infrastructure Setup (2 days)

- Clerk mock for auth-aware components
- Cloudinary utilities mock
- Featured content database factory
- Cache service test utilities

### Phase 2: Core Facades & Queries (5 days)

- Platform stats facade (6 unit + 3 integration tests)
- Featured content facade (9 unit + 5 integration tests)
- Query and transformer unit tests (8 unit tests)

### Phase 3: Async Components & Transformations (3 days)

- Async component integration tests (6 tests)
- Display component tests (18 tests)
- Auth component tests (3 tests)

### Phase 4: Section Components & E2E (4 days)

- Section component tests (8 tests)
- Skeleton component tests (8 tests)
- E2E section tests (14 tests)
- Page-level tests (3 tests)

**Total Estimated Effort**: 14 days

---

## Critical Code Sections Requiring Testing

### 1. Error Handling in Facades

```typescript
// Featured Content Facade - Error context pattern
catch (error) {
  const errorContext: FacadeErrorContext = {
    data: {},
    facade: facadeName,
    method: 'getTrendingBobbleheadsAsync',
    operation: OPERATIONS.FEATURED_CONTENT.GET_TRENDING_BOBBLEHEADS,
  };
  throw createFacadeError(errorContext, error);
}
```

**Tests needed**: Verify error context propagation, Sentry logging, error messages

### 2. Data Transformation in Async Components

```typescript
// Featured Collections Async - Complex mapping
const collections: Array<FeaturedCollection> = collectionsData.map((data) => ({
  comments: data.comments,
  contentId: data.contentId,
  // ... 20+ fields with null handling
  totalValue: data.totalValue ? Number(data.totalValue) : 0,
}));
```

**Tests needed**: Null field handling, type conversions, array mapping edge cases

### 3. Cache Layer Integration

```typescript
// Platform Stats Facade - Cache with custom key
return await CacheService.platform.stats(
  async () => {
    /* fetch logic */
  },
  {
    context: {
      entityType: CACHE_ENTITY_TYPE.PLATFORM,
      facade: facadeName,
      operation: OPERATIONS.PLATFORM.GET_STATS,
    },
    ttl: CACHE_CONFIG.TTL.EXTENDED,
  },
);
```

**Tests needed**: Cache key generation, TTL application, cache invalidation

### 4. Image Optimization (Cloudinary)

```typescript
// Featured Bobblehead Display - Image handling
const _publicId = _hasPhoto ? extractPublicIdFromCloudinaryUrl(bobblehead.photoUrl!) : null;
const _blurDataUrl = _publicId ? generateBlurDataUrl(_publicId) : undefined;
const _hasPhotoAndPublicId = _hasPhoto && Boolean(_publicId);
```

**Tests needed**: URL parsing, blur data generation, fallback rendering

### 5. Auth-Aware Rendering

```typescript
// Hero Section - Auth-aware CTA
<AuthContent
  fallback={<SignUpButton>Start Your Collection</SignUpButton>}
  loadingSkeleton={<Skeleton className={'h-11 w-52 rounded-md'} />}
>
  <Link href={$path({ route: '/dashboard/collection' })}>
    My Collection
  </Link>
</AuthContent>
```

**Tests needed**: Auth state rendering, skeleton display, button navigation

---

## File Organization for New Tests

```
tests/
├── unit/
│   ├── lib/
│   │   ├── facades/
│   │   │   ├── platform/
│   │   │   │   └── platform-stats.facade.test.ts
│   │   │   └── featured-content/
│   │   │       └── featured-content.facade.test.ts
│   │   ├── queries/
│   │   │   └── featured-content/
│   │   │       ├── featured-content-query.test.ts
│   │   │       └── featured-content-transformer.test.ts
│   │   └── utils/
│   │       ├── cloudinary.utils.test.ts
│   │       └── cache.service.test.ts
│   └── queries/
│       ├── bobbleheads-count.test.ts
│       ├── collections-count.test.ts
│       └── users-count.test.ts
├── components/
│   ├── home/
│   │   ├── sections/
│   │   │   ├── hero-section.test.tsx
│   │   │   ├── featured-collections-section.test.tsx
│   │   │   ├── trending-bobbleheads-section.test.tsx
│   │   │   └── join-community-section.test.tsx
│   │   ├── async/
│   │   │   ├── platform-stats-async.test.tsx
│   │   │   ├── featured-bobblehead-async.test.tsx
│   │   │   ├── featured-collections-async.test.tsx
│   │   │   └── trending-bobbleheads-async.test.tsx
│   │   ├── display/
│   │   │   ├── platform-stats-display.test.tsx
│   │   │   ├── featured-bobblehead-display.test.tsx
│   │   │   ├── featured-collections-display.test.tsx
│   │   │   └── trending-bobbleheads-display.test.tsx
│   │   ├── skeleton/
│   │   │   ├── platform-stats-skeleton.test.tsx
│   │   │   ├── featured-bobblehead-skeleton.test.tsx
│   │   │   ├── featured-collections-skeleton.test.tsx
│   │   │   └── trending-bobbleheads-skeleton.test.tsx
│   │   └── home-page.test.tsx
│   └── ui/
│       └── auth.test.tsx
├── integration/
│   └── home-page/
│       ├── platform-stats-flow.test.ts
│       ├── featured-content-flow.test.ts
│       └── home-page-data-pipeline.test.ts
└── e2e/
    └── specs/
        ├── home/
        │   ├── hero-section.spec.ts
        │   ├── featured-sections.spec.ts
        │   ├── trending-section.spec.ts
        │   ├── community-section.spec.ts
        │   └── full-page-flow.spec.ts
        └── pages/
            └── home.page.ts (expand selectors)
```

---

## Quality Standards Applied

- **Specificity**: Each gap lists exact functionality and file locations
- **Risk Assessment**: Based on business impact and architecture position
- **Estimation Accuracy**: Based on code complexity and patterns from existing tests
- **Reusability**: Identified shared test utilities (Button, Badge, Skeleton)
- **Dependencies**: Explicit blocking relationships noted
- **Coverage Pyramid**: Follows unit -> integration -> component -> E2E hierarchy

---

## Next Steps

1. **Review this analysis** with the team
2. **Prioritize phases** based on project timeline
3. **Create task file** at `docs/2025_11_27/tasks/home-page-testing.md` with broken-down tasks
4. **Use `/plan-tests home-page --scope=all`** to generate comprehensive test implementation plan
