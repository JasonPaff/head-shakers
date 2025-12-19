# Test Coverage Gap Analysis: Collection Dashboard Bobblehead Grid

**Date**: 2025-12-04
**Scope**: Unit, Component, Integration Tests (NOT E2E)
**Focus Area**: Bobblehead grid dashboard feature

---

## Summary

- **Source Files Analyzed**: 12 high priority + 5 medium priority
- **Existing Tests Found**: 2 (validation schemas + facade)
- **Total Coverage Gaps**: Significant - only 16.7% baseline coverage
- **Estimated New Tests Required**: 68-82 tests across all types

---

## Coverage Matrix

| Source File                       | Unit       | Component  | Integration | Gap Status |
| --------------------------------- | ---------- | ---------- | ----------- | ---------- |
| `bobblehead-grid-display.tsx`     | N/A        | ❌ Missing | ❌ Missing  | Critical   |
| `toolbar.tsx`                     | N/A        | ❌ Missing | N/A         | High       |
| `bulk-actions-bar.tsx`            | N/A        | ❌ Missing | N/A         | High       |
| `bobblehead-card.tsx`             | N/A        | ❌ Missing | N/A         | High       |
| `bobblehead-pagination.tsx`       | N/A        | ❌ Missing | N/A         | High       |
| `bobblehead-grid.tsx`             | N/A        | ❌ Missing | N/A         | Medium     |
| `bobbleheads.actions.ts`          | ✅ Partial | N/A        | ❌ Missing  | High       |
| `bobbleheads-dashboard.facade.ts` | ❌ Missing | N/A        | ✅ Exists   | Partial    |
| `bobbleheads.facade.ts`           | ❌ Missing | N/A        | ✅ Exists   | Partial    |
| `bobbleheads-dashboard.query.ts`  | ❌ Missing | N/A        | ❌ Missing  | Critical   |
| `bobbleheads.validation.ts`       | ✅ Exists  | N/A        | N/A         | Complete   |
| `route-type.ts`                   | ❌ Missing | N/A        | N/A         | Low        |

---

## Coverage Gaps by Priority

### Critical Priority

#### 1. **File**: `src/app/(app)/dashboard/collection/(collection)/components/display/bobblehead-grid-display.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component, Integration

**Exports Requiring Tests**:

- `BobbleheadGridDisplay` - Main orchestration component

**Functionality Lacking Coverage**:

1. **Search & Filtering**:
   - Search input debouncing (300ms delay)
   - Filter state management (category, condition, featured)
   - Search input synchronization with URL params
   - Clear filters functionality
   - Active filter badge display

2. **Pagination**:
   - Page change handling with scroll-to-top
   - Page size change handling with reset to page 1
   - Pagination conditional rendering

3. **Selection Mode**:
   - Selection mode toggle
   - Select/deselect individual items
   - Select all/deselect all
   - Selected items count tracking
   - Selected items set management

4. **Grid Density**:
   - Grid density toggle (compact/comfortable)
   - User preference persistence
   - Visual density state management

5. **Hover Card**:
   - Hover card toggle
   - User preference persistence
   - Conditional rendering based on selection mode

6. **Actions**:
   - Single delete with confirmation dialog
   - Bulk delete with count confirmation
   - Single feature toggle
   - Bulk feature toggle
   - Edit parameter setting

7. **Server Action Integration**:
   - Delete action execution and error handling
   - Feature toggle action execution and error handling
   - Bulk feature action execution
   - Bulk delete action execution
   - Success callbacks and state cleanup
   - Router refresh after mutations

8. **Empty States**:
   - No bobbleheads state
   - No results after filtering state
   - Conditional rendering of empty states

9. **State Derived Values**:
   - `_hasBobbleheads` calculation
   - `_isFiltered` calculation
   - `_hasNoResults` calculation
   - `_hasNoBobbleheads` calculation
   - `_hasSelection` calculation
   - `_isAllSelected` calculation

**Risk Assessment**: Critical - This is the core orchestration component that:

- Manages complex state (selection, filters, pagination, preferences)
- Handles all user interactions with the grid
- Integrates multiple child components
- Executes server actions with proper error handling
- Manages cache invalidation through router refresh

