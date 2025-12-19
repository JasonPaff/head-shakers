# E2E Test Coverage Gap Analysis: Home Page Featured Bobblehead Section

**Date**: 2025-12-04
**Focus**: End-to-End (E2E) user interaction tests only
**Scope**: Featured bobblehead display and related hero section functionality

---

## Executive Summary

| Metric                      | Value                                              |
| --------------------------- | -------------------------------------------------- |
| **Source Files Analyzed**   | 6                                                  |
| **Existing E2E Tests**      | 2 test files (14 tests total)                      |
| **Test Coverage Type**      | Mixed (section visibility, navigation, auth state) |
| **E2E Gaps Identified**     | 12 critical gaps                                   |
| **Estimated New E2E Tests** | 15-18 tests                                        |

---

## Source Files Under Analysis

### Core Components

1. **`src/app/(app)/(home)/page.tsx`**
   - Main home page server component
   - Renders hero, featured collections, trending, and community sections
   - No direct user interaction logic

2. **`src/app/(app)/(home)/components/sections/hero-section.tsx`**
   - Server component with Suspense boundaries
   - Contains featured bobblehead async component
   - Renders platform stats and CTAs
   - Shows conditional buttons based on auth state

3. **`src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx`**
   - Client component (use client)
   - Renders featured bobblehead card with image, stats, badges
   - Displays floating cards (Top Rated, Value Growth)
   - Links to bobblehead detail page

4. **`src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx`**
   - Server component that fetches featured bobblehead data
   - Uses FeaturedContentFacade.getFeaturedBobbleheadAsync()
   - Handles null case (returns null if no featured bobblehead)

5. **`src/lib/facades/featured-content/featured-content.facade.ts`**
   - Business logic layer with caching via Redis
   - getFeaturedBobbleheadAsync() - returns single highest-priority bobblehead
   - Uses cache service with configurable TTL

6. **`src/lib/queries/featured-content/featured-content-query.ts`**
   - Database query layer
   - getFeaturedBobbleheadAsync() - queries featured_content table with bobbleheads join
   - Filters by: isActive=true, content type='bobblehead', date range validation
   - Orders by priority DESC, then createdAt DESC
   - Limits to 1 result

---

## Existing E2E Test Coverage

### Test File: `tests/e2e/specs/public/home-sections.spec.ts`

**Purpose**: Public (unauthenticated) home page E2E tests
**Tests**: 8 tests total

| Test Name                      | What It Tests                     | Coverage Type      |
| ------------------------------ | --------------------------------- | ------------------ |
| Hero section visibility        | Hero section renders              | Visibility         |
| Platform statistics            | Stats load within hero            | Visibility + Async |
| Featured collections section   | Collections section visible       | Visibility         |
| Trending bobbleheads section   | Trending section visible          | Visibility         |
| Join community section         | Community section renders         | Visibility         |
| Browse collections navigation  | Clicks browse button              | Navigation         |
| Explore bobbleheads navigation | Clicks explore bobbleheads button | Navigation         |
| All sections in correct order  | All sections present              | Layout/Order       |

**Featured Bobblehead Specific**: Very limited coverage

- Verifies hero section is visible
- Does NOT interact with featured bobblehead card
- Does NOT verify featured bobblehead image loads
- Does NOT test featured bobblehead data display
- Does NOT test featured bobblehead link click-through

### Test File: `tests/e2e/specs/user/home-authenticated.spec.ts`

**Purpose**: Authenticated home page E2E tests
**Tests**: 6 tests total

| Test Name                              | What It Tests                      | Coverage Type     |
| -------------------------------------- | ---------------------------------- | ----------------- |
| Hero section with My Collection button | Auth state shows My Collection     | Auth + Visibility |
| Navigate to dashboard                  | Clicks My Collection in hero       | Navigation        |
| Join community auth state              | Auth state in community section    | Auth              |
| Join community navigation              | Clicks My Collection in community  | Navigation        |
| Featured collections section           | Collections section visible        | Visibility        |
| Trending section                       | Trending section visible           | Visibility        |
| Auth state throughout page             | User avatar visible after scroll   | Auth State        |
| All sections in order                  | Sections present for authenticated | Layout/Order      |

