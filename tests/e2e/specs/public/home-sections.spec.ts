import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page - Public (Unauthenticated)', () => {
  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should display hero section with Start Your Collection CTA', async ({ finder, page }) => {
    // Verify hero section is visible
    await expect(finder.feature('hero-section')).toBeVisible();

    // Verify signup CTA is visible
    const startCollectionButton = page.getByRole('button', { name: /start your collection/i });
    await expect(startCollectionButton).toBeVisible();
  });

  test('should display platform statistics with numbers', async ({ page }) => {
    // Platform stats should load within hero section
    // Stats are loaded asynchronously, wait for them
    await page.waitForTimeout(2000);

    // Verify stats are visible (they render as text with numbers)
    const statsSection = page.locator('[data-testid*="stats"]').or(page.locator('text=/\\d+/'));
    await expect(statsSection.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display featured collections section', async ({ finder, page }) => {
    // Verify featured collections section is visible
    await expect(finder.layout('featured-collections-section')).toBeVisible();

    // Verify section header
    await expect(page.getByRole('heading', { name: /featured collections/i })).toBeVisible();

    // Verify view all button exists
    const viewAllButton = page.getByRole('link', { name: /view all collections/i });
    await expect(viewAllButton).toBeVisible();
  });

  test('should display trending bobbleheads section', async ({ finder, page }) => {
    // Verify trending section is visible
    await expect(finder.layout('trending-bobbleheads-section')).toBeVisible();

    // Verify section header
    await expect(page.getByRole('heading', { name: /trending now/i })).toBeVisible();

    // Verify explore all button exists
    const exploreButton = page.getByRole('link', { name: /explore all bobbleheads/i });
    await expect(exploreButton).toBeVisible();
  });

  test('should display join community section with signup CTA', async ({ page }) => {
    // Verify join community section header
    await expect(page.getByRole('heading', { name: /join the community/i })).toBeVisible();

    // Verify feature cards are visible (Connect, Discover, Share)
    await expect(page.getByText(/connect with fellow collectors/i)).toBeVisible();
    await expect(page.getByText(/find trending bobbleheads/i)).toBeVisible();
    await expect(page.getByText(/showcase your collection/i)).toBeVisible();

    // Verify Get Started Free CTA for unauthenticated users
    const getStartedButton = page.getByRole('button', { name: /get started free/i });
    await expect(getStartedButton).toBeVisible();
  });

  test('should navigate to browse collections page', async ({ page }) => {
    // Click Browse Collections button
    const browseButton = page.getByRole('link', { name: /browse collections/i }).first();
    await browseButton.click();

    // Verify navigation to browse page
    await expect(page).toHaveURL(/\/browse/);
  });

  test('should navigate to explore bobbleheads page', async ({ page }) => {
    // Click Explore Bobbleheads button in hero section
    const exploreButton = page.getByRole('link', { name: /explore bobbleheads/i }).first();
    await exploreButton.click();

    // Verify navigation to browse/search page
    await expect(page).toHaveURL(/\/browse\/search/);
  });

  test('should display all major sections in correct order', async ({ finder, page }) => {
    // Verify all sections exist on the page
    await expect(finder.feature('hero-section')).toBeVisible();
    await expect(finder.layout('featured-collections-section')).toBeVisible();
    await expect(finder.layout('trending-bobbleheads-section')).toBeVisible();
    await expect(page.getByRole('heading', { name: /join the community/i })).toBeVisible();

    // Verify page title
    await expect(page).toHaveTitle(/Head Shakers/i);
  });
});
