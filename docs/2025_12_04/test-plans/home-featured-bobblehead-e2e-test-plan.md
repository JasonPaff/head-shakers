# E2E Test Implementation Plan: Home Page Featured Bobblehead Section

Generated: 2025-12-04
Scope: E2E tests only (Playwright)

## Overview

- **Total tests**: 23 E2E tests across 3 spec files
- **Complexity**: Medium (visual components, async loading, navigation, responsive design)
- **Risk level**: High (homepage hero feature, first impression for users)
- **Estimated effort**: 8-10 hours (distributed across multiple sessions)

### Test Distribution

- **Critical Priority**: 8 tests (card visibility, navigation, loading states, stats)
- **High Priority**: 6 tests (floating cards, editor's pick badge, responsive layout, description)
- **Medium Priority**: 9 tests (auth state consistency, error handling, image performance)

## Prerequisites

### Required Test Infrastructure (Already Available)

- `tests/e2e/pages/home.page.ts` - HomePage Page Object
- `tests/e2e/pages/base.page.ts` - Base Page Object
- `tests/e2e/fixtures/base.fixture.ts` - Custom Playwright fixtures with ComponentFinder
- `tests/fixtures/featured-content.factory.ts` - Featured content database factory
- `tests/fixtures/bobblehead.factory.ts` - Bobblehead database factory
- `tests/fixtures/collection.factory.ts` - Collection database factory
- `tests/fixtures/user.factory.ts` - User database factory
- `playwright.config.ts` - Playwright configuration with auth setup

### Additional Infrastructure Needed (Step 1)

- HomePage Page Object locators for featured bobblehead elements
- E2E database seeding script for featured bobblehead test data
- Helper methods for featured bobblehead interactions

---

## Implementation Steps

### Step 1: Page Object Enhancement

**Test Type**: infrastructure
**What**: Add locators and helper methods to HomePage Page Object for featured bobblehead section
**Why**: CRITICAL - Page Object pattern ensures maintainable, reusable test code

**Files to Modify**:

- `tests/e2e/pages/home.page.ts`

**Locators to Add**:

```typescript
// Featured Bobblehead Section (in hero)
get featuredBobbleheadSection(): Locator
get featuredBobbleheadCard(): Locator
get featuredBobbleheadImage(): Locator
get featuredBobbleheadBadge(): Locator
get featuredBobbleheadTitle(): Locator
get featuredBobbleheadDescription(): Locator
get featuredBobbleheadLikesCount(): Locator
get featuredBobbleheadViewsCount(): Locator
get featuredBobbleheadTopRatedCard(): Locator
get featuredBobbleheadValueGrowthCard(): Locator
get featuredBobbleheadSkeleton(): Locator
```

**Helper Methods to Add**:

```typescript
async clickFeaturedBobblehead(): Promise<void>
async getFeaturedBobbleheadName(): Promise<string>
async waitForFeaturedBobbleheadLoad(): Promise<void>
async isFeaturedBobbleheadVisible(): Promise<boolean>
```

**Patterns to Follow**:

- Use `byTestId()` method from BasePage for test ID selectors
- Use `getByRole()` for semantic queries where appropriate
- Follow existing HomePage locator patterns
- Use Playwright's chaining for nested locators

**Validation Commands**:

```bash
npm run typecheck
npm run lint
```

**Success Criteria**:

- All locators compile without TypeScript errors
- Helper methods use proper Playwright Locator API
- Follows existing Page Object patterns in codebase

---

### Step 2: E2E Database Seeding Script

**Test Type**: infrastructure
**What**: Create database seeding script for featured bobblehead test data
**Why**: E2E tests need consistent test data in the E2E database branch

**Files to Create**:

- `tests/e2e/scripts/seed-featured-bobblehead.ts`

**Seeding Logic**:

```typescript
// Create test user
// Create test collection
// Create test bobblehead with specific properties
// Create featured content record linking to bobblehead
// Return IDs for test reference
```

**Patterns to Follow**:

- Reference `tests/e2e/scripts/seed-test-users.ts` for script structure
- Use database factories from `tests/fixtures/`
- Use `getTestDb()` for database connection
- Export seed function for use in tests
- Clean up after tests (delete featured content record)

**Validation Commands**:

```bash
npm run typecheck
npm run test:e2e -- --grep @setup
```

**Success Criteria**:

- Script successfully creates featured bobblehead data
- Featured content record is active and has correct featureType
- Can be called from E2E test setup
- Clean up function removes test data

---

### Step 3: Critical Priority - Card Visibility (2 tests)

**Test Type**: E2E
**What**: Verify featured bobblehead card renders and is visible
**Why**: CRITICAL - Users cannot engage with feature if card doesn't render

**Files to Create**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Featured bobblehead card is visible on page load** (unauthenticated)
   - Navigate to home page
   - Verify featured bobblehead section is visible
   - Verify featured bobblehead card is visible
   - Verify card has expected structure (image, badge, title, stats)

2. **Featured bobblehead card is visible for authenticated users**
   - Navigate to home page as authenticated user
   - Verify featured bobblehead section is visible
   - Verify featured bobblehead card is visible
   - Verify same card structure as unauthenticated

**Patterns to Follow**:

- Use `test.describe()` blocks for grouping
- Use `test.beforeEach()` for common setup
- Use ComponentFinder fixture: `finder.feature('bobblehead-card')`
- Use `await expect(locator).toBeVisible()` assertions
- Reference `tests/e2e/specs/public/home-sections.spec.ts` for structure

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts
```

**Success Criteria**:

- Tests pass consistently (not flaky)
- Card visibility verified within 5 seconds
- Tests work for both authenticated and unauthenticated states

---

### Step 4: Critical Priority - Navigation/Click-Through (3 tests)

**Test Type**: E2E
**What**: Verify users can click through to bobblehead detail page
**Why**: CRITICAL - Primary user flow from homepage to detail view

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Click featured bobblehead navigates to detail page** (unauthenticated)
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Click featured bobblehead card
   - Verify navigation to bobblehead detail page (URL matches `/bobbleheads/[slug]`)
   - Verify detail page displays correct bobblehead name

2. **Click featured bobblehead navigates to detail page** (authenticated)
   - Use `userPage` fixture
   - Navigate to home page
   - Click featured bobblehead card
   - Verify navigation to detail page
   - Verify authenticated user can see additional features (like button, etc.)

3. **Featured bobblehead link is keyboard accessible**
   - Navigate to home page
   - Tab to featured bobblehead card
   - Verify card has focus
   - Press Enter key
   - Verify navigation occurs

**Patterns to Follow**:

- Use `await Promise.all([page.waitForURL(), card.click()])` for navigation
- Use `page.url()` or `expect(page).toHaveURL()` for URL verification
- Use `page.keyboard.press('Enter')` for keyboard interaction
- Use separate describe blocks for authenticated vs unauthenticated

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "navigation"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "navigation"
```

**Success Criteria**:

- Navigation completes within 5 seconds
- Correct bobblehead detail page loads
- Keyboard navigation works (accessibility)
- No JavaScript errors in console

---

### Step 5: Critical Priority - Loading States (4 tests)

**Test Type**: E2E
**What**: Verify skeleton loading states and async data fetching
**Why**: CRITICAL - Poor loading UX creates negative first impression

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Skeleton loader displays while featured bobblehead loads**
   - Navigate to home page with throttled network
   - Verify skeleton loader is visible immediately
   - Wait for featured bobblehead to load
   - Verify skeleton is replaced with actual card

2. **Featured bobblehead loads within acceptable time**
   - Navigate to home page
   - Start timer
   - Wait for featured bobblehead card to be visible
   - Assert load time is under 3 seconds

3. **Hero section displays correctly while bobblehead loads**
   - Navigate to home page
   - Verify hero section content is visible immediately (title, CTA buttons)
   - Verify featured bobblehead area has placeholder (skeleton)
   - Verify layout doesn't shift when bobblehead loads (no CLS)

4. **Featured bobblehead loads after navigation from another page**
   - Navigate to about page
   - Navigate to home page
   - Verify featured bobblehead loads correctly
   - Verify no stale data from previous visit

**Patterns to Follow**:

- Use `page.route()` for network throttling in Playwright
- Use `test.slow()` for network-throttled tests
- Use `await expect(locator).toBeVisible({ timeout: 3000 })` for timing assertions
- Reference `tests/e2e/specs/feature/newsletter-footer.spec.ts` for async patterns

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "loading"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "loading"
```

**Success Criteria**:

- Skeleton loader displays before data loads
- Load time consistently under 3 seconds
- No layout shift (CLS) during load
- Tests handle race conditions correctly

---

### Step 6: Critical Priority - Stats Display (2 tests)

**Test Type**: E2E
**What**: Verify likes and views counts display correctly
**Why**: CRITICAL - Engagement metrics drive user trust and interest

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Likes count displays with correct formatting**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify likes count is visible
   - Verify likes count has heart icon
   - Verify number formatting (e.g., "1,234" or "1.2K")

2. **Views count displays with correct formatting**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify views count is visible
   - Verify views count has eye icon
   - Verify number formatting matches likes

**Patterns to Follow**:

- Use `locator.textContent()` to extract count values
- Use regex to validate number formatting: `/\d{1,3}(,\d{3})*|\d+\.?\d*[KMB]/`
- Use `getByRole('img')` or `locator.locator('svg')` for icon verification
- Use custom assertions for number format validation

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "stats"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "stats"
```

**Success Criteria**:

- Likes and views counts are visible
- Icons render correctly
- Number formatting is consistent
- Counts are non-negative numbers

---

### Step 7: High Priority - Floating Cards (2 tests)

**Test Type**: E2E
**What**: Verify Top Rated and Value Growth floating cards render
**Why**: HIGH - Key visual elements that differentiate featured content

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Top Rated floating card is visible**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify "Top Rated" card is visible
   - Verify card contains trophy icon
   - Verify card contains "This Week" text
   - Verify card has animation (check CSS class)

2. **Value Growth floating card is visible**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify "Value Growth" card is visible
   - Verify card contains trending up icon
   - Verify card contains percentage (e.g., "+23%")
   - Verify card has animation with delay

**Patterns to Follow**:

- Use test IDs: `byTestId('feature-bobblehead-card-top-rated-card')`
- Use `locator.locator('svg')` to verify icon presence
- Use `page.evaluate()` to check animation CSS properties if needed
- Verify `aria-hidden` attribute is set (decorative elements)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "floating"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "floating"
```

**Success Criteria**:

- Both floating cards are visible
- Icons and text content correct
- Cards don't interfere with main card interaction
- aria-hidden set correctly

---

### Step 8: High Priority - Editor's Pick Badge (1 test)

**Test Type**: E2E
**What**: Verify Editor's Pick badge displays on featured bobblehead
**Why**: HIGH - Key indicator that distinguishes featured content

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Editor's Pick badge displays with crown icon**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify badge is visible on card
   - Verify badge text is "Editor's Pick"
   - Verify badge has crown icon
   - Verify badge styling (gradient background)

**Patterns to Follow**:

- Use test ID: `byTestId('feature-bobblehead-card-badge')`
- Use `getByText(/editor's pick/i)` for text verification
- Use `locator.locator('[data-slot="hero-featured-badge"]')` for specific badge
- Verify badge is within the card overlay (bottom section)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "badge"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "badge"
```

**Success Criteria**:

- Badge is visible and correctly positioned
- Text and icon are correct
- Badge styling renders correctly
- Badge doesn't obscure important content

---

### Step 9: High Priority - Responsive Layout (2 tests)

**Test Type**: E2E
**What**: Verify featured bobblehead displays correctly on mobile and desktop
**Why**: HIGH - Layout must adapt to different screen sizes

**Files to Create**:

- `tests/e2e/specs/public/home-featured-bobblehead-responsive.spec.ts`

**Test Cases**:

1. **Featured bobblehead displays correctly on mobile viewport**
   - Set viewport to iPhone 12 (390x844)
   - Navigate to home page
   - Verify featured bobblehead is visible
   - Verify card is full-width (no side padding)
   - Verify floating cards are visible (may stack differently)
   - Verify touch target is large enough (at least 44x44px)

2. **Featured bobblehead displays correctly on desktop viewport**
   - Set viewport to 1920x1080
   - Navigate to home page
   - Verify featured bobblehead is in right column
   - Verify hero text is in left column
   - Verify floating cards are absolutely positioned
   - Verify aspect ratio is correct (square)

**Patterns to Follow**:

- Use `page.setViewportSize()` for viewport changes
- Use `page.evaluate()` to check computed styles (width, padding)
- Use `locator.boundingBox()` to verify touch target size
- Use devices from `playwright.config.ts` or custom viewport sizes

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead-responsive.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead-responsive.spec.ts
```

**Success Criteria**:

- Layout adapts correctly on mobile (< 768px)
- Layout adapts correctly on tablet (768px - 1024px)
- Layout adapts correctly on desktop (> 1024px)
- No horizontal scroll on any viewport
- Touch targets meet accessibility standards (44x44px minimum)

---

### Step 10: High Priority - Description Text (1 test)

**Test Type**: E2E
**What**: Verify featured bobblehead description displays when present
**Why**: HIGH - Description provides context and increases engagement

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Description displays when featured bobblehead has description**
   - Seed featured bobblehead with description
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify description text is visible
   - Verify description is in card overlay (below title)
   - Verify description truncates appropriately if too long

**Patterns to Follow**:

- Use seeding script to ensure test bobblehead has description
- Use `getByText()` or test ID for description locator
- Use `locator.textContent()` to verify description matches expected
- Consider testing both with and without description (conditional rendering)

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "description"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "description"
```

**Success Criteria**:

- Description displays when present
- Description doesn't display when absent (null)
- Text is readable (contrast, size)
- Long descriptions are handled gracefully

---

### Step 11: Medium Priority - Auth State Consistency (2 tests)

**Test Type**: E2E
**What**: Verify featured bobblehead displays consistently across auth states
**Why**: MEDIUM - UI should be consistent regardless of authentication

**Files to Create**:

- `tests/e2e/specs/feature/featured-bobblehead-auth.spec.ts`

**Test Cases**:

1. **Same featured bobblehead shows for authenticated and unauthenticated users**
   - Navigate to home page as unauthenticated
   - Get featured bobblehead name and slug
   - Sign in as user
   - Navigate to home page
   - Verify same bobblehead is featured (name and slug match)

2. **Featured bobblehead preferences persist across sessions**
   - Navigate to home page as authenticated user
   - Note featured bobblehead
   - Sign out
   - Navigate to home page
   - Verify same featured bobblehead displays
   - Sign back in
   - Verify still same featured bobblehead

**Patterns to Follow**:

- Use custom fixtures: `page` (unauthenticated), `userPage` (authenticated)
- Use helper method to extract bobblehead identifier
- Use `page.context().clearCookies()` to simulate sign out
- Reference `tests/e2e/specs/feature/newsletter-footer.spec.ts` for multi-auth patterns

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/feature/featured-bobblehead-auth.spec.ts
npm run test:e2e:ui -- tests/e2e/specs/feature/featured-bobblehead-auth.spec.ts
```

**Success Criteria**:

- Featured content is consistent across auth states
- No stale data or caching issues
- Sign in/out doesn't affect featured content
- Tests are stable and not flaky

---

### Step 12: Medium Priority - Error Handling (2 tests)

**Test Type**: E2E
**What**: Verify graceful error handling when featured bobblehead fails to load
**Why**: MEDIUM - App should handle errors gracefully without crashing

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Hero section displays correctly when no featured bobblehead exists**
   - Clear featured content from database
   - Navigate to home page
   - Verify hero section still displays
   - Verify hero text and CTAs are visible
   - Verify right column is empty or shows fallback
   - Verify no error messages or broken UI

2. **Error boundary catches featured bobblehead errors**
   - Mock API to return error for featured bobblehead
   - Navigate to home page
   - Verify error boundary displays fallback UI
   - Verify rest of page still functions
   - Verify no console errors leak to user

**Patterns to Follow**:

- Use `page.route()` to intercept and mock API responses
- Use database clean-up to simulate missing data
- Use `page.on('console')` to capture console errors
- Verify error boundary test ID: `byTestId('error-boundary-featured-bobblehead-showcase')`

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "error"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "error"
```

**Success Criteria**:

- Page doesn't crash when featured bobblehead fails
- Error boundary displays appropriate fallback
- Hero section remains functional
- User can still navigate to other sections

---

### Step 13: Medium Priority - Image Performance (1 test)

**Test Type**: E2E
**What**: Verify featured bobblehead images load efficiently
**Why**: MEDIUM - Image performance affects page load and user experience

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Featured bobblehead image loads with Cloudinary optimizations**
   - Navigate to home page
   - Wait for featured bobblehead image to load
   - Verify image src is Cloudinary URL
   - Verify image has blur placeholder
   - Verify image dimensions are appropriate (not oversized)
   - Verify image format is modern (webp/avif)
   - Verify image loads within 2 seconds

**Patterns to Follow**:

- Use `page.on('request')` to capture image requests
- Use `page.on('response')` to check image headers (Content-Type)
- Use `locator.getAttribute('src')` to verify Cloudinary URL
- Use Performance API to measure image load time
- Check for blur placeholder: `locator.getAttribute('placeholder')`

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "image"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "image"
```

**Success Criteria**:

- Image loads from Cloudinary CDN
- Blur placeholder displays during load
- Image format is optimized (webp)
- Image dimensions match viewport requirements
- Load time is under 2 seconds

---

### Step 14: Medium Priority - Accessibility (2 tests)

**Test Type**: E2E
**What**: Verify featured bobblehead section meets accessibility standards
**Why**: MEDIUM - Ensure inclusive experience for all users

**Files to Modify**:

- `tests/e2e/specs/public/home-featured-bobblehead.spec.ts`

**Test Cases**:

1. **Featured bobblehead card has proper ARIA attributes**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Verify card is a link with role="link"
   - Verify card has accessible name (bobblehead title)
   - Verify image has alt text
   - Verify floating cards have aria-hidden="true"
   - Verify stats icons have aria-hidden="true"

2. **Featured bobblehead section has proper semantic structure**
   - Navigate to home page
   - Verify hero section has proper heading hierarchy (h1 -> h3)
   - Verify featured bobblehead title is h3
   - Verify no skipped heading levels
   - Verify link is keyboard focusable
   - Verify link has visible focus indicator

**Patterns to Follow**:

- Use `locator.getAttribute('role')` for ARIA verification
- Use `locator.getAttribute('aria-hidden')` for decorative elements
- Use `page.accessibility.snapshot()` for heading hierarchy
- Use keyboard navigation tests (Tab, Enter)
- Reference WCAG 2.1 AA standards

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "accessibility"
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "accessibility"
```

**Success Criteria**:

- All interactive elements are keyboard accessible
- Proper ARIA attributes on all elements
- Heading hierarchy is correct
- Focus indicators are visible
- Alt text is descriptive

---

### Step 15: Medium Priority - Visual Regression (2 tests)

**Test Type**: E2E
**What**: Verify featured bobblehead visual appearance doesn't regress
**Why**: MEDIUM - Catch unintended visual changes

**Files to Create**:

- `tests/e2e/specs/visual/home-featured-bobblehead-visual.spec.ts`

**Test Cases**:

1. **Featured bobblehead section matches visual snapshot (light theme)**
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Take screenshot of featured bobblehead section
   - Compare with baseline snapshot
   - Verify no visual regressions

2. **Featured bobblehead section matches visual snapshot (dark theme)**
   - Set color scheme to dark
   - Navigate to home page
   - Wait for featured bobblehead to load
   - Take screenshot of featured bobblehead section
   - Compare with baseline snapshot
   - Verify dark theme renders correctly

**Patterns to Follow**:

- Use `await expect(locator).toHaveScreenshot()` for visual regression
- Use `page.emulateMedia({ colorScheme: 'dark' })` for dark theme
- Use threshold for pixel differences: `maxDiffPixelRatio: 0.01`
- Seed consistent test data for visual tests
- Use `test.slow()` for screenshot tests

**Validation Commands**:

```bash
npm run test:e2e -- tests/e2e/specs/visual/home-featured-bobblehead-visual.spec.ts
npm run test:e2e -- tests/e2e/specs/visual/home-featured-bobblehead-visual.spec.ts --update-snapshots
```

**Success Criteria**:

- Baseline snapshots captured for light/dark themes
- Visual regression tests pass consistently
- Snapshots account for dynamic content (use consistent seed data)
- Tests don't fail due to animation frames

---

## Quality Gates

### Before Step 3 (After Infrastructure Setup)

- All Page Object locators compile without errors
- Database seeding script successfully creates test data
- TypeScript compilation passes
- ESLint passes with no errors

### After Step 6 (Critical Priority Complete)

- All 8 critical tests pass consistently (3 runs minimum)
- Featured bobblehead card visible in < 5 seconds
- Navigation works 100% of the time
- Loading states are stable (no flaky tests)
- Stats display correctly formatted

### After Step 10 (High Priority Complete)

- All 14 tests (critical + high) pass consistently
- Floating cards render correctly
- Editor's Pick badge displays
- Responsive layout works on 3+ viewports
- Description renders conditionally

### Final Gate (All Tests Complete)

- All 23 E2E tests pass consistently
- No flaky tests (100% pass rate over 5 runs)
- Test execution time under 10 minutes
- Visual snapshots are stable
- Accessibility tests pass

### CI/CD Integration

- Add to `unauthenticated` project in playwright.config.ts
- Add to `feature-tests` project for cross-auth tests
- Tests run on every PR that touches home page components
- Required CI check: `npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts`
- Optional CI check: Visual regression tests (run on schedule)

---

## Test Infrastructure Notes

### Playwright Configuration

- **Project**: Tests will run in `unauthenticated` project for public tests
- **Project**: Tests will run in `feature-tests` project for auth state tests
- **Timeout**: Default 60s (sufficient for async loading)
- **Retries**: 1 retry locally, 2 retries in CI (handles transient failures)
- **Viewport**: Desktop Chrome (1280x720) by default
- **Trace**: On first retry (for debugging failures)

### Database Seeding Approach

1. **Global Setup**: E2E branch created in `global.setup.ts`
2. **Test Setup**: Seed featured bobblehead data in `test.beforeEach()` or `test.beforeAll()`
3. **Test Teardown**: Clean up featured content in `test.afterEach()` or `test.afterAll()`
4. **Factories**: Use `createTestFeaturedBobbleheadContent()` from `tests/fixtures/featured-content.factory.ts`
5. **Data Consistency**: Use fixed slug/name for predictable tests

### Mock Requirements

- **Network Mocking**: Use `page.route()` for error simulation only
- **API Mocking**: Not needed (tests use real E2E database)
- **Image Mocking**: Not needed (use real Cloudinary URLs or fallback)
- **Time Mocking**: Not needed (tests don't depend on specific times)

### Test Isolation

- Each test should be independent (no shared state)
- Use `test.beforeEach()` for test-specific setup
- Clean up test data in `test.afterEach()` to avoid pollution
- Use unique identifiers (timestamps) where needed

### Performance Considerations

- Tests should complete in under 30 seconds each
- Use `waitForLoadState('networkidle')` sparingly (prefer specific waits)
- Use `test.slow()` for network-throttled tests (multiplies timeout by 3)
- Parallelize tests where possible (Playwright handles this)

---

## Risk Mitigation

### Flaky Test Prevention

1. **Explicit Waits**: Use `waitFor()` instead of `waitForTimeout()`
2. **Stable Selectors**: Prefer test IDs over CSS selectors
3. **Network Stability**: Use `page.waitForLoadState('domcontentloaded')`
4. **Animation Handling**: Disable animations in tests if needed
5. **Retry Logic**: Use Playwright's built-in retry mechanism

### Error Handling Strategy

1. **Error Boundaries**: Test that errors don't crash entire page
2. **Fallback UI**: Verify fallback displays when data is missing
3. **Console Errors**: Capture and assert on console errors
4. **Network Errors**: Simulate network failures with `page.route()`
5. **Timeout Errors**: Use appropriate timeout values for async operations

### Maintenance Strategy

1. **Page Objects**: Keep locators centralized in Page Objects
2. **Test Data**: Use database factories for consistent test data
3. **Selectors**: Prefer semantic queries and test IDs (resilient to UI changes)
4. **Documentation**: Keep this plan updated as tests evolve
5. **Refactoring**: Extract common patterns to helper functions

---

## Test Execution Commands

### Run All Featured Bobblehead Tests

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead-responsive.spec.ts
npm run test:e2e -- tests/e2e/specs/feature/featured-bobblehead-auth.spec.ts
```

### Run by Priority

```bash
# Critical tests only
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "Critical|visibility|navigation|loading|stats"

# High priority tests
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "floating|badge|description"
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead-responsive.spec.ts

# Medium priority tests
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "error|image|accessibility"
npm run test:e2e -- tests/e2e/specs/feature/featured-bobblehead-auth.spec.ts
```

### Run with UI Mode (Debugging)

```bash
npm run test:e2e:ui -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts
```

### Run Specific Test

```bash
npm run test:e2e -- tests/e2e/specs/public/home-featured-bobblehead.spec.ts --grep "Featured bobblehead card is visible"
```

### Update Visual Snapshots

```bash
npm run test:e2e -- tests/e2e/specs/visual/home-featured-bobblehead-visual.spec.ts --update-snapshots
```

---

## Implementation Checklist

Use this checklist to track progress:

### Infrastructure (Steps 1-2)

- [ ] Page Object locators added to `home.page.ts`
- [ ] Helper methods added to `home.page.ts`
- [ ] Database seeding script created
- [ ] TypeScript compilation passes
- [ ] ESLint passes

### Critical Priority (Steps 3-6)

- [ ] Card visibility tests (2 tests)
- [ ] Navigation tests (3 tests)
- [ ] Loading state tests (4 tests)
- [ ] Stats display tests (2 tests)
- [ ] All critical tests pass consistently

### High Priority (Steps 7-10)

- [ ] Floating cards tests (2 tests)
- [ ] Editor's Pick badge test (1 test)
- [ ] Responsive layout tests (2 tests)
- [ ] Description text test (1 test)
- [ ] All high priority tests pass

### Medium Priority (Steps 11-15)

- [ ] Auth state consistency tests (2 tests)
- [ ] Error handling tests (2 tests)
- [ ] Image performance test (1 test)
- [ ] Accessibility tests (2 tests)
- [ ] Visual regression tests (2 tests)
- [ ] All medium priority tests pass

### Final Validation

- [ ] All 23 tests pass (5 consecutive runs)
- [ ] No flaky tests
- [ ] CI/CD integration complete
- [ ] Documentation updated
- [ ] Code review completed

---

## Success Metrics

- **Test Coverage**: 23 E2E tests covering 11 coverage gaps
- **Pass Rate**: 100% pass rate over 5 consecutive runs
- **Execution Time**: < 10 minutes for full suite
- **Maintenance**: Selectors use test IDs (80%+ coverage)
- **Stability**: Zero flaky tests after 10 runs
- **Coverage**: Critical gaps fully covered, high/medium gaps 85%+ covered

---

## Notes

- E2E tests use real database (E2E branch) via Testcontainers
- Tests run against actual Next.js server (localhost:3000)
- Featured bobblehead data is seeded before tests
- Tests use Playwright's auto-retry for resilience
- Visual regression tests may need baseline updates periodically
- Mobile tests should be run on actual devices occasionally for validation
- Performance tests should be run with production build for accuracy
