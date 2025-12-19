# E2E Test Implementation Plan: Home Page Featured Collections Section

Generated: 2025-12-04
Scope: E2E tests only (Playwright)

## Overview

- **Total tests**: 28 E2E tests across 4 spec files
- **Complexity**: Medium-High (async data, authentication states, responsive layout, social features)
- **Risk level**: High (featured content drives engagement, authentication security critical)
- **Estimated effort**: 10-12 hours (distributed across multiple sessions)

### Test Distribution

- **Critical Priority**: 17 tests (display metadata, navigation, authentication states, empty state)
- **High Priority**: 8 tests (responsive layout, loading states)
- **Medium Priority**: 3 tests (accessibility, error boundaries)

## Prerequisites

### Required Test Infrastructure (Already Available)

- `tests/e2e/pages/home.page.ts` - HomePage Page Object
- `tests/e2e/pages/base.page.ts` - Base Page Object
- `tests/e2e/fixtures/base.fixture.ts` - Custom Playwright fixtures (page, userPage, finder, userFinder)
- `tests/fixtures/featured-content.factory.ts` - Featured content database factory
- `tests/fixtures/collection.factory.ts` - Collection database factory
- `tests/fixtures/user.factory.ts` - User database factory
- `playwright.config.ts` - Playwright configuration with auth setup

### Additional Infrastructure Needed

- HomePage Page Object locators for featured collection card elements
- Helper methods for featured collections interactions
- E2E database seeding script for featured collections test data (if needed beyond existing factories)

---

## Implementation Steps

### Step 1: Page Object Enhancement - Featured Collections Locators

**Test Type**: infrastructure
**What**: Add locators and helper methods to HomePage Page Object for featured collections section elements
**Why**: CRITICAL - Page Object pattern ensures maintainable, reusable test code and centralizes selectors

**Files to Modify**:

- `tests/e2e/pages/home.page.ts`

**Locators to Add**:

```typescript
// Featured Collections Section (already exists: featuredCollectionsSection)
get featuredCollectionsGrid(): Locator
get featuredCollectionsCards(): Locator
get featuredCollectionsEmptyState(): Locator
get featuredCollectionsSkeleton(): Locator
get viewAllCollectionsLink(): Locator

// Individual Collection Card (helper methods that take index or collection ID)
getFeaturedCollectionCard(index: number): Locator
getFeaturedCollectionCardById(collectionId: string): Locator
getFeaturedCollectionImage(index: number): Locator
getFeaturedCollectionTitle(index: number): Locator
getFeaturedCollectionDescription(index: number): Locator
getFeaturedCollectionOwnerAvatar(index: number): Locator
getFeaturedCollectionOwnerName(index: number): Locator
getFeaturedCollectionItemCount(index: number): Locator
getFeaturedCollectionValue(index: number): Locator
getFeaturedCollectionLikes(index: number): Locator
getFeaturedCollectionViews(index: number): Locator
getFeaturedCollectionComments(index: number): Locator
getFeaturedCollectionTrendingBadge(index: number): Locator
```

**Helper Methods to Add**:

```typescript
async getVisibleCollectionCardsCount(): Promise<number>
async clickFeaturedCollection(index: number): Promise<void>
async getFeaturedCollectionUrl(index: number): Promise<string>
async isFeaturedCollectionTrending(index: number): Promise<boolean>
async waitForFeaturedCollectionsLoad(): Promise<void>
```

**Patterns to Follow**:

- Use `byTestId()` method from BasePage: `byTestId('feature-collection-grid')`
- Use `finder.feature()` for component finder: `finder.feature('collection-card', collectionId)`
- Use `locator.nth(index)` for accessing specific cards in grid
- Use `getByRole()` for semantic queries where appropriate (links, headings, images)
- Follow existing HomePage locator patterns (check `browseCollectionsLink`, `trendingBobbleheadsSection`)

**Validation Commands**:

```bash
npm run typecheck
npm run lint
```

**Success Criteria**:

- All locators compile without TypeScript errors
- Helper methods use proper Playwright Locator API
- Follows existing Page Object patterns in codebase
- No ESLint errors

---

### Step 2: Critical Priority - Display Collections Metadata (5 tests)

**Test Type**: E2E
**What**: Verify collection cards display all required metadata (title, owner, stats, value, trending badge)
**Why**: CRITICAL - Users need complete information to decide which collections to explore

**Files to Create**:

- `tests/e2e/specs/public/home-featured-collections.spec.ts`

**Test Cases**:

1. **Featured collections section displays heading and description** (unauthenticated)
   - Navigate to home page
   - Verify featured collections section is visible
   - Verify heading "Featured Collections" is displayed
   - Verify description text "Explore curated collections from our most passionate collectors" is visible
   - Verify "View All Collections" button is visible

2. **Collection cards display complete metadata** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load (replace skeleton)
   - Verify at least 1 collection card is visible
   - For first card, verify:
     - Collection title is visible and non-empty
     - Owner avatar image is displayed
     - Owner username is displayed (format: @username)
     - Item count is displayed (format: "N items")
     - Estimated value is displayed (format: "$X,XXX")
     - Likes count is visible with heart icon
     - Views count is visible with eye icon
     - Comments count is visible with message icon

3. **Trending badge displays for trending collections** (unauthenticated)
   - Seed featured collection with `featureType: 'trending'`
   - Navigate to home page
   - Wait for collections to load
   - Verify trending badge is visible on trending collection
   - Verify badge text is "Trending"
   - Verify badge has flame icon
   - Verify badge styling (gradient background)

4. **Collection description displays when present** (unauthenticated)
   - Seed featured collection with description text
   - Navigate to home page
   - Wait for collections to load
   - Verify description is visible on card
   - Verify description text matches seeded data
   - Verify description is truncated if too long (line-clamp-2)

5. **Engagement metrics format correctly** (unauthenticated)
   - Seed featured collection with high counts (likes: 1234, views: 5678, comments: 90)
   - Navigate to home page
   - Wait for collections to load
   - Verify likes display as "1,234" (comma formatting)
   - Verify views display as "5,678" (comma formatting)
   - Verify comments display as "90"
   - Verify all icons are visible (heart, eye, message)

**Patterns to Follow**:

- Use `test.describe()` blocks for grouping
- Use `test.beforeEach()` for common setup (navigate to home)
- Use ComponentFinder: `finder.layout('featured-collections-section')`
- Use `await expect(locator).toBeVisible()` assertions
- Use `locator.textContent()` to extract and validate text
- Use regex for number formatting validation: `/\d{1,3}(,\d{3})*/`
- Reference `tests/e2e/specs/public/home-sections.spec.ts` for structure

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts
```

**Success Criteria**:

- All metadata fields display correctly
- Number formatting is consistent
- Trending badge appears only on trending collections
- Description displays conditionally
- Tests pass consistently (not flaky)

---

### Step 3: Critical Priority - Collection Card Images (3 tests)

**Test Type**: E2E
**What**: Verify collection images load correctly with Cloudinary optimization and placeholders
**Why**: CRITICAL - Images are primary visual element driving engagement

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-collections.spec.ts`

**Test Cases**:

1. **Collection images load from Cloudinary with optimizations** (unauthenticated)
   - Seed featured collection with Cloudinary image URL
   - Navigate to home page
   - Wait for collections to load
   - Verify image is visible on first card
   - Verify image src contains Cloudinary domain
   - Verify image has alt text (collection title)
   - Verify image has aspect ratio 4:3 (check container class)

2. **Placeholder image displays when collection has no cover image** (unauthenticated)
   - Seed featured collection with null coverImageUrl
   - Navigate to home page
   - Wait for collections to load
   - Verify placeholder image is visible
   - Verify placeholder src is `CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER`
   - Verify placeholder has alt text "Collection placeholder"

