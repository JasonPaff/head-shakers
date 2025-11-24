# Feature Test Report: Search and Filter Functionality

**Generated**: 2025-11-24
**Feature**: Search and Filter Functionality on /browse/search
**Test Mode**: Full
**Testing Architecture**: Subagent-based deep testing

## Executive Summary

- **Test Score**: 53/100 (Grade: F)
- **Status**: CRITICAL ISSUES
- **Test Units Executed**: 1
- **Total Scenarios Tested**: 47
- **Pass Rate**: 43/47 (91.5%)

## Test Coverage Summary

| Test Unit         | Route(s)       | Scenarios | Passed | Failed | Status |
| ----------------- | -------------- | --------- | ------ | ------ | ------ |
| Search and Filter | /browse/search | 47        | 43     | 4      | FAILED |

## Issue Summary

| Severity  | Count | Score Impact |
| --------- | ----- | ------------ |
| Critical  | 1     | -25          |
| High      | 1     | -15          |
| Medium    | 2     | -10          |
| Low       | 0     | 0            |
| **Total** | 4     | **-50**      |

## Critical Issues

### CRIT-1: Category Filter Crashes Application

- **Route**: /browse/search?q=oriole
- **Test Unit**: Search and Filter
- **Scenario**: Expanding Category filter section
- **File**: `src/app/(app)/browse/search/components/search-filters.tsx:309-324`
- **Problem**: Clicking the Category filter section trigger causes the entire application to crash with a React error boundary. The error message indicates "A <Select.Item /> must have a value prop that is not an empty string."
- **Expected**: Category filter section should expand showing category options (All Categories, Sports, Movies & TV, Music, Gaming, Anime & Manga, Historical, Custom)
- **Actual**: Page displays error boundary with message "Something Went Wrong" and Select.Item error
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/browse/search?q=oriole
  2. Click "Show search filters" button
  3. Click "Category" section to expand it
  4. Application crashes immediately
- **Evidence**:
  - Screenshot: category-filter-crash.png
  - Console: `Error: A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder.`
- **Recommended Fix**: The CATEGORY_OPTIONS array in search-filters.tsx has an "All Categories" option with `value: ''` (empty string) at line 34. Radix UI Select does not allow empty string values for Select.Item. Change the empty string to a non-empty value like `"all"` or `"none"` and handle this in the filter logic.

```tsx
// Current (broken):
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },  // <-- Empty string causes crash
  ...
];

// Fixed:
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },  // Use 'all' instead
  ...
];

// Then in handleCategoryChange:
const handleCategoryChange = useCallback(
  (value: string) => {
    onFiltersChange({ category: value === 'all' ? undefined : value });
  },
  [onFiltersChange],
);
```

## High Priority Issues

### HIGH-1: Clear All Button Sets URL Parameters to "undefined"

- **Route**: /browse/search?q=oriole&dateFrom=2024-01-01&sortBy=date&sortOrder=asc
- **Test Unit**: Search and Filter
- **Scenario**: Clicking "Clear All" button with multiple filters applied
- **File**: `src/app/(app)/browse/search/components/search-filters.tsx:176-186`
- **Problem**: Clear All button sets filter parameters to "undefined" string literal instead of removing them from URL, causing invalid URL state and console warnings
- **Expected**: Clear All should remove filter parameters from URL entirely, leaving only ?q=oriole or clean URL
- **Actual**: URL becomes ?q=oriole&dateFrom=undefined&category=undefined&dateTo=undefined with "undefined" literal strings
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/browse/search?q=oriole
  2. Apply Date From filter (2024-01-01)
  3. Apply Sort By filter (date)
  4. Apply Sort Order filter (asc)
  5. Click "Clear All" button
  6. Observe URL has undefined values
- **Evidence**:
  - Screenshot: clear-all-undefined-bug.png
  - Console: `The specified value "undefined" does not conform to the required format, "yyyy-MM-dd"` (multiple warnings)
- **Recommended Fix**: The handleClearFilters function passes `undefined` for optional fields, but nuqs may be serializing these as "undefined" strings. Use `null` instead or configure nuqs to handle undefined properly:

```tsx
// Current:
const handleClearFilters = useCallback(() => {
  onFiltersChange({
    category: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    // ...
  });
}, [onFiltersChange]);

// Fixed - use null to explicitly remove params:
const handleClearFilters = useCallback(() => {
  onFiltersChange({
    category: null, // null removes the param
    dateFrom: null,
    dateTo: null,
    entityTypes: ['collection', 'subcollection', 'bobblehead'],
    sortBy: 'relevance',
    sortOrder: 'desc',
    tagIds: [],
  });
}, [onFiltersChange]);
```

## Medium Priority Issues

### MED-1: Result Count Not Updated When Filters Applied

- **Route**: /browse/search?q=oriole&entityTypes=subcollection,bobblehead
- **Test Unit**: Search and Filter
- **Scenario**: Applying Content Type filters
- **File**: `src/app/(app)/browse/search/components/search-results-grid.tsx` (suspected)
- **Problem**: The "Results Found" count remains at 11 even when filters reduce the visible results
- **Expected**: When Collections filter is unchecked (removing 1 result), count should show "10 Results Found"
- **Actual**: Count continues to show "11 Results Found" regardless of filters applied
- **Steps to Reproduce**:
  1. Search for "oriole" (11 results: 1 collection, 5 subcollections, 5 bobbleheads)
  2. Uncheck "Collections" filter
  3. Only 10 results are displayed (5 subcollections + 5 bobbleheads)
  4. Header still shows "11 Results Found"
