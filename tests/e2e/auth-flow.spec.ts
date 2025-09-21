import { clerk } from '@clerk/testing/playwright';
import { expect, test } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { createComponentFinder } from './helpers/test-helpers';

// Tests that modify authentication state
// These tests handle their own authentication and should not share state with other tests
test.describe.configure({ mode: 'serial' });

test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Each test needs its own authentication
    await page.goto($path({ route: '/' }));
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });
  });

  test('should sign out successfully', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    await expect(page).toHaveURL($path({ route: '/' }));
  });

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

    // reload the page and wait for it to be ready
    await page.reload();
    await expect(page.locator('button:text("Sign In")')).toBeVisible();

    // re-authenticate for the second test
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });

    // wait for sign-in to complete and navigate to bobbleheads add page
    await expect(page.locator('button:text("Sign In")')).toBeHidden();
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
  test.beforeEach(async ({ page }) => {
    // Ensure we start unauthenticated
    await page.goto($path({ route: '/' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
  });

  test('should redirect unauthenticated users to homepage', async ({ page }) => {
    // ensure we're signed out
    await expect(page.locator('button:text("Sign In")')).toBeVisible();

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
  test.beforeEach(async ({ page }) => {
    // Start with authentication, then sign out during test
    await page.goto($path({ route: '/' }));
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });
  });

  test('should redirect to homepage when accessing protected route', async ({ page }) => {
    const finder = createComponentFinder(page);

    // start at dashboard (should be authenticated from beforeEach)
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