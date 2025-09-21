import { expect, test } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { createComponentFinder } from './helpers/test-helpers';

// Tests that require persistent authentication state
// These tests assume the user is already authenticated via global setup

test.describe('Authentication Flow', () => {
  test('should login and navigate to dashboard', async ({ page }) => {
    const finder = createComponentFinder(page);

    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);

    const dashboardHeader = finder.layout('app-header', 'dashboard');
    await expect(dashboardHeader).toBeVisible();
  });

  test('should access bobbleheads add page when authenticated', async ({ page }) => {
    await page.goto($path({ route: '/bobbleheads/add' }));

    await expect(page).toHaveURL(/.*bobbleheads\/add/);
    await expect(page.locator('h1')).toContainText(/add.*bobblehead/i);
  });
});

test.describe('Session Persistence', () => {
  test('should maintain authentication across page reloads', async ({ page }) => {
    const finder = createComponentFinder(page);

    // navigate to dashboard - should be authenticated from global setup
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);

    // verify authenticated state
    const dashboardHeader = finder.layout('app-header', 'dashboard');
    await expect(dashboardHeader).toBeVisible();

    // reload the page
    await page.reload();

    // should still be authenticated and on the same page
    await expect(page).toHaveURL(/.*dashboard\/collection/);
    await expect(dashboardHeader).toBeVisible();
  });

  test('should maintain authentication across browser navigation', async ({ page }) => {
    const finder = createComponentFinder(page);

    // start at dashboard
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // navigate to add bobblehead page
    await page.goto($path({ route: '/bobbleheads/add' }));
    await expect(page).toHaveURL(/.*bobbleheads\/add/);

    // navigate back to the dashboard
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();
  });

  test('should persist authentication across different protected routes', async ({ page }) => {
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/')));

      // each protected route should load without redirecting to the home
      await expect(page).not.toHaveURL($path({ route: '/' }));
    }
  });
});