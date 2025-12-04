# Test Coverage Gap Analysis: Collection Dashboard Sidebar Feature

## Summary

- **Source Files Analyzed**: 17
- **Existing Tests Found**: 2 (partial coverage)
- **Total Coverage Gaps**: 15 source files with missing tests
- **Estimated New Tests Required**: 62 tests across all test types

---

## Coverage Matrix

| Source File | Unit | Component | Integration | Gap Status |
|---|---|---|---|---|
| `sidebar-display.tsx` | N/A | ❌ | N/A | Missing |
| `sidebar-async.tsx` | N/A | ❌ | N/A | Missing |
| `sidebar-header.tsx` | N/A | ❌ | N/A | Missing |
| `sidebar-search.tsx` | N/A | ❌ | N/A | Missing |
| `sidebar-collection-list.tsx` | N/A | ❌ | N/A | Missing |
| `sidebar-footer.tsx` | N/A | ❌ | N/A | Missing |
| `collection-card-compact.tsx` | N/A | ❌ | N/A | Missing |
| `collection-card-detailed.tsx` | N/A | ❌ | N/A | Missing |
| `collection-card-cover.tsx` | N/A | ❌ | N/A | Missing |
| `collection-card-hovercard.tsx` | N/A | ❌ | N/A | Missing |
| `no-collections.tsx` | N/A | ❌ | N/A | Missing |
| `no-filtered-collections.tsx` | N/A | ❌ | N/A | Missing |
| `collections-dashboard.facade.ts` | ❌ | N/A | ✅* | Partial |
| `collections-dashboard.query.ts` | ❌ | N/A | ✅* | Partial |
| `collections.actions.ts` | ❌ | N/A | ✅* | Partial |
| `collections.validation.ts` | ✅ | N/A | N/A | Complete |
| `collection.utils.ts` (sortCollections) | ❌ | N/A | N/A | Missing |

**Legend**: ✅ = Complete, ✅* = Covered but by parent facade tests, ❌ = Missing, N/A = Not Applicable

---

## Coverage Gaps by Priority

### CRITICAL PRIORITY - Core Sidebar Orchestration

#### File: `src/app/(app)/dashboard/collection/(collection)/components/display/sidebar-display.tsx`

**Component Type**: Client component (orchestrator)

**Complexity**: High - manages complex state, filtering, sorting, dialogs, and actions

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarDisplay` component (main component)
- `CollectionCardMapper` sub-component (internal)

**Key Functionality**:
- State management: cardStyle, editingCollection, searchValue, sortOption, deletingCollectionId
- Dialog orchestration: Create, Edit, Delete dialogs
- Collection filtering by search query (name + description)
- Collection sorting via `sortCollections` utility (9 sort options)
- User preferences persistence (collectionSidebarView, collectionSidebarSort, isCollectionHoverCardEnabled)
- Server action integration (deleteCollectionAction)
- Query string state management (collectionSlug)
- Fallback collection selection when none specified

**Edge Cases to Test**:
- Empty collections (shows NoCollections component)
- Search with no results (shows NoFilteredCollections)
- Create dialog open/close
- Edit dialog with pre-filled data
- Delete dialog confirmation flow
- Hover card toggle persistence
- Card style changes and persistence
- Sort option changes and persistence
- All 9 sort options working correctly
- Search filtering across name and description
- Collection selection triggering query param update
- Delete action triggering collection deselection
- Race condition when deleting last filtered collection

**Estimated Tests**: 18 component tests

**Risk Assessment**: CRITICAL - This is the main orchestration component for the entire sidebar feature. Complex state management, multiple dialogs, and user preference handling create high risk for bugs.

**Test Infrastructure Needed**:
- Mock `nuqs` for query state management
- Mock `useServerAction` hook
- Mock `useUserPreferences` hook
- Mock `sortCollections` utility
- Mock all child components (safe approach for component isolation)

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-search.tsx`

**Component Type**: Client component (controls)

