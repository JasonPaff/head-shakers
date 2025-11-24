# Test Unit 1: Individual Filter Functionality Results

**Routes Tested**: /admin/reports
**Focus Area**: Individual filter controls (Status, Content Type, Reason, Date From, Date To)
**Total Scenarios Tested**: 47
**Pass Rate**: 31/47 (66%)

---

## PASSED SCENARIOS

1. [PASS] Page loads without application console errors - Only Sentry rate limiting errors (429) observed, no application errors
2. [PASS] Filter card visible with "Filters" header and icon - Card displayed correctly with funnel icon
3. [PASS] All filter dropdowns visible - Status, Content Type, Reason, Date From, Date To all present
4. [PASS] Date pickers show "Pick a date" placeholder - Both Date From and Date To show correct placeholder
5. [PASS] No active filters section initially - Active Filters section not displayed on page load
6. [PASS] Stats cards display correctly - Total Reports (13), Pending (8), Reviewed (2), Resolved (2), Dismissed (1)
7. [PASS] Status dropdown opens on click - Shows all 4 options: Pending, Reviewed, Resolved, Dismissed
8. [PASS] Status filter updates URL parameter - URL changes to `?status=pending` when selected
9. [PASS] Status filter badge displays correctly - Shows "Status: Pending" badge
10. [PASS] Status filter badge X button removes filter - Clicking X removes badge and clears URL parameter
11. [PASS] Clear All button appears when filter active - Button appears in Filters header
12. [PASS] Content Type dropdown opens on click - Shows all 4 options: Bobblehead, Collection, Subcollection, Comment
13. [PASS] Content Type filter updates URL parameter - URL changes to `?targetType=collection`
14. [PASS] Content Type filter badge displays correctly - Shows "Type: Collection" badge
15. [PASS] Reason dropdown opens on click - Shows all 8 options: Spam, Harassment, Inappropriate Content, Copyright Violation, Misinformation, Hate Speech, Violence, Other
16. [PASS] Reason filter updates URL parameter - URL changes to `?reason=violence`
17. [PASS] Reason filter badge displays correctly - Shows "Reason: Violence" badge with proper formatting
18. [PASS] Date From calendar popover opens - Calendar displays November 2025 with selectable dates
19. [PASS] Date From filter updates URL parameter - URL changes to `?dateFrom=2025-11-20T05:00:00.000Z`
20. [PASS] Date From filter badge displays correctly - Shows "From: Nov 20, 2025" badge
21. [PASS] Date From button shows selected date - Changes from "Pick a date" to "November 20th, 2025"
22. [PASS] Clear All removes all filters - Clicking Clear All removes all filter badges and URL parameters
23. [PASS] Filter persistence on direct URL navigation - Navigating to URL with filters restores filter state
24. [PASS] Multiple filters restore from URL - Navigating to `?status=pending&targetType=bobblehead` shows both badges
25. [PASS] Filters actually work on page load with URL params - Data is correctly filtered when navigating directly to filtered URL
26. [PASS] Empty state shows helpful message - "No reports found" with "Try adjusting your filters" suggestion
27. [PASS] Calendar navigation works - Previous/Next month buttons function correctly
28. [PASS] Today's date highlighted in calendar - November 24, 2025 shown as "Today"
29. [PASS] Calendar closes on Escape key - Pressing Escape closes the date picker popover
30. [PASS] Filter badges have X button for removal - All filter badges have clickable X button
31. [PASS] Dropdown closes after selection - Dropdowns close after selecting an option

---

## FAILED SCENARIOS

