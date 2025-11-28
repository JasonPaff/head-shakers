# Test Implementation Plan: Home Page

Generated: 2025-11-27
Original Request: "the home page, not including the header/footer"
Scope Filter: all (Unit, Component, Integration, E2E)

## Analysis Summary

- Feature area refined into testable requirements
- Discovered 41 source files, 6 existing tests
- Identified 38 coverage gaps (127 tests missing)
- Generated 15-step test implementation plan

## Coverage Gap Summary

| Priority  | Test Count | Description                        |
| --------- | ---------- | ---------------------------------- |
| Critical  | 34         | Facades, Queries, Page composition |
| High      | 56         | Display, Async, Section components |
| Medium    | 37         | Skeletons, Utilities, Transformers |
| **Total** | **127**    | **Missing tests**                  |

---

## Overview

| Metric          | Value                             |
| --------------- | --------------------------------- |
| Total Tests     | 127                               |
| Complexity      | High                              |
| Risk Level      | Medium (core user-facing feature) |
| Estimated Steps | 15                                |

## Prerequisites

### 1. Test Infrastructure Setup

**Clerk Auth Mock** (Required for component tests)

```typescript
// tests/mocks/clerk.mock.ts
vi.mock('@clerk/nextjs', () => ({
  useAuth: vi.fn(() => ({ isLoaded: true, isSignedIn: true, userId: 'test-user-id' })),
  SignUpButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));
```

**Cloudinary Utilities Mock** (Required for display component tests)

```typescript
// tests/mocks/cloudinary.mock.ts
vi.mock('@/lib/utils/cloudinary.utils', () => ({
  extractPublicIdFromCloudinaryUrl: vi.fn((url: string) => (url ? 'mock-public-id' : null)),
  generateBlurDataUrl: vi.fn(() => 'data:image/jpeg;base64,mock'),
}));
```

**next-typesafe-url Mock** (Required for navigation tests)

```typescript
// tests/mocks/path.mock.ts
vi.mock('next-typesafe-url', () => ({
  $path: vi.fn(({ route }: { route: string }) => route),
}));
```

### 2. Database Fixtures (Required for integration tests)

**Featured Content Factory**

- File: `tests/fixtures/featured-content.factory.ts`
- Create functions: `createTestFeaturedBobblehead()`, `createTestFeaturedCollection()`, `createTestTrendingBobblehead()`

### 3. MSW Handlers (Optional for API mocking)

- `tests/mocks/handlers/featured-content.handlers.ts`

---

## Implementation Steps

### Step 1: Infrastructure Setup - Clerk Mock

**What**: Create reusable Clerk authentication mock for component tests
**Why**: AuthContent component and auth-aware CTAs require mocked auth state
**Test Type**: Infrastructure
**Files to Create**:

- `tests/mocks/clerk.mock.ts`

**Implementation**:

```typescript
// tests/mocks/clerk.mock.ts
import { vi } from 'vitest';

export const mockClerkAuth = (
  overrides: Partial<{ isLoaded: boolean; isSignedIn: boolean; userId: string | null }> = {},
) => {
  const defaultState = {
    isLoaded: true,
    isSignedIn: false,
    userId: null,
    ...overrides,
  };

  vi.mocked(useAuth).mockReturnValue(defaultState);
};

export const mockSignedInUser = () => mockClerkAuth({ isSignedIn: true, userId: 'test-user-id' });
export const mockSignedOutUser = () => mockClerkAuth({ isSignedIn: false, userId: null });
export const mockLoadingAuth = () => mockClerkAuth({ isLoaded: false });
```

**Validation Commands**:

```bash
npm run typecheck
```

**Success Criteria**:

- Mock exports `mockClerkAuth`, `mockSignedInUser`, `mockSignedOutUser`, `mockLoadingAuth`
- TypeScript compiles without errors

---

### Step 2: Infrastructure Setup - Cloudinary Mock

**What**: Create Cloudinary utilities mock for image display tests
**Why**: Display components use `extractPublicIdFromCloudinaryUrl` and `generateBlurDataUrl`
**Test Type**: Infrastructure
**Files to Create**:

- `tests/mocks/cloudinary.mock.ts`

**Implementation**:

```typescript
// tests/mocks/cloudinary.mock.ts
import { vi } from 'vitest';

export const mockCloudinaryUtils = () => {
  vi.mock('@/lib/utils/cloudinary.utils', () => ({
    extractPublicIdFromCloudinaryUrl: vi.fn((url: string | null) => (url ? 'mock-public-id' : null)),
    generateBlurDataUrl: vi.fn(() => 'data:image/jpeg;base64,/9j/mock'),
  }));
};
```