**Featured Bobblehead Specific**: Minimal coverage

- Only verifies hero section is visible
- Does NOT interact with featured bobblehead card
- Does NOT verify featured bobblehead renders when authenticated
- Does NOT test featured bobblehead stats display

### Page Object: `tests/e2e/pages/home.page.ts`

**Locators Available for Featured Bobblehead**:

```typescript
// General
heroSection; // Hero section container
platformStats; // Platform stats display

// Newsletter (footer-related)
newsletterSection; // Newsletter subscription area
```

**Missing Locators** that would help test featured bobblehead:

- No featured bobblehead card locator
- No featured bobblehead image locator
- No featured bobblehead stats locators (likes, views)
- No floating cards locators
- No featured bobblehead link/URL locator

---

## Detailed Coverage Gaps

### Critical Priority Gaps

#### Gap 1: Featured Bobblehead Card Visibility and Rendering

**Status**: Not tested in E2E
**Risk**: High - Featured bobblehead is a key hero element visible to all users

**What's NOT tested**:

- Featured bobblehead card renders on page load
- Featured bobblehead card is visible without scrolling (or within viewport)
- Featured bobblehead card renders with proper layout (left/right grid positioning)
- Featured bobblehead image displays correctly
- Featured bobblehead title renders
- Featured bobblehead stats (likes, view count) are visible and formatted correctly

**Scenario Requirements**:

```gherkin
Feature: Featured Bobblehead Display on Home Hero
  Scenario: Featured bobblehead card renders in hero section (public)
    Given I'm on the home page (unauthenticated)
    When the page loads
    Then featured bobblehead card should be visible
    And featured bobblehead image should be visible
    And featured bobblehead title should be displayed
    And editor's pick badge should be visible
    And likes count should be formatted with commas
    And views count should be formatted with commas

  Scenario: Featured bobblehead card renders in hero section (authenticated)
    Given I'm authenticated and on the home page
    When the page loads
    Then featured bobblehead card should be visible
    And featured bobblehead image should be visible
    And featured bobblehead title should be displayed

  Scenario: Featured bobblehead renders with fallback when no image
    Given I'm on the home page
    And featured bobblehead has no image
    When the page loads
    Then trophy icon placeholder should be visible
    And gradient background should display
    And title should still be visible on top
```

**Estimated Tests**: 3 E2E tests

---

#### Gap 2: Featured Bobblehead Navigation (Click-Through)

**Status**: Not tested in E2E
**Risk**: Critical - Featured bobblehead card is a primary CTA linking to detail page

**What's NOT tested**:

- Clicking featured bobblehead card navigates to bobblehead detail page
- Navigation URL contains correct bobblehead slug
- Featured bobblehead card link is properly accessible (keyboard navigation)
- Link has proper ARIA attributes for screen readers
- Click targets entire card or just the image
- Navigation preserves scroll position or handles navigation properly

**Scenario Requirements**:

```gherkin
Feature: Featured Bobblehead Navigation
  Scenario: Click featured bobblehead card navigates to detail page
    Given I'm on the home page
    When the featured bobblehead card is visible
    And I click the featured bobblehead card
    Then I should navigate to the bobblehead detail page
    And the URL should contain the correct bobblehead slug
    And the page should load successfully

  Scenario: Featured bobblehead link is keyboard accessible
    Given I'm on the home page
    When I tab to the featured bobblehead card
    Then the card should have a visible focus indicator
    And pressing Enter should navigate to the detail page

  Scenario: Featured bobblehead card link has proper semantics
    Given I'm on the home page
    When the page loads
    Then the featured bobblehead card should be wrapped in a link element
    And the link should have a descriptive href
```