**Estimated Tests**: 18-22 tests

- Happy path flow: 3 tests
- Error cases: 4 tests
- State management: 6 tests
- Action integration: 5 tests
- Empty states: 2 tests
- Integration scenarios: 2 tests

---

#### 2. **File**: `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-card.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component

**Exports Requiring Tests**:

- `BobbleheadCard` - Individual card display with actions
- `conditionVariants` - CVA for condition styling

**Functionality Lacking Coverage**:

1. **Card Rendering**:
   - Image display with feature photo
   - Name and condition display
   - Featured badge visibility
   - Selection checkbox overlay (conditional)
   - Hover actions overlay (conditional)

2. **Selection Mode**:
   - Card role and aria attributes change when in selection mode
   - Checkbox checkbox interaction
   - Card click toggles selection when in selection mode
   - Keyboard support (Enter/Space) for selection

3. **Hover Card**:
   - Hover card trigger and content
   - Hover card disabled when in selection mode
   - Hover card disabled when feature disabled
   - Detailed information display in hover card
   - Engagement metrics display

4. **Actions**:
   - Edit button click handler
   - Feature toggle via dropdown menu
   - Delete via dropdown menu
   - Proper event propagation/stopping

5. **Condition Styling**:
   - All condition variants: mint, near-mint, excellent, good, fair, poor
   - Text transformation (hyphen to space, uppercase)

6. **Accessibility**:
   - Image alt text
   - Role and aria attributes for keyboard interaction
   - Tabindex management
   - Keyboard event handlers

**Risk Assessment**: High - This component:

- Is rendered hundreds of times (per-item rendering)
- Handles complex conditional rendering (selection vs hover modes)
- Has keyboard accessibility requirements
- Manages event propagation
- Has CVA styling variants that must be tested

**Estimated Tests**: 14-18 tests

- Rendering states: 4 tests
- Selection mode interactions: 4 tests
- Hover card behavior: 3 tests
- Actions: 4 tests
- Accessibility: 2 tests
- Styling variants: 1 test

---

#### 3. **File**: `src/lib/queries/bobbleheads/bobbleheads-dashboard.query.ts`

**Current Coverage**: No tests

**Missing Test Types**: Integration

**Exports Requiring Tests**:

- `BobbleheadsDashboardQuery.getCategoriesByCollectionSlugAsync()`
- `BobbleheadsDashboardQuery.getCountAsync()`
- `BobbleheadsDashboardQuery.getListAsync()`
- Private filter methods

**Functionality Lacking Coverage**:

1. **Category Fetching**:
   - Distinct categories by collection slug
   - Filtering null categories
   - Ordering by category name
   - Permission filters applied

2. **Count Queries**:
   - Count without pagination parameters
   - Search term filtering (name, description, character, manufacturer)
   - Category filtering
   - Condition filtering
   - Featured status filtering
   - Base filters (public, userId, deletedAt)
   - Correct count aggregation

3. **List Queries**:
   - All fields selected properly
   - Pagination (page, pageSize, offset)
   - Subqueries for comment count, like count, view count
   - Primary photo left join
   - Proper field name transformations (currentCondition -> condition)
   - Search filtering across multiple fields
   - Sort ordering (newest, oldest, name-asc, name-desc, value-high, value-low)
   - All filters combined properly

4. **Filter Methods**:
   - `_getSearchCondition()`: OR across 4 fields, case-insensitive
   - `_getCategoryCondition()`: Handles 'all' vs specific category
   - `_getConditionFilter()`: Maps condition enum value
   - `_getFeaturedCondition()`: Boolean conversion from featured flag
   - `_getSortOrder()`: All 6 sort options, NULLS LAST handling

5. **Edge Cases**:
   - Empty search results
   - No categories in collection
   - Pagination at boundaries
   - Missing photo for bobblehead
   - Null values in optional fields

**Risk Assessment**: Critical - Query layer:

- Directly affects API response correctness
- Handles complex filtering logic
- Pagination correctness impacts UX
- Subqueries must be accurate
- Permission checks must be enforced

**Estimated Tests**: 12-16 tests

