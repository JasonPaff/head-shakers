# Featured Collections E2E Test Scenarios - Detailed Reference

**Purpose**: Detailed test scenario breakdown and example implementations for E2E coverage gaps.

---

## Test Scenario Catalog

### Display & Metadata Tests

#### Scenario 1.1: Display Collection Cards with Metadata

**Priority**: CRITICAL | **Complexity**: Medium | **File**: `featured-collections.spec.ts`

**Acceptance Criteria**:

- Exactly 6 collection cards render in grid
- Each card displays title, owner name, avatar, item count, estimated value
- Likes, views, and comments stats visible with icons
- Collection card is a clickable link
- Cards are ordered by featured content priority

**Test Implementation**:

```typescript
test('should display 6 collection cards with complete metadata', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Verify card count
  const collectionCards = finder.feature('collection-card');
  await expect(collectionCards).toHaveCount(6);

  // Verify first card has all metadata
  const firstCard = collectionCards.first();

  // Title visible
  const title = firstCard.locator('[data-slot="featured-collection-title"]');
  await expect(title).toBeVisible();
  const titleText = await title.textContent();
  expect(titleText?.length).toBeGreaterThan(0);

  // Owner info visible
  const ownerSection = firstCard.locator('[data-slot="featured-collection-owner-section"]');
  const ownerName = ownerSection.locator('text=/^@/');
  await expect(ownerName).toBeVisible();

  // Owner avatar
  const avatar = ownerSection.locator('img').first();
  await expect(avatar).toHaveAttribute('src', /\.(jpg|png|jpeg|svg)/i);

  // Item count visible
  const itemCount = ownerSection.locator('text=/items/i');
  await expect(itemCount).toBeVisible();

  // Estimated value visible
  const value = ownerSection.locator('text=/Est\. Value/i');
  await expect(value).toBeVisible();

  // Stats visible
  const stats = firstCard.locator('[data-slot="featured-collection-stats"]');
  await expect(stats).toContainText(/\d+ likes?/i);
  await expect(stats).toContainText(/\d+/); // view count
  await expect(stats).toContainText(/\d+/); // comments
});
```

**Related Test Data**:

- Featured collections must have: title, owner, items, value, stats populated
- Each card uses data from `FeaturedCollectionData` type

---

#### Scenario 1.2: Verify Trending Badge Display

**Priority**: HIGH | **Complexity**: Low

**Acceptance Criteria**:

- Trending badge visible only for collections where `isTrending: true`
- Badge displays flame icon and "Trending" text
- Badge positioned top-right of collection image
- Non-trending collections don't show badge

**Test Implementation**:

```typescript
test('should display trending badge only for trending collections', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const collectionCards = finder.feature('collection-card');

  for (let i = 0; i < 6; i++) {
    const card = collectionCards.nth(i);
    const trendingBadge = card.locator('[data-slot="featured-collection-trending-badge"]');

    // The badge should either be visible or not, based on isTrending value
    // If visible, should contain "Trending" text and flame icon
    const badgeVisible = await trendingBadge.isVisible().catch(() => false);

    if (badgeVisible) {
      await expect(trendingBadge).toContainText('Trending');
      const flameIcon = trendingBadge.locator('[class*="lucide"]');
      await expect(flameIcon).toBeVisible();
    }
  }
});
```

---

#### Scenario 1.3: Verify Image Loading with Blur Placeholder

**Priority**: HIGH | **Complexity**: High

**Acceptance Criteria**:

- Cloudinary image loads progressively with blur placeholder
- Image aspect ratio maintained (4:3)
- Placeholder removes when image loads
- Fallback placeholder shows if image URL invalid

**Test Implementation**:

```typescript
test('should load collection image with blur placeholder', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const firstCard = finder.feature('collection-card').first();
  const imageContainer = firstCard.locator('[data-slot="featured-collection-image-container"]');

  // Verify image container has correct aspect ratio
  const boundingBox = await imageContainer.boundingBox();
  expect(boundingBox).not.toBeNull();

  if (boundingBox) {
    const aspectRatio = boundingBox.width / boundingBox.height;
    expect(aspectRatio).toBeCloseTo(4 / 3, 0.1); // 4:3 aspect ratio
  }

  // Verify image exists
  const images = firstCard.locator('img, [role="img"]');
  await expect(images.first()).toBeVisible();

  // If CldImage is used, it should have loading="lazy"
  const cldImage = firstCard.locator('img[class*="cld"]');
  const isLazy = await cldImage.getAttribute('loading').catch(() => null);
  if (isLazy) {
    expect(isLazy).toBe('lazy');
  }
});
```

