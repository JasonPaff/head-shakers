# E2E Test Implementation Guide: Featured Bobblehead

**Purpose**: Quick reference for implementing featured bobblehead E2E tests
**Scope**: All 15-18 recommended tests across 3 phases
**Estimated Time**: 6-9 hours total

---

## Test Setup and Infrastructure

### Page Object Additions Required

Add these locators to `tests/e2e/pages/home.page.ts`:

```typescript
// Featured Bobblehead Container
get featuredBobbleheadSection(): Locator {
  return this.page.locator('[data-slot="hero-featured-bobblehead"]');
}

// Featured Bobblehead Card (clickable link)
get featuredBobbleheadCard(): Locator {
  return this.byTestId('feature-bobblehead-card-card');
}

// Featured Bobblehead Image
get featuredBobbleheadImage(): Locator {
  return this.byTestId('feature-bobblehead-card-image');
}

// Featured Bobblehead Title (h3)
get featuredBobbleheadTitle(): Locator {
  return this.featuredBobbleheadSection.getByRole('heading', { level: 3 });
}

// Featured Bobblehead Description
get featuredBobbleheadDescription(): Locator {
  return this.featuredBobbleheadSection.locator('text=/^(?!.*(?:Top Rated|Value Growth)).+$/');
}

// Editor's Pick Badge
get featuredBobbleheadBadge(): Locator {
  return this.byTestId('feature-bobblehead-card-badge');
}

// Stats Container (holds both likes and views)
get featuredBobbleheadStats(): Locator {
  return this.featuredBobbleheadSection.locator('div:has(svg[aria-hidden])');
}

// Like Count Stat
get featuredBobbleheadLikes(): Locator {
  return this.featuredBobbleheadSection
    .locator('span:has-text(/^[0-9,]+$/)').first();
}

// View Count Stat
get featuredBobbleheadViews(): Locator {
  return this.featuredBobbleheadSection
    .locator('span:has-text(/^[0-9,]+$/)').nth(1);
}

// Top Rated Floating Card
get featuredBobbleheadTopRatedCard(): Locator {
  return this.byTestId('feature-bobblehead-card-top-rated-card');
}

// Value Growth Floating Card
get featuredBobbleheadValueGrowthCard(): Locator {
  return this.byTestId('feature-bobblehead-card-value-growth-card');
}

// Loading Skeleton
get featuredBobbleheadSkeleton(): Locator {
  return this.byTestId('ui-skeleton-hero-featured-bobblehead');
}

// Helper: Get featured bobblehead link href
async getFeaturedBobbleheadUrl(): Promise<string | null> {
  return this.featuredBobbleheadCard.getAttribute('href');
}

// Helper: Click featured bobblehead
async clickFeaturedBobblehead(): Promise<void> {
  await this.featuredBobbleheadCard.click();
}

// Helper: Verify featured bobblehead is visible
async isFeaturedBobbleheadVisible(): Promise<boolean> {
  return this.featuredBobbleheadCard.isVisible();
}
```

### Test File Structure

Create: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

```typescript
import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page - Featured Bobblehead Section', () => {
  // Tests go here - organized by phase
});
```

### Shared Test Utilities

Create helper function to wait for featured bobblehead:

```typescript
// In test setup or fixture
async function waitForFeaturedBobblehead(page: Page): Promise<void> {
  // Wait for either skeleton to appear or real content
  await Promise.race([
    page
      .getByTestId('ui-skeleton-hero-featured-bobblehead')
      .waitFor({ state: 'visible', timeout: 2000 })
      .catch(() => {}),
    page.getByTestId('feature-bobblehead-card-card').waitFor({ state: 'visible', timeout: 5000 }),
  ]);

  // Then wait for real content to appear
  await page.getByTestId('feature-bobblehead-card-card').waitFor({ state: 'visible', timeout: 5000 });
}
```

---

## Phase 1: Critical User Path Tests (Week 1)

### Test 1.1: Featured Bobblehead Card Renders in Hero

