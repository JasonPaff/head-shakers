# Test Implementation Plan: Collection Dashboard Sidebar

Generated: 2025-12-04 10:49:47
Scope: unit | component | integration (NO E2E)

## Overview

- **Total tests**: 68 tests across 16 files
- **Complexity**: High (complex aggregation queries, multiple sort options, variant cards)
- **Risk level**: High (core dashboard feature with DB queries and caching)
- **Estimated effort**: 16-20 hours (distributed across multiple sessions)

## Prerequisites

### Required Test Infrastructure (Already Available)

- `tests/fixtures/collection.factory.ts` - Database collection factory
- `tests/fixtures/user.factory.ts` - Database user factory
- `tests/setup/test-db.ts` - Testcontainers setup with PostgreSQL
- `tests/setup/test-utils.tsx` - React Testing Library wrapper
- `tests/mocks/data/collections.mock.ts` - Mock collection data for unit tests

### Additional Infrastructure Needed (Step 1)

- Enhanced mock data for dashboard-specific records (with aggregation stats)
- MSW handlers for server actions (if needed for component tests)
- Utility functions for creating collections with stats

---

## Implementation Steps

### Step 1: Test Infrastructure Setup

**Test Type**: infrastructure
**What**: Create test infrastructure for dashboard-specific data structures and mocks
**Why**: Dashboard components need collections with aggregated stats (bobbleheadCount, likeCount, etc.) that don't exist in base mock data

**Files to Create**:
- `tests/mocks/data/collections-dashboard.mock.ts`

**Utilities to Add**:
```typescript
// Mock dashboard list records with stats
export const mockCollectionDashboardRecord
export const createMockCollectionDashboardRecord(overrides)
export const createMockCollectionDashboardRecords(count)

// Mock dashboard header records
export const mockCollectionDashboardHeaderRecord
```

**Patterns to Follow**:
- Reference `tests/mocks/data/collections.mock.ts` for structure
- Include all properties from `CollectionDashboardListRecord` type
- Provide realistic stat values (bobbleheadCount, likeCount, viewCount, commentCount, totalValue)

**Validation Commands**:
```bash
npm run typecheck
npm run lint
```

**Success Criteria**:
- Mock data compiles without TypeScript errors
- Mock factories create valid dashboard record types
- Can be imported by test files

---

### Step 2: sortCollections Utility (11 unit tests)

**Test Type**: unit
**What**: Test pure sorting function for 9 different sort options
**Why**: CRITICAL - This utility powers all sidebar sorting and must handle all sort modes correctly

**Files to Create**:
- `tests/unit/lib/utils/sort-collections.test.ts`

**Test Cases**:
1. Sort by name (A-Z) - alphabetical ascending
2. Sort by name (Z-A) - alphabetical descending
3. Sort by newest - most recent createdAt first
4. Sort by oldest - oldest createdAt first
5. Sort by most items - highest bobbleheadCount first
6. Sort by least items - lowest bobbleheadCount first
7. Sort by most liked - highest likeCount first
8. Sort by most viewed - highest viewCount first
9. Sort by highest value - highest totalValue first
10. Handle empty array input
11. Handle single item array

**Patterns to Follow**:
- Arrange/Act/Assert pattern (see `tests/unit/lib/utils/action-response.test.ts`)
- Use descriptive test names with "should" prefix
- Test edge cases (empty, single item, equal values)
- Verify sort stability for equal values