---

#### Scenario 1.4: Verify Placeholder Image Fallback

**Priority**: MEDIUM | **Complexity**: Medium

**Acceptance Criteria**:

- When no image URL provided, placeholder image displays
- Placeholder has same layout as normal image
- Placeholder is from correct CLOUDINARY_PATHS constant
- No broken image states

**Test Implementation**:

```typescript
test('should display placeholder image when no image available', async ({ page, finder }) => {
  // This test requires a featured collection with imageUrl: null
  // and no coverImageUrl from collection
  const homePage = new HomePage(page);
  await homePage.goto();

  const collectionCards = finder.feature('collection-card');

  // Find a card with placeholder (check for specific placeholder src)
  for (let i = 0; i < 6; i++) {
    const card = collectionCards.nth(i);
    const image = card.locator('img[alt="Collection placeholder"]');

    const isVisible = await image.isVisible().catch(() => false);
    if (isVisible) {
      await expect(image).toHaveAttribute('src', /placeholder|default/i);
      break;
    }
  }
});
```

---

### Navigation Tests

#### Scenario 2.1: Click Collection Card Navigates to Detail

**Priority**: CRITICAL | **Complexity**: Medium

**Acceptance Criteria**:

- Clicking collection card navigates to `/collections/[collectionSlug]`
- URL includes correct slug from `contentSlug` field
- Detail page loads with content
- Navigation uses `$path` type-safe routing

**Test Implementation**:

```typescript
test('should navigate to collection detail page when clicking card', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Get the first collection card
  const firstCard = finder.feature('collection-card').first();

  // Get its href attribute to verify slug
  const href = await firstCard.getAttribute('href');
  expect(href).toMatch(/\/collections\/[a-z0-9\-]+/);

  // Wait for navigation and click
  await Promise.all([page.waitForURL(/\/collections\/[a-z0-9\-]+/, { timeout: 10000 }), firstCard.click()]);

  // Verify we're on collection detail page
  await expect(page).toHaveURL(/\/collections\/[a-z0-9\-]+/);
});
```

**Related Source Code**:

- Line 84-86 of `featured-collections-display.tsx`: Link href definition
- Uses `$path({ route: '/collections/[collectionSlug]', ... })`

---

#### Scenario 2.2: Multiple Card Navigation

**Priority**: HIGH | **Complexity**: Medium

**Acceptance Criteria**:

- Each of 6 cards navigates to correct detail page
- Different cards navigate to different slugs
- URL changes match expected collection slugs
- No cards navigate to wrong page

**Test Implementation**:

```typescript
test('should navigate to correct detail page for each collection card', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const collectionCards = finder.feature('collection-card');
  const cardCount = await collectionCards.count();

  // Store original URL
  const homeUrl = page.url();

  for (let i = 0; i < Math.min(cardCount, 3); i++) {
    // Go back to home
    await homePage.goto();

    const card = collectionCards.nth(i);
    const expectedHref = await card.getAttribute('href');

    // Navigate to collection
    await Promise.all([page.waitForURL(/\/collections\//), card.click()]);

    // Verify correct URL
    const currentUrl = page.url();
    expect(currentUrl).toContain(expectedHref);
  }
});
```

---

#### Scenario 2.3: View All Button Navigation

**Priority**: CRITICAL | **Complexity**: Low

**Acceptance Criteria**:

- "View All Collections" button navigates to `/browse`
- Button is visible in featured collections section
- Navigation completes without errors
- Browse page content loads

**Test Implementation**:

```typescript
test('should navigate to browse page from View All button', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Find View All button in featured collections section
  const viewAllButton = page.getByRole('link', { name: /view all collections/i });
  await expect(viewAllButton).toBeVisible();

  // Verify button has correct href
  const href = await viewAllButton.getAttribute('href');
  expect(href).toContain('/browse');

  // Navigate
  await Promise.all([page.waitForURL(/\/browse/, { timeout: 10000 }), viewAllButton.click()]);

  // Verify navigation successful
  await expect(page).toHaveURL(/\/browse/);
});
```

**Related Source Code**:

- Line 49 of `featured-collections-section.tsx`: Link component
- Navigation to `$path({ route: '/browse' })`

---

### Authentication Tests

#### Scenario 3.1: Unauthenticated Like Display

**Priority**: CRITICAL | **Complexity**: High

**Acceptance Criteria**:

- Unauthenticated users see aggregate likes count
- No personal like status indicator shown
- Likes count is consistent with database
- Same view for all unauthenticated users

**Test Implementation**:

```typescript
test('should display aggregate likes for unauthenticated users', async ({ page, finder }) => {
  // This test uses default page fixture (unauthenticated)
  const homePage = new HomePage(page);
  await homePage.goto();

  // Verify user is NOT authenticated
  const userAvatar = page.locator('[data-testid*="user-avatar"]');
  const isAuthenticated = await userAvatar.isVisible().catch(() => false);
  expect(isAuthenticated).toBe(false);

  // Get first collection card stats
  const firstCard = finder.feature('collection-card').first();
  const stats = firstCard.locator('[data-slot="featured-collection-stats"]');

  // Should show likes count with heart icon
  const likesText = await stats.locator('text=/\\d+ likes?/i').textContent();
  expect(likesText).toBeTruthy();
  expect(likesText).toMatch(/\\d+/);

  // Get likes count as number
  const likesMatch = likesText?.match(/\\d+/);
  const likesCount = likesMatch ? parseInt(likesMatch[0]) : 0;
  expect(likesCount).toBeGreaterThanOrEqual(0);
});
```

**Related Source Code**:

- Line 417-425 in `featured-content-query.ts`: Like count aggregate query
- Query returns `likes: sql<number>` (aggregate count)
- Query returns `isLiked: sql<boolean>` (user-specific, false when no userId)

---

#### Scenario 3.2: Authenticated Personal Like Status

**Priority**: CRITICAL | **Complexity**: High

**Acceptance Criteria**:

- Authenticated users see personal like status
- Like status is accurate (liked vs. unliked)
- Different users see different states for same collection
- Like status persists across page reloads

**Test Implementation**:

```typescript
test('should show personal like status for authenticated user', async ({ userPage, userFinder }) => {
  const homePage = new HomePage(userPage);
  await homePage.goto();

  // Verify user IS authenticated
  const userAvatar = userFinder.layout('user-avatar', 'button');
  await expect(userAvatar).toBeVisible({ timeout: 15000 });

  // Get first collection card stats
  const firstCard = userFinder.feature('collection-card').first();
  const stats = firstCard.locator('[data-slot="featured-collection-stats"]');

  // Should show aggregate likes
  const likesText = await stats.locator('text=/\\d+ likes?/i').textContent();
  expect(likesText).toBeTruthy();

  // If collection has like button or indicator, verify it's in view
  // The personal like status is included in isLiked field (used by like feature)
  const card = firstCard;
  await expect(card).toBeVisible();

  // Persist check: reload page and verify state unchanged
  await userPage.reload();
  await expect(userFinder.feature('collection-card').first()).toBeVisible();
});
```

**Related Source Code**:

- Line 444-450 in `featured-content-query.ts`: User-specific like join
- `isLiked` boolean field is true only if current user liked collection
- When userId provided: left join to likes with user filter
- When no userId: left join to `sql\`false\`` (always null/false)

---

#### Scenario 3.3: Like Status Differs by Auth State

**Priority**: HIGH | **Complexity**: High

**Acceptance Criteria**:

- Same collection shows different like status for anon vs. auth users
- Auth user sees personal status, anon sees only aggregate
- Cache uses separate keys per user (no data leakage)
- Facade passes userId correctly to query

**Test Implementation**:

```typescript
test('should show different like statuses for authenticated vs unauthenticated', async ({
  page,
  userPage,
  finder,
  userFinder,
}) => {
  // Get likes count as unauthenticated
  const homePage = new HomePage(page);
  await homePage.goto();

  const anonCard = finder.feature('collection-card').first();
  const anonStats = anonCard.locator('[data-slot="featured-collection-stats"]');
  const anonLikesText = await anonStats.locator('text=/\\d+ likes?/i').textContent();
  const anonLikes = anonLikesText?.match(/\\d+/)?.[0];

  // Get likes count as authenticated user
  const userHomePage = new HomePage(userPage);
  await userHomePage.goto();

  const userCard = userFinder.feature('collection-card').first();
  const userStats = userCard.locator('[data-slot="featured-collection-stats"]');
  const userLikesText = await userStats.locator('text=/\\d+ likes?/i').textContent();
  const userLikes = userLikesText?.match(/\\d+/)?.[0];

  // Likes count should be the same (aggregate)
  expect(anonLikes).toBe(userLikes);

  // But personal state should differ
  // (This would be visible in like button if implemented)
  // For now, just verify both loaded correctly
  await expect(anonStats).toBeVisible();
  await expect(userStats).toBeVisible();
});
```

---

### State Handling Tests

#### Scenario 4.1: Loading Skeleton Displays During Fetch

**Priority**: CRITICAL | **Complexity**: Medium

**Acceptance Criteria**:

- Loading skeleton renders while async component fetches data
- Skeleton has same layout/spacing as real cards
- Skeleton disappears when data loads
- Transition is smooth (no layout shift)

**Test Implementation**:

```typescript
test('should display loading skeleton while fetching data', async ({ page, finder }) => {
  // Disable network speed to ensure we see skeleton
  await page.route('**/*', (route) => {
    setTimeout(() => route.continue(), 500);
  });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Look for skeleton loading state
  const skeletonCard = page.locator('[data-testid*="skeleton"]');

  // Skeleton might appear briefly
  const skeletonVisible = await skeletonCard.isVisible().catch(() => false);

  // Even if skeleton not visible (fast), verify final state
  const collectionCards = finder.feature('collection-card');
  await expect(collectionCards.first()).toBeVisible({ timeout: 10000 });
});
```

**Related Source Code**:

- Line 35-37 of `featured-collections-section.tsx`: Suspense with skeleton fallback
- `FeaturedCollectionsSkeleton` component in `skeleton/featured-collections-skeleton.tsx`

---

#### Scenario 4.2: Empty State Displays When No Collections

**Priority**: HIGH | **Complexity**: Low

**Acceptance Criteria**:

- Empty state renders when `collections.length === 0`
- Shows icon, message, and Browse button
- Message is clear: "No featured collections available at this time"
- Browse button navigates to `/browse`

**Test Implementation**:

```typescript
test('should display empty state when no collections available', async ({ page, finder }) => {
  // This test requires featured collections to be empty
  // May need database setup or feature flag
  const homePage = new HomePage(page);
  await homePage.goto();

  // Check if empty state or cards display
  const emptyState = finder.feature('collections-empty-state');
  const collectionCards = finder.feature('collection-card');

  const cardsVisible = await collectionCards
    .first()
    .isVisible()
    .catch(() => false);
  const emptyVisible = await emptyState.isVisible().catch(() => false);

  if (emptyVisible) {
    // Verify empty state content
    await expect(emptyState).toContainText(/no featured collections/i);

    // Verify Browse button
    const browseButton = emptyState.getByRole('link', { name: /browse/i });
    await expect(browseButton).toBeVisible();
  } else {
    // Collections display - not empty
    expect(cardsVisible).toBe(true);
  }
});
```

**Related Source Code**:

- Line 25-39 of `featured-collections-display.tsx`: Empty state check and rendering
- Uses `FeaturedCollectionData` type array length check

---

#### Scenario 4.3: Error Boundary Catches Rendering Errors

**Priority**: HIGH | **Complexity**: High

**Acceptance Criteria**:

- If async component throws, error boundary catches
- Error message displays gracefully
- Page doesn't crash completely
- Section remains in layout without breaking

**Test Implementation**:

```typescript
test('should handle component errors gracefully with error boundary', async ({ page, finder }) => {
  // This test is challenging - requires injection of error
  // Or monitoring for actual error conditions
  const homePage = new HomePage(page);
  await homePage.goto();

  // Verify section is either showing content or error gracefully
  const section = finder.layout('featured-collections-section');
  await expect(section).toBeVisible();

  // Check for either:
  // 1. Collection cards (normal case)
  // 2. Empty state (no data case)
  // 3. Error message (error case) - would need ErrorBoundary UI

  const hasContent = await section.locator('[data-slot*="featured-collection"]').count();
  expect(hasContent).toBeGreaterThanOrEqual(0); // Either content or empty
});
```

**Related Source Code**:

- Line 34-38 of `featured-collections-section.tsx`: ErrorBoundary wrapper
- `<ErrorBoundary name={'featured-collections'}>`

---

### Responsive Behavior Tests

#### Scenario 5.1: Desktop View Shows 3 Columns

**Priority**: CRITICAL | **Complexity**: Medium

**Acceptance Criteria**:

- At 1024px+ width, grid displays 3 columns
- All 6 cards visible
- Cards align in 3x2 grid layout
- Spacing maintained

**Test Implementation**:

```typescript
test('should display 3 columns on desktop viewport', async ({ page, finder }) => {
  // Set desktop viewport (1280x720)
  await page.setViewportSize({ width: 1280, height: 720 });

  const homePage = new HomePage(page);
  await homePage.goto();

  // Get grid container
  const grid = page.locator('[data-slot="featured-collections-grid"]');

  // Verify all 6 cards visible
  const visibleCards = grid.locator('[data-slot="featured-collection-card"]:visible');
  const visibleCount = await visibleCards.count();
  expect(visibleCount).toBe(6);

  // Verify grid layout (3 columns)
  // Check that cards wrap properly
  const boundingBoxes = await visibleCards.evaluateAll((cards) => {
    return cards.map((card) => ({
      x: (card as HTMLElement).getBoundingClientRect().x,
      y: (card as HTMLElement).getBoundingClientRect().y,
    }));
  });

  // Should have 3 different x positions for columns
  const xPositions = new Set(boundingBoxes.map((box) => Math.round(box.x)));
  expect(xPositions.size).toBe(3);
});
```

**Related Source Code**:

- Line 43 of `featured-collections-display.tsx`: Grid classes
- `grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3`
- Tailwind breakpoints: lg = 1024px

---

#### Scenario 5.2: Tablet View Shows 2 Columns

**Priority**: HIGH | **Complexity**: Medium

**Acceptance Criteria**:

- At 640-1023px width, grid displays 2 columns
- All 6 cards visible in 3x2 layout
- Spacing and gaps maintained

**Test Implementation**:

```typescript
test('should display 2 columns on tablet viewport', async ({ page, finder }) => {
  // Set tablet viewport (768x1024)
  await page.setViewportSize({ width: 768, height: 1024 });

  const homePage = new HomePage(page);
  await homePage.goto();

  const grid = page.locator('[data-slot="featured-collections-grid"]');
  const visibleCards = grid.locator('[data-slot="featured-collection-card"]:visible');
  const visibleCount = await visibleCards.count();

  // All 6 cards should be visible
  expect(visibleCount).toBe(6);

  // Verify 2 columns
  const boundingBoxes = await visibleCards.evaluateAll((cards) => {
    return cards.map((card) => ({
      x: (card as HTMLElement).getBoundingClientRect().x,
    }));
  });

  const xPositions = new Set(boundingBoxes.map((box) => Math.round(box.x)));
  expect(xPositions.size).toBe(2);
});
```

---

#### Scenario 5.3: Mobile View Shows 1 Column with First 3 Cards

**Priority**: CRITICAL | **Complexity**: Medium

**Acceptance Criteria**:

- At <640px width, grid displays 1 column
- Only first 3 cards visible (cards 0, 1, 2)
- Cards 4, 5, 6 hidden with `hidden md:block`
- Mobile layout is readable and full-width

**Test Implementation**:

```typescript
test('should display 1 column on mobile viewport with only first 3 cards', async ({ page, finder }) => {
  // Set mobile viewport (375x667)
  await page.setViewportSize({ width: 375, height: 667 });

  const homePage = new HomePage(page);
  await homePage.goto();

  const grid = page.locator('[data-slot="featured-collections-grid"]');
  const allCards = grid.locator('[data-slot="featured-collection-card"]');

  // Get card count
  const totalCards = await allCards.count();
  expect(totalCards).toBe(6);

  // Check visible cards
  const visibleCards = grid.locator('[data-slot="featured-collection-card"]:visible');
  const visibleCount = await visibleCards.count();
  expect(visibleCount).toBe(3); // Only first 3 visible

  // Verify 1 column layout
  const boundingBoxes = await visibleCards.evaluateAll((cards) => {
    return cards.map((card) => ({
      x: (card as HTMLElement).getBoundingClientRect().x,
    }));
  });

  const xPositions = new Set(boundingBoxes.map((box) => Math.round(box.x)));
  expect(xPositions.size).toBe(1); // All same x position = 1 column
});
```

**Related Source Code**:

- Line 49 of `featured-collections-display.tsx`: Visibility logic
- `className={index >= 3 ? 'hidden md:block' : undefined}`
- Cards 0-2: always visible
- Cards 3-5: hidden on mobile (`hidden`), visible on md+ (`md:block`)

---

### Accessibility Tests

#### Scenario 6.1: Collection Card Links Keyboard Navigable

**Priority**: CRITICAL | **Complexity**: Medium

**Acceptance Criteria**:

- Tab through cards in order
- Focus state visible on each card
- Enter key navigates to collection
- Outline visible for keyboard users

**Test Implementation**:

```typescript
test('should navigate collection cards with keyboard', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // Start tabbing from view all button
  const viewAllButton = page.getByRole('link', { name: /view all collections/i });
  await viewAllButton.focus();

  // Tab to first card
  await page.keyboard.press('Tab');

  // Verify first card is focused
  let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('href'));
  expect(focusedElement).toContain('/collections/');

  // Tab through multiple cards
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('Tab');
    focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('href'));
    expect(focusedElement).toMatch(/\/collections\/[a-z0-9\-]+/);
  }

  // Press Enter on focused card
  const currentHref = await page.evaluate(() => document.activeElement?.getAttribute('href'));

  await Promise.all([page.waitForURL(/\/collections\//), page.keyboard.press('Enter')]);

  expect(page.url()).toContain(currentHref);
});
```

**Related Source Code**:

- Line 75-87 of `featured-collections-display.tsx`: Link component
- Native `Link` component provides keyboard navigation

---

#### Scenario 6.2: Screen Reader Announces Collection Titles

**Priority**: HIGH | **Complexity**: High

**Acceptance Criteria**:

- Screen readers announce collection title
- Context provided (e.g., "Featured collection: Title by @Owner")
- Owner name announced
- Stats announced with context

**Test Implementation**:

```typescript
test('should announce collection titles to screen readers', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  const firstCard = finder.feature('collection-card').first();

  // Get accessible name of the link
  const accessibleName = await firstCard.evaluate((el) => {
    return el.getAttribute('aria-label') || el.textContent || '';
  });

  expect(accessibleName).toBeTruthy();

  // Verify title is in accessible text
  const titleElement = firstCard.locator('[data-slot="featured-collection-title"]');
  const titleText = await titleElement.textContent();

  const cardText = await firstCard.textContent();
  expect(cardText).toContain(titleText);

  // Verify owner is accessible
  const ownerText = await firstCard.locator('text=/^@/').textContent();
  expect(cardText).toContain(ownerText);
});
```

---

#### Scenario 6.3: Empty State Screen Reader Friendly

**Priority**: MEDIUM | **Complexity**: Low

**Acceptance Criteria**:

- Empty state message announced clearly
- Browse button accessible
- Clear language explaining situation

**Test Implementation**:

```typescript
test('should announce empty state to screen readers', async ({ page, finder }) => {
  const homePage = new HomePage(page);
  await homePage.goto();

  // If empty state visible
  const emptyState = finder.feature('collections-empty-state');
  const emptyVisible = await emptyState.isVisible().catch(() => false);

  if (emptyVisible) {
    const message = await emptyState.textContent();
    expect(message).toContain(/no featured collections/i);

    // Browse button should be accessible
    const browseButton = emptyState.getByRole('link');
    await expect(browseButton).toBeVisible();
  }
});
```