- **Recommended Fix**: Update the results count to use the sum of filtered results instead of total. Check if the count is coming from the API response total vs. the sum of displayed items.

### MED-2: Active Filters Show "undefined" Values After Clear All

- **Route**: /browse/search?q=oriole&dateFrom=undefined&category=undefined&dateTo=undefined
- **Test Unit**: Search and Filter
- **Scenario**: After clicking Clear All button
- **File**: `src/app/(app)/browse/search/components/search-filters.tsx:485-520`
- **Problem**: Active Filters section shows "Category: undefined" and "To: undefined" badges after Clear All
- **Expected**: Active Filters section should be empty or hidden when no filters are applied
- **Actual**: Displays undefined values as active filter badges
- **Steps to Reproduce**:
  1. Apply filters (date, sorting, etc.)
  2. Click "Clear All" button
  3. Check Active Filters section at bottom of filter panel
  4. See "Category: undefined" and "To: undefined" badges
- **Recommended Fix**: Related to HIGH-1 fix. Additionally, add validation in the Conditional components to check for truthy values that are not the string "undefined":

```tsx
// Add validation to prevent "undefined" strings from showing:
<Conditional isCondition={Boolean(category) && category !== 'undefined'}>
  <Badge variant={'secondary'}>
    Category: {CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || category}
  </Badge>
</Conditional>
```

## Test Unit Details

### Search and Filter

**Focus**: Search input, filter controls, results display, filter combinations, URL state management
**Routes**: /browse/search
**Scenarios Executed**: 47
**Pass Rate**: 91.5%

**Passed Scenarios (43):**

- Page loads without console errors
- All expected UI elements visible (search input, filter button)
- Search query "oriole" returns 11 results
- URL updates with search query parameter
- Results count displayed with breakdown by type
- Filter panel expands/collapses correctly
- Content Type section expanded by default with all checkboxes
- Uncheck Collections filter updates results
- Uncheck Subcollections filter updates results
- At least one content type must remain selected
- Active filter badges show correct counts
- Filter count badge updates on Filters button
- Date Range section expands with From/To inputs
- Date From input accepts YYYY-MM-DD format
- URL updates with dateFrom parameter
- Sorting section expands with Sort By/Sort Order dropdowns
- Sort By/Sort Order defaults correct (relevance, desc)
- Sort By dropdown shows all options
- Change Sort By to "Date" works
- URL updates with sortBy parameter
- Sort Order dropdown opens and selection works
- URL updates with sortOrder parameter
- Filter badges update correctly
- View mode defaults to Grid
- Switch to List view works
- URL updates with viewMode parameter
- Clear search input clears results
- Empty state message displays correctly
- Search debouncing works
- Results display correctly in grid format
- Results display correctly in list format

**Skipped Scenarios:**

- Category filter selection - Cannot test due to crash (CRIT-1)
- Category filter URL state - Cannot test due to crash
- Pagination controls - All results fit on one page
- Empty search results state - Time constraints
- Search with special characters - Time constraints
- Search with very long query - Time constraints
- Rapid filter changes - Time constraints
- Browser refresh with filters - Partially tested
- Keyboard navigation - Not tested

## Console Errors Summary

**Total Unique Errors**: 4 feature-related, 6+ infrastructure-related

**Feature-Related Errors:**

1. `Error: A <Select.Item /> must have a value prop that is not an empty string` - CRIT-1
2. `The specified value "undefined" does not conform to the required format, "yyyy-MM-dd"` - HIGH-1, MED-2
3. `The specified value "01/01/2024" does not conform to the required format, "yyyy-MM-dd"` - Date format validation working
4. Browse page error boundary triggered - CRIT-1

**Infrastructure Errors (not feature bugs):**

- Sentry rate limiting (429 responses)
- Cloudinary image 404s for temp/uploads paths
- Clerk development key warnings
- Network fetch failures to Sentry

## Screenshots Captured

| Filename                    | Description                                               |
| --------------------------- | --------------------------------------------------------- |
| category-filter-crash.png   | Application error boundary after clicking Category filter |
| clear-all-undefined-bug.png | Active Filters showing "undefined" values after Clear All |

## Recommendations

### Immediate Fixes Required

1. **Fix Category Filter Crash (CRIT-1)**: Replace empty string value with "all" in CATEGORY_OPTIONS and update handler logic
2. **Fix Clear All Undefined Bug (HIGH-1)**: Use `null` instead of `undefined` when clearing parameters, or configure nuqs properly

### Should Fix Before Merge

1. **Fix Result Count (MED-1)**: Display filtered count, not total count
2. **Fix Undefined Badges (MED-2)**: Add validation to prevent rendering "undefined" string values

### Consider Fixing

1. Add loading indicators when filters change
2. Add empty results state with helpful suggestions
3. Add animation when switching view modes
4. Consider collapsing filter sections by default to save vertical space

## Testing Metrics

- **Start Time**: 2025-11-24
- **Duration**: ~10 minutes
- **Subagents Launched**: 1
- **Playwright Interactions**: ~100+ (navigation, clicks, typing, screenshots, console checks)
- **Browser**: Playwright (Chromium)
- **Base URL**: http://localhost:3000

## Next Steps

**CRITICAL**: Feature has major issues. The Category filter crash completely breaks a core filter feature.

Run `/fix-validation docs/2025_11_24/testing/search-filter-functionality/test-report.md` to address all issues before proceeding.

---

**Fix Command**:

```
/fix-validation docs/2025_11_24/testing/search-filter-functionality/test-report.md
```
