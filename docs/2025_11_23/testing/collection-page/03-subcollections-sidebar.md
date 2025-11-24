# Test Unit 3: Subcollections & Sidebar

**Routes Tested**: /collections/baltimore-orioles, /collections/baltimore-orioles/subcollection/aberdeen-ironbirds, /collections/baltimore-orioles/subcollection/bowie-baysox, /collections/baltimore-orioles/subcollection/norfolk-tides
**Total Scenarios Tested**: 32
**Pass Rate**: 31/32 (96.9%)

---

## PASSED SCENARIOS

1. [PASS] Stats card is visible in sidebar - Collection Stats section clearly visible
2. [PASS] Item count displays correctly - Shows "5" for Total Bobbleheads
3. [PASS] Views/impressions display - Shows "17 views" with eye icon
4. [PASS] Last updated date displays - Shows "11/23/2025" formatted correctly
5. [PASS] Subcollections count displays - Shows "6" subcollections count in stats
6. [PASS] Subcollections section header visible - "Subcollections" header with count badge "6"
7. [PASS] List of subcollections displays - All 6 subcollections rendered in list
8. [PASS] Each subcollection shows name - Aberdeen Ironbirds, Bowie Baysox, etc. all visible
9. [PASS] Each subcollection shows thumbnail/icon - Placeholder images displayed
10. [PASS] Each subcollection shows item count - "0 items", "1 item" labels with proper pluralization
11. [PASS] Subcollection links are clickable - All subcollection cards have working links
12. [PASS] Clicking subcollection navigates to subcollection page - Successfully navigated
13. [PASS] Subcollection page loads correctly - Page displays heading, description, stats, bobbleheads section
14. [PASS] Can navigate back to parent collection - "Back to Baltimore Orioles" link works
15. [PASS] URL updates to subcollection route - URL correctly shows /collections/[slug]/subcollection/[subslug]
16. [PASS] Add subcollection button visible for owner - "Add Subcollection" button displayed
17. [PASS] Clicking add button opens form/dialog - Dialog "Create New Subcollection" opens
18. [PASS] Form has name field - Name field present with required indicator
19. [PASS] Form has description field - Description field present
20. [PASS] Cancel button closes form - Cancel button successfully closes the dialog
21. [PASS] Form validation works (empty name) - Error message "Name is required" displayed
22. [PASS] Edit subcollection option available - "Edit Details" menu item in actions dropdown
23. [PASS] Delete subcollection option available - "Delete Subcollection" menu item in actions dropdown
24. [PASS] Edit dialog opens with pre-filled data - Name and description fields pre-populated
25. [PASS] Dialog closes with Escape key - Pressing Escape successfully closes the dialog
26. [PASS] Subcollection with items displays bobbleheads - Bowie Baysox shows bobblehead
27. [PASS] Empty subcollection shows appropriate message - Shows "No Bobbleheads Yet" with CTA
28. [PASS] Browser back navigation works - Successfully returned to parent collection
29. [PASS] Direct URL navigation works - Direct navigation loads correctly
30. [PASS] Subcollection stats sidebar displays - Views, Total Bobbleheads, etc. all visible
31. [PASS] Sidebar content doesn't overflow - Content displays within bounds, names truncated appropriately

---

## FAILED SCENARIOS

### ISSUE-1: manifest.json Syntax Error (duplicate)

- **Severity**: LOW
- **Route**: All routes tested
- **Scenario**: Page load console error check
- **Problem**: The manifest.json file has a syntax error on every page load
- **Expected**: manifest.json should parse without errors
- **Actual**: Console shows "Manifest: Line: 1, column: 1, Syntax error."
- **Recommended Fix**: Check `/public/manifest.json` for valid JSON syntax

---

## SKIPPED SCENARIOS

- Submit creates subcollection - Skipped to avoid creating test data
- Reorder subcollections - Feature not observed in the UI
- Cover photo upload functionality - Skipped to avoid file system side effects

---

## CONSOLE ERRORS OBSERVED

```
[ERROR] Manifest: Line: 1, column: 1, Syntax error.
[ERROR] Sentry 429 (Too Many Requests) - expected in development
[WARNING] Image with src "/images/placeholders/subcollection-cover-placeholder.png" detected as LCP - add loading="eager"
[WARNING] Clerk: Loaded with development keys - expected
```

---

## ADDITIONAL OBSERVATIONS

**UX Positives:**

- "Public Subcollection" toggle in create form defaults to checked
- Proper pluralization ("0 items", "1 item")
- Sticky header appears when scrolling - good UX

**Accessibility:**

- All interactive elements have proper ARIA labels
- Dialog has proper heading structure
- Form fields have proper labels

**Suggestions:**

1. Fix the manifest.json syntax error
2. Consider adding loading="eager" to subcollection placeholder images per Next.js recommendation