3. **Collection images have hover effect** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load
   - Hover over first collection card
   - Verify image scales on hover (check transform style or animation)
   - Verify card translates up on hover (group-hover:-translate-y-2)

**Patterns to Follow**:

- Use `page.on('request')` to capture image requests if needed
- Use `locator.getAttribute('src')` to verify image URL
- Use `locator.hover()` for hover interactions
- Use `page.evaluate()` to check computed styles if needed
- Use CldImage test ID patterns from codebase

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "image"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "image"
```

**Success Criteria**:

- Images load from Cloudinary for collections with cover images
- Placeholder displays for collections without images
- Hover effects work correctly
- All images have alt text
- No broken image icons

---

### Step 4: Critical Priority - Navigation (4 tests)

**Test Type**: E2E
**What**: Verify users can navigate to collection detail pages and browse page
**Why**: CRITICAL - Primary user flow from homepage to collection detail view

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-collections.spec.ts`

**Test Cases**:

1. **Click collection card navigates to collection detail page** (unauthenticated)
   - Seed featured collection with known slug
   - Navigate to home page
   - Wait for collections to load
   - Click first collection card
   - Verify navigation to `/collections/[slug]` URL
   - Verify collection detail page loads
   - Verify collection name on detail page matches card title

2. **Click collection card navigates to detail page** (authenticated)
   - Use `userPage` fixture
   - Seed featured collection with known slug
   - Navigate to home page
   - Wait for collections to load
   - Click first collection card
   - Verify navigation to collection detail page
   - Verify authenticated user sees additional features (like button enabled)

3. **Click "View All Collections" navigates to browse page** (unauthenticated)
   - Navigate to home page
   - Click "View All Collections" button
   - Verify navigation to `/browse` page
   - Verify browse page displays collections grid

4. **Collection cards are keyboard accessible** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load
   - Tab to first collection card (may need multiple tabs from top of page)
   - Verify card has focus indicator
   - Press Enter key
   - Verify navigation to collection detail page

**Patterns to Follow**:

- Use `await Promise.all([page.waitForURL(), card.click()])` for navigation
- Use `page.url()` or `expect(page).toHaveURL()` for URL verification
- Use `page.keyboard.press('Tab')` and `page.keyboard.press('Enter')` for keyboard interaction
- Use separate describe blocks for authenticated vs unauthenticated
- Extract collection slug from seeded data for URL verification

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "navigation"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "navigation"
```

**Success Criteria**:

- Navigation completes within 5 seconds
- Correct collection detail page loads with matching content
- Browse page navigation works
- Keyboard navigation is fully functional
- No JavaScript errors in console

---

### Step 5: Critical Priority - Authentication States (5 tests)

**Test Type**: E2E
**What**: Verify like status displays correctly for authenticated vs unauthenticated users
**Why**: CRITICAL - Authentication state affects displayed data, potential security risk if not isolated

**Files to Create**:

- `tests/e2e/specs/feature/featured-collections-auth.spec.ts`

**Test Cases**:

1. **Unauthenticated users see aggregate like counts only** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load
   - Verify likes count is visible on first card
   - Verify likes count is a number (aggregate count)
   - Verify no "liked" state indicator (heart should not be filled)

2. **Authenticated users see like status for collections they liked** (authenticated)
   - Seed featured collection that user has liked
   - Use `userPage` fixture
   - Navigate to home page
   - Wait for collections to load
   - Verify collection card shows user has liked it (isLiked: true)
   - Verify aggregate like count is also visible

3. **Authenticated users see aggregate counts for collections they haven't liked** (authenticated)
   - Seed featured collection that user has NOT liked
   - Use `userPage` fixture
   - Navigate to home page
   - Wait for collections to load
   - Verify collection card shows user has not liked it (isLiked: false)
   - Verify aggregate like count is visible

4. **Same collections display for authenticated and unauthenticated users** (cross-auth)
   - Navigate to home page as unauthenticated
   - Get collection titles from visible cards
   - Use `userPage` fixture
   - Navigate to home page as authenticated user
   - Get collection titles from visible cards
   - Verify same collections are displayed (titles match)
   - Verify order is consistent

5. **Cache isolation: User A's likes don't affect User B** (multi-user)
   - Seed collection that User A has liked but User B has not
   - Use `userPage` fixture (User A)
   - Navigate to home page
   - Verify collection shows as liked
   - Use `newUserPage` fixture (User B)
   - Navigate to home page
   - Verify same collection shows as NOT liked
   - Verify like counts are consistent

**Patterns to Follow**:

- Use custom fixtures: `page` (unauthenticated), `userPage` (authenticated), `newUserPage` (second user)
- Use database factories to seed likes: `createLike({ userId, targetId, targetType: 'collection' })`
- Use `FeaturedCollectionsDisplay` component data attributes for like status
- Reference `tests/e2e/specs/feature/newsletter-footer.spec.ts` for multi-auth patterns
- Check `isLiked` field from query (line 417 in featured-content-query.ts)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/feature/featured-collections-auth.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/feature/featured-collections-auth.spec.ts
```

