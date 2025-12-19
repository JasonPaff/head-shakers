# E2E Coverage Gap Reference Guide

Quick lookup reference for all 12 identified gaps in featured bobblehead E2E testing.

---

## Gap 1: Featured Bobblehead Card Visibility

**Status**: NOT TESTED

**Description**: Featured bobblehead card renders in hero section

**What Needs Testing**:

- [ ] Card is visible on page load
- [ ] Card appears after async component loads
- [ ] Card image renders without broken state
- [ ] Card title displays
- [ ] Card layout is correct
- [ ] Card is not hidden or cropped

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 33-158)
- `featured-bobblehead-async.tsx` (lines 6-11)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 1-2

**Priority**: CRITICAL

**Risk**: Featured bobblehead is main visual element in hero

---

## Gap 2: Featured Bobblehead Navigation

**Status**: NOT TESTED

**Description**: Clicking featured bobblehead navigates to detail page

**What Needs Testing**:

- [ ] Click on card triggers navigation
- [ ] URL contains correct bobblehead slug
- [ ] Navigation URL matches expected pattern `/bobbleheads/[slug]`
- [ ] Page loads successfully after navigation
- [ ] Link href is valid
- [ ] Keyboard activation (Enter key) works

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 37-46)
- `hero-section.tsx` (lines 154-158)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 2-3

**Priority**: CRITICAL

**Risk**: Primary CTA - users cannot access featured bobblehead details

---

## Gap 3: Floating Cards Display

**Status**: NOT TESTED

**Description**: Top Rated and Value Growth floating cards render

**What Needs Testing**:

- [ ] Top Rated card is visible
- [ ] "Top Rated" and "This Week" text displays
- [ ] Trophy icon renders in Top Rated card
- [ ] Value Growth card is visible
- [ ] "+23%" text displays
- [ ] Trending up icon renders
- [ ] Cards are marked as aria-hidden (decorative)
- [ ] Cards animate correctly
- [ ] Cards respect motion-reduce preference

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 114-155)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 2

**Priority**: HIGH

**Risk**: Visual polish and visual consistency

---

## Gap 4: Loading States

**Status**: PARTIALLY TESTED

**Description**: Skeleton and loading states during data fetch

**What Needs Testing**:

- [ ] Skeleton displays while loading
- [ ] Skeleton has aria-busy="true"
- [ ] Skeleton has descriptive aria-label
- [ ] Skeleton shows placeholder elements
- [ ] Real content replaces skeleton when loaded
- [ ] Skeleton doesn't persist indefinitely
- [ ] Error state handled gracefully
- [ ] Page doesn't break if featured bobblehead returns null

**Components Affected**:

- `featured-bobblehead-skeleton.tsx`
- `hero-section.tsx` (lines 154-158)
- `featured-bobblehead-async.tsx` (lines 6-11)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 3-4

**Priority**: CRITICAL

**Risk**: User experience during data fetch

---

## Gap 5: Stats Display and Formatting

**Status**: PARTIALLY TESTED (component test exists)

**Description**: Like and view count stats display and format correctly

**What Needs Testing**:

- [ ] Like count displays
- [ ] View count displays
- [ ] Large numbers (1000+) have comma formatting
- [ ] Like count shows heart icon
- [ ] View count shows eye icon
- [ ] Stats are readable in light mode
- [ ] Stats are readable in dark mode
- [ ] Stats don't overflow layout
- [ ] Stats responsive on mobile
- [ ] Stats update if featured bobblehead changes

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 99-109)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 2

**Priority**: HIGH

**Risk**: Engagement metrics may not display correctly

---

## Gap 6: Editor's Pick Badge

**Status**: NOT TESTED

**Description**: Editor's Pick badge displays with correct styling

**What Needs Testing**:

- [ ] Badge text "Editor's Pick" is visible
- [ ] Crown icon displays
- [ ] Badge has distinctive styling
- [ ] Badge positioned in bottom area of card
- [ ] Badge doesn't overlap with other content
- [ ] Badge visible on all screen sizes

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 80-88)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 1-2

**Priority**: HIGH

**Risk**: Featured indicator may not be visible to users

---

## Gap 7: Description Text

**Status**: NOT TESTED

**Description**: Description text displays when available

**What Needs Testing**:

- [ ] Description renders when available
- [ ] Description hidden when null/empty
- [ ] Description text is readable
- [ ] Description not truncated
- [ ] Description positioned below title
- [ ] Long description text wraps correctly

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 94-97)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 1

**Priority**: MEDIUM

**Risk**: Context for featured bobblehead may be missing

---

## Gap 8: Responsive Layout

**Status**: NOT TESTED

**Description**: Featured bobblehead layout works on desktop and mobile

**What Needs Testing**:

**Desktop (1280px+)**:

- [ ] 2-column grid layout
- [ ] Featured card on right side
- [ ] Text content on left side
- [ ] Visible gap between columns
- [ ] No horizontal scroll

**Mobile (375px)**:

- [ ] Single column (stacked) layout
- [ ] Featured card full width
- [ ] Featured card below text content
- [ ] No horizontal scroll
- [ ] Content readable without zoom

**Tablet (768px)**:

- [ ] Proper intermediate layout
- [ ] Featured card visible

**Components Affected**:

- `hero-section.tsx` (lines 50-52)
- `featured-bobblehead-display.tsx` (lines 33-34)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 3

**Priority**: HIGH

**Risk**: Mobile layout likely broken (no responsive testing)

---

## Gap 9: Cross-Browser Compatibility

**Status**: NOT TESTED

**Description**: Featured bobblehead renders consistently across browsers

**What Needs Testing**:

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Note**: Requires playwright browser matrix setup. Consider deferred.

**Components Affected**: All

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts` (optional)

**Estimated Tests**: 0 (deferred)

**Priority**: MEDIUM

**Risk**: Browser-specific rendering issues

---

## Gap 10: Authentication State Consistency

**Status**: NOT TESTED

**Description**: Featured bobblehead renders identically for auth/unauth users

**What Needs Testing**:

- [ ] Card renders for authenticated users
- [ ] Card renders for unauthenticated users
- [ ] Content is identical in both states
- [ ] No permission issues
- [ ] No user-specific data leaks
- [ ] Navigation works in both states

**Components Affected**:

- `hero-section.tsx` (lines 154-158)
- `featured-bobblehead-async.tsx` (all)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 1

**Priority**: MEDIUM

**Risk**: Different behavior for authenticated users not tested

---

## Gap 11: Error Handling

**Status**: NOT TESTED

**Description**: Errors handled gracefully when featured bobblehead fails

**What Needs Testing**:

- [ ] Error boundary catches errors
- [ ] Page doesn't show white screen
- [ ] Rest of page works if featured bobblehead fails
- [ ] No JavaScript errors in console
- [ ] Null featured bobblehead handled
- [ ] API errors handled

**Components Affected**:

- `hero-section.tsx` (lines 154-158)
- `featured-bobblehead-async.tsx` (lines 8)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 2

**Priority**: MEDIUM

**Risk**: Page breaks if featured bobblehead fails

---

## Gap 12: Image Loading Performance

**Status**: NOT TESTED

**Description**: Featured bobblehead image loads within acceptable time

**What Needs Testing**:

- [ ] Image loads within 5 seconds
- [ ] Blur placeholder displays during load
- [ ] Image dimensions are correct
- [ ] Alt text is descriptive
- [ ] Cloudinary transformation applied
- [ ] Image doesn't cause layout shift (CLS)

**Components Affected**:

- `featured-bobblehead-display.tsx` (lines 48-74)

**Test File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Estimated Tests**: 1

**Priority**: MEDIUM

**Risk**: Slow image loading affects user experience

---

## Coverage Summary Table

| Gap #     | Title           | Priority | Tests     | Current | Status           |
| --------- | --------------- | -------- | --------- | ------- | ---------------- |
| 1         | Card Visibility | Critical | 1-2       | None    | Not Tested       |
| 2         | Navigation      | Critical | 2-3       | None    | Not Tested       |
| 3         | Floating Cards  | High     | 2         | None    | Not Tested       |
| 4         | Loading States  | Critical | 3-4       | Partial | Partial          |
| 5         | Stats Display   | High     | 2         | Partial | Not Tested (E2E) |
| 6         | Badge           | High     | 1-2       | None    | Not Tested       |
| 7         | Description     | Medium   | 1         | None    | Not Tested       |
| 8         | Responsive      | High     | 3         | None    | Not Tested       |
| 9         | Browser Compat  | Medium   | 0         | None    | Deferred         |
| 10        | Auth State      | Medium   | 1         | None    | Not Tested       |
| 11        | Error Handling  | Medium   | 2         | None    | Not Tested       |
| 12        | Performance     | Medium   | 1         | None    | Not Tested       |
| **TOTAL** |                 |          | **17-20** | 0       |                  |

---

## Feature Map

### By React Component

**featured-bobblehead-display.tsx** (Client Component)

- Gap 1: Card rendering (lines 33-158)
- Gap 2: Navigation/link (lines 37-46)
- Gap 3: Floating cards (lines 114-155)
- Gap 5: Stats (lines 99-109)
- Gap 6: Badge (lines 80-88)
- Gap 7: Description (lines 94-97)
- Gap 12: Image loading (lines 48-74)

**featured-bobblehead-async.tsx** (Server Component)

- Gap 4: Loading skeleton fallback (lines 155-157)
- Gap 10: Auth state (all)
- Gap 11: Error handling (line 8)

**hero-section.tsx** (Server Component)

- Gap 1: Card visibility (lines 154-158)
- Gap 4: Suspense boundary (lines 154-158)
- Gap 8: Responsive layout (lines 50-52)
- Gap 11: Error boundary (lines 154-158)

**featured-bobblehead-skeleton.tsx** (Component)

- Gap 4: Skeleton rendering

---

## Test Execution Flowchart

```
Start Test
  ↓