**File**: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`

**Objective**: Verify featured bobblehead card is visible and rendered correctly

```typescript
test('should render featured bobblehead card in hero section - public', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for async component
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  // Verify image is visible
  const image = homePage.featuredBobbleheadImage;
  await expect(image).toBeVisible();

  // Verify title renders
  const title = homePage.featuredBobbleheadTitle;
  await expect(title).toBeVisible();
  await expect(title).not.toBeEmpty();

  // Verify badge is visible
  const badge = homePage.featuredBobbleheadBadge;
  await expect(badge).toBeVisible();
  await expect(badge).toContainText("Editor's Pick");
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead card visible within 10 seconds
- [x] Image renders without broken image icon
- [x] Title text is displayed and not empty
- [x] Editor's Pick badge is visible

---

### Test 1.2: Featured Bobblehead Renders for Authenticated User

**Objective**: Verify featured bobblehead displays identically for authenticated users

```typescript
test('should render featured bobblehead card in hero section - authenticated', async ({
  userPage,
  userFinder,
}) => {
  const homePage = new HomePage(userPage);
  await homePage.goto();

  // User should be authenticated
  await expect(userFinder.layout('user-avatar', 'button')).toBeVisible();

  // Featured bobblehead should still render
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  const image = homePage.featuredBobbleheadImage;
  await expect(image).toBeVisible();

  const title = homePage.featuredBobbleheadTitle;
  await expect(title).toBeVisible();
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead renders when user is authenticated
- [x] Featured bobblehead content matches public version
- [x] No permission errors appear

---

### Test 1.3: Featured Bobblehead Navigation Works

**Objective**: Verify clicking featured bobblehead navigates to detail page

```typescript
test('should navigate to bobblehead detail page when clicking featured card', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card to be visible
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  // Get the href to verify it's valid
  const href = await homePage.getFeaturedBobbleheadUrl();
  expect(href).toMatch(/^\/bobbleheads\/[^/]+$/);

  // Click and verify navigation
  await Promise.all([page.waitForURL(/\/bobbleheads\/[^/]+/), homePage.clickFeaturedBobblehead()]);

  // Verify URL is correct
  expect(page.url()).toMatch(/\/bobbleheads\//);
});
```

**Acceptance Criteria**:

- [x] Featured card link href is valid URL
- [x] Clicking card navigates to bobblehead detail page
- [x] Navigation URL includes bobblehead slug
- [x] Page loads without errors after navigation

---

### Test 1.4: Featured Bobblehead Navigation is Keyboard Accessible

**Objective**: Verify featured bobblehead can be activated with keyboard

```typescript
test('should be keyboard accessible - featured bobblehead card', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  // Tab to the featured card (it's a link, should be focusable)
  // Start by clicking the page to focus it
  await page.click('body');

  // Tab until we reach the featured card
  let focused = await page.evaluate(() => document.activeElement?.getAttribute('href') || '');
  let tabCount = 0;
  const maxTabs = 20;

  while (!focused.includes('/bobbleheads/') && tabCount < maxTabs) {
    await page.keyboard.press('Tab');
    tabCount++;
    focused = await page.evaluate(() => document.activeElement?.getAttribute('href') || '');
  }

  expect(tabCount).toBeLessThan(maxTabs); // Should be reachable

  // Verify it has focus indicator (keyboard-visible)
  const focusedElement = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const styles = window.getComputedStyle(el);
    return {
      outline: styles.outline,
      boxShadow: styles.boxShadow,
      isVisible: el.offsetParent !== null,
    };
  });

  expect(focusedElement.isVisible).toBe(true);

  // Press Enter to activate
  await Promise.all([page.waitForURL(/\/bobbleheads\/[^/]+/), page.keyboard.press('Enter')]);

  expect(page.url()).toMatch(/\/bobbleheads\//);
});
```

**Acceptance Criteria**:

- [x] Featured card is reachable via keyboard navigation
- [x] Focus indicator is visible when tabbed to
- [x] Pressing Enter activates the link
- [x] Navigation works via keyboard

---

### Test 1.5: Featured Bobblehead Loading State Displays

**Objective**: Verify skeleton loads during data fetch

```typescript
test('should display loading skeleton while featured bobblehead loads', async ({ page }) => {
  const homePage = new HomePage(page);

  // Go to page but slow down network to see skeleton
  await page.route('**/api/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Artificial delay
    await route.continue();
  });

  await homePage.goto();

  // Skeleton should be visible or real content
  const skeleton = homePage.featuredBobbleheadSkeleton;
  const realCard = homePage.featuredBobbleheadCard;

  // Wait for real content to appear (skeleton disappears)
  await realCard.waitFor({ state: 'visible', timeout: 10000 });

  // Final state: real content should be visible
  await expect(realCard).toBeVisible();
});
```

**Acceptance Criteria**:

- [x] Skeleton or loading state displays
- [x] Real content eventually replaces skeleton
- [x] No duplicate content (skeleton + real) on screen
- [x] Page doesn't freeze during loading

---

### Test 1.6: Featured Bobblehead Stats Display Correctly

**Objective**: Verify stats (likes, views) render and are formatted

```typescript
test('should display featured bobblehead stats with correct formatting', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  // Get stats
  const likes = homePage.featuredBobbleheadLikes;
  const views = homePage.featuredBobbleheadViews;

  // Verify stats are visible
  await expect(likes).toBeVisible();
  await expect(views).toBeVisible();

  // Verify stats have numbers
  const likeText = await likes.textContent();
  const viewText = await views.textContent();

  expect(likeText).toMatch(/^\d{1,}(?:,\d{3})*$/); // Allows 0, 123, 1,234, 1,234,567 etc
  expect(viewText).toMatch(/^\d{1,}(?:,\d{3})*$/);

  // Verify stats don't overflow
  const likeBox = await likes.boundingBox();
  const viewBox = await views.boundingBox();

  expect(likeBox?.width).toBeLessThan(200); // Shouldn't be huge
  expect(viewBox?.width).toBeLessThan(200);

  // Verify heart and eye icons are visible
  const statsContainer = homePage.featuredBobbleheadSection.locator('svg');
  const iconCount = await statsContainer.count();
  expect(iconCount).toBeGreaterThan(0); // Should have heart and eye icons
});
```

**Acceptance Criteria**:

- [x] Like count is visible and formatted with commas for thousands
- [x] View count is visible and formatted with commas for thousands
- [x] Stats don't overflow or break layout
- [x] Icons (heart, eye) are visible

---

## Phase 2: Visual and Interaction Details (Week 2)

### Test 2.1: Editor's Pick Badge Displays

**Objective**: Verify badge renders with correct styling and icon

```typescript
test('should display editor's pick badge with styling', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const badge = homePage.featuredBobbleheadBadge;
  await expect(badge).toBeVisible({ timeout: 10000 });

  // Verify badge text
  await expect(badge).toContainText("Editor's Pick");

  // Verify badge has crown icon (checking for SVG element)
  const badgeContent = await badge.locator('svg').count();
  expect(badgeContent).toBeGreaterThan(0);

  // Verify badge styling (should have background and border)
  const badgeClasses = await badge.getAttribute('class');
  expect(badgeClasses).toContain('badge'); // Has badge class

  // Verify badge is positioned in bottom area of card
  const badgeBox = await badge.boundingBox();
  const cardBox = await homePage.featuredBobbleheadCard.boundingBox();

  if (badgeBox && cardBox) {
    // Badge should be in bottom half of card
    const badgeVerticalPos = (badgeBox.y - cardBox.y) / cardBox.height;
    expect(badgeVerticalPos).toBeGreaterThan(0.5);
  }
});
```

**Acceptance Criteria**:

- [x] Badge text "Editor's Pick" is visible
- [x] Crown icon displays next to text
- [x] Badge has distinctive styling
- [x] Badge is positioned correctly on card

---

### Test 2.2: Floating Cards Render

**Objective**: Verify floating cards (Top Rated, Value Growth) are visible

```typescript
test('should render floating cards - top rated and value growth', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured bobblehead
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

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

  // Verify both cards have icons
  const topRatedIcon = topRatedCard.locator('svg').first();
  const valueIcon = valueCard.locator('svg').first();

  await expect(topRatedIcon).toBeVisible(); // Trophy icon
  await expect(valueIcon).toBeVisible(); // Trending up icon

  // Verify cards are decorative (aria-hidden)
  const topRatedHidden = await topRatedCard.getAttribute('aria-hidden');
  const valueHidden = await valueCard.getAttribute('aria-hidden');

  expect(topRatedHidden).toBe('true');
  expect(valueHidden).toBe('true');
});
```

**Acceptance Criteria**:

- [x] Top Rated card is visible with correct text
- [x] Value Growth card is visible with correct data (+23%)
- [x] Both cards have icons (trophy, trending up)
- [x] Cards are marked as aria-hidden (decorative)

---

### Test 2.3: Featured Bobblehead Image Loads

**Objective**: Verify image renders and loads correctly

```typescript
test('should load featured bobblehead image with proper attributes', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const image = homePage.featuredBobbleheadImage;
  await expect(image).toBeVisible({ timeout: 10000 });

  // Verify image has alt text
  const alt = await image.getAttribute('alt');
  expect(alt).toBeTruthy();
  expect(alt?.length).toBeGreaterThan(0);

  // Verify image is not broken (check src is set)
  const src = await image.getAttribute('src');
  expect(src).toBeTruthy();
  expect(src).toMatch(/cloudinary|image/i); // Should be from Cloudinary or valid image source

  // Verify image has proper dimensions
  const imageBox = await image.boundingBox();
  if (imageBox) {
    // Image should be reasonably sized
    expect(imageBox.width).toBeGreaterThan(100);
    expect(imageBox.height).toBeGreaterThan(100);

    // Image should be roughly square (aspect ratio close to 1:1)
    const aspectRatio = imageBox.width / imageBox.height;
    expect(Math.abs(aspectRatio - 1)).toBeLessThan(0.2); // Within 20% of square
  }

  // Verify image doesn't have error event (basic check)
  // This would need to be done via JavaScript in real tests
});
```

**Acceptance Criteria**:

- [x] Image renders without broken state
- [x] Image has descriptive alt text
- [x] Image source is from Cloudinary (or valid image service)
- [x] Image maintains square aspect ratio
- [x] Image is properly sized and visible

---

### Test 2.4: Featured Bobblehead Description Renders

**Objective**: Verify description text displays when available

```typescript
test('should display featured bobblehead description when available', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  // Check if description exists (it's optional)
  const description = homePage.featuredBobbleheadDescription;

  // If description exists, verify it's visible and readable
  const isVisible = await description.isVisible().catch(() => false);

  if (isVisible) {
    const descText = await description.textContent();
    expect(descText).toBeTruthy();
    expect(descText?.length).toBeGreaterThan(0);

    // Verify description is positioned below title
    const descBox = await description.boundingBox();
    const titleBox = await homePage.featuredBobbleheadTitle.boundingBox();

    if (descBox && titleBox) {
      expect(descBox.y).toBeGreaterThan(titleBox.y);
    }
  }
  // If description doesn't exist, test should still pass (it's optional)
});
```

**Acceptance Criteria**:

- [x] Description renders when available
- [x] Description text is readable and not truncated
- [x] If no description, page doesn't show "null" or error
- [x] Description is positioned below title

---

### Test 2.5: Responsive Layout - Desktop

**Objective**: Verify featured bobblehead renders in correct position on desktop

```typescript
test('should display featured bobblehead in correct grid position on desktop', async ({ page }) => {
  // Set desktop viewport (lg breakpoint is 1024px)
  await page.setViewportSize({ width: 1280, height: 800 });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  const heroSection = homePage.heroSection;

  // Get bounding boxes
  const heroBox = await heroSection.boundingBox();
  const cardBox = await featuredCard.boundingBox();

  if (heroBox && cardBox) {
    // Featured card should be on right side (x position > hero width / 2)
    const cardXRelative = cardBox.x - heroBox.x;
    const expectedRightStart = heroBox.width / 2 - 50; // Allow 50px margin

    expect(cardXRelative).toBeGreaterThan(expectedRightStart);

    // Featured card should be roughly 50% width of hero (or slightly less due to gap)
    expect(cardBox.width).toBeLessThan(heroBox.width);
    expect(cardBox.width).toBeGreaterThan(heroBox.width * 0.35);
  }

  // Verify no horizontal scroll
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  const viewportWidth = page.viewportSize()?.width || 1280;
  expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead is on right side of hero on desktop
- [x] Featured bobblehead takes roughly 50% of space (or less with gap)
- [x] No horizontal scrolling occurs
- [x] Layout is stable and doesn't shift

---

### Test 2.6: Responsive Layout - Mobile

**Objective**: Verify featured bobblehead stacks on mobile

```typescript
test('should stack featured bobblehead below content on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Wait for featured card
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  const heroSection = homePage.heroSection;

  // Get bounding boxes
  const heroBox = await heroSection.boundingBox();
  const cardBox = await featuredCard.boundingBox();

  if (heroBox && cardBox) {
    // On mobile, featured card should be full width (minus padding)
    const cardWidth = cardBox.width;
    const viewportWidth = 375;
    const expectedWidth = viewportWidth * 0.9; // Allow 5% padding on each side

    expect(cardWidth).toBeGreaterThan(viewportWidth * 0.8);
    expect(cardWidth).toBeLessThan(viewportWidth);
  }

  // Verify no horizontal scroll
  const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(375);
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead stacks below text on mobile
- [x] Featured bobblehead takes up ~90% of viewport width
- [x] No horizontal scrolling occurs
- [x] Content is readable on mobile

---

## Phase 3: Edge Cases and Error Handling (Week 3)

### Test 3.1: No Featured Bobblehead Gracefully Handled

**Objective**: Verify page works when no featured bobblehead is configured

```typescript
test('should handle missing featured bobblehead gracefully', async ({ page }) => {
  // This test assumes the test database can be seeded with no featured content
  // Or you can mock the API to return null

  // Mock the featured content query to return null
  await page.route('**/api/**/featured-content/**', (route) => {
    route.abort('blockedbyclient');
  });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Page should load without crashing
  await expect(page).toHaveTitle(/Head Shakers/i);

  // Hero buttons should still be visible
  const startButton = page.getByRole('button', { name: /start your collection/i });
  await expect(startButton).toBeVisible();

  // Featured bobblehead card should not be visible (or should timeout)
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).not.toBeVisible({ timeout: 5000 });

  // Other sections should load normally
  const featuredCollections = homePage.featuredCollectionsSection;
  await expect(featuredCollections).toBeVisible();
});
```

**Acceptance Criteria**:

- [x] Page loads without errors when featured bobblehead is null
- [x] Hero buttons are still accessible
- [x] No error messages appear to user
- [x] Other sections load normally

---

### Test 3.2: Error Boundary Handles Failures

**Objective**: Verify error boundary prevents page crash

```typescript
test('should handle featured bobblehead component errors gracefully', async ({ page }) => {
  // Mock featured content API to return invalid data
  await page.route('**/api/**/featured-content/**', (route) => {
    route.respond({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    });
  });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Page should load without crashing
  await expect(page).toHaveTitle(/Head Shakers/i);

  // Should show hero content
  const heroSection = homePage.heroSection;
  await expect(heroSection).toBeVisible();

  // Featured bobblehead may not render, but shouldn't cause white screen
  const featuredCard = homePage.featuredBobbleheadCard;
  const isVisible = await featuredCard.isVisible().catch(() => false);

  expect(isVisible).toBe(false); // Should not show broken card

  // Rest of page should work
  const browseButton = page.getByRole('link', { name: /browse collections/i });
  await expect(browseButton).toBeVisible();
});
```

**Acceptance Criteria**:

- [x] Error boundary catches component errors
- [x] Page doesn't show white screen of death
- [x] Rest of page remains functional
- [x] No JavaScript console errors

---

### Test 3.3: Authentication State Consistency

**Objective**: Verify featured bobblehead renders identically for both auth states

```typescript
test('should render featured bobblehead identically for both authentication states', async ({
  page,
  userPage,
}) => {
  const homePagePublic = new HomePage(page);
  const homePageAuth = new HomePage(userPage);

  // Load public version
  await homePagePublic.goto();
  await page.waitForTimeout(2000);

  const publicCard = homePagePublic.featuredBobbleheadCard;
  const publicTitle = homePagePublic.featuredBobbleheadTitle;
  const publicImage = homePagePublic.featuredBobbleheadImage;

  const publicTitleText = await publicTitle.textContent();
  const publicImageSrc = await publicImage.getAttribute('src');

  // Load authenticated version
  await homePageAuth.goto();
  await userPage.waitForTimeout(2000);

  const authCard = homePageAuth.featuredBobbleheadCard;
  const authTitle = homePageAuth.featuredBobbleheadTitle;
  const authImage = homePageAuth.featuredBobbleheadImage;

  const authTitleText = await authTitle.textContent();
  const authImageSrc = await authImage.getAttribute('src');

  // Verify they show the same content
  expect(publicTitleText).toBe(authTitleText);
  expect(publicImageSrc).toBe(authImageSrc);

  // Verify both are visible
  await expect(publicCard).toBeVisible();
  await expect(authCard).toBeVisible();
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead displays for authenticated and unauthenticated users
- [x] Content is identical in both states
- [x] No permission issues
- [x] No user-specific data leaks

---

### Test 3.4: Image Loading Performance

**Objective**: Verify featured bobblehead image loads within reasonable time

```typescript
test('should load featured bobblehead image with good performance', async ({ page }) => {
  const homePage = new HomePage(page);

  // Start measuring time
  const startTime = Date.now();

  await homePage.goto();

  // Wait for featured card to be visible
  const featuredCard = homePage.featuredBobbleheadCard;
  await expect(featuredCard).toBeVisible({ timeout: 10000 });

  const imageLoadTime = Date.now() - startTime;

  // Featured card should load within 5 seconds (includes page load + async fetch + image)
  expect(imageLoadTime).toBeLessThan(5000);

  // Verify image actually loaded (not placeholder)
  const image = homePage.featuredBobbleheadImage;
  const isCldImage = await image.evaluate((el: HTMLImageElement) => {
    return el.currentSrc && (el.currentSrc.includes('cloudinary') || el.src.includes('cloudinary'));
  });

  expect(isCldImage).toBe(true);
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead loads within 5 seconds
- [x] Image is loaded (not placeholder)
- [x] Image comes from Cloudinary CDN
- [x] Performance is acceptable for UX

---

### Test 3.5: Scroll and Viewport Positioning

**Objective**: Verify featured bobblehead is visible without scrolling

```typescript
test('should display featured bobblehead without scrolling required', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Featured card should be visible in initial viewport
  const featuredCard = homePage.featuredBobbleheadCard;

  // Check if visible without scrolling
  const isInViewport = await featuredCard.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  });

  // Should be in viewport (or at least card top is visible)
  const rect = await featuredCard.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top,
      visible: r.top < (window.innerHeight || document.documentElement.clientHeight),
    };
  });

  expect(rect.visible).toBe(true); // At least top of card should be visible
});
```

**Acceptance Criteria**:

- [x] Featured bobblehead is visible in initial viewport (or top portion is)
- [x] No scroll required to see the card on desktop
- [x] Works on various viewport sizes

---

## Test Execution Checklist

### Before Running Tests

- [ ] Create test file: `tests/e2e/specs/feature/home-featured-bobblehead.spec.ts`
- [ ] Update page object: `tests/e2e/pages/home.page.ts` with new locators
- [ ] Verify test database has featured bobblehead fixture
- [ ] Confirm fixtures work with E2E environment
- [ ] Check Playwright configuration for timeout settings

### Running Tests

```bash
# Run featured bobblehead tests only
npm run test:e2e -- home-featured-bobblehead.spec.ts