**Complexity**: Medium - dropdown menus, input field, toggle switch

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarSearch` component
- `CollectionCardStyle` type export

**Key Functionality**:
- Search input with clearable state
- Disabled state support
- Card style selector (3 options: compact, detailed, cover)
- Sort option selector (9 options with proper labeling)
- Hover card toggle switch
- Dynamic icon selection based on sort option

**Edge Cases to Test**:
- Disabled search input when no collections
- Search input value changes
- Search clear button
- Card style selection changes
- All 9 sort options rendering with correct icons
- Hover card toggle state changes
- Icons displayed correctly for each sort type
- Label text accuracy for all options

**Estimated Tests**: 12 component tests

**Risk Assessment**: HIGH - Multiple dropdowns with 9 sort options, incorrect label mapping or sort values could confuse users.

**Test Infrastructure Needed**:
- Mock Radix UI dropdown components
- Mock lucide-react icons
- Mock Input component
- Mock Switch component

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-collection-list.tsx`

**Component Type**: Client component (layout container)

**Complexity**: Low - simple layout wrapper with conditional spacing

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarCollectionList` component

**Key Functionality**:
- Conditional spacing based on cardStyle ('compact' vs 'detailed'/'cover')
- Scrollable container
- Children rendering

**Edge Cases to Test**:
- Compact view spacing (space-y-2)
- Cover/detailed view spacing (space-y-3)
- Overflow handling
- Children render correctly

**Estimated Tests**: 3 component tests

**Risk Assessment**: MEDIUM - Simple component but impacts UX with spacing; visual regression risk.

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/async/sidebar-async.tsx`

**Component Type**: Server component

**Complexity**: Low - wrapper for data fetching

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarAsync` function

**Key Functionality**:
- Async data fetching from `CollectionsDashboardFacade`
- User preferences retrieval
- Passes data to `SidebarDisplay`

**Edge Cases to Test**:
- Data loading and passing to display component
- User authentication verification
- Exception handling for facade calls

**Estimated Tests**: 2 integration tests (server component pattern)

**Risk Assessment**: MEDIUM - Server component orchestration; data flow critical.

**Test Infrastructure Needed**:
- Mock `CollectionsDashboardFacade.getListByUserIdAsync`
- Mock `getUserPreferences`
- Mock `getRequiredUserIdAsync`

---

### CRITICAL PRIORITY - Collection Card Components

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-compact.tsx`

**Component Type**: Client component (card variant)

**Complexity**: Medium - interactive card with dropdown menu, hover effects, keyboard navigation

**Current Coverage**: None

**Exports Requiring Tests**:
- `CollectionCardCompact` component
- `CollectionCardCompactProps` type

**Key Functionality**:
- Card selection (onClick, keyboard Enter/Space)
- Active state styling (border-primary, gradient background, pulse animation)
- Hover card support (optional)
- Edit menu item
- Delete menu item
- Collection info display: name, item count, visibility, total value
- Currency formatting
- Dropdown menu with stop propagation
- Keyboard accessibility

**Edge Cases to Test**:
- Active state styling applied
- Inactive state styling
- Hover effects
- Menu item clicks with event propagation stop
- Keyboard navigation (Enter, Space keys)
- Collection with/without image
- Public vs private visibility icons
- Currency formatting for different values
- Hover card enabled/disabled

**Estimated Tests**: 11 component tests

**Risk Assessment**: CRITICAL - User interaction point; keyboard navigation and selection state critical for UX.

**Test Infrastructure Needed**:
- Mock HoverCard components
- Mock DropdownMenu components
- Mock Avatar components
- Mock formatCurrency utility
- Mock cn utility (classname merge)

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-detailed.tsx`

**Component Type**: Client component (card variant)

**Complexity**: Medium - similar to compact but with more stats display

**Current Coverage**: None

**Exports Requiring Tests**:
- `CollectionCardDetailed` component
- `CollectionCardDetailedProps` type

**Key Functionality**:
- Card selection with keyboard support
- Active state styling
- Extended stats: likes, featured count
- Description display with line clamping
- Edit/Delete actions
- Hover card support
- Engagement stats rendering

**Edge Cases to Test**:
- All card-compact tests (same selection/navigation patterns)
- Stats display: likes, featured count
- Description rendering with line-clamp
- Empty vs filled stats
- Currency formatting

**Estimated Tests**: 11 component tests

**Risk Assessment**: CRITICAL - High visibility component with engagement metrics; stat accuracy important.

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-cover.tsx`