**Estimated Tests**: 3 E2E tests

---

#### Gap 3: Featured Bobblehead Floating Cards (Decorative Elements)

**Status**: Not tested in E2E
**Risk**: Medium-High - Visual elements with data that should render consistently

**What's NOT tested**:

- "Top Rated This Week" floating card renders and animates
- "Value Growth" floating card renders with correct data/percentage
- Floating cards animate with correct timing (different durations)
- Floating cards respect motion-reduce preference
- Floating cards are marked as aria-hidden (decorative)
- Cards render in correct positions (top-left for Top Rated, bottom-right for Value Growth)

**Scenario Requirements**:

```gherkin
Feature: Featured Bobblehead Floating Cards
  Scenario: Floating cards render with correct content
    Given I'm on the home page
    When the page loads
    Then "Top Rated" card should be visible
    And "This Week" subtext should be visible
    And "Value Growth" card should be visible
    And "+23%" text should be visible
    And trophy icon should be visible in Top Rated card
    And trending up icon should be visible in Value Growth card

  Scenario: Floating cards are decorative elements
    Given I'm on the home page
    When the page loads
    Then floating cards should have aria-hidden="true"
    And floating cards should not be included in keyboard navigation

  Scenario: Floating cards respect motion preferences
    Given I'm on the home page
    And system prefers reduced motion
    When the page loads
    Then floating cards should not animate
    And animation classes should be disabled
```

**Estimated Tests**: 2 E2E tests

---

#### Gap 4: Featured Bobblehead Loading States

**Status**: Not tested in E2E
**Risk**: High - User experience during data fetch is critical

**What's NOT tested**:

- Skeleton/loading state shows while featured bobblehead data is fetching
- Skeleton has proper accessibility (aria-busy, aria-label)
- Skeleton renders all expected placeholder elements
- Skeleton is replaced with real content once loaded
- Error state (when data fetch fails) is handled gracefully
- Page doesn't break if featured bobblehead returns null

**Scenario Requirements**:

```gherkin
Feature: Featured Bobblehead Loading States
  Scenario: Loading skeleton displays during data fetch
    Given I'm on the home page
    When the page is loading
    Then featured bobblehead skeleton should be visible
    And skeleton should have aria-busy="true"
    And skeleton should have aria-label for accessibility
    And skeleton should show placeholder elements (image, title, stats)

  Scenario: Skeleton replaced with real content on load
    Given I'm on the home page with featured bobblehead
    When the page finishes loading (after 2+ seconds)
    Then skeleton should be removed
    And real featured bobblehead card should be visible
    And image should display properly

  Scenario: Empty state handled gracefully when no featured bobblehead
    Given I'm on the home page
    And no featured bobblehead is configured
    When the page loads
    Then loading skeleton should not display indefinitely
    And page should not show error message
    And other hero content (buttons, text) should display normally

  Scenario: Error handling for failed data fetch
    Given I'm on the home page
    And featured bobblehead API fails
    When the page attempts to load
    Then error boundary should catch the error
    And page should not crash
    And other sections should load normally
```

**Estimated Tests**: 3-4 E2E tests

---

#### Gap 5: Featured Bobblehead Stats Display and Formatting

**Status**: Partially tested (component test exists, but no E2E)
**Risk**: Medium - User engagement metrics should display correctly

**What's NOT tested**:

- Large numbers (1000+) are formatted with commas in E2E context
- Like count displays with heart icon
- View count displays with eye icon
- Stats are visible and readable in light/dark mode
- Stats render correctly on mobile (responsive)
- Stats update if featured bobblehead changes
- Stats don't overflow or cause layout issues

**Scenario Requirements**:

```gherkin
Feature: Featured Bobblehead Stats Display
  Scenario: Stats display with correct formatting
    Given I'm on the home page
    When featured bobblehead card is visible
    Then like count should be displayed with proper formatting
    And view count should be displayed with proper formatting
    And large numbers should use commas (e.g., 1,234 not 1234)
    And heart icon should be visible before like count
    And eye icon should be visible before view count

  Scenario: Stats display correctly on mobile
    Given I'm viewing the home page on mobile (375px width)
    When featured bobblehead card is visible
    Then stats should be readable without horizontal scrolling
    And icons should not overflow
    And text should wrap appropriately

  Scenario: Stats display correctly in dark mode
    Given I'm on the home page in dark mode
    When featured bobblehead card is visible
    Then stats should be visible and readable
    And text should have sufficient contrast
    And icons should be visible
```

**Estimated Tests**: 2 E2E tests

---

#### Gap 6: Editor's Pick Badge

**Status**: Not tested in E2E
**Risk**: Medium - Badge identifies featured content type

**What's NOT tested**:

- Editor's Pick badge renders on featured bobblehead card
- Badge displays "Editor's Pick" text
- Crown icon renders next to badge text
- Badge styling is correct (variant='editor_pick')
- Badge is positioned correctly on card
- Badge visibility in different screen sizes

**Scenario Requirements**:

```gherkin
Feature: Editor's Pick Badge
  Scenario: Editor's Pick badge displays on featured bobblehead
    Given I'm on the home page
    When featured bobblehead card is visible
    Then "Editor's Pick" badge should be visible
    And crown icon should display next to badge text
    And badge should have distinctive styling/color

  Scenario: Badge position and layout
    Given I'm on the home page
    When featured bobblehead card is visible
    Then badge should be positioned in the bottom-left of the card
    And badge should not overlap with title or stats
```

**Estimated Tests**: 1-2 E2E tests

---

### High Priority Gaps

#### Gap 7: Featured Bobblehead Description Text

**Status**: Not tested in E2E
**Risk**: Medium - Description provides context for featured bobblehead

**What's NOT tested**:

- Description text renders when available
- Description text is hidden when null/empty
- Description positioning and styling
- Description text is readable and not truncated
- Description renders correctly with long text

**Estimated Tests**: 1 E2E test

---

#### Gap 8: Hero Section Layout and Responsive Design

**Status**: Partially tested (section visible, but not layout)
**Risk**: Medium - Grid layout breaks on responsive sizes

**What's NOT tested**:

- Featured bobblehead renders on right side of grid on desktop
- Featured bobblehead stacks below text on tablet/mobile
- Featured bobblehead image aspect ratio maintains on resize
- Hero section 2-column grid layout on desktop (lg breakpoint)
- Hero section single-column layout on mobile
- Gap spacing between content and featured card

**Scenario Requirements**:

```gherkin
Feature: Hero Section Responsive Layout
  Scenario: Featured bobblehead renders in correct grid position on desktop
    Given I'm on the home page at desktop width (1024px+)
    When the page loads
    Then featured bobblehead should be on the right side
    And text content should be on the left side
    And there should be visible gap between them
    And both should be roughly equal width

  Scenario: Featured bobblehead stacks on mobile
    Given I'm on the home page at mobile width (375px)
    When the page loads
    Then featured bobblehead should stack below text
    And featured bobblehead should be full width
    And layout should not overflow horizontally

  Scenario: Featured bobblehead image aspect ratio maintained
    Given I'm on the home page at various widths
    When featured bobblehead card is visible
    Then image should maintain square aspect ratio
    And image should not stretch or distort
```

**Estimated Tests**: 2-3 E2E tests

---

#### Gap 9: Cross-Browser Visual Consistency

**Status**: Not tested in E2E
**Risk**: Medium - Visual issues in specific browsers

**What's NOT tested**:

- Featured bobblehead renders consistently across browsers
- Image loading works in all browsers
- Gradient overlays display correctly
- Animations work smoothly
- Dark mode styling works in all browsers
- Responsive layout works across browsers

**Estimated Tests**: 0 (requires playwright browser matrix, not recommended for sprint)

---

### Medium Priority Gaps

#### Gap 10: Authentication State Difference

