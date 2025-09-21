import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { createComponentFinder } from './helpers/test-helpers';

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

  test('should sign out successfully', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    await expect(page).toHaveURL($path({ route: '/' }));
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

test.describe('Logout Functionality', () => {
  test('should sign out and clear authentication state', async ({ page }) => {
    const finder = createComponentFinder(page);

    // verify we start authenticated
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // sign out and wait for navigation to complete
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    // should redirect to the home page
    await expect(page).toHaveURL($path({ route: '/' }));

    // verify we're on home page with unauthenticated UI
    await expect(page.locator('button:text("Sign In")')).toBeVisible();
    await expect(page.locator('button:text("Sign Up")')).toBeVisible();
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    const finder = createComponentFinder(page);

    // start authenticated
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // sign out and wait for navigation to complete
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));

    // verify we see the unauthenticated UI
    await expect(page.locator('button:text("Sign In")')).toBeVisible();
    await expect(page.locator('button:text("Sign Up")')).toBeVisible();
  });

  test('should handle logout from different pages', async ({ context, page }) => {
    const finder = createComponentFinder(page);

    // test logout from the dashboard
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));
    await expect(page.locator('button:text("Sign In")')).toBeVisible();

    // clear all cookies and storage to ensure a clean state
    await context.clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // reload the page and wait a bit
    await page.reload();
    await page.waitForTimeout(2000);

    // re-authenticate for the second test
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });

    // wait for sign-in and navigate to bobbleheads add page
    await page.waitForTimeout(2000);
    await page.goto($path({ route: '/bobbleheads/add' }));
    await expect(page).toHaveURL(/.*bobbleheads\/add/);

    // sign out from this page
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));
    await expect(page.locator('button:text("Sign In")')).toBeVisible();
  });
});

test.describe('Protected Route Redirects', () => {
  test('should redirect unauthenticated users to homepage', async ({ page }) => {
    // ensure we're signed out
    await page.goto($path({ route: '/' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    // try to access protected routes directly
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // should be redirected to the home page
      await expect(page).toHaveURL($path({ route: '/' }));
    }
  });
});

test.describe('Unauthenticated Access', () => {
  test('should redirect to homepage when accessing protected route', async ({ page }) => {
    const finder = createComponentFinder(page);

    // start at dashboard (should be authenticated from global setup)
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // sign out and wait for redirect
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));

    // verify we're on home page with unauthenticated UI
    await expect(page.locator('button:text("Sign In")')).toBeVisible();
    await expect(page.locator('button:text("Sign Up")')).toBeVisible();
  });
});