**Component Type**: Client component (card variant)

**Complexity**: High - image overlay, gradient effects, mobile-specific styling

**Current Coverage**: None

**Exports Requiring Tests**:
- `CollectionCardCover` component
- `CollectionCardCoverProps` type

**Key Functionality**:
- Cover image display with aspect ratio
- Gradient overlay (dark to transparent)
- Image scale on hover
- Floating action menu with event stop propagation
- Collection info overlay on image
- Stats overlay: items, value, likes
- Visibility indicator (public/private)
- Active state with border and ring effect
- Keyboard navigation support

**Edge Cases to Test**:
- Image loading with fallback
- Hover scale animation
- Active state ring styling
- Gradient overlay rendering
- Overlay stats positioning
- Visibility indicator positioning
- Keyboard navigation
- Hover card with image background

**Estimated Tests**: 13 component tests

**Risk Assessment**: CRITICAL - Most visually complex card variant; visual regression and accessibility risks high.

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/cards/collection-card-hovercard.tsx`

**Component Type**: Client component (hover preview)

**Complexity**: Medium - preview popup content

**Current Coverage**: None

**Exports Requiring Tests**:
- `CollectionHoverCardContent` component
- `CollectionHoverCardContentProps` type

**Key Functionality**:
- Hover card content with avatar, name, item count
- Separator dividers
- Stats grid: Total Value, Featured, Views, Likes, Visibility, Comments
- Currency formatting
- Public/Private visibility text

**Edge Cases to Test**:
- All stats displayed correctly
- Currency formatting
- Visibility text (Public/Private)
- Layout with separator dividers
- Avatar fallback
- Zero values in stats
- Large values rendering

**Estimated Tests**: 6 component tests

**Risk Assessment**: MEDIUM - Preview information; limited interaction, but stat accuracy important.

---

### HIGH PRIORITY - Empty States

#### File: `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-collections.tsx`

**Component Type**: Client component (simple)

**Complexity**: Low - static UI with one action button

**Current Coverage**: None

**Exports Requiring Tests**:
- `NoCollections` component

**Key Functionality**:
- Create button with icon
- Static messaging

**Edge Cases to Test**:
- Create button click
- onCreateClick callback

**Estimated Tests**: 2 component tests

**Risk Assessment**: LOW - Simple component, but important for new user experience.

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/empty-states/no-filtered-collections.tsx`

**Component Type**: Client component (simple)

**Complexity**: Low - static UI with clear search button

**Current Coverage**: None

**Exports Requiring Tests**:
- `NoFilteredCollections` component

**Key Functionality**:
- Clear search button with icon
- Static messaging

**Edge Cases to Test**:
- Clear button click
- onClearSearch callback

**Estimated Tests**: 2 component tests

**Risk Assessment**: LOW - Simple component, but important for search UX.

---

### HIGH PRIORITY - Sidebar Controls

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-header.tsx`

**Component Type**: Client component (header)

**Complexity**: Low - static header with create button

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarHeader` component

**Key Functionality**:
- Collections title with gradient text
- Create button with icon
- Optional onCreateClick callback

**Edge Cases to Test**:
- Create button click
- onCreateClick callback
- Gradient styling applied

**Estimated Tests**: 2 component tests

**Risk Assessment**: LOW - Simple header component.

---

#### File: `src/app/(app)/dashboard/collection/(collection)/components/sidebar/sidebar-footer.tsx`

**Component Type**: Client component (footer)

**Complexity**: Low - static footer with count

**Current Coverage**: None

**Exports Requiring Tests**:
- `SidebarFooter` component

**Key Functionality**:
- Total collection count display
- Plural/singular text handling

