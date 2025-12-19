# Test Implementation Plan: Collection Dashboard Bobblehead Grid

## Overview

**Total Tests Planned**: 133-163 tests across unit, component, and integration levels
**Complexity Level**: High - Complex state management, server actions, URL params, bulk operations
**Risk Assessment**: Critical - Core collection dashboard feature with complex interactions

### Test Breakdown

- **Unit Tests**: 20-25 tests (URL parsers, pure utilities)
- **Component Tests**: 81-95 tests (UI components, interactions, accessibility)
- **Integration Tests**: 32-43 tests (Query layer, facade, server actions)

### Critical Risk Areas

1. **BobbleheadGridDisplay** - Complex state orchestration with 11+ state variables
2. **BobbleheadCard** - Selection mode, hover cards, accessibility, condition variants
3. **BobbleheadsDashboardQuery** - Complex subqueries for stats aggregation
4. **Server Actions** - Batch operations (delete, feature), permission checks
5. **Pagination** - Page number calculation logic with ellipsis handling

---

## Prerequisites

### Existing Fixtures (Use As-Is)

✅ **Available in `tests/fixtures/`**

- `bobblehead.factory.ts` - `createTestBobblehead()`, `createTestBobbleheads()`, `createTestFeaturedBobblehead()`
- `collection.factory.ts` - `createTestCollection()`
- `user.factory.ts` - `createTestUser()`

### Existing Mocks (Use As-Is)

✅ **Available in `tests/mocks/`**

- `tests/mocks/data/bobbleheads.mock.ts` - `mockBobblehead`, `createMockBobblehead()`, `createMockBobbleheads()`
- MSW handlers (if needed for API mocking)

### New Fixtures Needed

📝 **Create in `tests/fixtures/`**

**File**: `tests/fixtures/bobblehead-grid.factory.ts`

```typescript
/**
 * Factory for creating mock bobblehead grid data with stats
 * Used in component tests for BobbleheadGridDisplay
 */
- createMockBobbleheadDashboardRecord() - With stats (likes, views, comments)
- createMockBobbleheadDashboardRecords() - Batch creation with varied data
- createMockPagination() - Pagination metadata
```

### New Mocks Needed

📝 **Create in `tests/mocks/`**

**File**: `tests/mocks/hooks/use-user-preferences.mock.ts`

```typescript
/**
 * Mock useUserPreferences hook for component tests
 */
- mockUseUserPreferences() - Returns mock preference state and setPreference
```

**File**: `tests/mocks/hooks/use-server-action.mock.ts`

```typescript
/**
 * Mock useServerAction hook for component tests
 */
- mockUseServerAction() - Returns mock executeAsync with loading states
```

**File**: `tests/mocks/router.mock.ts`

```typescript
/**
 * Mock Next.js router for component tests
 */
- mockRouter() - Mock router.refresh(), router.push()
```

**File**: `tests/mocks/nuqs.mock.ts`

```typescript
/**
 * Mock nuqs useQueryStates for URL state management
 */
- mockUseQueryStates() - Returns mock query state and setParams
```

### Setup Utilities Needed

📝 **Create in `tests/setup/`**

**File**: `tests/setup/mock-environment.ts`

```typescript
/**
 * Centralized mocking for common dependencies
 */
- setupComponentTestEnvironment() - Mocks router, nuqs, hooks
- cleanupComponentTestEnvironment() - Cleanup after tests
```

---

## Implementation Steps

### Phase 1: Test Infrastructure Setup (Foundation)

#### Step 1.1: Create Bobblehead Grid Factory

**What**: Create factory for generating mock bobblehead grid data with stats
**Why**: Enables consistent test data across component tests
**Test Type**: Infrastructure (no tests, just utilities)
**Files to Create**:

- `tests/fixtures/bobblehead-grid.factory.ts`

**Factory Functions**:

```typescript
createMockBobbleheadDashboardRecord(overrides?: Partial<BobbleheadDashboardListRecord>)
createMockBobbleheadDashboardRecords(count: number, baseOverrides?: Partial<BobbleheadDashboardListRecord>)
createMockPagination(currentPage: number, pageSize: number, totalCount: number)
```

**Patterns to Follow**: Existing pattern from `tests/fixtures/bobblehead.factory.ts`
**Validation Commands**: N/A (infrastructure only)
**Success Criteria**: Factories exported and typed correctly

---

#### Step 1.2: Create Hook Mocks