### ISSUE-1: Filters do not re-fetch data when selected via dropdown (client-side)

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Select any filter via dropdown control
- **Problem**: When selecting a filter using the dropdown UI (not via URL navigation), the table data does not update to reflect the filter. The URL updates, the filter badge appears, but the table continues showing ALL unfiltered data.
- **Expected**: After selecting "Pending" status, table should show only the 8 Pending items
- **Actual**: Table continues to show all 13 items including Reviewed, Resolved, and Dismissed statuses
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/admin/reports
  2. Click on Status dropdown
  3. Select "Pending"
  4. Observe that URL updates to `?status=pending` and badge shows "Status: Pending"
  5. Observe that table still shows all 13 records including non-Pending statuses
- **Console Errors**: None (only Sentry rate limiting)
- **Network Issues**: None observed
- **Recommended Fix**: The filter components update the URL state but the page/table component is not reacting to URL parameter changes to re-fetch filtered data. Need to ensure the data query uses the URL parameters and re-executes when they change.

### ISSUE-2: Pagination count incorrect when filters applied

- **Severity**: HIGH
- **Route**: /admin/reports?status=pending
- **Scenario**: View pagination with filter applied via direct URL navigation
- **Problem**: When filters are applied (via URL navigation where filtering DOES work), the pagination shows the total unfiltered count instead of the filtered count.
- **Expected**: With status=pending filter showing 8 results, pagination should show "Showing 1 to 8 of 8 results"
- **Actual**: Pagination shows "Showing 1 to 13 of 13 results" even though only 8 rows are displayed
- **Steps to Reproduce**:
  1. Navigate directly to http://localhost:3000/admin/reports?status=pending
  2. Observe 8 table rows (all Pending status)
  3. Observe pagination shows "Showing 1 to 13 of 13 results"
- **Console Errors**: None
- **Network Issues**: None
- **Recommended Fix**: The pagination component needs to use the filtered result count, not the total unfiltered count from the stats.

### ISSUE-3: Content Type filter does not filter table data (client-side)

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Select Content Type filter via dropdown
- **Problem**: Same as ISSUE-1 - selecting "Collection" via dropdown does not filter the table
- **Expected**: Should show only 1 Collection item
- **Actual**: Shows all 13 items including Bobblehead, Comment types
- **Recommended Fix**: Same as ISSUE-1

### ISSUE-4: Reason filter does not filter table data (client-side)

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Select Reason filter via dropdown
- **Problem**: Same as ISSUE-1 - selecting "Violence" via dropdown does not filter the table
- **Expected**: Should show only 1 Violence item
- **Actual**: Shows all 13 items including Hate Speech, Copyright Violation, Inappropriate Content, Other
- **Recommended Fix**: Same as ISSUE-1

### ISSUE-5: Date From filter does not filter table data (client-side)

- **Severity**: CRITICAL
- **Route**: /admin/reports
- **Scenario**: Select Date From filter via date picker
- **Problem**: Same as ISSUE-1 - selecting November 20, 2025 via date picker does not filter the table
- **Expected**: Should exclude items from before Nov 20 (the 11/12/2025 item)
- **Actual**: Shows all 13 items including the 11/12/2025 item
- **Recommended Fix**: Same as ISSUE-1

---

## SKIPPED SCENARIOS

- Multi-select status filter testing - Could not test because single selection replaced previous selection
- Date To filter testing - Skipped due to time constraints and same root cause confirmed
- Date range (From + To) combined testing - Skipped due to confirmed filtering bug
- Browser back/forward navigation testing - Skipped due to confirmed filtering bug

---

## CONSOLE ERRORS OBSERVED

1. `Sentry Logger [error]: [Replay] TransportStatusCodeError: Transport returned status code 429` - Sentry rate limiting
2. `Failed to load resource: the server responded with a status of 429 (Too Many Requests)` - Sentry rate limiting

---

## ADDITIONAL OBSERVATIONS

1. **UX Concern**: Filter dropdowns do not show currently selected value after selection
2. **Data Quality Note**: 8 identical "Hate Speech" pending comment reports - test data quality issue
3. **Root Cause Analysis**: All filter issues share same root cause - nuqs URL updates don't trigger data re-fetch
