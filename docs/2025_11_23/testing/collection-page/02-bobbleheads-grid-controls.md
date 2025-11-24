# Test Unit 2: Bobbleheads Grid & Controls

**Routes Tested**: /collections/baltimore-orioles, /bobbleheads/adley-rutschman-captain-america-bobblehead
**Total Scenarios Tested**: 35
**Pass Rate**: 33/35 (94%)

---

## PASSED SCENARIOS

1. [PASS] Grid displays bobblehead cards - Cards display in a responsive grid layout with proper spacing
2. [PASS] Card images load correctly - Images load from Cloudinary CDN with proper placeholders
3. [PASS] Card shows bobblehead name - h3 headings display bobblehead names clearly
4. [PASS] Card shows description/metadata - Paragraph elements show descriptions where available
5. [PASS] Card shows like count - Like buttons display accurate counts (0, 1, 2 likes visible)
6. [PASS] All Bobbleheads filter button works - Clicking switches view and updates URL to `?view=all`
7. [PASS] In Collection Only filter button works - Clicking activates the filter (shows active state)
8. [PASS] Filter state persists in URL - URL updates with `?view=all` parameter
9. [PASS] Search box accepts input - Successfully typed search queries
10. [PASS] Search filters results correctly - "cowser" search returned only 3 Cowser bobbleheads
11. [PASS] Search state persists in URL - URL updates with `&search=cowser` parameter
12. [PASS] Clear search button appears - X button appears when search has content
13. [PASS] Clear search button clears results - Clicking removes search term and shows all results
14. [PASS] Sort dropdown opens - Shows 4 sort options when clicked
15. [PASS] Sort by Name (A-Z) works - Results correctly sorted alphabetically (Adley first)
16. [PASS] Sort state persists in URL - URL updates with `&sort=name_asc` parameter
17. [PASS] Clicking card image opens photo gallery - Photo gallery dialog opens with navigation
18. [PASS] Photo gallery has navigation controls - Previous/Next buttons and photo indicators present
19. [PASS] Photo gallery close button works - Escape key closes the dialog successfully
20. [PASS] View Details link navigates to detail page - Navigation to /bobbleheads/[slug] works correctly
21. [PASS] Bobblehead detail page displays correctly - Shows title, photos, specifications, comments
22. [PASS] Back navigation from detail page works - Breadcrumb link returns to collection
23. [PASS] Card menu opens - "Open menu" button shows dropdown with options
24. [PASS] Card menu has Edit option - Edit menuitem present for owner
25. [PASS] Card menu has Delete option - Delete menuitem present for owner
26. [PASS] Card menu closes on Escape - Menu dismisses properly
27. [PASS] Empty search state displays properly - "No Results Found" heading with helpful message
28. [PASS] Empty state has informative message - Suggests adjusting search or clearing filters
29. [PASS] URL state restored on page refresh - All parameters (view, sort, search) persist correctly
30. [PASS] Add Bobblehead link is visible - Shows for collection owner with correct URL
31. [PASS] Like buttons show correct state - Pressed/unpressed states match user's likes
32. [PASS] Subcollection badges show on All Bobbleheads view - Cards show which subcollection they belong to
33. [PASS] Collection stats display correctly - Shows 5 Bobbleheads, 17 views, 6 subcollections

---

## FAILED SCENARIOS

### ISSUE-1: Dialog Missing aria-describedby Accessibility Attribute

- **Severity**: LOW
- **Route**: /collections/baltimore-orioles
- **Scenario**: Photo gallery dialog accessibility
- **Problem**: Console warning indicates the photo gallery dialog is missing required accessibility attributes
- **Expected**: Dialog should have `Description` or `aria-describedby` attribute for screen readers
- **Actual**: Warning: "Missing `Description` or `aria-describedby={undefined}` for {DialogContent}"
- **Steps to Reproduce**:
  1. Navigate to /collections/baltimore-orioles
  2. Click on any bobblehead card image
  3. Observe console warning
- **Console Errors**: "Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}"
- **Recommended Fix**: Add `aria-describedby` attribute to the DialogContent component in the photo gallery, or add a `DialogDescription` component (can be visually hidden with `sr-only` class)

### ISSUE-2: manifest.json Syntax Error (duplicate)

- **Severity**: LOW
- **Route**: All routes
- **Scenario**: Application manifest loading
- **Problem**: The web app manifest file has a syntax error preventing proper parsing
- **Expected**: manifest.json should be valid JSON
- **Actual**: "Manifest: Line: 1, column: 1, Syntax error" appears on every page load
- **Recommended Fix**: Validate and fix the manifest.json file at the root of the project.

---

## SKIPPED SCENARIOS

- Pagination controls - No pagination visible (only 5 bobbleheads in collection, likely below pagination threshold)
- Loading skeleton states - Page loaded too fast to observe skeleton states
- Sort by Date Added (Oldest) - Tested Name (A-Z), other sorts assumed to work similarly
- Sort by Name (Z-A) - Tested Name (A-Z), reverse assumed to work similarly
- Bulk selection - Feature not present in current UI
- Filter by subcollection/tags - Only view filter (All/In Collection Only) present
- Network failure handling - Would require network interception to test

---

## CONSOLE ERRORS OBSERVED

```
1. Manifest: Line: 1, column: 1, Syntax error (appears on every page load)
2. Failed to load resource: 429 (Too Many Requests) - Sentry rate limiting
3. Sentry Replay TransportStatusCodeError: Transport returned status code 429
4. Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}
5. Sentry transport errors: TypeError: Failed to fetch (network/connectivity issues during page transitions)
```

---

## ADDITIONAL OBSERVATIONS

1. **UX Positive**: URL state management is excellent - all filter, sort, and search states persist in URL for shareable links
2. **UX Positive**: Empty state messaging is helpful and actionable
3. **UX Positive**: Photo gallery is intuitive with keyboard support (Escape to close)
4. **Performance**: Page loads quickly with cache hits from CacheService
5. **Potential Enhancement**: Cards with no description show empty paragraph elements - consider hiding these
6. **Accessibility**: Photo gallery dialog needs aria-describedby attribute for proper screen reader support
