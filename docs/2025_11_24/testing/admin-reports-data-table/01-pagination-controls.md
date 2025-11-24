### TEST UNIT: Pagination Controls

**Routes Tested**: /admin/reports
**Focus Area**: Pagination controls including Previous/Next buttons, page indicator, results counter, and URL state management
**Total Scenarios Tested**: 35
**Pass Rate**: 18/35 (51%)

---

## PASSED SCENARIOS

1. [PASS] Page loads without console errors - Only Sentry rate limiting warnings (not related to feature)
2. [PASS] Pagination section is visible at bottom of table - Located correctly below table
3. [PASS] Results info displays format - Shows "Showing X to Y of Z results" format
4. [PASS] Page indicator displays correctly - Shows "Page X of Y" format
5. [PASS] Previous button is disabled on first page - Correctly disabled on page 1
6. [PASS] Next button enabled when more pages exist - Enabled when on page 1 of 2
7. [PASS] Page size button selection works - Clicking "10" changes from default 25
8. [PASS] URL updates when changing page size - Added ?pageSize=10 parameter
9. [PASS] Page indicator updates when page size changes - Changed from "1 of 1" to "1 of 2"
10. [PASS] Results counter updates when page size changes - Changed from "1 to 13" to "1 to 10"
11. [PASS] Next button click updates URL - Added page=2 parameter
12. [PASS] Page indicator updates when clicking Next - Changed to "Page 2 of 2"
13. [PASS] Next button disables on last page - Correctly disabled on page 2 of 2
14. [PASS] Previous button enables when not on first page - Enabled on page 2
15. [PASS] Results counter shows correct range on last page - "Showing 11 to 13 of 13 results"
16. [PASS] Previous button click updates URL - Removed page parameter (defaults to 1)
17. [PASS] Direct URL navigation to page 2 works - Successfully loads page 2 when navigating to ?pageSize=10&page=2
18. [PASS] Browser refresh maintains pagination state - URL parameters persist after F5

---

## FAILED SCENARIOS

**ISSUE-1: Table Data Not Paginated on Client-Side Navigation**

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Navigation between pages via Next/Previous buttons
- **Problem**: When clicking Next or Previous buttons, the pagination controls update correctly (page indicator, results counter, URL), but the table continues to display ALL rows instead of just the current page's rows. This renders pagination completely non-functional for data display.
- **Expected**: Clicking Next from page 1 should display only rows 11-13 (the second page of data). Clicking Previous should show only rows 1-10.
- **Actual**: The table displays all 13 rows regardless of which page is selected. The UI claims to show "Showing 1 to 10 of 13 results" but actually displays all 13 rows.
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/admin/reports
  2. Click the "10" page size button to create multiple pages
  3. Click "Next" button
  4. Observe URL changes to ?pageSize=10&page=2
  5. Observe page indicator shows "Page 2 of 2"
  6. Scroll through table - all 13 rows are still visible instead of just rows 11-13
- **Console Errors**: None (only Sentry rate limiting warnings)
- **Network Issues**: None observed
- **Recommended Fix**: The client-side table component is not slicing the data array based on the current page. Need to implement proper data slicing: `data.slice((page - 1) * pageSize, page * pageSize)` before rendering table rows.

**ISSUE-2: Server Returns Wrong Data After Page Load**

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Server-side data fetching on page load
- **Problem**: After certain navigation patterns, the server returns incorrect data. Page 1 with pageSize=10 should return rows 1-10, but instead returns only the last 3 rows (rows 11-13).
- **Expected**: Page 1 should display the first 10 reports ordered by submission date descending
- **Actual**: Page 1 displays only 3 rows (the last 3 in the dataset) while the pagination counter claims "Showing 1 to 10 of 13 results"
- **Steps to Reproduce**:
  1. Navigate directly to http://localhost:3000/admin/reports?pageSize=10&page=2
  2. Observe page 2 correctly shows 3 rows (rows 11-13) ✓
  3. Click "Previous" button (triggers full page reload)
  4. Observe page 1 now shows only 3 rows (incorrectly - same rows as page 2)
  5. Refresh page (F5) - problem persists
  6. Change page size to 25 - still shows only 3 rows despite claiming "1 to 13 of 13 results"
- **Console Errors**: None
- **Network Issues**: None
- **Recommended Fix**: Investigate server-side data query logic. Possible caching issue or incorrect OFFSET/LIMIT calculation in the SQL query. The query may be caching the last page's data or using wrong pagination parameters.

**ISSUE-3: Inconsistent Navigation Behavior (Full Reload vs Client-Side)**

- **Severity**: HIGH
- **Route**: /admin/reports
- **Scenario**: Mixed navigation patterns between client-side and full page reloads
- **Problem**: Some pagination button clicks trigger client-side navigation (updating URL without reload), while others trigger full page reloads. This inconsistency suggests improper routing or state management.
- **Expected**: All pagination navigation should be consistent - either all client-side or all server-side, with predictable behavior
- **Actual**: First Next/Previous clicks trigger client-side navigation (no reload), while some subsequent clicks trigger full page reloads (observable by resource loading in console)
- **Steps to Reproduce**:
  1. Start on page 1, click Next → Client-side navigation
  2. Click Previous → Full page reload occurs
  3. Pattern varies depending on prior actions
- **Console Errors**: None directly related
- **Network Issues**: None
- **Recommended Fix**: Ensure consistent router.push() usage with shallow navigation for pagination. Check if any code path is using window.location or router.replace() that causes full reloads.