**What**: Create mocks for React hooks used in components
**Why**: Isolate component logic from hook implementations
**Test Type**: Infrastructure (no tests, just mocks)
**Files to Create**:

- `tests/mocks/hooks/use-user-preferences.mock.ts`
- `tests/mocks/hooks/use-server-action.mock.ts`
- `tests/mocks/router.mock.ts`
- `tests/mocks/nuqs.mock.ts`

**Mock Signatures**:

```typescript
// use-user-preferences.mock.ts
export const mockUseUserPreferences = (overrides?: Partial<UserPreferences>) => ({
  preferences: { collectionGridDensity: 'compact', isBobbleheadHoverCardEnabled: true, ...overrides },
  setPreference: vi.fn(),
});

// use-server-action.mock.ts
export const mockUseServerAction = (overrides?: { loading?: boolean; error?: string }) => ({
  executeAsync: vi.fn().mockResolvedValue({ success: true }),
  isLoading: overrides?.loading ?? false,
  error: overrides?.error,
});
```

**Patterns to Follow**: Existing mock patterns in `tests/mocks/data/`
**Validation Commands**: N/A (infrastructure only)
**Success Criteria**: All mocks typed and exported correctly

---

#### Step 1.3: Create Mock Environment Setup

**What**: Centralized setup utility for component test environment
**Why**: Reduces boilerplate in component tests
**Test Type**: Infrastructure (no tests, just utilities)
**Files to Create**:

- `tests/setup/mock-environment.ts`

**Setup Functions**:

```typescript
setupComponentTestEnvironment() - Mocks all common dependencies
cleanupComponentTestEnvironment() - Cleanup after tests
```

**Patterns to Follow**: Similar to existing `tests/setup/test-db.ts` pattern
**Validation Commands**: N/A (infrastructure only)
**Success Criteria**: Setup/cleanup functions work without errors

---

### Phase 2: Unit Tests (Low-Level Pure Logic)

#### Step 2.1: URL Parser Tests (route-type.ts)

**What**: Test URL search param parsers and validators
**Why**: URL state management is critical for filtering, pagination, sorting
**Test Type**: Unit
**Files to Create**:

- `tests/unit/app/dashboard/collection/route-type.test.ts`

**Test Cases** (6-8 tests):

1. `collectionDashboardParsers.sortBy` - Should parse valid sort options (newest, oldest, name-asc, etc.)
2. `collectionDashboardParsers.sortBy` - Should default to 'newest' for invalid values
3. `collectionDashboardParsers.condition` - Should parse valid conditions (mint, excellent, etc.)
4. `collectionDashboardParsers.featured` - Should parse 'all', 'featured', 'not-featured'
5. `collectionDashboardParsers.page` - Should parse positive integers and default to 1
6. `collectionDashboardParsers.pageSize` - Should default to 24
7. `collectionDashboardParsers.search` - Should handle empty strings
8. `Route.searchParams` Zod schema - Should validate complete search params object

**Patterns to Follow**: Similar to `tests/unit/lib/validations/bobbleheads.validation.test.ts`
**Validation Commands**:

```bash
npm run test -- route-type.test.ts
```

**Success Criteria**: All parsers validate correct inputs and reject invalid ones

---

#### Step 2.2: Pagination Helper Tests (getPageNumbers function)

**What**: Test page number calculation logic with ellipsis markers
**Why**: Complex logic for displaying page buttons with ellipsis
**Test Type**: Unit
**Files to Create**:

- `tests/unit/components/dashboard/collection/pagination-helpers.test.ts`

**Test Cases** (10-12 tests):

1. Should return all pages when totalPages ≤ 5
2. Should include ellipsis when currentPage > 3
3. Should include ellipsis when currentPage < totalPages - 2
4. Should always show first and last page
5. Should show pages around current page (currentPage - 1 to currentPage + 1)
6. Edge case: currentPage = 1, totalPages = 10
7. Edge case: currentPage = 10, totalPages = 10
8. Edge case: currentPage = 5, totalPages = 10
9. Should handle single page (totalPages = 1)
10. Should handle two pages (totalPages = 2)

**Note**: Extract `getPageNumbers` to a separate utility file first:

- Create `src/lib/utils/pagination.utils.ts`
- Export `getPageNumbers(currentPage: number, totalPages: number): number[]`

**Patterns to Follow**: Pure function unit testing pattern
**Validation Commands**:

```bash
npm run test -- pagination-helpers.test.ts
```