**Edge Cases to Test**:
- Single collection (no plural 's')
- Multiple collections (plural 's')
- Zero collections
- Large numbers

**Estimated Tests**: 4 component tests

**Risk Assessment**: LOW - Simple component with text formatting.

---

### HIGH PRIORITY - Business Logic & Data Layer

#### File: `src/lib/facades/collections/collections-dashboard.facade.ts`

**Component Type**: Facade class (business logic)

**Complexity**: Low-Medium - wrapper around queries and cache service

**Current Coverage**: Partial - covered by parent `CollectionsFacade` tests

**Exports Requiring Tests**:
- `CollectionsDashboardFacade.getHeaderByCollectionSlugAsync` (static method)
- `CollectionsDashboardFacade.getListByUserIdAsync` (static method)

**Key Functionality**:
- Fetch collection header by slug with stats aggregation
- Fetch all collections for user with stats
- Cache integration
- Permission context handling

**Missing Test Coverage**:
- Unit tests for facade methods with mocked dependencies
- Error handling scenarios
- Cache key consistency

**Estimated Tests**: 6 unit tests

**Risk Assessment**: HIGH - Data layer critical for sidebar functionality; cache behavior important.

---

#### File: `src/lib/queries/collections/collections-dashboard.query.ts`

**Component Type**: Query class (data access)

**Complexity**: High - complex Drizzle queries with multiple joins and aggregations

**Current Coverage**: Partial - covered by facade integration tests

**Exports Requiring Tests**:
- `CollectionsDashboardQuery.getHeaderByCollectionSlugAsync` (static method)
- `CollectionsDashboardQuery.getListByUserIdAsync` (static method)
- `CollectionsDashboardQuery.getSelectorsByUserIdAsync` (static method)
- Private methods:
  - `_buildBobbleheadStatsSubquery` (bobblehead count, featured, total value)
  - `_buildCommentStatsSubquery` (comment count)
  - `_buildLikeStatsSubquery` (like count)
  - `_buildViewStatsSubquery` (view count)

**Key Functionality**:
- Complex SQL joins with 4 aggregate subqueries
- Permission filtering (user context, isPublic, deletedAt)
- Null coalescing for optional counts
- Case-insensitive name ordering

**Missing Test Coverage**:
- Unit tests for individual query methods
- Aggregate calculation correctness
- Permission filtering edge cases
- Null value handling

**Estimated Tests**: 8 integration tests (using real database)

**Risk Assessment**: HIGH - Complex aggregation queries; stat calculation errors would directly impact UI.

---

#### File: `src/lib/actions/collections/collections.actions.ts`

**Component Type**: Server Actions

**Complexity**: Medium - input validation, permission checks, action response handling

**Current Coverage**: Partial - covered by facade integration tests

**Exports Requiring Tests**:
- `createCollectionAction` (server action)
- `updateCollectionAction` (server action)
- `deleteCollectionAction` (server action)

**Key Functionality**:
- Input schema validation
- Duplicate name checking
- Error handling with Sentry context
- Action success/failure responses
- Transaction requirement metadata

**Missing Test Coverage**:
- Duplicate name check validation
- Permission errors
- Action response formatting
- Sentry error context

**Estimated Tests**: 6 integration tests

**Risk Assessment**: HIGH - Server actions handle mutations; error handling and validation critical.

---

### MEDIUM PRIORITY - Utilities & Validation

#### File: `src/lib/utils/collection.utils.ts` - `sortCollections` function

**Component Type**: Utility function (pure)

**Complexity**: Low-Medium - switch-based sorting with 9 options

**Current Coverage**: None

**Exports Requiring Tests**:
- `sortCollections` function

**Key Functionality**:
- 9 sort options with correct implementation:
  - `name-asc`: Locale string comparison ascending
  - `name-desc`: Locale string comparison descending
  - `count-asc`: Bobblehead count ascending
  - `count-desc`: Bobblehead count descending
  - `value-asc`: Total value ascending with null coalescing
  - `value-desc`: Total value descending with null coalescing
  - `likes-desc`: Like count descending
  - `views-desc`: View count descending
  - `comments-desc`: Comment count descending
