# E2E Test Coverage Gap Analysis: Featured Collections Section

**Analysis Date**: December 4, 2025
**Scope**: E2E tests only (Playwright)
**Target Feature**: Home page featured collections section

## Summary

- **Source Files Analyzed**: 6
  - `src/app/(app)/(home)/page.tsx` - Home page entry point
  - `src/app/(app)/(home)/components/sections/featured-collections-section.tsx` - Layout wrapper
  - `src/app/(app)/(home)/components/async/featured-collections-async.tsx` - Data fetching
  - `src/app/(app)/(home)/components/display/featured-collections-display.tsx` - Grid rendering
  - `src/lib/facades/featured-content/featured-content.facade.ts` - Business logic
  - `src/lib/queries/featured-content/featured-content-query.ts` - Database queries

- **Existing E2E Tests Found**: 2
  - `tests/e2e/specs/public/home-sections.spec.ts` - Basic visibility tests (1 test)
  - `tests/e2e/specs/user/home-authenticated.spec.ts` - Authenticated visibility test (1 test)

- **Total E2E Coverage Gaps**: 40 test scenarios
- **Estimated New E2E Tests**: 18-22 individual test cases

---

## Coverage Matrix

| User Flow                              | Current Coverage | Gap Status  |
| -------------------------------------- | ---------------- | ----------- |
| 1. Collection Display Flow             | PARTIAL (20%)    | CRITICAL    |
| 2. Navigation Flow (Card & View All)   | PARTIAL (15%)    | CRITICAL    |
| 3. Authentication-Dependent Behavior   | MISSING (0%)     | CRITICAL    |
| 4. State Handling (Empty/Loading/Error)| MISSING (0%)     | HIGH        |
| 5. Responsive Behavior (Desktop/Tablet/Mobile) | MISSING (0%) | HIGH |
| 6. Accessibility (ARIA/Keyboard/Screen Reader) | MISSING (0%) | MEDIUM      |

---

## Detailed Coverage Analysis by User Flow

### 1. Collection Display Flow (Current Coverage: 20%)

**Description**: Verify that up to 6 featured collections display correctly in responsive grid with complete metadata.

**Source Code Analysis**:
- `FeaturedCollectionsDisplay` component renders grid with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Each card displays: image, trending badge, title, description, owner info, stats (likes, views, comments)
- Collections limited to 6 items via `.limit(6)` in query
- Mobile shows `hidden md:block` for items at index >= 3 (first 3 visible on mobile)

**Existing E2E Coverage**:
- `home-sections.spec.ts` line 29-39: Checks section visibility and heading (NO card validation)
- `home-authenticated.spec.ts` line 61-74: Checks section visibility only (NO card validation)