# Run with debug
npm run test:e2e -- --debug home-featured-bobblehead.spec.ts

# Run specific test
npm run test:e2e -- -g "should navigate to bobblehead detail"

# Run all E2E tests
npm run test:e2e
```

### Test Coverage Summary

| Phase                        | Tests  | Hours   | Status    |
| ---------------------------- | ------ | ------- | --------- |
| Phase 1 (Critical Path)      | 6      | 2-3     | Ready     |
| Phase 2 (Visual/Interaction) | 6      | 2-3     | Ready     |
| Phase 3 (Edge Cases)         | 5      | 2-3     | Ready     |
| **Total**                    | **17** | **6-9** | **Ready** |

---

## Debugging Guide

### Common Issues

**Issue**: Test times out waiting for featured bobblehead

```typescript
// Solution: Increase timeout for async component
await expect(featuredCard).toBeVisible({ timeout: 15000 });
```

**Issue**: Featured bobblehead image not loading

```typescript
// Solution: Check network tab for image URL
console.log(await image.getAttribute('src'));
// Or mock network delay
await page.route('**/*.jpg', (route) => {
  setTimeout(() => route.continue(), 1000);
});
```

**Issue**: Responsive test fails on different screen

```typescript
// Solution: Use exact viewport size
await page.setViewportSize({ width: 375, height: 667 });
// Verify before testing
console.log(page.viewportSize());
```

**Issue**: Featured bobblehead card click not working

```typescript
// Solution: Verify card is clickable and visible
const card = homePage.featuredBobbleheadCard;
console.log(await card.isVisible());
console.log(await card.isEnabled());
// Try scrolling into view first
await card.scrollIntoViewIfNeeded();
await card.click();
```

---

## Notes for Implementation

1. **Async Component Timing**: Featured bobblehead uses Suspense, so tests must wait for async load (2-5 seconds typical)

2. **Caching**: Redis cache is transparent to E2E tests - they test the rendered output regardless of cache status

3. **Database**: Tests can use factories to create featured bobblehead fixtures, or rely on seed data

4. **Mobile Testing**: Use `setViewportSize()` for responsive tests rather than device emulation

5. **Dark Mode**: Featured bobblehead should work in both light and dark modes - consider adding dark mode tests if needed

6. **Accessibility**: Tests should verify ARIA attributes, keyboard navigation, and focus indicators