**Status**: Partially tested
**Risk**: Medium - Featured bobblehead should render identically for auth/unauth users

**What's NOT tested**:

- Featured bobblehead renders identically for authenticated and unauthenticated users
- Featured bobblehead click-through works for both states
- Featured bobblehead doesn't show private/user-specific data

**Estimated Tests**: 1 E2E test

---

#### Gap 11: Image Loading Performance

**Status**: Not tested in E2E
**Risk**: Low-Medium - Performance perception affects UX

**What's NOT tested**:

- Featured bobblehead image loads within reasonable time
- Blur placeholder displays before image fully loads
- Image dimensions and alt text are correct
- Cloudinary transformation is applied correctly
- Image doesn't cause layout shift (CLS)

**Estimated Tests**: 1 E2E test

---

#### Gap 12: Page Scroll and Viewport Positioning

**Status**: Not tested in E2E
**Risk**: Low - User should see featured bobblehead on initial page load

**What's NOT tested**:

- Featured bobblehead is visible in initial viewport (no scroll needed)
- Featured bobblehead visibility on different screen heights
- Scroll position doesn't cause featured bobblehead to be cut off

**Estimated Tests**: 1 E2E test

---

## Coverage Matrix

| Source File                                                               | Current E2E Coverage              | Gap Status | Priority |
| ------------------------------------------------------------------------- | --------------------------------- | ---------- | -------- |
| `src/app/(app)/(home)/page.tsx`                                           | Partial (section visibility)      | Partial    | N/A      |
| `src/app/(app)/(home)/components/sections/hero-section.tsx`               | Partial (section visibility)      | Partial    | High     |
| `src/app/(app)/(home)/components/display/featured-bobblehead-display.tsx` | None                              | Critical   | Critical |
| `src/app/(app)/(home)/components/async/featured-bobblehead-async.tsx`     | Partial (loading state)           | Partial    | High     |
| `src/lib/facades/featured-content/featured-content.facade.ts`             | Integration tests exist (not E2E) | N/A        | N/A      |
| `src/lib/queries/featured-content/featured-content-query.ts`              | Integration tests exist (not E2E) | N/A        | N/A      |

---

## Test Infrastructure Available

### Page Object Enhancements Needed

**Current locators** in `tests/e2e/pages/home.page.ts`:

```typescript
heroSection; // Container
platformStats; // Stats display
```

**Recommended new locators** for featured bobblehead testing:

```typescript
// Featured Bobblehead Locators
get featuredBobbleheadCard(): Locator {
  return this.byTestId('feature-bobblehead-card-card');
}

get featuredBobbleheadImage(): Locator {
  return this.byTestId('feature-bobblehead-card-image');
}

get featuredBobbleheadBadge(): Locator {
  return this.byTestId('feature-bobblehead-card-badge');
}

get featuredBobbleheadTitle(): Locator {
  return this.heroSection.getByRole('heading', { level: 3 });
}

get featuredBobbleheadLikes(): Locator {
  return this.heroSection.getByText(/\d+/, { selector: 'span' }).first();
}

get featuredBobbleheadViews(): Locator {
  return this.heroSection.getByText(/\d+/, { selector: 'span' }).last();
}

get featuredBobbleheadLink(): Locator {
  return this.byTestId('feature-bobblehead-card-card');
}

get featuredBobbleheadTopRatedCard(): Locator {
  return this.byTestId('feature-bobblehead-card-top-rated-card');
}

get featuredBobbleheadValueGrowthCard(): Locator {
  return this.byTestId('feature-bobblehead-card-value-growth-card');
}
```

### Test Fixtures and Data

**Available factories** in `tests/fixtures/`:

- `featured-content.factory.ts` - createTestFeaturedBobbleheadContent()
- `bobblehead.factory.ts` - createTestBobblehead()
- `collection.factory.ts` - createTestCollection()
- `user.factory.ts` - createTestUser()

These can be used to set up test data before E2E tests run.