**Success Criteria**: All page number calculations match expected arrays

---

### Phase 3: Component Tests (UI Layer)

#### Step 3.1: BobbleheadGrid Component Tests

**What**: Test grid wrapper with density variants
**Why**: Simple but foundational component for layout
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/bobblehead-grid.test.tsx`

**Test Cases** (4-6 tests):

1. Should render children in grid layout with compact density
2. Should render children in grid layout with comfortable density
3. Should apply correct grid column classes for compact (7 columns on xl)
4. Should apply correct grid column classes for comfortable (5 columns on xl)
5. Should render empty state centered when isEmpty=true
6. Should use correct data-slot attributes for test targeting

**Patterns to Follow**: `tests/components/home/display/trending-bobbleheads-display.test.tsx`
**Validation Commands**:

```bash
npm run test -- bobblehead-grid.test.tsx
```

**Success Criteria**: All grid layouts render with correct CSS classes

---

#### Step 3.2: BulkActionsBar Component Tests

**What**: Test bulk action controls (select all, delete, feature)
**Why**: Critical for multi-selection workflows
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/bulk-actions-bar.test.tsx`

**Test Cases** (8-10 tests):

1. Should display correct selected count (singular: "1 item")
2. Should display correct selected count (plural: "5 items")
3. Should call onSelectAll when "Select All" clicked
4. Should call onSelectAll when "Deselect All" clicked (isAllSelected=true)
5. Should show "Deselect All" text when isAllSelected=true
6. Should call onBulkFeature when "Feature Selected" clicked
7. Should call onBulkDelete when "Delete Selected" clicked
8. Should hide button text on mobile (sm: breakpoint)
9. Should render with primary border styling
10. Should use correct data-slot for test targeting

**Patterns to Follow**: Component testing with user interactions
**Validation Commands**:

```bash
npm run test -- bulk-actions-bar.test.tsx
```

**Success Criteria**: All user interactions trigger correct callbacks

---

#### Step 3.3: BobbleheadPagination Component Tests

**What**: Test pagination controls and page size selector
**Why**: Complex interaction with page calculations and navigation
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/bobblehead-pagination.test.tsx`

**Test Cases** (10-13 tests):

1. Should display "Showing X to Y of Z bobbleheads" text correctly
2. Should disable previous button on page 1
3. Should disable next button on last page
4. Should call onPageChange with currentPage - 1 when previous clicked
5. Should call onPageChange with currentPage + 1 when next clicked
6. Should render page number buttons with getPageNumbers logic
7. Should highlight current page button with "default" variant
8. Should render ellipsis markers as "..." text
9. Should call onPageSizeChange when page size selector changes
10. Should render page size options (12, 24, 48)
11. Should return null when totalCount = 0
12. Should calculate startItem correctly (page 2, pageSize 24 = 25)
13. Should calculate endItem correctly (last page partial results)

**Patterns to Follow**: Component testing with state changes
**Validation Commands**:

```bash
npm run test -- bobblehead-pagination.test.tsx
```

**Success Criteria**: All pagination calculations and interactions work correctly

---

#### Step 3.4: Toolbar Component Tests

**What**: Test search, filters, sort, toggles, and view options
**Why**: Primary interface for data manipulation - high complexity
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/toolbar.test.tsx`

**Test Cases** (12-16 tests):

1. Should render search input with placeholder
2. Should call onSearchChange when typing in search input
3. Should call onSearchClear when clear button clicked
4. Should render Filters dropdown with active indicator when filters active
5. Should call onFilterCategoryChange when category selected
6. Should render all categories in dropdown
7. Should call onFilterConditionChange when condition selected
8. Should call onFilterFeaturedChange when featured filter changes
9. Should call onClearFilters when "Clear All Filters" clicked
10. Should render Sort dropdown with all 6 sort options
11. Should call onSortChange when sort option selected
12. Should toggle grid density when density button clicked
13. Should toggle hover card with Switch component
14. Should toggle selection mode when "Select" button clicked
15. Should show "Cancel" text when isSelectionMode=true
16. Should call onAddClick when "Add Bobblehead" clicked
17. Mobile: Should render view options in dropdown menu
18. Should use sticky positioning with correct z-index

**Patterns to Follow**: Dropdown and input interaction testing
**Validation Commands**:

```bash
npm run test -- toolbar.test.tsx
```

**Success Criteria**: All toolbar interactions trigger correct callbacks

---

#### Step 3.5: BobbleheadCard Component Tests

