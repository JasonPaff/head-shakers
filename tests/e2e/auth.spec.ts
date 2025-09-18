import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { $path } from 'next-typesafe-url';

test.describe('Authentication Flow', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    await page.goto($path({ route: '/' }));
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);
    const dashboardHeader = page.locator('[data-testid="dashboard-header"]');
    await expect(dashboardHeader).toBeVisible();
  });

  test('should access bobbleheads add page when authenticated', async ({ page }) => {
    await page.goto($path({ route: '/bobbleheads/add' }));
    await expect(page).toHaveURL(/.*bobbleheads\/add/);
    await expect(page.locator('h1')).toContainText(/add.*bobblehead/i);
  });

  test('should sign out successfully', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await clerk.signOut({ page });
    await expect(page).toHaveURL($path({ route: '/' }));
  });
});

test.describe('Unauthenticated Access', () => {
  test('should redirect to homepage when accessing protected route', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await clerk.signOut({ page });
    await expect(page).toHaveURL($path({ route: '/' }));
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL($path({ route: '/' }));
  });
});