**Validation Commands**:
```bash
npm run test:run tests/unit/lib/utils/sort-collections.test.ts
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 11 tests pass
- 100% code coverage of sortCollections function
- No lint or type errors

---

### Step 3: collections.validation.ts Schema Variations (8 unit tests)

**Test Type**: unit
**What**: Test missing schema variations and edge cases in collections validation schemas
**Why**: HIGH PRIORITY - Validation schemas protect data integrity and need comprehensive coverage

**Files to Create**:
- `tests/unit/lib/validations/collections.validation.test.ts`

**Test Cases**:
1. `insertCollectionSchema` - valid data with all fields
2. `insertCollectionSchema` - valid data with minimal fields (name only)
3. `insertCollectionSchema` - rejects name below min length
4. `insertCollectionSchema` - rejects name above max length
5. `insertCollectionSchema` - rejects invalid coverImageUrl format
6. `updateCollectionSchema` - requires collectionId UUID
7. `getCollectionBySlugSchema` - validates slug format (lowercase, hyphens only)
8. `deleteCollectionSchema` - validates collectionId is present

**Patterns to Follow**:
- Use `schema.safeParse()` for validation checks
- Test both valid and invalid inputs
- Check error messages match expected field names
- Reference existing validation test patterns in codebase

**Validation Commands**:
```bash
npm run test:run tests/unit/lib/validations/collections.validation.test.ts
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 8 tests pass
- Schema validation errors are properly tested
- Type inference works correctly

---

### Step 4: collections-dashboard.facade.ts (6 unit tests)

**Test Type**: unit
**What**: Test business logic facade methods with mocked dependencies
**Why**: HIGH PRIORITY - Facade orchestrates caching and query coordination

**Files to Create**:
- `tests/unit/lib/facades/collections/collections-dashboard.facade.test.ts`

**Test Cases**:
1. `getHeaderByCollectionSlugAsync` - calls query with correct context
2. `getHeaderByCollectionSlugAsync` - wraps result in cache service
3. `getHeaderByCollectionSlugAsync` - passes userId and slug correctly
4. `getListByUserIdAsync` - calls query with user context
5. `getListByUserIdAsync` - wraps result in cache service
6. `getListByUserIdAsync` - returns empty array when no collections exist

**Patterns to Follow**:
- Mock `CollectionsDashboardQuery` methods
- Mock `CacheService.collections.dashboard` and `dashboardHeader`
- Verify method calls with correct arguments using `vi.fn()`
- Don't test actual database operations (that's integration tests)