- Category queries: 2 tests
- Count queries with filters: 4 tests
- List queries with pagination: 4 tests
- Sort ordering: 2 tests
- Filter conditions: 3 tests
- Edge cases: 1 test

---

### High Priority

#### 4. **File**: `src/app/(app)/dashboard/collection/(collection)/components/main/toolbar.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component

**Exports Requiring Tests**:

- `Toolbar` - Search, filter, sort controls
- `ToolbarProps` - Type definitions

**Functionality Lacking Coverage**:

1. **Search Input**:
   - Input value binding
   - Input change handler
   - Clear button functionality
   - Placeholder text

2. **Filter Dropdown**:
   - Dropdown trigger button
   - Active filter badge display
   - Category radio group with all + categories
   - Condition radio group with all + conditions
   - Featured filter options (all, featured, not-featured)
   - Clear filters menu item visibility (only when filters active)
   - Filter state display in radio groups

3. **Sort Dropdown**:
   - Sort button and label
   - All 6 sort options
   - Current sort value reflected in radio group
   - Desktop vs mobile button text

4. **Grid Density Toggle**:
   - Icon changes based on density
   - Toggle button desktop only (lg:flex hidden)
   - On click handler

5. **Hover Card Toggle**:
   - Switch component integration
   - Label with icon
   - Desktop display (lg:flex hidden)
   - Mobile display in view options dropdown

6. **Selection Mode Toggle**:
   - Both desktop and mobile versions
   - Button state based on isSelectionMode (default vs primary variant)
   - Label changes (Cancel vs Select)
   - Icon display

7. **Add Button**:
   - Desktop only
   - Button state and styling
   - On click handler

8. **Mobile Actions**:
   - View options dropdown
   - Hover card toggle in mobile menu
   - Grid density toggle in mobile menu
   - Selection mode toggle in mobile menu

9. **Layout**:
   - Sticky positioning
   - z-index management
   - Responsive layout (flex-col on mobile, flex-row on sm)

**Risk Assessment**: High - UI component:

- User interacts with frequently
- Controls all filtering and search behavior
- Multiple conditional renders for responsive design
- Numerous event handlers
- State synchronization with display

**Estimated Tests**: 12-16 tests

- Search functionality: 3 tests
- Filter dropdowns: 4 tests
- Sort dropdown: 2 tests
- Toggle controls: 3 tests
- Mobile vs desktop layout: 3 tests
- Conditional rendering: 1 test

---

#### 5. **File**: `src/app/(app)/dashboard/collection/(collection)/components/main/bulk-actions-bar.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component

**Exports Requiring Tests**:

- `BulkActionsBar` - Bulk selection actions
- `BulkActionsBarProps` - Type definitions

**Functionality Lacking Coverage**:

1. **Selection Count Display**:
   - Correct singular/plural text ("1 item" vs "N items")
   - Count accuracy

2. **Select All Button**:
   - Label toggles (Select All vs Deselect All)
   - On click handler
   - Button styling

3. **Feature Action**:
   - Feature Selected button
   - Icon display
   - Label visibility on mobile vs desktop
   - On click handler

4. **Delete Action**:
   - Delete Selected button
   - Destructive styling
   - Icon display
   - Label visibility on mobile vs desktop
   - On click handler

5. **Card Styling**:
   - Primary border color
   - Layout with flexbox
   - Responsive spacing

**Risk Assessment**: High - UI component:

- Critical for bulk operations UX
- Simple but frequently used
- Event handler accuracy important
- Text formatting must be exact

**Estimated Tests**: 8-10 tests

- Selection count: 2 tests
- Select all button: 2 tests
- Feature action: 2 tests
- Delete action: 2 tests
- Layout and styling: 1 test

---

#### 6. **File**: `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-pagination.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component

**Exports Requiring Tests**:

- `BobbleheadPagination` - Pagination controls
- `getPageNumbers()` - Helper function

**Functionality Lacking Coverage**:

1. **Results Info Display**:
   - Start item calculation: (page - 1) \* pageSize + 1
   - End item calculation: min(page \* pageSize, totalCount)
   - Zero totalCount handling
   - Text formatting