**Validation Commands**:

```bash
npm run typecheck
```

**Success Criteria**:

- Mock properly mocks both Cloudinary utility functions
- TypeScript compiles without errors

---

### Step 3: Infrastructure Setup - Featured Content Factory

**What**: Create database factory for featured content test data
**Why**: Integration tests need consistent test data for featured bobbleheads, collections, trending
**Test Type**: Infrastructure
**Files to Create**:

- `tests/fixtures/featured-content.factory.ts`

**Test Cases**:

- Factory creates valid featured_content records
- Factory supports overrides for all fields
- Factory links to valid bobblehead/collection records

**Patterns to Follow**:

- Use pattern from existing `tests/fixtures/user.factory.ts`
- Return typed objects matching `FeaturedContentRecord`

**Validation Commands**:

```bash
npm run typecheck
npm run test:run -- tests/fixtures/featured-content.factory.test.ts
```

**Success Criteria**:

- Factory creates records in database
- All foreign key constraints satisfied
- Returns properly typed objects

---

### Step 4: Unit Tests - Cloudinary Utilities

**What**: Unit test `extractPublicIdFromCloudinaryUrl` and `generateBlurDataUrl`
**Why**: Critical for image display; used by all display components
**Test Type**: Unit
**Files to Create**:

- `tests/unit/lib/utils/cloudinary.utils.test.ts`

**Test Cases**:

1. `extractPublicIdFromCloudinaryUrl` - extracts public ID from valid Cloudinary URL
2. `extractPublicIdFromCloudinaryUrl` - returns null for null/undefined input
3. `extractPublicIdFromCloudinaryUrl` - returns null for non-Cloudinary URL
4. `generateBlurDataUrl` - generates valid base64 data URL
5. `generateBlurDataUrl` - handles various public IDs

**Patterns to Follow**:

```typescript
describe('cloudinary utilities', () => {
  describe('extractPublicIdFromCloudinaryUrl', () => {
    it('should extract public ID from valid Cloudinary URL', () => {
      const url = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
      const result = extractPublicIdFromCloudinaryUrl(url);
      expect(result).toBe('sample');
    });
  });
});
```

**Validation Commands**:

```bash
npm run test:run -- tests/unit/lib/utils/cloudinary.utils.test.ts
```

**Success Criteria**:

- All 5 test cases pass
- 100% coverage of utility functions

---

### Step 5: Unit Tests - Featured Content Transformer

**What**: Unit test data transformation logic
**Why**: Transforms database records to typed DTOs
**Test Type**: Unit
**Files to Create**:

- `tests/unit/lib/queries/featured-content/featured-content-transformer.test.ts`

**Test Cases**:

1. `transformFeaturedContent` - transforms complete record correctly
2. `transformFeaturedContent` - handles null optional fields
3. `filterByType` - filters by single feature type
4. `filterByType` - filters by multiple feature types
5. `filterByType` - returns empty array for no matches

**Validation Commands**:

```bash
npm run test:run -- tests/unit/lib/queries/featured-content/featured-content-transformer.test.ts
```

**Success Criteria**:

- All transformation edge cases covered
- Type safety verified

---

### Step 6: Integration Tests - Platform Stats Facade

**What**: Test `PlatformStatsFacade.getPlatformStatsAsync()` with real database
**Why**: Critical facade that aggregates platform metrics; uses parallel queries
**Test Type**: Integration
**Files to Create**:

- `tests/integration/facades/platform/platform-stats.facade.test.ts`

**Test Cases**:

1. Returns correct counts for bobbleheads, collections, users
2. Returns zeros when database is empty
3. Handles database errors gracefully
4. Cache integration - returns cached data on second call
5. Parallel query execution timing

**Patterns to Follow**:

```typescript
import { getTestDb, resetTestDatabase } from '@/tests/setup/test-db';
import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';

describe('PlatformStatsFacade', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  describe('getPlatformStatsAsync', () => {
    it('should return correct counts', async () => {
      // Create test data
      await createTestUser();
      await createTestBobblehead();
      await createTestCollection();

      const result = await PlatformStatsFacade.getPlatformStatsAsync();

      expect(result.totalBobbleheads).toBe(1);
      expect(result.totalCollectors).toBe(1);
      expect(result.totalCollections).toBe(1);
    });
  });
});
```

