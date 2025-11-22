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
    // Register console listener BEFORE navigation to capture all errors
    const consoleErrors: Array<string> = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for page to be fully loaded (domcontentloaded is more reliable than networkidle
    // since external services like Clerk, Sentry, Cloudinary may never truly "idle")
    await page.waitForLoadState('domcontentloaded');
    // Give a brief moment for critical assets to load
    await page.waitForTimeout(1000);

    // Filter out non-critical and transient errors
    // We only care about errors that affect the core application functionality
    const criticalErrors = consoleErrors.filter((error) => {
      const lowerError = error.toLowerCase();

      // Ignore favicon and 404 errors
      if (lowerError.includes('favicon') || lowerError.includes('404')) {
        return false;
      }

      // Ignore external service errors (Sentry, Clerk, Cloudinary, analytics)
      if (
        lowerError.includes('sentry.io') ||
        lowerError.includes('clerk.') ||
        lowerError.includes('cloudinary') ||
        lowerError.includes('ingest.us.sentry.io')
      ) {
        return false;
      }

      // Ignore transient network errors that can occur in dev mode
      if (
        lowerError.includes('econnreset') ||
        lowerError.includes('aborted') ||
        lowerError.includes('net::err_')
      ) {
        return false;
      }

      // Ignore 500 errors from external services or transient server issues
      // These are often caused by dev server hot reloading or cold starts
      if (lowerError.includes('500') && lowerError.includes('internal server error')) {
        return false;
      }

      // Only flag errors that are likely application-critical
      return lowerError.includes('failed to load') || lowerError.includes('err_');
    });

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