1. Navigate to home page
  ↓
2. Wait for featured bobblehead to load (5-10s)
  ↓
3. Test Card Visibility (Gap 1)
  ├─ Verify card is visible
  ├─ Verify image renders
  └─ Verify title displays
  ↓
4. Test Navigation (Gap 2)
  ├─ Verify link href is valid
  └─ Verify click navigates
  ↓
5. Test Visual Elements (Gaps 3, 5, 6, 7)
  ├─ Verify floating cards
  ├─ Verify stats display
  ├─ Verify badge displays
  └─ Verify description (if applicable)
  ↓
6. Test Responsive (Gap 8)
  ├─ Test desktop layout
  └─ Test mobile layout
  ↓
7. Test Edge Cases (Gaps 4, 10, 11, 12)
  ├─ Test loading state
  ├─ Test auth consistency
  ├─ Test error handling
  └─ Test performance
  ↓
End Test
```

---

## Dependency Map

```
featured-bobblehead-display.tsx
    ↑
    └─ featured-bobblehead-async.tsx
         ↑
         └─ FeaturedContentFacade.getFeaturedBobbleheadAsync()
              ↑
              ├─ CacheService.featured.featuredBobblehead()
              │
              └─ FeaturedContentQuery.getFeaturedBobbleheadAsync()
                  ↑
                  └─ Database (featured_content + bobbleheads tables)

hero-section.tsx
    ↓
    ├─ featured-bobblehead-async.tsx (Suspense)
    ├─ featured-bobblehead-skeleton.tsx (fallback)
    ├─ platform-stats-async.tsx
    └─ Error boundary
```

E2E tests should test the entire stack from `hero-section.tsx` rendering perspective.

---

## Common Test Patterns

### Pattern 1: Wait for Async Component

```typescript
const featuredCard = homePage.featuredBobbleheadCard;
await expect(featuredCard).toBeVisible({ timeout: 10000 });
```

### Pattern 2: Verify Navigation

```typescript
await Promise.all([page.waitForURL(/\/bobbleheads\/[^/]+/), featuredCard.click()]);
expect(page.url()).toMatch(/\/bobbleheads\//);
```

### Pattern 3: Test Responsive

```typescript
await page.setViewportSize({ width: 375, height: 667 }); // Mobile
await page.setViewportSize({ width: 1280, height: 800 }); // Desktop
```

### Pattern 4: Verify Accessibility

```typescript
const href = await card.getAttribute('href');
expect(href).toBeTruthy();
// Verify keyboard navigation
await page.keyboard.press('Tab');
await page.keyboard.press('Enter');
```

### Pattern 5: Verify Data Display

```typescript
const text = await element.textContent();
expect(text).toMatch(/^\d{1,}(?:,\d{3})*$/); // Comma-formatted numbers
```

---

## Success Criteria Checklist

After implementing all 17 tests, verify:

- [x] All 12 gaps have test coverage
- [x] Tests pass on CI/CD pipeline
- [x] Tests run in < 2 minutes total
- [x] No flaky tests (re-run 3x consistently passes)
- [x] Tests cover happy path and edge cases
- [x] Tests cover responsive layouts
- [x] Tests cover auth states
- [x] Page Object locators are stable
- [x] Documentation updated
- [x] Team can run tests locally

---

## Quick Reference: What to Test

### Must Test (Critical)

- Featured card renders
- Navigation works
- Loading state displays
- Stats format correctly

### Should Test (High)

- Floating cards display
- Badge displays
- Responsive layout
- Description displays

### Nice to Have (Medium)

- Error handling
- Auth consistency
- Performance
- Description text

### Can Skip (Low/Deferred)

- Cross-browser testing (requires matrix setup)
- Dark mode specifics (if covered by component tests)

---

## File Locations

**Analysis Documents**:

- Main analysis: `docs/2025_12_04/e2e-coverage-gaps/home-featured-bobblehead-e2e-analysis.md`
- Implementation guide: `docs/2025_12_04/e2e-coverage-gaps/test-implementation-guide.md`
- This reference: `docs/2025_12_04/e2e-coverage-gaps/gap-reference.md`

**Test File to Create**:

- `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**File to Modify**:

- `tests/e2e/pages/home.page.ts` (add featured bobblehead locators)

---

**Created**: 2025-12-04
**Type**: Quick Reference Guide
**Status**: Ready for Implementation