**Success Criteria**:

- Like status is accurate for authenticated users
- Aggregate counts display for unauthenticated users
- Cache isolation verified (no data leaks between users)
- Same collections display regardless of auth state
- Tests are stable and not flaky

---

### Step 6: High Priority - State Handling (3 tests)

**Test Type**: E2E
**What**: Verify loading skeletons, empty states, and error boundaries
**Why**: HIGH - Proper state handling creates good UX and prevents crashes

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-collections.spec.ts`

**Test Cases**:

1. **Skeleton loader displays while collections load** (unauthenticated)
   - Navigate to home page with throttled network
   - Verify skeleton loader is visible immediately in featured collections section
   - Verify skeleton has 3 placeholder cards (desktop layout)
   - Wait for collections to load
   - Verify skeleton is replaced with actual collection cards

2. **Empty state displays when no featured collections exist** (unauthenticated)
   - Clear all featured collections from database (or set isActive: false)
   - Navigate to home page
   - Wait for section to load
   - Verify empty state is visible
   - Verify empty state message: "No featured collections available at this time."
   - Verify "Browse All Collections" link is visible in empty state
   - Verify no broken UI or error messages

3. **Error boundary catches featured collections errors** (unauthenticated)
   - Mock API to return error for featured collections (use page.route())
   - Navigate to home page
   - Verify error boundary displays fallback UI
   - Verify rest of page still functions (hero, trending sections visible)
   - Verify no console errors leak to user

**Patterns to Follow**:

- Use `page.route()` for network throttling: `page.route('**/*', route => route.continue({ delay: 2000 }))`
- Use `test.slow()` for network-throttled tests (multiplies timeout by 3)
- Use database clean-up to simulate missing data
- Use test ID: `byTestId('feature-collections-empty-state')`
- Use test ID: `byTestId('ui-skeleton-featured-collections')`
- Reference `ErrorBoundary` component name 'featured-collections' (line 34 in featured-collections-section.tsx)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "state"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "state"
```

**Success Criteria**:

- Skeleton displays before data loads
- Empty state displays with appropriate message when no data
- Error boundary prevents page crash on errors
- Rest of page remains functional in error state
- Tests handle async loading correctly

---

### Step 7: High Priority - Responsive Layout (5 tests)

**Test Type**: E2E
**What**: Verify featured collections layout adapts to different screen sizes
**Why**: HIGH - Layout must work correctly across devices (desktop, tablet, mobile)

**Files to Create**:

- `tests/e2e/specs/public/home-featured-collections-responsive.spec.ts`

**Test Cases**:

