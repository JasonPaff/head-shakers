# Browse/Search Page Redesign Implementation Plan

**Generated**: 2025-11-23
**Original Request**: A redesigned and enhanced /browse/search page with a clean, modern design and improved UI/UX
**Refined Request**: Redesign and enhance the `/browse/search` page to deliver a clean, modern interface with significantly improved user experience for discovering bobblehead collections and individual bobbleheads.

---

## Overview

**Estimated Duration**: 5-7 days
**Complexity**: High
**Risk Level**: Medium

## Quick Summary

- Redesign the `/browse/search` page with modern card-based UI, grid/list view modes, and enhanced filtering capabilities
- Implement real-time search suggestions with autocomplete using Command component
- Add enhanced skeleton loading states and smooth transitions for improved UX
- Optimize search queries with proper Redis caching and URL state synchronization via Nuqs
- Support TanStack React Table for list view with sortable columns and efficient rendering

## Prerequisites

- [ ] Review existing search page components and understand current data flow
- [ ] Ensure Cloudinary configuration is properly set up for optimized images
- [ ] Verify Redis (Upstash) caching infrastructure is operational
- [ ] Confirm TanStack React Table and Nuqs dependencies are installed

---

## Implementation Steps

### Step 1: Update Route Type Definitions and Validation Schemas

**What**: Extend the route type schema to support new filter parameters (view mode, date range, rarity) and update validation schemas
**Why**: The foundation for URL state management requires updated schemas to support new filtering capabilities
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/route-type.ts` - Add viewMode, dateFrom, dateTo parameters
- `src/lib/validations/public-search.validation.ts` - Extend searchFiltersSchema with new filter options
- `src/lib/constants/enums.ts` - Add SEARCH.VIEW_MODE enum values

**Changes:**

- Add `viewMode` parameter with 'grid' | 'list' enum values to route-type.ts
- Add `dateFrom` and `dateTo` optional date string parameters
- Add `category` optional string parameter for category filtering
- Extend searchFiltersSchema to include dateFrom, dateTo, category, and viewMode
- Add VIEW_MODE enum to ENUMS.SEARCH constant

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Route type schema compiles without errors
- [ ] New URL parameters are properly typed with Zod validation
- [ ] All validation commands pass

---

### Step 2: Create Search Result Card Component for Grid View

**What**: Create a new enhanced card component for displaying search results in grid view with Cloudinary-optimized images, hover states, and smooth transitions
**Why**: The current SearchResultItem is minimal; a dedicated card component provides better visual hierarchy and modern design patterns
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/search/components/search-result-card.tsx` - Enhanced card component with image, metadata, hover effects

**Changes:**

- Create SearchResultCard component using existing Card UI component patterns
- Implement CldImage integration with responsive sizing and quality settings
- Add hover state animations using Tailwind transition utilities
- Include entity type badge, owner info, and description with proper truncation
- Support click handler prop and $path navigation for type-safe routing
- Add proper testId generation following project patterns

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component renders correctly with collection, subcollection, and bobblehead result types
- [ ] Cloudinary images load with proper optimization settings
- [ ] Hover states and transitions are smooth
- [ ] All validation commands pass

---

### Step 3: Create Search Result List Item Component for List View

**What**: Create a list view component with expanded metadata display using TanStack React Table patterns
**Why**: List view provides more detailed information at a glance and requires different layout structure than cards
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/search/components/search-results-list.tsx` - List view component with TanStack Table integration

**Changes:**

- Create SearchResultsList component following ReportsTable pattern
- Define columns for thumbnail, name, entity type, owner, date, and actions
- Implement sorting state management with TanStack Table
- Add responsive column visibility for mobile/tablet breakpoints
- Include proper empty state handling

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] List renders with sortable columns
- [ ] Responsive layout adapts to screen size
- [ ] Row hover states work correctly
- [ ] All validation commands pass

---

### Step 4: Implement View Mode Toggle Component

**What**: Create a toggle button group to switch between grid and list views with URL state persistence
**Why**: Users need intuitive controls to switch view modes, and state must persist through navigation
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/search/components/view-mode-toggle.tsx` - Toggle component with grid/list icons