**Validation Commands**:
```bash
npm run test:run tests/unit/lib/facades/collections/collections-dashboard.facade.test.ts
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 6 tests pass
- Mocks verify correct method calls
- No actual database calls made

---

### Step 5: no-collections.tsx (2 component tests)

**Test Type**: component
**What**: Test empty state component when user has no collections
**Why**: MEDIUM PRIORITY - Simple presentational component, good starting point for component tests

**Files to Create**:
- `tests/components/collections/dashboard/no-collections.test.tsx`

**Test Cases**:
1. Renders empty state message and icon
2. Renders "Create Collection" call-to-action button

**Patterns to Follow**:
- Use `render` from `tests/setup/test-utils`
- Query by role, text, or test IDs
- Reference `tests/components/ui/empty-state.test.tsx` patterns

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/no-collections.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 2 tests pass
- Component renders correct empty state UI
- Accessibility checks pass (proper roles)

---

### Step 6: no-filtered-collections.tsx (2 component tests)

**Test Type**: component
**What**: Test empty state when search/filter returns no results
**Why**: MEDIUM PRIORITY - Similar to no-collections but different messaging

**Files to Create**:
- `tests/components/collections/dashboard/no-filtered-collections.test.tsx`

**Test Cases**:
1. Renders "no results found" message with search context
2. Renders "clear filters" suggestion or button

**Patterns to Follow**:
- Same as Step 5
- Test that messaging differs from no-collections component

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/no-filtered-collections.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 2 tests pass
- Distinct messaging from no-collections component

---

### Step 7: sidebar-header.tsx (2 component tests)

**Test Type**: component
**What**: Test sidebar header with title and action buttons
**Why**: MEDIUM PRIORITY - Simple presentational component

**Files to Create**:
- `tests/components/collections/dashboard/sidebar-header.test.tsx`

**Test Cases**:
1. Renders "Collections" title or header text
2. Renders "New Collection" or create action button

**Patterns to Follow**:
- Test for heading roles (h1, h2, etc.)
- Test button presence and accessibility

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/sidebar-header.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 2 tests pass
- Proper heading hierarchy
- Interactive elements are accessible

---

### Step 8: sidebar-footer.tsx (4 component tests)

**Test Type**: component
**What**: Test sidebar footer with summary stats or actions
**Why**: MEDIUM PRIORITY - May display totals or navigation

**Files to Create**:
- `tests/components/collections/dashboard/sidebar-footer.test.tsx`

**Test Cases**:
1. Renders total collection count when provided
2. Renders additional summary stats (total items, total value)
3. Handles zero collections gracefully
4. Renders footer actions or links if present

**Patterns to Follow**:
- Pass mock data as props
- Test conditional rendering based on data presence
- Verify number formatting for stats

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/sidebar-footer.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 4 tests pass
- Stats display correctly formatted
- Conditional elements render appropriately

---

### Step 9: sidebar-collection-list.tsx (3 component tests)

**Test Type**: component
**What**: Test collection list container that maps collection data to cards
**Why**: MEDIUM PRIORITY - Orchestrator component that delegates to card variants

**Files to Create**:
- `tests/components/collections/dashboard/sidebar-collection-list.test.tsx`

**Test Cases**:
1. Renders list of collections using provided variant prop
2. Passes correct data to each collection card
3. Handles empty list by rendering empty state

**Patterns to Follow**:
- Mock child card components (collection-card-compact, etc.)
- Verify correct props passed to children
- Test list iteration logic

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/sidebar-collection-list.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 3 tests pass
- List renders correct number of items
- Empty state delegation works

---

### Step 10: collection-card-hovercard.tsx (6 component tests)

**Test Type**: component
**What**: Test Radix UI HoverCard with collection preview details
**Why**: MEDIUM PRIORITY - Enhances UX with quick previews

**Files to Create**:
- `tests/components/collections/dashboard/collection-card-hovercard.test.tsx`

**Test Cases**:
1. Renders trigger element (card preview)
2. Shows hovercard content on hover/focus
3. Displays collection stats in hovercard
4. Displays collection description if present
5. Handles null description gracefully
6. Closes hovercard when trigger loses focus

**Patterns to Follow**:
- Use `user.hover()` for hover interactions
- Test Radix UI HoverCard trigger and content
- Reference Radix UI component test patterns

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/collection-card-hovercard.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 6 tests pass
- Hover interactions work correctly
- Content displays expected data

---

### Step 11: collection-card-compact.tsx (11 component tests)

**Test Type**: component
**What**: Test default compact card variant showing minimal collection info
**Why**: CRITICAL - Primary card variant used in dashboard sidebar

**Files to Create**:
- `tests/components/collections/dashboard/collection-card-compact.test.tsx`

**Test Cases**:
1. Renders collection name
2. Renders collection item count
3. Renders collection visibility badge (public/private)
4. Displays collection cover image or placeholder
5. Links to correct collection detail page
6. Renders active/selected state styling
7. Handles collections with zero items
8. Handles collections without cover images
9. Displays testId prop correctly
10. Renders truncated long collection names
11. Shows hover effects via CSS classes

**Patterns to Follow**:
- Reference `tests/components/home/display/featured-collections-display.test.tsx`
- Mock next/image and next-cloudinary
- Mock $path from next-typesafe-url
- Test link href attributes
- Test image rendering (CldImage vs placeholder)

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/collection-card-compact.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 11 tests pass
- Image handling works for all cases
- Link generation uses $path correctly
- Accessibility attributes present

---

### Step 12: collection-card-detailed.tsx (11 component tests)

**Test Type**: component
**What**: Test detailed card variant with extended stats (likes, views, comments)
**Why**: CRITICAL - Alternative card variant with full statistics

**Files to Create**:
- `tests/components/collections/dashboard/collection-card-detailed.test.tsx`

**Test Cases**:
1. Renders all compact card features (inherit from compact)
2. Displays like count with icon
3. Displays view count with icon
4. Displays comment count with icon
5. Displays total value with currency formatting
6. Displays featured bobblehead count
7. Handles zero values for all stats
8. Formats large numbers correctly (1000 -> 1K)
9. Shows all stats in proper layout grid
10. Renders collection description snippet
11. Handles missing optional stats gracefully

**Patterns to Follow**:
- Similar setup to collection-card-compact
- Test number formatting utilities
- Verify icon rendering (lucide-react icons)
- Test layout and stat positioning

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/collection-card-detailed.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 11 tests pass
- Stats display with correct formatting
- Icons render for each stat type
- Layout handles all stat combinations

---

### Step 13: collection-card-cover.tsx (13 component tests)

**Test Type**: component
**What**: Test cover image card variant with image overlay and minimal text
**Why**: CRITICAL - Visual-first card variant for image-focused displays

**Files to Create**:
- `tests/components/collections/dashboard/collection-card-cover.test.tsx`

**Test Cases**:
1. Renders full-bleed cover image as background
2. Renders collection name as overlay text
3. Displays gradient overlay for text readability
4. Shows item count badge on image
5. Handles collections without cover images (placeholder)
6. Renders aspect ratio container correctly
7. Applies hover zoom effect via CSS
8. Links to collection detail page
9. Handles very long collection names with ellipsis
10. Displays visibility indicator (public/private icon)
11. Shows loading state for images
12. Renders testId correctly
13. Handles image loading errors gracefully

**Patterns to Follow**:
- Mock CldImage component
- Test CSS class application for overlays
- Test image aspect ratios
- Verify gradient overlays render

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/collection-card-cover.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 13 tests pass
- Image overlay rendering works
- Fallback for missing images
- Text readability via gradient

---

### Step 14: sidebar-search.tsx (12 component tests)

**Test Type**: component
**What**: Test search input and sort controls for filtering collections
**Why**: HIGH PRIORITY - Core interaction point for sidebar filtering/sorting

**Files to Create**:
- `tests/components/collections/dashboard/sidebar-search.test.tsx`

**Test Cases**:
1. Renders search input field with placeholder
2. Updates search value on user input
3. Debounces search input (if applicable)
4. Clears search input when clear button clicked
5. Renders sort dropdown/select with all options
6. Changes sort option when user selects new value
7. Displays current sort option correctly
8. Calls onChange/onSort callbacks with correct values
9. Handles empty search state
10. Shows search icon/magnifying glass
11. Accessible labels for screen readers
12. Keyboard navigation works for sort dropdown

**Patterns to Follow**:
- Use `user.type()` for input interactions
- Use `user.click()` and `user.selectOptions()` for dropdown
- Test callback functions with `vi.fn()`
- Test debouncing with `vi.useFakeTimers()` if needed
- Reference form component test patterns

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/sidebar-search.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 12 tests pass
- User interactions trigger correct callbacks
- Debouncing works correctly
- Accessibility requirements met

---

### Step 15: sidebar-display.tsx (18 component tests)

**Test Type**: component
**What**: Test main sidebar orchestrator integrating search, list, and empty states
**Why**: CRITICAL - Highest priority component test, integrates all sidebar features

**Files to Create**:
- `tests/components/collections/dashboard/sidebar-display.test.tsx`

**Test Cases**:
1. Renders sidebar header with title
2. Renders search and sort controls
3. Renders collection list with provided collections
4. Renders no-collections empty state when list is empty
5. Renders no-filtered-collections when search returns no results
6. Filters collections based on search input
7. Sorts collections based on selected sort option
8. Combines search and sort correctly
9. Renders sidebar footer with stats
10. Handles loading state (if applicable)
11. Passes correct variant prop to collection cards
12. Updates display when collections prop changes
13. Maintains search state across re-renders
14. Maintains sort state across re-renders
15. Renders with custom testId prop
16. Shows correct collection count in footer
17. Handles very large collection lists (performance)
18. Integrates all child components correctly

**Patterns to Follow**:
- Mock child components (sidebar-header, sidebar-search, etc.)
- Test state management for search/sort
- Test derived state (filtered/sorted collections)
- Use `rerender()` for prop change tests
- Reference `tests/components/home/display/featured-collections-display.test.tsx`

**Validation Commands**:
```bash
npm run test:run tests/components/collections/dashboard/sidebar-display.test.tsx
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 18 tests pass
- Integration of all child components works
- State management functions correctly
- Performance acceptable for large lists