**What**: Test card display with selection, hover, actions
**Why**: Core UI component with complex interaction modes
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/bobblehead-card.test.tsx`

**Test Cases** (14-18 tests):

1. **Display**: Should render bobblehead name
2. **Display**: Should render condition badge with correct variant (mint, excellent, etc.)
3. **Display**: Should format condition text (uppercase, replace hyphens)
4. **Display**: Should render feature photo when available
5. **Display**: Should show "Featured" badge when isFeatured=true
6. **Selection Mode**: Should render checkbox when isSelectionMode=true
7. **Selection Mode**: Should call onSelectionChange when checkbox clicked
8. **Selection Mode**: Should call onSelectionChange when card clicked
9. **Selection Mode**: Should apply ring-2 ring-primary when isSelected=true
10. **Selection Mode**: Should support keyboard navigation (Enter, Space)
11. **Normal Mode**: Should show hover overlay with Edit button
12. **Normal Mode**: Should call onEdit when Edit button clicked
13. **Normal Mode**: Should show dropdown menu with Feature/Delete options
14. **Normal Mode**: Should call onFeatureToggle when feature clicked
15. **Normal Mode**: Should call onDelete when delete clicked
16. **Normal Mode**: Should show "Un-feature" text when isFeatured=true
17. **Hover Card**: Should render HoverCardContent with full details
18. **Hover Card**: Should display stats (likes, views, comments)
19. **Hover Card**: Should be disabled when isSelectionMode=true
20. **Accessibility**: Should have proper ARIA attributes (aria-checked, role)

**Patterns to Follow**: Component testing with conditional rendering
**Validation Commands**:

```bash
npm run test -- bobblehead-card.test.tsx
```

**Success Criteria**: All card modes and interactions work correctly

---

#### Step 3.6: BobbleheadGridDisplay Component Tests

**What**: Test main orchestrator component with state management
**Why**: Most complex component - orchestrates entire grid feature
**Test Type**: Component
**Files to Create**:

- `tests/components/dashboard/collection/bobblehead-grid-display.test.tsx`

**Test Cases** (18-22 tests):

1. **Rendering**: Should render Toolbar with correct props
2. **Rendering**: Should render BobbleheadGrid with bobbleheads
3. **Rendering**: Should render BobbleheadPagination when pagination provided
4. **Rendering**: Should render BulkActionsBar when items selected
5. **Empty States**: Should show NoBobbleheads when empty and no filters
6. **Empty States**: Should show NoResults when empty with active filters
7. **State**: Should initialize searchInput from URL params
8. **State**: Should debounce search input and update URL params
9. **State**: Should toggle selection mode and clear selections
10. **State**: Should track selected bobbleheads in Set
11. **Selection**: Should select all bobbleheads when handleSelectAll called
12. **Selection**: Should deselect all when all already selected
13. **Filters**: Should update URL params when category filter changes
14. **Filters**: Should update URL params when condition filter changes
15. **Filters**: Should reset to page 1 when filters change
16. **Actions**: Should open delete dialog when handleDeleteBobblehead called
17. **Actions**: Should call deleteBobbleheadAction when delete confirmed
18. **Actions**: Should call batchDeleteBobbleheadsAction for bulk delete
19. **Actions**: Should call updateBobbleheadFeatureAction for single feature toggle
20. **Actions**: Should call batchUpdateBobbleheadFeatureAction for bulk feature
21. **Preferences**: Should persist grid density to user preferences
22. **Preferences**: Should persist hover card enabled to user preferences
23. **Pagination**: Should call setParams with new page when page changes
24. **Pagination**: Should scroll to top when page changes

**Note**: This component requires extensive mocking:

- Mock `useQueryStates` from nuqs
- Mock `useServerAction` hook (4 different actions)
- Mock `useUserPreferences` hook
- Mock `useRouter` for router.refresh()
- Mock `useDebounce` hook

**Patterns to Follow**: Complex component orchestration testing
**Validation Commands**:

```bash
npm run test -- bobblehead-grid-display.test.tsx
```

**Success Criteria**: All state management and action orchestration works correctly

---

### Phase 4: Integration Tests (Data Layer)

#### Step 4.1: BobbleheadsDashboardQuery Integration Tests

**What**: Test query methods with real database
**Why**: Complex SQL queries with subqueries need validation
**Test Type**: Integration
**Files to Create**:

- `tests/integration/queries/bobbleheads-dashboard.query.test.ts`

**Test Cases** (12-16 tests):

**getListAsync**:

1. Should return bobbleheads for collection with stats
2. Should include likeCount from subquery
3. Should include viewCount from subquery
4. Should include commentCount from subquery
5. Should filter by category when provided
6. Should filter by condition when provided
7. Should filter by featured='featured' (isFeatured=true only)
8. Should filter by featured='not-featured' (isFeatured=false only)
9. Should search by name (case-insensitive)
10. Should search by characterName
11. Should sort by newest (default)
12. Should sort by name-asc (ascending)
13. Should sort by value-high (DESC NULLS LAST)
14. Should paginate correctly (page 2, pageSize 10)
15. Should apply permission filters (userId context)
16. Should exclude soft-deleted bobbleheads (deletedAt IS NULL)

**getCategoriesByCollectionSlugAsync**: 17. Should return distinct categories 18. Should exclude null categories 19. Should order categories alphabetically

**getCountAsync**: 20. Should return correct count with no filters 21. Should return correct count with category filter 22. Should return correct count with search term

**Patterns to Follow**: `tests/integration/facades/bobbleheads/bobbleheads.facade.test.ts`
**Validation Commands**:

```bash
npm run test -- bobbleheads-dashboard.query.test.ts
```

**Success Criteria**: All queries return correct data with real database

---

#### Step 4.2: BobbleheadsDashboardFacade Integration Tests

**What**: Test facade methods with caching and orchestration
**Why**: Ensures business logic layer works with cache service
**Test Type**: Integration
**Files to Create**:

- `tests/integration/facades/bobbleheads-dashboard.facade.test.ts`

**Test Cases** (8-12 tests):

**getListByCollectionSlugAsync**:

1. Should return bobbleheads with pagination metadata
2. Should calculate totalPages correctly
3. Should use separate cache keys for data and count
4. Should cache data results with page-specific key
5. Should cache count results without pagination params
6. Should handle empty results gracefully

**getCategoriesByCollectionSlugAsync**: 7. Should return cached categories 8. Should cache with correct key (collectionSlug + userId)

**getBobbleheadForEditAsync**: 9. Should return bobblehead with tags for owner 10. Should return null for non-owner 11. Should return null for non-existent bobblehead

**getUserCollectionSelectorsAsync**: 12. Should return collection selectors ordered by name 13. Should cache selectors with MEDIUM TTL

**Patterns to Follow**: Existing facade integration tests
**Validation Commands**:

```bash
npm run test -- bobbleheads-dashboard.facade.test.ts
```

**Success Criteria**: All facade methods work with caching and return correct data

---

#### Step 4.3: Bobblehead Server Actions Integration Tests

**What**: Test delete and feature server actions
**Why**: Critical mutation operations need validation
**Test Type**: Integration
**Files to Create**:

- `tests/integration/actions/bobbleheads.actions.test.ts`

**Test Cases** (16-22 tests):

**deleteBobbleheadAction**:

1. Should delete bobblehead successfully
2. Should soft-delete (set deletedAt) rather than hard delete
3. Should return success response
4. Should return error when bobblehead not found
5. Should return error when user not owner
6. Should trigger cache invalidation

**updateBobbleheadFeatureAction**: 7. Should update isFeatured to true 8. Should update isFeatured to false 9. Should return success response 10. Should return error when bobblehead not found 11. Should return error when user not owner

**batchDeleteBobbleheadsAction**: 12. Should delete multiple bobbleheads 13. Should validate all IDs are UUIDs 14. Should return error if any bobblehead not owned by user 15. Should handle partial failures gracefully 16. Should trigger cache invalidation for all deleted items

**batchUpdateBobbleheadFeatureAction**: 17. Should feature multiple bobbleheads 18. Should validate all IDs are UUIDs 19. Should return error if any bobblehead not owned by user 20. Should update all bobbleheads to isFeatured=true 21. Should trigger cache invalidation for all updated items

**Patterns to Follow**: Server action testing pattern
**Validation Commands**:

```bash
npm run test -- bobbleheads.actions.test.ts
```

**Success Criteria**: All actions perform mutations correctly with proper error handling

---

## Quality Gates

### Before Proceeding to Next Phase

1. **Phase 1 → Phase 2**: All infrastructure files created and importable
2. **Phase 2 → Phase 3**: All unit tests passing with 100% coverage
3. **Phase 3 → Phase 4**: All component tests passing with user interactions verified
4. **Phase 4 → Complete**: All integration tests passing with real database

### Test Coverage Targets

- **Unit Tests**: 100% coverage for parsers and pure functions
- **Component Tests**: 80%+ coverage for UI components
- **Integration Tests**: 100% coverage for query methods and critical server actions

### Performance Benchmarks

- Unit tests should complete in < 5s total
- Component tests should complete in < 30s total
- Integration tests should complete in < 60s total (with Testcontainers)

---

## Test Infrastructure Notes

### Component Test Setup Pattern

```typescript
import { vi } from 'vitest';
import { render, screen, userEvent } from '@tests/setup/test-utils';