**Validation Commands**:

```bash
npm run test:integration -- tests/integration/facades/platform/platform-stats.facade.test.ts
```

**Success Criteria**:

- All 5 test cases pass
- Database queries execute correctly
- Error handling verified

---

### Step 7: Integration Tests - Featured Content Facade

**What**: Test featured content facade methods used by home page
**Why**: Core data pipeline for hero, featured collections, trending sections
**Test Type**: Integration
**Files to Create**:

- `tests/integration/facades/featured-content/featured-content.facade.test.ts`

**Test Cases**:

1. `getFeaturedBobbleheadAsync` - returns featured bobblehead with all fields
2. `getFeaturedBobbleheadAsync` - returns null when none featured
3. `getFeaturedCollectionsAsync` - returns up to 6 collections
4. `getFeaturedCollectionsAsync` - includes like status for authenticated user
5. `getFeaturedCollectionsAsync` - excludes expired content (endDate check)
6. `getTrendingBobbleheadsAsync` - returns up to 12 trending items
7. `getTrendingBobbleheadsAsync` - filters by feature type correctly
8. Cache key differentiation for user-specific data
9. Error context propagation with Sentry

**Validation Commands**:

```bash
npm run test:integration -- tests/integration/facades/featured-content/featured-content.facade.test.ts
```

**Success Criteria**:

- All 9 test cases pass
- Cache behavior verified
- User-specific data handling correct

---

### Step 8: Integration Tests - Featured Content Query

**What**: Test raw database queries for featured content
**Why**: Foundation for facade layer; complex joins and filters
**Test Type**: Integration
**Files to Create**:

- `tests/integration/queries/featured-content/featured-content-query.test.ts`

**Test Cases**:

1. `getFeaturedBobbleheadAsync` - joins with bobbleheads table correctly
2. `getFeaturedBobbleheadAsync` - orders by priority descending
3. `getFeaturedCollectionsAsync` - includes owner user data
4. `getFeaturedCollectionsAsync` - calculates like status for user
5. `getTrendingBobbleheadsAsync` - filters by isActive and date range
6. Query handles null/empty results gracefully

**Validation Commands**:

```bash
npm run test:integration -- tests/integration/queries/featured-content/featured-content-query.test.ts
```

**Success Criteria**:

- All query methods tested
- Join behavior verified
- Filter logic correct

---

### Step 9: Component Tests - Skeleton Components

**What**: Test all 4 skeleton loading components
**Why**: Quick wins; simple structure, important for loading UX
**Test Type**: Component
**Files to Create**:

- `tests/components/home/skeleton/platform-stats-skeleton.test.tsx`
- `tests/components/home/skeleton/featured-bobblehead-skeleton.test.tsx`
- `tests/components/home/skeleton/featured-collections-skeleton.test.tsx`
- `tests/components/home/skeleton/trending-bobbleheads-skeleton.test.tsx`

**Test Cases per File**:

1. Renders correct number of skeleton items
2. Has proper accessibility attributes (aria-busy, role="status")
3. Includes correct test IDs
4. (For featured-bobblehead) Renders floating card animations

**Patterns to Follow**:

```typescript
import { customRender, screen } from '@/tests/setup/test-utils';
import { PlatformStatsSkeleton } from '@/app/(app)/(home)/components/skeleton/platform-stats-skeleton';

describe('PlatformStatsSkeleton', () => {
  it('should render 3 skeleton stat items', () => {
    customRender(<PlatformStatsSkeleton />);

    expect(screen.getAllByRole('status')).toHaveLength(3);
  });

  it('should have aria-busy attribute', () => {
    customRender(<PlatformStatsSkeleton />);

    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });
});
```

**Validation Commands**:

```bash
npm run test:components -- tests/components/home/skeleton/
```

**Success Criteria**:

- All 4 skeleton components tested
- Accessibility attributes verified
- ~8 tests total

---

### Step 10: Component Tests - Display Components

**What**: Test all 4 display components with various data states
**Why**: User-facing rendering logic; handles empty states, images, formatting
**Test Type**: Component
**Files to Create**:

- `tests/components/home/display/platform-stats-display.test.tsx`
- `tests/components/home/display/featured-bobblehead-display.test.tsx`
- `tests/components/home/display/featured-collections-display.test.tsx`
- `tests/components/home/display/trending-bobbleheads-display.test.tsx`

**Test Cases - PlatformStatsDisplay**:

1. Renders all 3 stat values
2. Formats numbers with toLocaleString
3. Has proper accessibility (dl/dt/dd structure)

**Test Cases - FeaturedBobbleheadDisplay**:

1. Renders with complete data
2. Shows trophy icon when no image
3. Displays editor's pick badge
4. Links to bobblehead detail page

**Test Cases - FeaturedCollectionsDisplay**:

1. Renders collection grid
2. Shows empty state when no collections
3. Displays owner avatar and info
4. Shows like status and trending badge

**Test Cases - TrendingBobbleheadsDisplay**:

1. Renders trending grid
2. Shows empty state
3. Maps badge variants correctly
4. Displays category and year

**Validation Commands**:

```bash
npm run test:components -- tests/components/home/display/
```

**Success Criteria**:

- All display states tested
- Image fallbacks verified
- ~18 tests total

---

### Step 11: Component Tests - AuthContent

**What**: Test auth-aware conditional rendering component
**Why**: Critical for all auth-aware CTAs on home page
**Test Type**: Component
**Files to Create**:

- `tests/components/ui/auth.test.tsx`

**Test Cases**:

1. Shows loading skeleton when `isLoaded` is false
2. Renders children when signed in
3. Renders fallback when signed out
4. Fragment wrapper doesn't add extra DOM

**Patterns to Follow**:

```typescript
import { mockLoadingAuth, mockSignedInUser, mockSignedOutUser } from '@/tests/mocks/clerk.mock';

describe('AuthContent', () => {
  it('should render loading skeleton when auth is loading', () => {
    mockLoadingAuth();
    customRender(
      <AuthContent loadingSkeleton={<div data-testid="loading">Loading</div>} fallback={<div>Fallback</div>}>
        <div>Content</div>
      </AuthContent>
    );

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
```

**Validation Commands**:

```bash
npm run test:components -- tests/components/ui/auth.test.tsx
```

**Success Criteria**:

- All 3 auth states tested
- Integration with Clerk useAuth verified

---

### Step 12: Component Tests - Section Components

**What**: Test all 4 section components (excluding async data)
**Why**: User-facing structure; wraps Suspense boundaries
**Test Type**: Component
**Files to Create**:

- `tests/components/home/sections/hero-section.test.tsx`
- `tests/components/home/sections/featured-collections-section.test.tsx`
- `tests/components/home/sections/trending-bobbleheads-section.test.tsx`
- `tests/components/home/sections/join-community-section.test.tsx`

**Test Cases - HeroSection**:

1. Renders heading and CTAs
2. Shows Suspense fallback skeletons
3. Auth-aware button rendering

**Test Cases - FeaturedCollectionsSection**:

1. Renders section heading
2. Shows "View All" link

**Test Cases - TrendingBobbleheadsSection**:

1. Renders section heading
2. Shows "Explore All" link

**Test Cases - JoinCommunitySection**:

1. Renders 3 feature cards
2. Auth-aware CTAs (signed in vs out)
3. Loading state for auth

**Validation Commands**:

```bash
npm run test:components -- tests/components/home/sections/
```

**Success Criteria**:

- Section structure verified
- Suspense boundaries tested with fallbacks
- ~14 tests total

---

### Step 13: Component Tests - Home Page

**What**: Test main page component composition and SEO
**Why**: Orchestrates all sections; generates metadata
**Test Type**: Component
**Files to Create**:

- `tests/components/home/home-page.test.tsx`

**Test Cases**:

1. Renders all 4 sections
2. `generateMetadata` returns correct SEO data
3. JSON-LD schema is valid

**Validation Commands**:

```bash
npm run test:components -- tests/components/home/home-page.test.tsx
```

**Success Criteria**:

- Page composition verified
- Metadata generation tested

---

### Step 14: E2E Tests - Home Page Sections

**What**: Full E2E tests for home page user journeys
**Why**: Validates complete user experience including data loading
**Test Type**: E2E
**Files to Create**:

- `tests/e2e/specs/public/home-sections.spec.ts`
- `tests/e2e/specs/user/home-authenticated.spec.ts`

**Test Cases - Public (Unauthenticated)**:

1. Hero section visible with "Start Your Collection" CTA
2. Platform stats display with numbers
3. Featured collections section loads
4. Trending bobbleheads section loads
5. Join community section shows signup CTA
6. "Browse Collections" navigation works
7. "Explore Bobbleheads" navigation works

**Test Cases - Authenticated**:

1. Hero section shows "My Collection" button
2. Join community shows "My Collection" link
3. Featured collections show like status
4. Navigation to dashboard works