---

### Step 16: collections-dashboard.query.ts (8 integration tests)

**Test Type**: integration
**What**: Test database aggregation queries with real Testcontainers PostgreSQL
**Why**: CRITICAL - Complex SQL queries with joins and aggregations must be tested against real DB

**Files to Create**:
- `tests/integration/queries/collections/collections-dashboard.query.test.ts`

**Test Cases**:
1. `getHeaderByCollectionSlugAsync` - returns correct aggregated stats for collection
2. `getHeaderByCollectionSlugAsync` - returns zero counts for collection with no activity
3. `getHeaderByCollectionSlugAsync` - returns null for non-existent collection
4. `getHeaderByCollectionSlugAsync` - respects user permission filtering
5. `getListByUserIdAsync` - returns all user collections with stats
6. `getListByUserIdAsync` - aggregates bobblehead counts correctly
7. `getListByUserIdAsync` - aggregates likes, views, comments correctly
8. `getSelectorsByUserIdAsync` - returns minimal collection data for selectors

**Patterns to Follow**:
- Use `beforeEach(resetTestDatabase)`
- Use `createTestUser()` and `createTestCollection()` factories
- Create related entities (bobbleheads, likes, views, comments) for aggregation tests
- Reference `tests/integration/queries/featured-content/featured-content-query.test.ts`
- Mock Sentry, cache service, and Redis
- Verify SQL aggregation results