1. **Desktop layout displays 3 columns** (unauthenticated)
   - Set viewport to desktop (1280x720 or larger)
   - Seed at least 6 featured collections
   - Navigate to home page
   - Wait for collections to load
   - Verify at least 6 collection cards are visible
   - Verify grid has 3 columns layout (check CSS grid-cols-3)
   - Verify cards display in rows of 3

2. **Tablet layout displays 2 columns** (unauthenticated)
   - Set viewport to tablet (768px - 1023px, e.g., 768x1024)
   - Seed at least 6 featured collections
   - Navigate to home page
   - Wait for collections to load
   - Verify at least 4 collection cards are visible
   - Verify grid has 2 columns layout (check CSS grid-cols-2)
   - Verify cards display in rows of 2

3. **Mobile layout displays 1 column** (unauthenticated)
   - Set viewport to mobile (< 768px, e.g., 375x667)
   - Seed at least 6 featured collections
   - Navigate to home page
   - Wait for collections to load
   - Verify grid has 1 column layout (check CSS grid-cols-1)
   - Verify cards stack vertically

4. **Mobile shows first 3 cards only** (unauthenticated)
   - Set viewport to mobile (375x667)
   - Seed 6 featured collections
   - Navigate to home page
   - Wait for collections to load
   - Verify exactly 3 collection cards are visible
   - Verify 4th, 5th, 6th cards are hidden (check CSS display: none or visibility)
   - Verify "View All Collections" button is visible

5. **No horizontal scroll on any viewport** (unauthenticated)
   - Test on mobile, tablet, and desktop viewports
   - Navigate to home page
   - Wait for collections to load
   - Verify page body width does not exceed viewport width
   - Verify no horizontal scrollbar appears
   - Verify collections section fits within container

**Patterns to Follow**:

- Use `page.setViewportSize({ width, height })` for viewport changes
- Use `page.evaluate()` to check computed styles (grid-template-columns)
- Use `locator.count()` to verify visible card count
- Use `locator.isVisible()` to check visibility of specific cards
- Test viewports: Mobile (375x667), Tablet (768x1024), Desktop (1280x720, 1920x1080)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections-responsive.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections-responsive.spec.ts
```

**Success Criteria**:

- Layout adapts correctly to mobile (1 col), tablet (2 cols), desktop (3 cols)
- Mobile shows only first 3 cards, desktop shows all 6
- No horizontal scroll on any viewport
- Grid reflows properly on viewport change
- Text remains readable at all viewport sizes

---

### Step 8: Medium Priority - Accessibility (3 tests)

**Test Type**: E2E
**What**: Verify featured collections section meets accessibility standards
**Why**: MEDIUM - Ensure inclusive experience for all users (keyboard, screen reader)

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-collections.spec.ts`

**Test Cases**:

1. **Collection cards have proper ARIA attributes and semantic HTML** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load
   - Verify first collection card is a link (role="link")
   - Verify card has accessible name (collection title)
   - Verify image has alt text (collection title or placeholder text)
   - Verify icons have aria-hidden="true" (heart, eye, message, flame)
   - Verify stats are wrapped in semantic elements

2. **Keyboard navigation works through collection cards** (unauthenticated)
   - Navigate to home page
   - Wait for collections to load
   - Use Tab key to navigate to first collection card
   - Verify card has visible focus indicator (ring or border)
   - Continue tabbing to verify all cards are focusable
   - Press Enter on focused card
   - Verify navigation to collection detail page

3. **Section has proper heading hierarchy** (unauthenticated)
   - Navigate to home page
   - Verify featured collections section heading is h2
   - Verify collection card titles are h3
   - Verify no skipped heading levels (h1 -> h2 -> h3)
   - Use `page.accessibility.snapshot()` to check heading tree

**Patterns to Follow**:

- Use `locator.getAttribute('role')` for ARIA verification
- Use `locator.getAttribute('aria-hidden')` for decorative elements
- Use `locator.getAttribute('alt')` for image alt text
- Use keyboard navigation: `page.keyboard.press('Tab')`, `page.keyboard.press('Enter')`
- Use `page.accessibility.snapshot()` for heading hierarchy
- Reference WCAG 2.1 AA standards

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "accessibility"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "accessibility"
```

**Success Criteria**:

- All collection cards are keyboard accessible
- Proper ARIA attributes on interactive elements
- Heading hierarchy is correct (h2 -> h3)
- Focus indicators are visible
- Images have descriptive alt text
- Decorative icons have aria-hidden="true"

---

## Quality Gates

### Before Step 2 (After Infrastructure Setup)

- All Page Object locators compile without errors
- TypeScript compilation passes
- ESLint passes with no errors
- Page Object helper methods tested manually in UI mode

### After Step 4 (Critical Navigation Complete)

- All 12 critical tests (Steps 2-4) pass consistently (3 runs minimum)
- Collection cards display complete metadata
- Images load correctly (Cloudinary + placeholders)
- Navigation works 100% of the time
- No flaky tests

### After Step 5 (Critical Auth Complete)

- All 17 critical tests (Steps 2-5) pass consistently
- Like status displays correctly for auth vs unauth
- Cache isolation verified (no data leaks)
- Same collections display across auth states
- No security vulnerabilities detected

### After Step 7 (High Priority Complete)

- All 25 tests (critical + high) pass consistently
- Loading states work correctly
- Empty state displays when no data
- Responsive layout works on 3+ viewports
- Mobile shows first 3 cards only

### Final Gate (All Tests Complete)

- All 28 E2E tests pass consistently
- No flaky tests (100% pass rate over 5 runs)
- Test execution time under 12 minutes
- Accessibility tests pass
- All quality gates met

### CI/CD Integration

- Add to `unauthenticated` project in playwright.config.ts for public tests
- Add to `feature-tests` project for auth state tests
- Tests run on every PR that touches home page or featured content components
- Required CI check: `npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts`
- Required CI check: `npm run test:e2e -- tests/e2e/specs/feature/featured-collections-auth.spec.ts`

---

## Test Infrastructure Notes

### Playwright Configuration

- **Project**: Tests run in `unauthenticated` project for public tests
- **Project**: Tests run in `feature-tests` project for auth state tests
- **Timeout**: Default 60s (sufficient for async loading)
- **Retries**: 1 retry locally, 2 retries in CI (handles transient failures)
- **Viewport**: Desktop Chrome (1280x720) by default
- **Trace**: On first retry (for debugging failures)

### Database Seeding Approach

1. **Global Setup**: E2E branch created in `global.setup.ts`
2. **Test Setup**: Seed featured collections in `test.beforeEach()` or use existing data
3. **Factories**: Use `createFeaturedContent()`, `createCollection()`, `createUser()` from test fixtures
4. **Data Consistency**: Use fixed slugs/names for predictable tests
5. **Query Method**: `FeaturedContentQuery.getFeaturedCollectionsAsync()` returns up to 6 collections

### Featured Collections Query Details

From `src/lib/queries/featured-content/featured-content-query.ts`:

- Returns max 6 collections (line 461)
- Filters by `contentType: 'collection'`, `isActive: true`, date range
- Includes like status for authenticated users (userId parameter)
- Joins: collections, users (owner), likes (optional)
- Aggregates: totalItems, totalValue, likes count, comments count
- Returns: `FeaturedCollectionData` type (lines 41-58)

### Test Isolation

- Each test should be independent (no shared state)
- Use `test.beforeEach()` for test-specific setup
- Clean up test data in `test.afterEach()` if needed
- Use unique identifiers where necessary
- Database factories handle most data creation

### Performance Considerations

- Tests should complete in under 30 seconds each
- Use `waitForLoadState('domcontentloaded')` instead of 'networkidle' (faster)
- Use `test.slow()` for network-throttled tests (multiplies timeout by 3)
- Parallelize tests where possible (Playwright handles this)

---

## Risk Mitigation

### Flaky Test Prevention

1. **Explicit Waits**: Use `waitFor()` instead of `waitForTimeout()`
2. **Stable Selectors**: Prefer test IDs over CSS selectors
3. **Network Stability**: Use `page.waitForLoadState('domcontentloaded')`
4. **Animation Handling**: Account for hover animations and transitions
5. **Retry Logic**: Use Playwright's built-in retry mechanism

### Error Handling Strategy

1. **Error Boundaries**: Test that errors don't crash entire page
2. **Fallback UI**: Verify empty state displays when data is missing
3. **Network Errors**: Simulate failures with `page.route()`
4. **Timeout Errors**: Use appropriate timeout values for async operations
5. **Console Monitoring**: Use `page.on('console')` to catch warnings

### Maintenance Strategy

1. **Page Objects**: Keep locators centralized in Page Objects
2. **Test Data**: Use database factories for consistent test data
3. **Selectors**: Prefer test IDs and semantic queries (resilient to UI changes)
4. **Documentation**: Keep this plan updated as tests evolve
5. **Refactoring**: Extract common patterns to helper functions

---

## Test Execution Commands

### Run All Featured Collections Tests

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts
npm run test:e2e -- tests/e2e/specs/feature/featured-collections-auth.spec.ts
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections-responsive.spec.ts
```