**Missing Test Scenarios** (9 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Display 6 collections in grid | Verify up to 6 collection cards render |
| CRITICAL | Verify collection card metadata | Title, owner, total items, estimated value, stats visible |
| CRITICAL | Verify trending badge renders | Badge visible only for collections with `isTrending: true` |
| CRITICAL | Verify owner avatar/info displays | Owner display name, avatar, item count visible |
| CRITICAL | Verify engagement stats display | Likes, view count, comments rendered with icons |
| HIGH | Verify image loading with blur | Cloudinary image loads with blur placeholder |
| HIGH | Verify placeholder image fallback | Shows placeholder when no image available |
| MEDIUM | Verify collection card link elements | Cards are clickable links with correct structure |
| MEDIUM | Verify collection grid gap and spacing | Correct grid gaps and responsive spacing applied |

---

### 2. Navigation Flow (Current Coverage: 15%)

**Description**: Users can click collection cards to navigate to detail page and "View All" button to navigate to browse.

**Source Code Analysis**:
- Collection cards are `Link` components with href: `/collections/[collectionSlug]` (line 84-86)
- "View All Collections" button navigates to `/browse` (line 49)
- Both use `$path` for type-safe routing
- Card link wraps entire card component (line 75-87)

**Existing E2E Coverage**:
- `home-sections.spec.ts` line 67-74: Navigates to `/browse` via "Browse Collections" button
- `home-authenticated.spec.ts`: No navigation tests for featured collections

**Missing Test Scenarios** (8 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Click collection card navigates to detail page | Click first card → verify URL matches `/collections/[slug]` |
| CRITICAL | Multiple card navigation | Click different cards → verify correct slug in URL |
| CRITICAL | "View All Collections" button navigates to browse | Click button → verify URL is `/browse` |
| HIGH | Verify card link has correct href | Card element has href attribute with collection slug |
| HIGH | Verify navigation waits for page load | URL changes and page content loads |
| MEDIUM | Verify collection detail page loads | Collection detail page renders after navigation |
| MEDIUM | Verify all 6 cards are independently clickable | Each card navigates independently |
| MEDIUM | Verify button hover state affects navigation | Hover state exists, navigation works |

---

### 3. Authentication-Dependent Behavior (Current Coverage: 0%)

**Description**: Display varies based on authentication state - unauthenticated sees aggregate likes, authenticated sees personal like status.

**Source Code Analysis**:
- Query filters likes based on `userId` parameter (line 444-450 in query)
- If userId provided: left join to likes table with user-specific filter
- If no userId: left join to `sql\`false\`` → `isLiked` always false
- `isLiked` field indicates personal like status (boolean)
- `likes` count shows aggregate likes (always visible)
- Facade receives userId from `getUserIdAsync()` in async component (line 8)

**Existing E2E Coverage**: NONE - No tests verify authentication-dependent behavior

**Missing Test Scenarios** (10 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Unauthenticated sees aggregate likes | Verify likes count displays for anonymous users |
| CRITICAL | Authenticated user sees personal like status | Verify personal like state displays if user liked collection |
| CRITICAL | Like status differs between authenticated and unauthenticated | Navigate as anon vs auth → compare like displays |
| HIGH | Personal like state is accurate for liked collections | User who liked collection sees indication |
| HIGH | Personal like state is accurate for unliked collections | User who didn't like collection shows no indication |
| HIGH | Like count is consistent across auth states | Aggregate likes count same for anon and auth users |
| MEDIUM | Like state updates after liking/unliking | Click like → verify state changes (if like button present) |
| MEDIUM | Different users see different personal like states | Multiple authenticated users see own like status |
| MEDIUM | Cache doesn't leak personal data across users | User A's like status not visible to User B |
| MEDIUM | Anonymous users see empty like state | Anon users show aggregate but no personal indication |

---

### 4. State Handling (Current Coverage: 0%)

**Description**: Handle empty state, loading states, and error boundaries gracefully.

**Source Code Analysis**:
- **Empty State**: `FeaturedCollectionsDisplay` checks `collections.length === 0` (line 25)
  - Shows LayersIcon, message "No featured collections available at this time.", Browse button
  - Test ID: `feature-collections-empty-state`
- **Loading State**: `FeaturedCollectionsSkeleton` renders in Suspense boundary (line 35-37)
  - Shows loading skeleton while async data fetches
- **Error Handling**: `ErrorBoundary` wraps async component (line 34)
  - Named 'featured-collections' for debugging
  - Should catch and handle render errors gracefully

**Existing E2E Coverage**: NONE - No state handling tests

**Missing Test Scenarios** (8 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Loading skeleton displays during fetch | Async loads → skeleton visible until data ready |
| CRITICAL | Skeleton disappears when data loaded | Data loads → skeleton hidden, cards visible |
| HIGH | Empty state displays when no collections | Zero collections returned → empty state message visible |
| HIGH | Empty state shows Browse button | Empty state includes "Browse All Collections" link |
| HIGH | Error boundary catches rendering errors | Component error → error boundary message visible |
| MEDIUM | Loading state transitions smoothly | No layout shift when transitioning from skeleton to cards |
| MEDIUM | Empty state is accessible | Empty state message readable and keyboard accessible |
| MEDIUM | Error recovery is possible | After error, page refresh loads data successfully |

---

### 5. Responsive Behavior (Current Coverage: 0%)

**Description**: Grid adapts to viewport sizes - Desktop (3 cols), Tablet (2 cols), Mobile (1 col, first 3 visible).

**Source Code Analysis**:
- Grid classes: `grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3` (line 43)
  - Mobile (default): 1 column
  - Tablet (md): 2 columns (640px+)
  - Desktop (lg): 3 columns (1024px+)
- Card visibility: `index >= 3 ? 'hidden md:block' : undefined` (line 49)
  - Cards 0, 1, 2 always visible
  - Cards 3, 4, 5 hidden on mobile, visible on md+
- Gap between cards: 8 units (32px)

**Existing E2E Coverage**: NONE - No responsive tests

**Missing Test Scenarios** (8 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Desktop view shows 3 columns | 1024px+ viewport → grid displays 3 columns |
| CRITICAL | Tablet view shows 2 columns | 640px-1023px viewport → grid displays 2 columns |
| CRITICAL | Mobile view shows 1 column | <640px viewport → grid displays 1 column |
| HIGH | Mobile shows only first 3 cards | Mobile viewport → cards 4-6 hidden |
| HIGH | Tablet shows up to 6 cards (2x3) | Tablet viewport → all 6 cards visible in 2 columns |
| MEDIUM | Grid spacing maintains on all sizes | Gap spacing consistent across breakpoints |
| MEDIUM | Cards maintain aspect ratio | Image aspect ratio (4/3) maintained on all viewports |
| MEDIUM | Text truncation works on mobile | Long titles/descriptions truncate correctly on mobile |

---

### 6. Accessibility (Current Coverage: 0%)

**Description**: Proper ARIA labels, keyboard navigation, and screen reader support.

**Source Code Analysis**:
- **ARIA**: LayersIcon has `aria-hidden` (line 24, 32, 141)
- **Icons**: FlameIcon, HeartIcon, EyeIcon, MessageCircleIcon all have `aria-hidden` (line 141, 203, 207, 211)
- **Gradient Overlays**: Overlay has `aria-hidden` (line 128)
- **Semantic HTML**: Links use `Link` component, cards have descriptive text
- **Test IDs**: Generate via `generateTestId()` for testing
- **No explicit**: alt text on images, ARIA live regions, or focus management visible

**Existing E2E Coverage**: NONE - No accessibility tests

**Missing Test Scenarios** (7 gaps):

| Priority | Test Scenario | Details |
|----------|---------------|---------|
| CRITICAL | Collection card links keyboard navigable | Tab through cards, focus visible, Enter navigates |
| CRITICAL | "View All" button keyboard navigable | Tab to button, Enter triggers navigation |
| HIGH | Screen reader announces collection titles | Collection titles announced by screen readers |
| HIGH | Screen reader announces owner info | Owner display name announced clearly |
| HIGH | Screen reader announces stats | Likes, views, comments announced with context |
| MEDIUM | Image alt text is descriptive | Images have alt text for context |
| MEDIUM | Empty state is screen reader friendly | "No featured collections" message announced clearly |

---

## E2E Tests by Priority and Estimated Effort

### Critical Priority (Highest Risk)

**Estimated New Tests**: 8-10 tests

**Test File**: `tests/e2e/specs/feature/featured-collections.spec.ts`

#### Must-Have Tests:

1. **Display collection cards** - Verify 6 cards render with metadata
2. **Card navigation** - Click collection card → navigate to detail page
3. **View All navigation** - Click "View All" → navigate to `/browse`
4. **Unauthenticated like display** - Anon user sees aggregate likes
5. **Authenticated like display** - Auth user sees personal like status
6. **Responsive desktop (3 cols)** - Desktop viewport shows 3 column grid
7. **Responsive mobile (1 col)** - Mobile viewport shows 1 column, first 3 cards
8. **Loading state displays** - Skeleton shows while data loads
9. **Empty state displays** - No collections → empty state renders
10. **Card keyboard navigation** - Tab to cards, focus visible

---

### High Priority Tests

**Estimated New Tests**: 6-8 tests

#### Tests:

1. **Trending badge visibility** - Badge shows only for trending collections
2. **Owner avatar and info** - Owner name, avatar, item count display
3. **Engagement stats** - Likes, views, comments with icons
4. **Responsive tablet (2 cols)** - Tablet viewport shows 2 columns
5. **Mobile card visibility** - Cards 4-6 hidden on mobile
6. **Error boundary** - Component error → error boundary catches
7. **Navigation from multiple cards** - Different cards navigate to correct URLs

---

### Medium Priority Tests

**Estimated New Tests**: 4-6 tests

#### Tests:

1. **Image blur placeholder** - Cloudinary image loads with blur
2. **Placeholder image fallback** - No image → placeholder shows
3. **Empty state Browse button** - Empty state includes functional Browse link
4. **Keyboard navigation to View All** - Focus View All button, Enter navigates
5. **Screen reader support** - Titles, stats announced clearly
6. **Grid spacing** - Gap and padding consistent across sizes

---

## Test Infrastructure & Recommendations

### Existing Test Infrastructure

**Page Object Model** (`tests/e2e/pages/home.page.ts`):
- Already has `featuredCollectionsSection` locator
- Extends `BasePage` with common patterns
- Uses `finder` helper for semantic test ID selection

**Fixtures** (`tests/e2e/fixtures/base.fixture.ts`):
- `finder` - Component finder for unauthenticated users
- `userFinder` - Component finder for authenticated users
- `page` - Unauthenticated page context
- `userPage` - Authenticated page context
- Can extend with `adminPage` if needed for data setup

**Helpers** (`tests/e2e/helpers/test-helpers.ts`):
- `createComponentFinder()` - Semantic locator builders
- Supports `.feature()`, `.layout()`, `.ui()` selectors
- Already used in existing tests

### Test File Organization

**Suggested File**: `tests/e2e/specs/feature/featured-collections.spec.ts`

**Test Describe Blocks**:
```typescript
test.describe('Featured Collections - Display', () => { /* tests 1-9 */ })
test.describe('Featured Collections - Navigation', () => { /* tests 10-17 */ })
test.describe('Featured Collections - Auth States', () => { /* tests 18-27 */ })
test.describe('Featured Collections - Responsive', () => { /* tests 28-35 */ })
test.describe('Featured Collections - Accessibility', () => { /* tests 36-42 */ })
```

### Key Testing Patterns to Use

**Pattern 1: Fixture Context Selection**
```typescript
test.describe('Featured Collections - Display', () => {
  test('should display 6 collection cards', async ({ page, finder }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    const cards = finder.feature('collection-card');
    await expect(cards).toHaveCount(6);
  });
});
```

**Pattern 2: Navigation Testing**
```typescript
test('should navigate to collection detail on card click', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const firstCard = page.locator('[data-testid*="collection-card"]').first();
  const href = await firstCard.getAttribute('href');

  await firstCard.click();
  await expect(page).toHaveURL(new RegExp(href || ''));
});
```

**Pattern 3: Auth-Dependent Testing**
```typescript
test.describe('Featured Collections - Authentication States', () => {
  test('unauthenticated sees aggregate likes', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify likes count displays but no personal state
    const likeStats = page.locator('[data-slot="featured-collection-stats"]');
    await expect(likeStats.first()).toContainText(/\d+ likes/);
  });

  test('authenticated user sees personal like status', async ({ userPage }) => {
    const homePage = new HomePage(userPage);
    await homePage.goto();

    // Verify both aggregate and personal state
    const likeStats = userPage.locator('[data-slot="featured-collection-stats"]');
    await expect(likeStats.first()).toBeVisible();
  });
});
```

**Pattern 4: Responsive Testing**
```typescript
test('should display 3 columns on desktop', async ({ page }) => {
  // Set desktop viewport
  await page.setViewportSize({ width: 1280, height: 720 });

  const homePage = new HomePage(page);
  await homePage.goto();

  const grid = page.locator('[data-slot="featured-collections-grid"]');
  // Verify computed grid-template-columns or count visible cards
  const cards = page.locator('[data-slot="featured-collection-card"]:visible');
  // Desktop should show up to 3 per row
});
```

### Data Setup Considerations

**Challenges**:
- Tests need featured collections data in database
- Like status is user-specific and requires proper setup
- Trending status requires specific featured content data

**Solutions**:
1. **Use existing E2E database**: Tests run against Neon branch with test data
2. **Facade layer**: `FeaturedContentFacade.getFeaturedCollectionsAsync()` handles queries
3. **Pre-seeded data**: E2E database should have 6+ featured collections ready
4. **User setup**: Fixtures already handle authenticated users via Clerk

### Critical Test Data Requirements

For tests to pass, E2E database must have:
- At least 6 active featured collections (with `isActive: true` and valid date range)
- Collections with images (Cloudinary URLs) and placeholders
- Collections with varying like counts
- At least 1 collection marked as `isTrending: true`
- Owner users with avatars and display names
- Bobbleheads in collections (for totalItems count)
- At least 1 collection with comments

---

## Implementation Roadmap

### Phase 1: Critical Tests (Foundation) - 2-3 hours
1. Display collection cards with metadata
2. Collection card navigation
3. View All button navigation
4. Loading skeleton state
5. Empty state handling
6. Card keyboard navigation

### Phase 2: Authentication Tests (User-Dependent) - 1-2 hours
1. Unauthenticated like display
2. Authenticated personal like status
3. Like status consistency across auth states
4. Cache verification (no data leakage)

### Phase 3: Responsive & Accessibility Tests - 2-3 hours
1. Desktop (3 cols) layout
2. Tablet (2 cols) layout
3. Mobile (1 col) layout
4. Mobile card visibility (first 3 only)
5. Keyboard navigation
6. Screen reader support
7. Image alt text

### Phase 4: Polish & Edge Cases - 1-2 hours
1. Trending badge display
2. Owner info and avatar
3. Engagement stats accuracy
4. Placeholder image fallback
5. Error boundary behavior

---

## Blockers & Dependencies

**None identified** - All infrastructure and Page Object patterns already exist. Tests can be implemented immediately using existing fixtures and helpers.

### Assumptions for Test Success

1. E2E database has 6+ featured collections seeded
2. Featured collections have valid `isActive: true` and date range
3. Collections have diverse metadata (images, trending status, owners)
4. Cloudinary images are accessible during E2E runs
5. Authentication fixtures properly handle Clerk login
6. Test database allows reading featured content without special permissions

---

## Existing Test Files Reference

**Current Tests** (minimal featured collections coverage):
- `tests/e2e/specs/public/home-sections.spec.ts` - 1 test (section visibility)
- `tests/e2e/specs/user/home-authenticated.spec.ts` - 1 test (section visibility)
- `tests/e2e/pages/home.page.ts` - Page Object with `featuredCollectionsSection` locator

**Similar Test Files** (for pattern reference):
- `tests/e2e/specs/feature/newsletter-footer.spec.ts` - 10+ tests with auth variations
- `tests/e2e/specs/public/home-sections.spec.ts` - Basic section visibility patterns
- `tests/e2e/specs/smoke/auth-flow.spec.ts` - Auth state testing patterns

---

## Success Criteria

### Test Coverage Complete When:
- [ ] 18-22 E2E tests written for featured collections
- [ ] All 6 user flows covered: Display, Navigation, Auth, State Handling, Responsive, Accessibility
- [ ] Critical priority tests (display, navigation, auth) all passing
- [ ] Tests run in CI/CD pipeline successfully
- [ ] E2E coverage increases from 2 to 20+ tests for this feature
- [ ] No flaky tests (consistent pass rates)

### Quality Metrics:
- **Display tests**: Verify card count, metadata, visual elements
- **Navigation tests**: Verify URL changes and page loads
- **Auth tests**: Verify state differences between user contexts
- **Responsive tests**: Verify layout changes at breakpoints
- **Accessibility tests**: Verify keyboard and screen reader support

---

## Summary of Missing Tests by Category

| Category | Count | Priority | Estimated Time |
|----------|-------|----------|-----------------|
| Display & Metadata | 9 | CRITICAL | 1.5 hours |
| Navigation | 8 | CRITICAL | 1.5 hours |
| Authentication | 10 | CRITICAL | 1.5 hours |
| State Handling | 8 | HIGH | 1.5 hours |
| Responsive Layout | 8 | HIGH | 1.5 hours |
| Accessibility | 7 | MEDIUM | 1 hour |
| **TOTAL** | **50** | Mixed | **8-10 hours** |

**Note**: Estimated implementation time assumes 1-2 tests per hour for experienced E2E testing.