**Validation Commands**:
```bash
npm run test:run tests/integration/queries/collections/collections-dashboard.query.test.ts
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 8 tests pass
- Aggregation queries return correct counts/sums
- Permission filtering works correctly
- Tests use real database via Testcontainers

---

### Step 17: collections.actions.ts (6 integration tests)

**Test Type**: integration
**What**: Test server actions for collection CRUD operations
**Why**: HIGH PRIORITY - Server actions orchestrate facades and need integration testing

**Files to Create**:
- `tests/integration/actions/collections.actions.test.ts`

**Test Cases**:
1. `createCollectionAction` - successfully creates collection with valid data
2. `createCollectionAction` - rejects duplicate collection name for user
3. `updateCollectionAction` - successfully updates collection
4. `updateCollectionAction` - rejects unauthorized update (wrong user)
5. `deleteCollectionAction` - successfully deletes collection
6. `deleteCollectionAction` - rejects unauthorized delete (wrong user)

**Patterns to Follow**:
- Reference `tests/integration/actions/collections.facade.test.ts`
- Mock Sentry, cache service, cache revalidation, Redis
- Mock Next.js cache functions (revalidatePath, revalidateTag)
- Use real database via Testcontainers
- Test both success and failure paths
- Verify ActionResponse types (actionSuccess/actionFailure)

**Validation Commands**:
```bash
npm run test:run tests/integration/actions/collections.actions.test.ts
npm run lint
npm run typecheck
```

**Success Criteria**:
- All 6 tests pass
- Actions return correct ActionResponse types
- Permission checks work correctly
- Database state changes verified

---

## Quality Gates

### All Tests Must Pass
```bash
npm run test:run tests/unit/lib/utils/sort-collections.test.ts
npm run test:run tests/unit/lib/validations/collections.validation.test.ts
npm run test:run tests/unit/lib/facades/collections/collections-dashboard.facade.test.ts
npm run test:run tests/components/collections/dashboard/
npm run test:run tests/integration/queries/collections/collections-dashboard.query.test.ts
npm run test:run tests/integration/actions/collections.actions.test.ts
```

### Type Safety
```bash
npm run typecheck
```

### Code Quality
```bash
npm run lint
npm run format
```

### Coverage Requirements
- Unit tests: 100% coverage of pure functions
- Component tests: All user-facing scenarios covered
- Integration tests: All database queries and actions tested

---

## Test Infrastructure Notes

### Mocking Patterns

#### For Component Tests
```typescript
// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>): JSX.Element => (
    <img alt={String(props.alt)} src={String(props.src)} />
  ),
}));