// Mock dependencies
vi.mock('nuqs', () => ({
  useQueryStates: vi.fn(() => [{ search: '', category: 'all', sortBy: 'newest' }, vi.fn()]),
}));

vi.mock('@/hooks/use-server-action', () => ({
  useServerAction: vi.fn(() => ({
    executeAsync: vi.fn().mockResolvedValue({ success: true }),
  })),
}));
```

### Integration Test Setup Pattern

```typescript
import { beforeEach, describe, it, vi } from 'vitest';
import { resetTestDatabase, getTestDb } from '@tests/setup/test-db';
import { createTestUser, createTestCollection, createTestBobbleheads } from '@tests/fixtures';

vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

describe('BobbleheadsDashboardQuery', () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it('should return bobbleheads with stats', async () => {
    const user = await createTestUser();
    const collection = await createTestCollection({ userId: user.id });
    const bobbleheads = await createTestBobbleheads(user.id, collection.id, 5);

    const result = await BobbleheadsDashboardQuery.getListAsync(collection.slug, {
      userId: user.id,
      dbInstance: getTestDb(),
    });

    expect(result).toHaveLength(5);
    expect(result[0]).toHaveProperty('likeCount');
  });
});
```

### Mock Cleanup Best Practices

- Use `vi.clearAllMocks()` in `beforeEach` hooks
- Restore original implementations in `afterEach` if using `vi.spyOn`
- Use `vi.resetModules()` between test files to avoid state leakage

### Accessibility Testing Reminders

- Test keyboard navigation (Enter, Space, Tab)
- Verify ARIA attributes (role, aria-checked, aria-label)
- Check focus management and screen reader compatibility
- Use `getByRole` queries when possible for semantic HTML validation

### Performance Optimization

- Use `createMockBobbleheadDashboardRecords(100)` for stress testing
- Test pagination with large datasets (1000+ items)
- Verify debounce behavior with `vi.useFakeTimers()`

---

## Validation Commands Reference

### Run All Tests

```bash
npm run test
```

### Run Specific Test Types

```bash
# Unit tests only
npm run test -- tests/unit