### MSW Mocks

**Current mocks** available:

- API mocks in `tests/mocks/` can intercept featured content API calls if needed

---

## Recommended Test Implementation Order

### Phase 1: Critical User Path (Week 1)

**Priority**: Must have for user satisfaction
**Tests**: 5-6 tests
**Effort**: 2-3 hours

1. Featured bobblehead card visibility (render, image, title)
2. Featured bobblehead click-through navigation
3. Featured bobblehead link accessibility (keyboard nav)
4. Stats display and formatting
5. Loading state displays skeleton

### Phase 2: Visual and Interaction Details (Week 2)

**Priority**: Important for feature completeness
**Tests**: 5-6 tests
**Effort**: 2-3 hours

6. Floating cards render (Top Rated, Value Growth)
7. Editor's Pick badge visibility
8. Featured bobblehead image alt text and loading
9. Description text display/hide
10. Responsive layout (desktop vs mobile)

### Phase 3: Edge Cases and Error Handling (Week 3)

**Priority**: Robustness and reliability
**Tests**: 4-5 tests
**Effort**: 2-3 hours

11. No featured bobblehead (null state)
12. Error boundary handling
13. Auth state consistency (auth vs unauth)
14. Scroll and viewport positioning
15. Performance (image load time)

---

## Specific Test Scenarios to Implement

### Test 1: Featured Bobblehead Card Renders in Hero

```typescript
test('should render featured bobblehead card in hero section', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for async component to load
  await page.waitForTimeout(2000);

  // Verify featured bobblehead card is visible
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible();

  // Verify image loads
  const image = homePage.featuredBobbleheadImage;
  await expect(image).toBeVisible();

  // Verify title displays
  const title = homePage.featuredBobbleheadTitle;
  await expect(title).toBeVisible();

  // Verify editor's pick badge
  const badge = homePage.featuredBobbleheadBadge;
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("Editor's Pick");
});
```

### Test 2: Featured Bobblehead Navigation

```typescript
test('should navigate to bobblehead detail page when clicking featured card', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for async component to load
  await page.waitForTimeout(2000);

  const featuredCard = homePage.featuredBobbleheadCard;

  // Listen for navigation
  await Promise.all([page.waitForURL(/\/bobbleheads\/[^/]+/), featuredCard.click()]);

  // Verify URL changed
  expect(page.url()).toMatch(/\/bobbleheads\//);
});
```

### Test 3: Featured Bobblehead Loading State

```typescript
test('should display skeleton while loading featured bobblehead', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Initially skeleton should be visible or loading state
  const skeleton = page.getByTestId('ui-skeleton-hero-featured-bobblehead');

  // Either skeleton is visible initially, or it loads immediately
  // Verify final state shows real content
  await page.waitForTimeout(2000);

  const featuredCard = page.getByTestId('feature-bobblehead-card-card');
  await expect(featuredCard).toBeVisible();
});
```

### Test 4: Floating Cards Render

```typescript
test('should render floating cards on featured bobblehead', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await page.waitForTimeout(2000);

  // Verify Top Rated card
  const topRatedCard = homePage.featuredBobbleheadTopRatedCard;
  await expect(topRatedCard).toBeVisible();
  await expect(page.getByText('Top Rated')).toBeVisible();
  await expect(page.getByText('This Week')).toBeVisible();

  // Verify Value Growth card
  const valueCard = homePage.featuredBobbleheadValueGrowthCard;
  await expect(valueCard).toBeVisible();
  await expect(page.getByText('+23%')).toBeVisible();
  await expect(page.getByText('Value Growth')).toBeVisible();
});
```

### Test 5: Stats Display and Formatting

```typescript
test('should display formatted stats with icons', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  await page.waitForTimeout(2000);

  // Verify stats are visible with commas
  const stats = page.locator('[data-slot="hero-featured-image"]').locator('..').locator('text=/[0-9,]+/');

  // Should have formatted numbers (with commas for thousands)
  const likeText = page.locator('text=/❤️|♥/').first();
  const viewText = page.locator('text=/👁️|[0-9]+/').last();

  await expect(likeText).toBeVisible();
  await expect(viewText).toBeVisible();
});
```