// Mock next-cloudinary
vi.mock('next-cloudinary', () => ({
  CldImage: (props: Record<string, unknown>): JSX.Element => (
    <img alt={String(props.alt)} data-public-id={String(props.src)} />
  ),
}));

// Mock next-typesafe-url
vi.mock('next-typesafe-url', () => ({
  $path: vi.fn(({ route, routeParams }) => {
    if (routeParams?.collectionSlug) {
      return `/collections/${routeParams.collectionSlug}`;
    }
    return route;
  }),
}));
```

#### For Integration Tests
```typescript
// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  startSpan: vi.fn((_, callback) => callback({
    recordException: vi.fn(),
    setStatus: vi.fn()
  })),
}));

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      dashboard: <T>(callback: () => T): T => callback(),
      dashboardHeader: <T>(callback: () => T): T => callback(),
    },
  },
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Redis
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  })),
}));

// Mock database to use test container
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));
```

### Test Data Factories

Use existing factories for integration tests:
- `createTestUser()` - Create test users
- `createTestCollection()` - Create test collections
- `createTestCollections(userId, count)` - Create multiple collections

Create new mock data for unit/component tests:
- `createMockCollectionDashboardRecord()` - Mock collections with stats
- `createMockCollectionDashboardRecords(count)` - Multiple mock collections

### Testcontainers Setup

All integration tests automatically use:
- PostgreSQL via Testcontainers
- `resetTestDatabase()` before each test
- Real database operations (no mocks)

### Assertion Libraries

- Vitest: `expect()`, `describe()`, `it()`, `beforeEach()`, `vi.fn()`
- Testing Library: `screen`, `render()`, `user.click()`, `user.type()`
- Custom: `toBeInTheDocument()`, `toHaveAttribute()`, `toHaveTextContent()`

---

## Execution Strategy

### Phase 1: Foundation (Steps 1-4) - 4-5 hours
Build test infrastructure and unit tests for utilities and validation.

### Phase 2: Simple Components (Steps 5-10) - 3-4 hours
Test empty states, headers, footers, and simple container components.

### Phase 3: Complex Components (Steps 11-15) - 5-6 hours
Test card variants and main sidebar display orchestrator.

### Phase 4: Integration (Steps 16-17) - 4-5 hours
Test database queries and server actions with real database.

---

## Risk Mitigation

### High-Risk Areas
1. **Complex aggregation queries** - Step 16 requires careful verification of SQL joins
2. **Sort function edge cases** - Step 2 must handle all 9 sort modes correctly
3. **Sidebar integration** - Step 15 orchestrates many moving parts

### Recommended Order
Execute in step order (1-17) to build incrementally from simple to complex.

### Parallel Execution Opportunities
- Steps 5-10 (simple components) can be done in parallel by different developers
- Steps 2-4 (unit tests) can be done in parallel
- Component tests (Steps 11-13) are independent and can be parallelized

---

## Post-Implementation Checklist

- [ ] All 68 tests pass
- [ ] TypeScript compiles without errors
- [ ] ESLint passes with no warnings
- [ ] Test coverage report generated
- [ ] Integration tests use Testcontainers (no mocked DB)
- [ ] Component tests properly mock external dependencies
- [ ] Unit tests have no external dependencies
- [ ] All test files follow project naming conventions
- [ ] Test descriptions are clear and follow "should" pattern
- [ ] Arrange/Act/Assert pattern used consistently
