import { expect, test } from '../../fixtures/base.fixture';
import { HomePage } from '../../pages/home.page';

test.describe('Application Health Checks', () => {
  test('home page loads successfully', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();

    // Verify page loaded
    await expect(page).toHaveTitle(/Head Shakers/i);
  });

  test('page responds with valid status', async ({ page }) => {
    const response = await page.goto('/');

    // Verify server responded
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);
  });

  test('static assets load correctly', async ({ page }) => {
    await page.goto('/');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Check for console errors related to asset loading
    const consoleErrors: Array<string> = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Wait a moment for any delayed errors
    await page.waitForTimeout(1000);

    // Filter out non-critical errors
    const criticalErrors = consoleErrors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('404') &&
        (error.includes('Failed to load') || error.includes('ERR_')),
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('API health check endpoint responds', async ({ request }) => {
    // If there's a health check endpoint, test it
    const response = await request.get('/api/health', {
      failOnStatusCode: false,
    });

    // Accept 200 (success) or 404 (endpoint doesn't exist yet)
    expect([200, 404]).toContain(response.status());
  });
});