**Changes:**

- Create ViewModeToggle component using Button and Lucide icons (Grid3X3, List)
- Accept viewMode prop and onViewModeChange callback
- Style active state using existing Button variant patterns
- Ensure keyboard accessibility and ARIA attributes

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Toggle switches between grid and list modes visually
- [ ] Callback fires on mode change
- [ ] Accessible via keyboard navigation
- [ ] All validation commands pass

---

### Step 5: Create Search Autocomplete/Suggestions Component

**What**: Implement real-time search suggestions using Command component with debounced input
**Why**: Autocomplete improves discoverability and reduces unnecessary full searches
**Confidence**: Medium

**Files to Create:**

- `src/app/(app)/browse/search/components/search-autocomplete.tsx` - Autocomplete input with suggestions dropdown

**Changes:**

- Create SearchAutocomplete component using existing Command UI patterns
- Integrate with getPublicSearchDropdownAction for real-time suggestions
- Implement debounced input handling (300ms as per CONFIG.SEARCH.DEBOUNCE_MS)
- Show grouped suggestions by entity type (collections, subcollections, bobbleheads)
- Handle suggestion selection with navigation using $path
- Display loading state during fetch

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Suggestions appear after typing minimum characters
- [ ] Debouncing prevents excessive API calls
- [ ] Selecting a suggestion navigates to the correct entity
- [ ] All validation commands pass

---

### Step 6: Enhance Search Filters Component with Advanced Options

**What**: Redesign SearchFilters with expanded filter options including date range, category, and collapsible sections
**Why**: Enhanced filtering improves content discovery and user control over search results
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/components/search-filters.tsx` - Extend with new filter controls

**Changes:**

- Add date range picker using existing date input patterns
- Add category dropdown using Select component
- Implement Radix UI Collapsible for filter sections on mobile
- Add filter count badge showing active filters
- Include "Clear all filters" button with conditional visibility
- Reorganize layout into logical filter groups with proper spacing
- Add touch-friendly tap targets for mobile devices

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All new filter controls render and function correctly
- [ ] Filters update URL parameters via Nuqs
- [ ] Mobile-responsive layout with collapsible sections
- [ ] All validation commands pass

---

### Step 7: Create Enhanced Skeleton Loading Components

**What**: Build comprehensive skeleton loaders for grid cards, list rows, and filter sections
**Why**: Skeleton loaders provide visual feedback during loading and improve perceived performance
**Confidence**: High

**Files to Create:**

- `src/app/(app)/browse/search/components/search-skeletons.tsx` - Search-specific skeleton components

**Changes:**

- Create SearchCardSkeleton for grid view loading state
- Create SearchListRowSkeleton for list view loading state
- Create SearchFiltersSkeleton for filters loading state
- Create SearchResultsSkeleton that combines appropriate skeletons based on view mode
- Follow existing Skeleton component patterns with animate-pulse

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Skeletons match actual component dimensions
- [ ] Animation is smooth and not distracting
- [ ] Skeletons render correctly for both view modes
- [ ] All validation commands pass

---

### Step 8: Update Search Results Grid Component with View Mode Support

**What**: Refactor SearchResultsGrid to support both grid and list view modes with proper rendering logic
**Why**: Central results component needs to coordinate between view modes and display appropriate components
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/components/search-results-grid.tsx` - Add view mode switching and new card components

**Changes:**

- Rename to SearchResults and update exports
- Add viewMode prop to control rendering
- Conditionally render SearchResultCard or SearchResultsList based on viewMode
- Update grid layout classes for responsive breakpoints
- Add smooth transition between view modes
- Integrate ViewModeToggle in results header

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Grid view displays cards in responsive grid
- [ ] List view displays table with sorting
- [ ] Transitions between views are smooth
- [ ] All validation commands pass

---

### Step 9: Update Search Page Content with New State Management