### Run by Priority

```bash
# Critical tests only (Steps 2-5)
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "metadata|image|navigation"
npm run test:e2e -- tests/e2e/specs/feature/featured-collections-auth.spec.ts

# High priority tests (Steps 6-7)
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "state"
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections-responsive.spec.ts

# Medium priority tests (Step 8)
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "accessibility"
```

### Run with UI Mode (Debugging)

```bash
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-collections.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/feature/featured-collections-auth.spec.ts
```

### Run Specific Test

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-collections.spec.ts --grep "Collection cards display complete metadata"
```

---

## Implementation Checklist

Use this checklist to track progress:

### Infrastructure (Step 1)

- [ ] Page Object locators added to `home.page.ts`
- [ ] Helper methods added to `home.page.ts`
- [ ] TypeScript compilation passes
- [ ] ESLint passes

### Critical Priority (Steps 2-5)

- [ ] Display metadata tests (5 tests)
- [ ] Collection images tests (3 tests)
- [ ] Navigation tests (4 tests)
- [ ] Authentication state tests (5 tests)
- [ ] All critical tests pass consistently

### High Priority (Steps 6-7)

- [ ] State handling tests (3 tests)
- [ ] Responsive layout tests (5 tests)
- [ ] All high priority tests pass

### Medium Priority (Step 8)

- [ ] Accessibility tests (3 tests)
- [ ] All medium priority tests pass

### Final Validation

- [ ] All 28 tests pass (5 consecutive runs)
- [ ] No flaky tests
- [ ] CI/CD integration complete
- [ ] Documentation updated
- [ ] Code review completed

---

## Success Metrics

- **Test Coverage**: 28 E2E tests covering 50 identified gaps
- **Pass Rate**: 100% pass rate over 5 consecutive runs
- **Execution Time**: < 12 minutes for full suite
- **Maintenance**: Selectors use test IDs (80%+ coverage)
- **Stability**: Zero flaky tests after 10 runs
- **Coverage**: Critical gaps 100% covered, high/medium gaps 90%+ covered

---

## Notes

- E2E tests use real database (E2E branch) via Neon serverless
- Tests run against actual Next.js server (localhost:3000)
- Featured collections data is seeded using database factories
- Tests use Playwright's auto-retry for resilience
- Max 6 collections displayed per query (from featured-content-query.ts)
- Mobile viewport hides cards 4-6 (index >= 3) via CSS (line 49 in featured-collections-display.tsx)
- Like status requires userId parameter to getFeaturedCollectionsAsync()
- Authentication fixtures available: page, userPage, newUserPage, adminPage