2. **Page Size Selector**:
   - Select dropdown with options (12, 24, 48)
   - Current page size reflected
   - Value change handler
   - Proper type conversion to number

3. **Pagination Controls**:
   - Previous button
   - Next button
   - Individual page buttons
   - Ellipsis display (...) for page ranges
   - Active page styling (default variant)
   - Inactive page styling (outline variant)
   - Disabled state for first/last page buttons

4. **Page Number Calculation** (`getPageNumbers()`):
   - 5 pages or less: all pages shown
   - 6+ pages: intelligent ellipsis placement
   - First page always shown
   - Last page always shown
   - Pages around current (±1)
   - Ellipsis at both ends when needed (currentPage > 3 AND currentPage < totalPages - 2)

5. **Edge Cases**:
   - totalCount === 0: returns null
   - Single page: no pagination shown
   - Two pages: no ellipsis
   - Large page counts: ellipsis logic

**Risk Assessment**: High - Component:

- Complex pagination math must be correct
- UX depends on accurate page display
- Helper function has multiple branches
- Styling affects usability

**Estimated Tests**: 10-13 tests

- Results info: 3 tests
- Page size selector: 2 tests
- Pagination controls: 3 tests
- Page number calculation: 3 tests
- Edge cases: 2 tests

---

#### 7. **File**: `src/lib/actions/bobbleheads/bobbleheads.actions.ts`

**Current Coverage**: Partial (validation schemas only)

**Missing Test Types**: Integration

**Exports Requiring Tests**:

- `deleteBobbleheadAction()` - Single delete with transaction
- `updateBobbleheadFeatureAction()` - Single feature toggle
- `batchUpdateBobbleheadFeatureAction()` - Bulk feature toggle
- `batchDeleteBobbleheadsAction()` - Bulk delete with transaction

**Functionality Lacking Coverage** (for dashboard grid):

1. **deleteBobbleheadAction**:
   - Input validation
   - Authorization check (owns bobblehead)
   - Successful deletion response
   - Non-existent bobblehead error
   - Error handling and response formatting
   - Sentry breadcrumb logging
   - Cache invalidation (handled by facade)

2. **updateBobbleheadFeatureAction**:
   - Input validation (id, isFeatured)
   - Ownership verification
   - Successful update with response
   - Not found error handling
   - Sentry context and breadcrumb
   - Error response formatting

3. **batchUpdateBobbleheadFeatureAction**:
   - Input validation (ids array, isFeatured)
   - Batch update execution
   - All-or-nothing transaction
   - Array of updated bobbleheads response
   - Error handling
   - Sentry logging with batch count

4. **batchDeleteBobbleheadsAction**:
   - Input validation (ids array, min 1, max 100)
   - Batch deletion execution
   - Count of deleted bobbleheads in response
   - Error handling
   - Sentry logging with batch count
   - Tag removal for each bobblehead
   - Cloudinary cleanup handling

5. **Error Cases**:
   - Invalid input formats
   - Unauthorized access attempts
   - Non-existent records
   - Database failures
   - Rate limiting

**Risk Assessment**: High - Server actions:

- Direct data mutation operations
- Critical for grid functionality (delete, feature)
- Complex transaction handling
- Error responses must be correct
- Permission checks essential

**Estimated Tests**: 10-14 tests per action

- Happy path: 2 tests per action = 8 tests
- Error cases: 2 tests per action = 8 tests
- Permission/authorization: 1 test per action = 4 tests
- Bulk operations: 2 tests = 2 tests
- **Total**: 16-22 tests

---

#### 8. **File**: `src/lib/facades/bobbleheads/bobbleheads-dashboard.facade.ts`

**Current Coverage**: No tests (facade exists but no tests)

**Missing Test Types**: Integration

**Exports Requiring Tests**:

- `BobbleheadsDashboardFacade.getListByCollectionSlugAsync()` - Main grid data fetch
- `BobbleheadsDashboardFacade.getCategoriesByCollectionSlugAsync()` - Category fetch
- `BobbleheadsDashboardFacade.getBobbleheadForEditAsync()` - Edit fetch
- `BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync()` - Collection selectors

**Functionality Lacking Coverage**:

1. **getListByCollectionSlugAsync**:
   - Pagination metadata calculation
   - Separate data and count caching with different keys
   - Hash creation for paginated options
   - Hash creation for filter-only options
   - Parallel query execution
   - Proper permission context
   - Edge cases (no bobbleheads, all filtered out)

2. **getCategoriesByCollectionSlugAsync**:
   - Cache integration with categoriesByCollection
   - Query execution with collection slug
   - User context creation

3. **getBobbleheadForEditAsync**:
   - Ownership verification (userId match)
   - Tag transformation (minimal data)
   - Null return for unauthorized access

4. **getUserCollectionSelectorsAsync**:
   - Cache integration with selectorsByUser
   - Ordering by name
   - Minimal data return (id, name, slug)

**Risk Assessment**: High - Facade layer:

- Orchestrates queries with caching
- Critical for performance (pagination, separate caches)
- Permission checks at business logic layer
- Complex cache key generation

**Estimated Tests**: 8-12 tests

- List queries with pagination: 3 tests
- Category queries: 2 tests
- Cache behavior: 2 tests
- Permission checks: 2 tests
- Edge cases: 1 test

---

### Medium Priority

#### 9. **File**: `src/app/(app)/dashboard/collection/(collection)/components/main/bobblehead-grid.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Component

**Exports Requiring Tests**:

- `BobbleheadGrid` - Grid wrapper component

**Functionality Lacking Coverage**:

1. **Grid Density Styling**:
   - Compact: grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7
   - Comfortable: grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5
   - Proper className generation with `cn()`

2. **Empty State Layout**:
   - Centered flex layout when isEmpty=true
   - Grid layout when isEmpty=false
   - Children rendered in both cases

3. **Container Styling**:
   - Padding and margin
   - Data slot for testing

**Risk Assessment**: Medium - Styling component:

- Simple layout wrapper
- No complex logic
- Styling correctness important for UX

**Estimated Tests**: 4-6 tests

- Compact grid rendering: 1 test
- Comfortable grid rendering: 1 test
- Empty state layout: 1 test
- Children rendering: 1 test

---

#### 10. **File**: `src/app/(app)/dashboard/collection/(collection)/route-type.ts`

**Current Coverage**: No tests

**Missing Test Types**: Unit

**Exports Requiring Tests**:

- Route definition and parser validation
- All search params types and defaults

**Functionality Lacking Coverage**:

1. **Search Params Validation**:
   - Type coercion (boolean, integer, string enum)
   - Default values application
   - Valid enum values acceptance

2. **Parser Definitions**:
   - `add`: boolean with false default
   - `category`: string with 'all' default
   - `condition`: enum with 'all' default
   - `edit`: optional string
   - `featured`: enum with 'all' default
   - `page`: integer with 1 default
   - `pageSize`: integer with 24 default
   - `search`: string with '' default
   - `sortBy`: enum with 'newest' default

**Risk Assessment**: Low - Type/config layer:

- Critical for URL state integrity
- But straightforward validation

**Estimated Tests**: 4-6 tests

- Each param type validation: 9 tests
- Default values: 1 test
- Parser cache: 1 test

---

### Low Priority

#### 11. **File**: `src/lib/facades/bobbleheads/bobbleheads.facade.ts` (Dashboard-related methods)

**Current Coverage**: Exists but partial

**Missing Test Types**: Integration (dashboard-specific tests)

**Dashboard-Specific Methods Lacking Coverage**:

- `updateFeaturedAsync()` - Single feature toggle
- `batchUpdateFeaturedAsync()` - Bulk feature toggle
- `batchDeleteAsync()` - Bulk delete
- Cache invalidation methods

**Estimated Tests**: 6-8 tests
(Note: Base facade tests exist, but dashboard-specific scenarios need coverage)

---

#### 12. **File**: `src/app/(app)/dashboard/collection/(collection)/components/async/bobblehead-grid-async.tsx`

**Current Coverage**: No tests

**Missing Test Types**: Integration

**Current Status**:

- Async boundary component for Suspense
- Simple server component wrapper
- Uses async data fetching

**Estimated Tests**: 2-4 tests
(Low priority: mostly integration with data fetching patterns)