**What**: Refactor SearchPageContent to integrate all new components and extended Nuqs state
**Why**: Main content component orchestrates all search functionality and needs to support new features
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/components/search-page-content.tsx` - Integrate new components and state

**Changes:**

- Extend useQueryStates with viewMode, dateFrom, dateTo, category parameters
- Replace search input with SearchAutocomplete component
- Add handler for view mode changes
- Update filters change handler to include new filter types
- Pass viewMode to SearchResults component
- Add skeleton loading states during transitions
- Update the searchPublicContentAction call to include new filter parameters

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] All URL parameters sync correctly with component state
- [ ] View mode persists through navigation
- [ ] New filters are applied to search queries
- [ ] All validation commands pass

---

### Step 10: Update Search Page Server Component

**What**: Enhance the main search page with improved layout, metadata, and loading states
**Why**: Server component provides initial structure and SEO-relevant metadata
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/page.tsx` - Update layout and Suspense boundaries

**Changes:**

- Update page header with modern typography and better spacing
- Implement SearchResultsSkeleton in Suspense fallback
- Add proper semantic HTML structure
- Update metadata generation with dynamic descriptions based on search context

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Page renders with improved visual hierarchy
- [ ] Suspense fallback shows appropriate skeletons
- [ ] Metadata is properly configured for SEO
- [ ] All validation commands pass

---

### Step 11: Extend Backend Query Layer with New Filters

**What**: Update ContentSearchQuery to support new filter parameters (date range, category)
**Why**: Backend must process new filter options to return relevant results
**Confidence**: Medium

**Files to Modify:**

- `src/lib/queries/content-search/content-search.query.ts` - Add date and category filter conditions
- `src/lib/facades/content-search/content-search.facade.ts` - Pass through new parameters

**Changes:**

- Add dateFrom and dateTo filter conditions using Drizzle gte/lte operators
- Add category filter condition with ilike matching
- Update searchPublicCollections, searchPublicSubcollections, searchPublicBobbleheads methods
- Update getSearchResultCounts to include new filter conditions
- Pass new parameters through facade methods to query layer

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Date range filtering works correctly
- [ ] Category filtering returns expected results
- [ ] Query performance is not significantly impacted
- [ ] All validation commands pass

---

### Step 12: Update Server Actions for New Filter Support

**What**: Extend server action input schema and pass new filter parameters
**Why**: Server actions must accept and validate new filter parameters from the client
**Confidence**: High

**Files to Modify:**

- `src/lib/actions/content-search/content-search.actions.ts` - Update action to handle new filters

**Changes:**

- Verify publicSearchInputSchema changes are reflected in action context
- Update Sentry context logging to include new filter parameters
- Pass dateFrom, dateTo, and category through to facade layer
- Update action breadcrumbs with new filter information

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Action accepts new filter parameters
- [ ] Sentry logging includes new filter data
- [ ] Filter parameters propagate to query layer
- [ ] All validation commands pass

---

### Step 13: Optimize Redis Cache Key Generation

**What**: Update cache key generation to include new filter parameters for proper cache invalidation
**Why**: Cache keys must uniquely identify query combinations including new filters
**Confidence**: High

**Files to Modify:**

- `src/lib/facades/content-search/content-search.facade.ts` - Update createHashFromObject calls

**Changes:**

- Include dateFrom, dateTo, category in filtersHash generation
- Verify cache TTL configuration is appropriate for search results
- Add viewMode to cache considerations if needed

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Different filter combinations generate unique cache keys
- [ ] Cache invalidation works correctly with new parameters
- [ ] All validation commands pass

---

### Step 14: Update SearchResultItem Component for Backward Compatibility

**What**: Update the existing SearchResultItem to work with new data structures while maintaining backward compatibility
**Why**: The original component may be used elsewhere; ensure it continues to work
**Confidence**: High

**Files to Modify:**

- `src/components/feature/search/search-result-item.tsx` - Enhance with optional new props

**Changes:**

- Add optional className overrides for different contexts
- Ensure proper integration with new card-based results
- Update image handling to use consistent Cloudinary transforms
- Add transition effects matching new design language

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Component works in both old and new contexts
- [ ] Image optimization is consistent
- [ ] Transition effects are applied
- [ ] All validation commands pass

---

### Step 15: Implement Responsive Mobile Layout Adjustments

**What**: Add mobile-specific styling and touch-friendly interactions throughout search components
**Why**: Mobile users need appropriate touch targets and responsive layouts
**Confidence**: High