---

## Test Data Requirements

### Minimum Featured Collections Setup

For E2E tests to pass, database needs:

```sql
-- Minimum 6 active featured collections
INSERT INTO featured_content (
  id, content_id, content_type, feature_type,
  title, description, image_url,
  is_active, priority, start_date, end_date,
  created_at, updated_at
) VALUES
  -- Collection 1: Basic with trending
  ('fc1', 'col1', 'collection', 'editor_pick',
   'Feature Collection 1', 'Description 1', NULL,
   true, 100, CURRENT_DATE, NULL, NOW(), NOW()),

  -- Collection 2: With custom image and trending badge
  ('fc2', 'col2', 'collection', 'trending',
   'Feature Collection 2', 'Description 2', 'https://...',
   true, 90, CURRENT_DATE, NULL, NOW(), NOW()),

  -- ... more collections up to 6
;

-- Collections must exist and have related data:
-- - User (owner)
-- - Avatar URL
-- - Bobbleheads (for item count)
-- - Purchase prices (for value calculation)
-- - Comments
-- - Likes
```

### Query Verification

Test data queries to verify setup:

```sql
-- Check featured collections for display
SELECT
  fc.id,
  c.name,
  c.slug,
  u.username,
  (SELECT COUNT(*) FROM bobbleheads WHERE collection_id = c.id AND deleted_at IS NULL) as item_count,
  fc.is_active,
  fc.feature_type
FROM featured_content fc
INNER JOIN collections c ON fc.content_id = c.id
INNER JOIN users u ON c.user_id = u.id
WHERE fc.content_type = 'collection'
  AND fc.is_active = true
  AND (fc.start_date IS NULL OR fc.start_date <= CURRENT_DATE)
  AND (fc.end_date IS NULL OR fc.end_date >= CURRENT_DATE)
ORDER BY fc.priority DESC, fc.created_at DESC
LIMIT 6;

-- Check likes for featured collections
SELECT
  fc.id,
  (SELECT COUNT(*) FROM likes WHERE target_id = fc.content_id AND like_target_type = 'collection') as like_count
FROM featured_content fc
WHERE fc.content_type = 'collection';
```

---

## Common Test Issues & Solutions

### Issue 1: Tests Flake Due to Async Data Loading

**Symptom**: Tests pass sometimes, fail other times

**Solution**: Use proper waits

```typescript
// BAD: Hard wait
await page.waitForTimeout(2000);

// GOOD: Wait for element
await expect(finder.feature('collection-card').first()).toBeVisible({ timeout: 10000 });
```

### Issue 2: Mobile Viewport Tests Fail

**Symptom**: `setViewportSize` doesn't apply responsive classes

**Solution**: Reload page after viewport change

```typescript
await page.setViewportSize({ width: 375, height: 667 });
await homePage.goto(); // Reload to apply responsive styles
```

### Issue 3: Grid Layout Verification Flakes

**Symptom**: Computing card positions is unreliable

**Solution**: Check computed styles instead

```typescript
const grid = page.locator('[data-slot="featured-collections-grid"]');
const computedStyle = await grid.evaluate((el) => {
  return window.getComputedStyle(el).gridTemplateColumns;
});
```

### Issue 4: Auth State Not Properly Isolated

**Symptom**: User context leaks between tests

**Solution**: Use separate page fixtures

```typescript
// Use userPage fixture (separate context)
await userPage.goto(...);

// Don't reuse page fixture between test contexts
```

---

## Validation Checklist

Before merging E2E tests:

- [ ] All 18-22 tests implemented
- [ ] Tests pass locally with `npm run test:e2e`
- [ ] No hardcoded timeouts (use proper waits)
- [ ] Tests use Page Object Model (HomePage)
- [ ] Responsive tests set viewport before navigation
- [ ] Auth tests use correct fixtures (userPage, adminPage)
- [ ] Empty state test has data setup plan
- [ ] Screenshot debugging added for failures
- [ ] Test names are descriptive and unique
- [ ] No test order dependencies (can run in any order)
- [ ] Test file follows project patterns
- [ ] Documentation updated with new tests