- Returns new sorted array (non-mutating)

**Edge Cases to Test**:
- Each of 9 sort options
- Collections with same sort key (stable sort)
- Collections with null/zero values
- Single collection
- Empty array
- Null values in numeric fields

**Estimated Tests**: 11 unit tests

**Risk Assessment**: HIGH - All sidebar sorting depends on this; incorrect sorting directly impacts UX and usability.

**Test Infrastructure Needed**: None - pure function, no dependencies

---

#### File: `src/lib/validations/collections.validation.ts`

**Component Type**: Zod validation schemas

**Complexity**: Medium - multiple schemas with custom validation

**Current Coverage**: Partial (2 schemas covered; missing schema variations)

**Exports Requiring Tests**:
- `insertCollectionSchema` ✅ (not directly tested, but covered by actions)
- `updateCollectionSchema` ✅ (not directly tested)
- `deleteCollectionSchema` ✅ (currently tested)
- `selectCollectionSchema` ❌
- `publicCollectionSchema` ❌
- `getCollectionBySlugSchema` ✅ (currently tested)

**Missing Test Coverage**:
- `insertCollectionSchema` variations (edge cases)
- `updateCollectionSchema` variations
- `selectCollectionSchema`
- `publicCollectionSchema`
- URL validation for coverImageUrl
- Description max length validation
- Name min/max length validation

**Estimated Tests**: 8 unit tests

**Risk Assessment**: MEDIUM - Validation schemas gate data integrity; incomplete coverage for edge cases.

---

## Existing Test Coverage

### Tests Found

1. **`tests/unit/lib/validations/collections.validation.test.ts`**
   - Tests: deleteCollectionSchema, getCollectionBySlugSchema
   - Coverage: 6 test cases
   - Status: Partial - missing insertCollectionSchema, updateCollectionSchema variations

2. **`tests/integration/actions/collections.facade.test.ts`**
   - Tests: CollectionsFacade CRUD operations
   - Coverage: 10 test cases
   - Status: Partial - covers getByIdAsync, createAsync, updateAsync, deleteAsync but not dashboard-specific queries

### Partial Coverage Notes

- **CollectionsDashboardFacade & Query**: Covered indirectly through parent facade tests but no dedicated dashboard query tests
- **Collection Actions**: Covered by facade tests but missing direct action validation tests
- **SidebarDisplay**: No coverage - complex orchestration component needs dedicated tests
- **Collection Card Components**: No coverage - no component tests at all
- **Sort Utility**: No tests despite 9 sort options

---

## Test Infrastructure Notes

### Existing Fixtures

Available in `tests/fixtures/`:
- `user.factory.ts` - createTestUser()
- `collection.factory.ts` - createTestCollection()

### Existing Mocks

Available in `tests/integration/actions/`:
- Sentry mocks (addBreadcrumb, captureException, etc.)
- CacheService mocks (collections cache methods)
- Next.js cache mocks (revalidatePath, revalidateTag)
- Cloudinary service mocks

### Test Database Setup

- `tests/setup/test-db.ts` - getTestDb(), resetTestDatabase()
- Testcontainers integration for PostgreSQL
- Database reset between tests

### Component Testing Infrastructure

No existing sidebar component tests - will need to establish:
- Rendering patterns
- Mock structure for Radix UI components
- Mock patterns for server actions
- Mock patterns for user preferences

---

## Recommendations

### 1. Start With: Unit Tests (Quick Wins)

**Estimated Effort**: 2-3 hours
**Tests**: ~19 tests
**Impact**: Foundation for component tests

```
Priority Order:
1. collection.utils.ts - sortCollections (11 tests)
   - Pure function, no dependencies
   - Directly used by SidebarDisplay
   - Validates all 9 sort options

2. collections.validation.ts - remaining schemas (8 tests)
   - Complete existing coverage gap
   - Simple validation logic
   - Required for action testing
```

### 2. Next: Component Tests (Critical Path)

