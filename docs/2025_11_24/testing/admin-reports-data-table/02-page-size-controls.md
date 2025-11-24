### TEST UNIT: Page Size Controls

**Routes Tested**: /admin/reports
**Focus Area**: Page size selector buttons (10, 25, 50, 100) and all related functionality
**Total Scenarios Tested**: 52
**Pass Rate**: 51/52 (98.1%)

---

## PASSED SCENARIOS

1. [PASS] Page loads with default page size of 25 - Verified "25" button highlighted on initial load
2. [PASS] Default page size button (25) is highlighted with active styling - Confirmed orange/highlighted appearance
3. [PASS] Other page size buttons (10, 50, 100) are not highlighted - Verified outline variant styling
4. [PASS] All four page size buttons visible and clickable - All buttons rendered and interactive
5. [PASS] Page size buttons have correct labels - "10", "25", "50", "100" displayed
6. [PASS] Results info displays correct count for default page size - "Showing 1 to 13 of 13 results"
7. [PASS] Click "10" button → button becomes highlighted - Visual confirmation of active state
8. [PASS] Click "10" button → other buttons become unhighlighted - Only one button active at a time
9. [PASS] Click "25" button → reverts to default highlighting - Confirmed state change
10. [PASS] Click "50" button → button becomes highlighted - Verified active styling
11. [PASS] Click "100" button → button becomes highlighted - Verified active styling
12. [PASS] Clicking same button again → no change (idempotent) - Clicking "25" twice works correctly
13. [PASS] Click "10" → URL updates to ?pageSize=10 - URL parameter added
14. [PASS] Click "50" → URL updates to ?pageSize=50 - URL parameter updated
15. [PASS] Click "100" → URL updates to ?pageSize=100 - URL parameter updated
16. [PASS] Click "25" → URL removes pageSize param (back to default) - URL reverts to /admin/reports
17. [PASS] URL changes reset page to 1 - No page param in URL after page size change
18. [PASS] Default (25): Shows correct page indicator - "Page 1 of 1" (with 13 total records)
19. [PASS] Change to 10: Shows updated page indicator - "Page 1 of 2" calculated correctly
20. [PASS] Change to 50: Shows updated page indicator - "Page 1 of 1" (all records fit)
21. [PASS] Change to 100: Shows updated page indicator - "Page 1 of 1" (all records fit)
22. [PASS] Total pages increases when page size decreases - Verified 25→10 shows more pages
23. [PASS] Total pages decreases when page size increases - Verified 10→50 shows fewer pages
24. [PASS] With pageSize=25: Shows correct results counter - "Showing 1 to 13 of 13 results"
25. [PASS] With pageSize=10: Shows correct results counter - "Showing 1 to 10 of 13 results"
26. [PASS] With pageSize=50: Shows correct results counter - "Showing 1 to 13 of 13 results"
27. [PASS] With pageSize=100: Shows correct results counter - "Showing 1 to 13 of 13 results"
28. [PASS] Counter updates immediately when page size changes - No delay observed
29. [PASS] End index reflects actual records when less than page size - Shows 13 when only 13 exist
30. [PASS] Page resets to 1 when page size changes - Verified by URL and page indicator
31. [PASS] URL shows no page param after page size change - Confirms page=1 default behavior
32. [PASS] Active button has correct styling (appears filled/highlighted) - Orange highlight visible
33. [PASS] Inactive buttons have correct styling (appears bordered) - Outline variant visible
34. [PASS] Buttons are properly sized - Visual confirmation of consistent sizing
35. [PASS] Buttons have correct spacing - Gap between buttons appropriate
36. [PASS] Buttons are all clickable (not disabled) - All buttons interactive
37. [PASS] Hover states work on buttons - Visual feedback on hover
38. [PASS] Select some rows on current page then change page size → selection is cleared - Verified 2 selected rows cleared
39. [PASS] Bulk action bar disappears when page size changes - Confirmed UI update
40. [PASS] Click "10" then immediately click "50" → only latest applied - Final state correct
41. [PASS] No duplicate/missing rows after rapid changes - Data integrity maintained
42. [PASS] UI reflects final state correctly after rapid changes - Visual state consistent
43. [PASS] No race conditions in URL updates - URL always reflects current state
44. [PASS] Change to pageSize=50 then refresh page → page size remains 50 - URL persistence works
45. [PASS] Button state reflects persisted page size after refresh - "50" highlighted after reload
46. [PASS] Data displays with correct page size after refresh - Showing all 13 records
47. [PASS] Buttons have proper text labels - Clear numeric labels
48. [PASS] Buttons are keyboard accessible (Tab navigation) - Focus navigation works
49. [PASS] Buttons can be activated with Enter key - Keyboard activation successful
50. [PASS] No feature-related console errors during testing - Only Sentry rate limiting errors
51. [PASS] No failed network requests for page size changes - All admin/reports requests returned 200

---

## FAILED SCENARIOS

**ISSUE-1: Pagination Not Working - Table Displays All Rows Regardless of Page Size**

- **Severity**: CRITICAL
- **Route**: /admin/reports?pageSize=10
- **Scenario**: Table data display when page size is set to 10
- **Problem**: The table displays all 13 rows even when pageSize=10 is selected. The UI correctly shows "Showing 1 to 10 of 13 results" and "Page 1 of 2", but the actual table renders all 13 rows instead of limiting to 10.
- **Expected**: When pageSize=10, the table should display exactly 10 rows
- **Actual**: All 13 rows are displayed regardless of page size selection
- **Steps to Reproduce**:
  1. Navigate to http://localhost:3000/admin/reports
  2. Click "10" button
  3. Observe URL changes to ?pageSize=10
  4. Count table rows - returns 13 instead of 10
  5. Verify all 13 rows are visible in the table
- **Console Errors**: None directly related (only Sentry rate limiting)
- **Network Issues**: None - requests return 200 OK
- **Recommended Fix**: The server-side pagination logic needs to apply LIMIT and OFFSET based on pageSize and page parameters in the data fetching query. Check `src/app/(app)/admin/reports/page.tsx` to ensure the query properly limits results.

---

## CONSOLE ERRORS OBSERVED

All observed errors are related to Sentry monitoring and rate limiting:

- Sentry 429 (Too Many Requests) errors
- Sentry replay transport errors
- No feature-related JavaScript errors

---

## SKIPPED SCENARIOS

None - All planned scenarios were tested.

---

## ADDITIONAL OBSERVATIONS

**Critical Issue**: The pagination system is completely non-functional. While the UI correctly indicates page size changes (button highlighting, URL updates, counter text), the actual data display ignores pagination entirely.

**Positive UX Elements**:

- Clear visual feedback when buttons are clicked
- URL persistence works well (page size maintained after refresh)
- Selection clearing on page size change prevents state issues
- Keyboard accessibility works correctly

**Accessibility Findings**:

- Buttons have clear text labels
- Keyboard navigation works (Tab + Enter)
- Consider adding `aria-current="true"` to active button

**Recommendations**:

1. **URGENT**: Fix pagination logic to actually limit results based on pageSize
2. Add loading indicators when page size changes
3. Add `aria-current="true"` to active page size button for screen reader support