# Component tests only
npm run test -- tests/components

# Integration tests only
npm run test -- tests/integration
```

### Run Specific Test Files

```bash
npm run test -- route-type.test.ts
npm run test -- bobblehead-grid-display.test.tsx
npm run test -- bobbleheads-dashboard.query.test.ts
```

### Run Tests in Watch Mode

```bash
npm run test -- --watch
```

### Run Tests with Coverage

```bash
npm run test -- --coverage
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint:fix
```

---

## Implementation Order Summary

1. **Infrastructure** (Steps 1.1-1.3): Factories, mocks, setup utilities
2. **Unit Tests** (Steps 2.1-2.2): URL parsers, pagination helpers
3. **Component Tests** (Steps 3.1-3.6): UI components from simple to complex
   - BobbleheadGrid → BulkActionsBar → BobbleheadPagination → Toolbar → BobbleheadCard → BobbleheadGridDisplay
4. **Integration Tests** (Steps 4.1-4.3): Query → Facade → Server Actions

**Total Estimated Effort**: 24-32 hours

- Infrastructure: 3-4 hours
- Unit Tests: 2-3 hours
- Component Tests: 12-16 hours
- Integration Tests: 7-9 hours

---

## Success Criteria (Final Checklist)

- [ ] All 133-163 tests passing
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No linting errors (`npm run lint:fix`)
- [ ] Test coverage > 80% for all components
- [ ] Test coverage 100% for queries and actions
- [ ] All accessibility tests passing (keyboard, ARIA)
- [ ] All edge cases covered (empty states, errors, loading)
- [ ] Integration tests use real database (Testcontainers)
- [ ] Component tests properly isolated with mocks
- [ ] Documentation updated with test patterns