**Estimated Effort**: 8-12 hours
**Tests**: ~35 tests
**Impact**: 60% of sidebar feature coverage

```
Priority Order:
1. sidebar-display.tsx (18 tests)
   - Core orchestration component
   - Most complex logic
   - Affects all other components

2. collection-card-cover.tsx (13 tests)
   - Most visually complex
   - Highest visual regression risk
   - Establishes card pattern for other variants

3. collection-card-compact.tsx (11 tests)
   - Default card style
   - User interaction patterns
   - Reusable test patterns for detailed variant

4. collection-card-detailed.tsx (11 tests)
   - Similar patterns to compact
   - Extended stats validation
```

### 3. Then: Data Layer Tests (Integration)

**Estimated Effort**: 6-8 hours
**Tests**: ~14 tests
**Impact**: Query correctness and stat calculation validation

```
Priority Order:
1. collections-dashboard.query.ts (8 tests)
   - Complex aggregations
   - Stat calculation correctness
   - Permission filtering

2. collections.actions.ts (6 tests)
   - Action response formatting
   - Error handling
```

### 4. Finally: Remaining Components

**Estimated Effort**: 3-5 hours
**Tests**: ~12 tests
**Impact**: Complete sidebar feature coverage

```
Priority Order:
1. sidebar-search.tsx (12 tests)
   - Dropdown menu interactions
   - Sort option validation

2. Others (low complexity):
   - sidebar-header.tsx (2 tests)
   - sidebar-footer.tsx (4 tests)
   - sidebar-collection-list.tsx (3 tests)
   - no-collections.tsx (2 tests)
   - no-filtered-collections.tsx (2 tests)
   - collection-card-hovercard.tsx (6 tests)
```

### 5. Blockers & Dependencies

**None identified** - existing test infrastructure is sufficient for all test types

### 6. Reusable Test Patterns to Establish

1. **Collection Card Testing Pattern** - Used by 4 variants
   - Selection/click handling
   - Active state validation
   - Menu interaction patterns
   - Keyboard accessibility

2. **Server Component Testing Pattern** - For sidebar-async
   - Data fetching mocking
   - Component rendering with async data

3. **Dropdown Menu Pattern** - Used by sidebar-search and cards
   - Menu item selection
   - Value change callbacks
   - Disabled state handling

---

## Summary Statistics

| Category | Count |
|---|---|
| Source files with NO tests | 15 |
| Source files with PARTIAL tests | 2 |
| Source files with COMPLETE tests | 1 |
| Component tests needed | 35 |
| Unit tests needed | 19 |
| Integration tests needed | 14 |
| Total new tests required | 68 |
| Estimated implementation hours | 20-28 hours |
| Estimated review hours | 5-7 hours |

---

## Risk Assessment Summary

**Critical Risk Areas** (will implement first):
- SidebarDisplay orchestration (complex state, multiple dialogs)
- Collection card components (user interaction, selection state)
- sortCollections utility (all 9 sort options)
- Collections dashboard query (stat calculation accuracy)

**High Risk Areas** (secondary priority):
- Sidebar search controls (9 sort options, UI consistency)
- Server actions (permission checks, error handling)
- User preferences persistence (selection state, view preferences)

**Medium Risk Areas** (tertiary priority):
- Empty states (user onboarding experience)
- Footer/header (simple components, formatting edge cases)
- Hover card preview (stat display accuracy)

---

## Implementation Checklist

- [ ] Create unit tests for sortCollections (11 tests)
- [ ] Expand validation schema tests (8 tests)
- [ ] Create SidebarDisplay component tests (18 tests)
- [ ] Create CollectionCardCover component tests (13 tests)
- [ ] Create CollectionCardCompact component tests (11 tests)
- [ ] Create CollectionCardDetailed component tests (11 tests)
- [ ] Create SidebarSearch component tests (12 tests)
- [ ] Create dashboard query integration tests (8 tests)
- [ ] Create server action integration tests (6 tests)
- [ ] Create remaining simple component tests (12 tests)
- [ ] Update coverage reports
- [ ] Document test patterns for team reference