---

## Existing Test Coverage

### ✅ Tests Found

1. **`tests/unit/lib/validations/bobbleheads.validation.test.ts`**
   - Covers: deleteBobbleheadSchema, reorderBobbleheadPhotosSchema, updateBobbleheadPhotoMetadataSchema, etc.
   - Status: Complete for validation schemas
   - Patterns: Zod schema safeParse with success/failure cases

2. **`tests/integration/facades/bobbleheads/bobbleheads.facade.test.ts`**
   - Covers: BobbleheadsFacade CRUD operations
   - Status: Partial - exists but doesn't cover dashboard facade
   - Patterns: Testcontainers setup, test database, mocked Sentry/Cloudinary

### 📋 Test Infrastructure Available

- **Fixtures**: `tests/fixtures/bobblehead.factory.ts` - Ready for integration tests
- **Mock Data**: `tests/mocks/data/bobbleheads.mock.ts` - Ready for component tests
- **MSW Handlers**: `tests/mocks/handlers/bobbleheads.handlers.ts` - API mocking
- **Test Utils**: Vitest + Testing Library setup ready
- **Test Database**: Testcontainers PostgreSQL available

---

## Recommended Testing Order

### Phase 1: Foundation (Unit Tests)

1. Route type params validation (4-6 tests)
2. Pagination helper (`getPageNumbers()`) (3-5 tests)

### Phase 2: Component Layer (Component Tests)

3. Bobblehead Card (14-18 tests)
4. Toolbar (12-16 tests)
5. Bulk Actions Bar (8-10 tests)
6. Pagination (10-13 tests)
7. Bobblehead Grid (4-6 tests)

### Phase 3: Business Logic (Integration Tests)

8. Dashboard Query Layer (12-16 tests)
9. Dashboard Facade (8-12 tests)
10. Server Actions (16-22 tests)

### Phase 4: Orchestration (Component Tests)

11. Bobblehead Grid Display (18-22 tests)

---

## Test Count Estimates by Type

| Test Type       | Count      | Key Files                                     |
| --------------- | ---------- | --------------------------------------------- |
| **Unit**        | 7-11       | route-type.ts, pagination helper              |
| **Component**   | 50-61      | Toolbar, Card, Pagination, Grid, Bulk Actions |
| **Integration** | 36-50      | Queries, Facades, Actions                     |
| **Total**       | **93-122** | All combined                                  |

**Focused Scope (High Priority Only)**: 68-82 tests

---

## Key Testing Patterns to Implement

### Component Testing Patterns

```typescript
// Search/filter state management
// Selection mode interactions
// Keyboard accessibility (Enter, Space)
// Event propagation and stopping
// Conditional rendering (selection vs hover)
// User preference persistence
// URL state synchronization with nuqs
```

### Integration Testing Patterns

```typescript
// Query filters with complex conditions
// Pagination calculations
// Permission/authorization checks
// Transaction handling
// Cache key generation
// Error handling and response formatting
```

### Mock Setup Requirements

```typescript
// nuqs for URL state management
// Next router for navigation
// useServerAction hook for action execution
// useUserPreferences hook for preferences
// Testcontainers PostgreSQL for integration tests
// MSW handlers for API calls
```

---

## Quality Metrics

- **Current Coverage**: ~16.7% (only validations + partial facade)
- **Target Coverage**: 85%+ for dashboard grid feature
- **Critical Path Coverage**: 100% (orchestration, queries, actions)
- **Component Coverage**: 90%+ (user-facing components)

---

## Dependencies & Blockers

### None Identified

- Test infrastructure fully available
- Factories and mocks ready
- All source files accessible
- No external API dependencies blocking tests

---

## Conclusion

The bobblehead grid dashboard feature has **minimal existing test coverage** with a clear need for:

1. **Critical**: Orchestration component and query layer tests
2. **High**: All interactive component tests and server action tests
3. **Medium**: Grid wrapper and utility component tests
4. **Low**: Route type and async boundary tests

Implementing the estimated **68-82 high-priority tests** will achieve **85%+ coverage** for this feature and significantly improve code reliability and maintainability.
