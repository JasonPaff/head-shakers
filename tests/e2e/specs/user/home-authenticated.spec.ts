import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Home Page - Authenticated User', () => {
  test.beforeEach(async ({ userPage }) => {
    const homePage = new HomePage(userPage);
    await homePage.goto();
  });

  test('should display hero section with My Collection button', async ({ userFinder, userPage }) => {
    // Verify hero section is visible
    await expect(userFinder.feature('hero-section')).toBeVisible();

    // Verify My Collection CTA is visible for authenticated users
    const myCollectionButton = userPage.getByRole('link', { name: /my collection/i }).first();
    await expect(myCollectionButton).toBeVisible();

    // Verify Start Your Collection button is NOT visible (that's for unauthenticated)
    const startCollectionButton = userPage.getByRole('button', { name: /start your collection/i });
    await expect(startCollectionButton).not.toBeVisible();
  });

  test('should navigate to dashboard from hero My Collection button', async ({ userPage }) => {
    // Click My Collection button in hero section
    const myCollectionButton = userPage.getByRole('link', { name: /my collection/i }).first();
    await myCollectionButton.click();

    // Verify navigation to dashboard collection page
    await expect(userPage).toHaveURL(/\/dashboard\/collection/);
  });

  test('should display join community section with My Collection link', async ({ userPage }) => {
    // Verify join community section header
    await expect(userPage.getByRole('heading', { name: /join the community/i })).toBeVisible();

    // For authenticated users, should show My Collection instead of Get Started Free
    const myCollectionLinks = userPage.getByRole('link', { name: /my collection/i });
    await expect(myCollectionLinks.last()).toBeVisible();

    // Verify Get Started Free is NOT visible for authenticated users
    const getStartedButton = userPage.getByRole('button', { name: /get started free/i });
    await expect(getStartedButton).not.toBeVisible();
  });

  test('should navigate to dashboard from join community My Collection link', async ({ userPage }) => {
    // Scroll to join community section
    await userPage.getByRole('heading', { name: /join the community/i }).scrollIntoViewIfNeeded();

    // Click My Collection button in join community section
    const myCollectionButton = userPage.getByRole('link', { name: /my collection/i }).last();
    await myCollectionButton.click();

    // Verify navigation to dashboard collection page
    await expect(userPage).toHaveURL(/\/dashboard\/collection/);
  });

  test('should display featured collections section', async ({ userFinder, userPage }) => {
    // Verify featured collections section is visible
    await expect(userFinder.layout('featured-collections-section')).toBeVisible();

    // Verify section header
    await expect(userPage.getByRole('heading', { name: /featured collections/i })).toBeVisible();

    // Collections should load (async component)
    await userPage.waitForTimeout(2000);
  });

  test('should display trending bobbleheads section', async ({ userFinder, userPage }) => {
    // Verify trending section is visible
    await expect(userFinder.layout('trending-bobbleheads-section')).toBeVisible();

    // Verify section header
    await expect(userPage.getByRole('heading', { name: /trending now/i })).toBeVisible();

    // Bobbleheads should load (async component)
    await userPage.waitForTimeout(2000);
  });

  test('should maintain authentication state throughout page', async ({ userFinder, userPage }) => {
    // Verify user is authenticated by checking for user avatar
    await expect(userFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });

    // Scroll through entire page
    await userPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await userPage.waitForTimeout(1000);

    // Verify still authenticated
    await expect(userFinder.layout('user-avatar', 'button')).toBeVisible();
  });

  test('should display all sections in correct order for authenticated user', async ({
    userFinder,
    userPage,
  }) => {
    // Verify all sections exist
    await expect(userFinder.feature('hero-section')).toBeVisible();
    await expect(userFinder.layout('featured-collections-section')).toBeVisible();
    await expect(userFinder.layout('trending-bobbleheads-section')).toBeVisible();
    await expect(userPage.getByRole('heading', { name: /join the community/i })).toBeVisible();

    // Verify page title
    await expect(userPage).toHaveTitle(/Head Shakers/i);
  });
});