**Patterns to Follow**:

```typescript
import { expect } from '@playwright/test';
import { test } from '@/tests/e2e/fixtures/base.fixture';

test.describe('Home Page - Public', () => {
  test('should display hero section with signup CTA', async ({ page, finder }) => {
    await page.goto('/');

    await expect(page.locator(finder.layout('hero', 'section'))).toBeVisible();
    await expect(page.getByRole('button', { name: /start your collection/i })).toBeVisible();
  });
});
```

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-sections.spec.ts
npm run test:e2e -- tests/e2e/specs/user/home-authenticated.spec.ts
```

**Success Criteria**:

- All sections visible and functional
- Navigation works correctly
- Auth states render properly
- ~15 E2E tests total

---

### Step 15: Expand Home Page Object Model

**What**: Add comprehensive selectors to existing home page POM
**Why**: Support E2E tests with consistent locators
**Test Type**: E2E Infrastructure
**Files to Modify**:

- `tests/e2e/pages/home.page.ts`

**Additions**:

```typescript
export class HomePage extends BasePage {
  readonly url = '/';

  // Section locators
  heroSection = this.byTestId('layout-hero-section');
  featuredCollectionsSection = this.byTestId('layout-featured-collections-section');
  trendingBobbleheadsSection = this.byTestId('layout-trending-bobbleheads-section');
  joinCommunitySection = this.byTestId('layout-join-community-section');

  // Stats
  platformStats = this.byTestId('feature-platform-stats-display');

  // CTAs
  startCollectionButton = this.page.getByRole('button', { name: /start your collection/i });
  myCollectionLink = this.page.getByRole('link', { name: /my collection/i });
  browseCollectionsLink = this.page.getByRole('link', { name: /browse collections/i });
  exploreBobblesLink = this.page.getByRole('link', { name: /explore bobbleheads/i });
}
```

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/smoke/health.spec.ts
```

**Success Criteria**:

- POM includes all section locators
- Existing smoke test still passes

---

## Quality Gates

### After Each Step

- [ ] Tests pass: `npm run test:run -- {test-file}`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Linting passes: `npm run lint`

### After All Steps

- [ ] Full test suite passes: `npm run test:run`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Coverage meets threshold (60%+): `npm run test:coverage`

---

## Test Infrastructure Notes

### Existing Setup (Reuse)

- `tests/setup/test-utils.tsx` - customRender with providers
- `tests/setup/test-db.ts` - Testcontainers helpers
- `tests/setup/vitest.setup.ts` - Global mocks (Clerk, Next.js)
- `tests/e2e/fixtures/base.fixture.ts` - Playwright fixtures

### Pre-Mocked (No Additional Setup)

- Clerk authentication (`@clerk/nextjs`, `@clerk/nextjs/server`)
- Next.js navigation (`next/navigation`, `next/headers`)
- Toast notifications (`sonner`)
- Theme provider (`next-themes`)

### New Mocks Required

- Cloudinary utilities (Step 2)
- next-typesafe-url $path (one-time in vitest.setup.ts)

---

## File Organization

```
tests/
├── unit/
│   └── lib/
│       ├── queries/featured-content/
│       │   └── featured-content-transformer.test.ts
│       └── utils/
│           └── cloudinary.utils.test.ts
├── integration/
│   ├── facades/
│   │   ├── platform/
│   │   │   └── platform-stats.facade.test.ts
│   │   └── featured-content/
│   │       └── featured-content.facade.test.ts
│   └── queries/featured-content/
│       └── featured-content-query.test.ts
├── components/
│   ├── home/
│   │   ├── sections/
│   │   │   ├── hero-section.test.tsx
│   │   │   ├── featured-collections-section.test.tsx
│   │   │   ├── trending-bobbleheads-section.test.tsx
│   │   │   └── join-community-section.test.tsx
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
├── e2e/
│   ├── specs/
│   │   ├── public/
│   │   │   └── home-sections.spec.ts
│   │   └── user/
│   │       └── home-authenticated.spec.ts
│   └── pages/
│       └── home.page.ts (expand)
├── fixtures/
│   └── featured-content.factory.ts
└── mocks/
    ├── clerk.mock.ts
    └── cloudinary.mock.ts
```

---

## Execution with /implement-plan

This plan can be executed using:

```bash
/implement-plan docs/2025_11_27/plans/home-page-test-plan.md
```

Each step will be routed to the `test-specialist` agent for implementation.