**Files to Modify:**

- `src/app/(app)/browse/search/components/search-filters.tsx` - Mobile filter drawer
- `src/app/(app)/browse/search/components/search-results-grid.tsx` - Mobile grid adjustments
- `src/app/(app)/browse/search/components/search-pagination.tsx` - Simplified mobile pagination

**Changes:**

- Add Sheet/Drawer pattern for mobile filters using Radix Dialog
- Adjust grid columns for mobile (1 column) and tablet (2 columns) breakpoints
- Simplify pagination controls on mobile with prev/next only
- Increase touch target sizes (minimum 44px)
- Add swipe gestures consideration for filter drawer

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Filters work well on mobile with drawer pattern
- [ ] Grid adapts properly to all screen sizes
- [ ] Touch targets meet accessibility guidelines
- [ ] All validation commands pass

---

### Step 16: Final Integration Testing and Polish

**What**: Verify all components work together and add final visual polish
**Why**: Integration testing ensures all pieces work cohesively before completion
**Confidence**: High

**Files to Modify:**

- All search page components as needed for final adjustments

**Changes:**

- Test complete user flow from search input to result navigation
- Verify URL state persistence through browser back/forward
- Test all filter combinations work correctly together
- Verify skeleton loading states appear correctly
- Add any missing transitions or hover states
- Ensure consistent spacing and typography throughout

**Validation Commands:**

```bash
npm run lint:fix && npm run typecheck
```

**Success Criteria:**

- [ ] Complete search flow works end-to-end
- [ ] URL state is shareable and bookmarkable
- [ ] All loading states are smooth
- [ ] Visual design is consistent and polished
- [ ] All validation commands pass

---

## Quality Gates

- [ ] All TypeScript files pass `npm run typecheck`
- [ ] All files pass `npm run lint:fix`
- [ ] Search page renders correctly in all view modes
- [ ] URL parameters properly sync with component state
- [ ] Search queries return expected results with new filters
- [ ] Mobile layout is functional and touch-friendly
- [ ] Skeleton loading states display correctly
- [ ] Redis caching generates unique keys for filter combinations

## Notes

- The TanStack React Table implementation follows existing patterns from `reports-table.tsx`
- Nuqs URL state management follows patterns from `browse-collections-content.tsx`
- Cloudinary image optimization should use consistent settings across all search result displays
- The Command component for autocomplete is already available in the codebase
- Consider adding E2E tests for the complete search flow after implementation
- Redis cache TTL for search results is currently 10 minutes (CACHE_CONFIG.TTL.PUBLIC_SEARCH)
- The project uses `$path` from next-typesafe-url for all internal navigation links
- No toggle component exists in UI library; use Button with variant switching for view mode toggle
- Date filtering should use ISO date strings for URL serialization compatibility

---

## File Discovery Summary

### Critical Files (7)
- `src/app/(app)/browse/search/page.tsx`
- `src/app/(app)/browse/search/route-type.ts`
- `src/app/(app)/browse/search/components/search-page-content.tsx`
- `src/app/(app)/browse/search/components/search-filters.tsx`
- `src/app/(app)/browse/search/components/search-results-grid.tsx`
- `src/app/(app)/browse/search/components/search-pagination.tsx`
- `src/components/feature/search/search-result-item.tsx`

### High Priority Files (7)
- `src/lib/actions/content-search/content-search.actions.ts`
- `src/lib/facades/content-search/content-search.facade.ts`
- `src/lib/queries/content-search/content-search.query.ts`
- `src/lib/validations/public-search.validation.ts`
- `src/components/feature/search/search-dropdown.tsx`
- `src/lib/constants/enums.ts`
- `src/lib/constants/config.ts`

### New Files to Create (5)
- `src/app/(app)/browse/search/components/search-result-card.tsx`
- `src/app/(app)/browse/search/components/search-results-list.tsx`
- `src/app/(app)/browse/search/components/view-mode-toggle.tsx`
- `src/app/(app)/browse/search/components/search-autocomplete.tsx`
- `src/app/(app)/browse/search/components/search-skeletons.tsx`