### Test 6: Responsive Layout

```typescript
test('should display featured bobblehead in correct grid position on desktop', async ({ page }) => {
  // Set desktop viewport
  await page.setViewportSize({ width: 1280, height: 800 });

  const homePage = new HomePage(page);
  await homePage.goto();

  await page.waitForTimeout(2000);

  const heroSection = homePage.heroSection;
  const featuredCard = homePage.featuredBobbleheadCard;

  // Verify featured card is visible and positioned
  await expect(featuredCard).toBeVisible();

  // Verify it's in a 2-column layout (right side)
  const boundingBox = await featuredCard.boundingBox();
  const sectionBox = await heroSection.boundingBox();

  // Featured card should be roughly on right half of section
  expect(boundingBox?.x || 0).toBeGreaterThan((sectionBox?.width || 0) / 3);
});

test('should stack featured bobblehead on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  const homePage = new HomePage(page);
  await homePage.goto();

  await page.waitForTimeout(2000);

  const featuredCard = homePage.featuredBobbleheadCard;

  // Verify card is visible and takes full width on mobile
  await expect(featuredCard).toBeVisible();

  const boundingBox = await featuredCard.boundingBox();
  const viewportWidth = page.viewportSize()?.width || 375;

  // Card should be roughly full width (minus padding)
  expect((boundingBox?.width || 0) / viewportWidth).toBeGreaterThan(0.8);
});
```

### Test 7: Authentication State Consistency

```typescript
test('should render featured bobblehead identically for authenticated user', async ({
  userPage,
  userFinder,
}) => {
  const homePage = new HomePage(userPage);
  await homePage.goto();

  await userPage.waitForTimeout(2000);

  // Verify featured bobblehead renders for authenticated user
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible();

  // Verify it renders the same content
  const title = homePage.featuredBobbleheadTitle;
  await expect(title).toBeVisible();

  const image = homePage.featuredBobbleheadImage;
  await expect(image).toBeVisible();
});
```

### Test 8: No Featured Bobblehead Graceful Handling

```typescript
test('should handle missing featured bobblehead gracefully', async ({ page }) => {
  // This test assumes database can be seeded with no featured bobblehead
  // Or we intercept the API to return empty

  const homePage = new HomePage(page);
  await homePage.goto();

  await page.waitForTimeout(2000);

  // Page should load without errors
  await expect(page).toHaveTitle(/Head Shakers/i);

  // Hero buttons should still be visible
  const startCollectionButton = page.getByRole('button', { name: /start your collection/i });
  await expect(startCollectionButton).toBeVisible();

  // Featured bobblehead card may not be present, and that's OK
});
```

---

## Gap Summary Table

| Gap # | Category    | Description                         | Priority | Estimated Tests | Status     |
| ----- | ----------- | ----------------------------------- | -------- | --------------- | ---------- |
| 1     | Visibility  | Featured bobblehead card rendering  | Critical | 3               | NOT TESTED |
| 2     | Navigation  | Featured bobblehead click-through   | Critical | 3               | NOT TESTED |
| 3     | Visual      | Floating cards animation/display    | High     | 2               | NOT TESTED |
| 4     | UX          | Loading states and skeletons        | Critical | 3-4             | PARTIAL    |
| 5     | Display     | Stats formatting and icons          | High     | 2               | NOT TESTED |
| 6     | Visual      | Editor's Pick badge                 | High     | 2               | NOT TESTED |
| 7     | Display     | Description text render/hide        | Medium   | 1               | NOT TESTED |
| 8     | Responsive  | Layout breakpoints (desktop/mobile) | High     | 3               | NOT TESTED |
| 9     | Browser     | Cross-browser compatibility         | Medium   | 0\*             | NOT TESTED |
| 10    | Auth        | Authentication state consistency    | Medium   | 1               | NOT TESTED |
| 11    | Performance | Image loading and CLS               | Medium   | 1               | NOT TESTED |
| 12    | UX          | Scroll and viewport positioning     | Low      | 1               | NOT TESTED |