**ISSUE-4: Results Counter Calculation Incorrect for Empty Pages**

- **Severity**: MEDIUM
- **Route**: /admin/reports
- **Scenario**: Results counter on pages with missing data
- **Problem**: When displaying incorrect data (only 3 rows on page 1), the results counter still claims "Showing 1 to 10 of 13 results", creating a mismatch between UI text and actual displayed rows.
- **Expected**: Results counter should accurately reflect the number of rows currently visible in the table
- **Actual**: Counter shows "1 to 10" but only 3 rows are visible
- **Steps to Reproduce**:
  1. Follow steps from ISSUE-2 to get into bad state
  2. Observe results counter text
  3. Count actual table rows
- **Console Errors**: None
- **Network Issues**: None
- **Recommended Fix**: Calculate results counter based on actual rendered rows OR fix underlying data fetching issues (ISSUE-2) which will automatically resolve this.

**ISSUE-5: No Loading State During Page Changes**

- **Severity**: MEDIUM
- **Route**: /admin/reports
- **Scenario**: User experience during page navigation
- **Problem**: When clicking Next/Previous buttons, there is no visual loading indicator. Users cannot tell if the action is processing or if the page has updated.
- **Expected**: Show loading spinner or skeleton state while fetching new page data
- **Actual**: Immediate state change with no feedback
- **Steps to Reproduce**:
  1. Click any pagination button
  2. Observe lack of loading feedback
- **Console Errors**: None
- **Network Issues**: None
- **Recommended Fix**: Add isLoading state tied to pagination actions, display LoadingSpinner or skeleton table rows during fetch

**ISSUE-6: No Validation for Invalid Page Numbers in URL**

- **Severity**: MEDIUM
- **Route**: /admin/reports
- **Scenario**: URL state management with invalid values
- **Problem**: Did not test but likely issue: If user manually edits URL to page=999 (beyond total pages), there's likely no validation or error handling.
- **Expected**: Invalid page numbers should either redirect to page 1 or show error message
- **Actual**: Unknown (not tested)
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/admin/reports?pageSize=10&page=999
  2. Observe behavior
- **Console Errors**: Unknown
- **Network Issues**: Unknown
- **Recommended Fix**: Add validation: if page > totalPages, redirect to last page or page 1

**ISSUE-7: Page Size Changes Don't Reset to Page 1**

- **Severity**: LOW
- **Route**: /admin/reports
- **Scenario**: Changing page size while on page > 1
- **Problem**: When changing page size, the page number should reset to 1 to avoid showing empty pages or out-of-range data.
- **Expected**: Changing from page 2 (pageSize=10) to pageSize=25 should reset to page 1
- **Actual**: Unknown (test scenario not executed due to critical bugs preventing proper multi-page testing)
- **Steps to Reproduce**:
  1. Navigate to page 2 with pageSize=10
  2. Change page size to 50
  3. Check if page parameter resets to 1
- **Console Errors**: Unknown
- **Network Issues**: Unknown
- **Recommended Fix**: When page size changes, always reset page to 1 in URL state

---

## CONSOLE ERRORS OBSERVED

- Sentry rate limiting errors (429 Too Many Requests) - Not related to pagination feature
- Sentry replay transport errors - Not related to pagination feature
- No JavaScript errors directly related to pagination functionality

---

## SKIPPED SCENARIOS

- Rapid navigation testing (clicking Next/Previous rapidly) - Skipped due to ISSUE-1 making it impossible to verify correct data changes
- Testing with filters applied + pagination - Skipped due to ISSUE-2 making base pagination non-functional
- Row selection persistence across pages - Skipped due to ISSUE-1 preventing proper page changes
- Testing browser back/forward buttons - Partially tested; full testing skipped due to critical bugs
- Testing invalid page numbers via URL - Skipped to focus on more critical issues
- Testing page size change while on page > 1 - Skipped due to inability to reliably get to page > 1 with correct data
- Testing pagination with sorting - Skipped due to time constraints and critical bugs
- Data consistency verification across multiple pages - Impossible due to ISSUE-1 and ISSUE-2
- Testing last page with partial results (< pageSize rows) - Attempted but inconclusive due to wrong data being displayed

---

## ADDITIONAL OBSERVATIONS

**Critical Blocker**: The pagination feature is essentially non-functional due to two separate critical bugs working in tandem:

1. Client-side navigation doesn't slice data (ISSUE-1)
2. Server-side navigation returns wrong data after certain sequences (ISSUE-2)

**Root Cause Analysis**:
The core problem appears to be that the table component receives ALL data from the server and is supposed to slice it client-side, but the slicing logic is missing or not connected properly. Additionally, there's a server-side caching or query bug that compounds the issue by sometimes returning incorrect datasets.

**Suggested Priority Fix Order**:

1. **ISSUE-1** (Client-side data slicing) - Quick fix, immediate impact
2. **ISSUE-2** (Server-side data fetching) - More complex, requires backend investigation
3. **ISSUE-5** (Loading states) - Better UX while other issues are being fixed
4. **ISSUE-3** (Navigation consistency) - May be symptom of ISSUE-2
5. **ISSUE-6** (URL validation) - Polish after core functionality works
6. **ISSUE-7** (Page size reset) - Nice to have
7. **ISSUE-4** (Counter accuracy) - Will auto-fix once ISSUE-1 and ISSUE-2 are resolved