\*Browser testing deferred - requires setup.

---

## Implementation Roadmap

### Immediate Actions (Before Implementation)

1. **Add Page Object Locators**
   - Update `tests/e2e/pages/home.page.ts` with featured bobblehead-specific getters
   - Test locators against real featured bobblehead data

2. **Verify Test Data Setup**
   - Confirm featured-content.factory.ts works with E2E setup
   - Ensure test database has featured bobblehead fixture

3. **Review Existing Component Tests**
   - Reference `tests/components/home/display/featured-bobblehead-display.test.tsx` for test patterns
   - Ensure E2E tests complement (not duplicate) component tests

### Implementation Phase (Week 1-3)

1. **Create E2E test file** at `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`
2. **Implement tests** following phase breakdown (Critical → High → Medium)
3. **Test against** both public and authenticated contexts
4. **Validate** responsive behavior on multiple breakpoints
5. **Handle** edge cases (null featured bobblehead, loading errors)

### Validation and Rollout

1. Run full E2E suite to verify no regressions
2. Verify tests pass on CI/CD pipeline
3. Document any environment-specific setup needs
4. Review test coverage with team

---

## Key Testing Considerations

### Async Component Timing

Featured bobblehead is fetched server-side via `FeaturedBobbleheadAsync`:

```typescript
<Suspense fallback={<FeaturedBobbleheadSkeleton />}>
  <FeaturedBobbleheadAsync />
</Suspense>
```

Tests must:

- Wait for async data to load (use `page.waitForTimeout(2000)` or wait for specific element)
- Handle skeleton display during initial load
- Verify final content renders after async completes

### Caching Behavior

Featured bobblehead uses Redis caching (via `CacheService.featured.featuredBobblehead`):

```typescript
static async getFeaturedBobbleheadAsync(dbInstance: DatabaseExecutor = db): Promise<FeaturedBobblehead | null> {
  return executeFacadeOperation(
    { facade, method: 'getFeaturedBobbleheadAsync', ... },
    async () => {
      return await CacheService.featured.featuredBobblehead(
        async () => {
          const context = this.getPublicContext(dbInstance);
          return await FeaturedContentQuery.getFeaturedBobbleheadAsync(context);
        },
        ...
      );
    },
  );
}
```

E2E tests don't need to worry about cache - they test actual rendered output.

### Database Filtering

Query filters featured bobbleheads by:

- `isActive = true`
- `contentType = 'bobblehead'`
- Date range validation (startDate, endDate)
- Ordering by priority DESC, createdAt DESC
- Limit 1 result

Test fixtures should use `createTestFeaturedBobbleheadContent()` with appropriate flags.

### Responsive Design

Hero section uses:

- Desktop (lg breakpoint, 1024px+): 2-column grid layout
- Mobile/Tablet (< 1024px): Stack vertically

Tests should verify both layouts with `setViewportSize()`.

---

## Conclusion

The featured bobblehead section on the home page has significant E2E test coverage gaps. While existing tests verify basic hero section visibility, they don't test:

1. **Featured bobblehead card rendering** and visibility
2. **Navigation interaction** (click-through)
3. **Stats and badge display**
4. **Loading states and error handling**
5. **Responsive layout** across screen sizes
6. **Visual elements** (floating cards, badges)

Implementing the recommended 15-18 E2E tests across critical, high, and medium priorities will ensure the featured bobblehead section works correctly across different user scenarios, devices, and authentication states.

**Estimated Total Effort**: 6-9 hours across 3 weeks
**Risk of Current State**: High - Critical user path (featured bobblehead display and navigation) is largely untested in E2E
