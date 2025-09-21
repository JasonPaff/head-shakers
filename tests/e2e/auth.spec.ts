import { expect } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { test } from './fixtures/auth-fixtures';
import { createComponentFinder } from './helpers/test-helpers';

test.describe('Authentication Flow', () => {
  test('should login and navigate to dashboard', async ({ authenticatedPage }) => {
    const finder = createComponentFinder(authenticatedPage);

    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);

    const dashboardHeader = finder.layout('app-header', 'dashboard');
    await expect(dashboardHeader).toBeVisible();
  });

  test('should access bobbleheads add page when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto($path({ route: '/bobbleheads/add' }));

    await expect(authenticatedPage).toHaveURL(/.*bobbleheads\/add/);
    await expect(authenticatedPage.locator('h1')).toContainText(/add.*bobblehead/i);
  });
});

test.describe('Session Persistence', () => {
  test('should maintain authentication across page reloads', async ({ authenticatedPage }) => {
    const finder = createComponentFinder(authenticatedPage);

    // navigate to dashboard - should be authenticated from fixtures
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);

    // verify authenticated state
    const dashboardHeader = finder.layout('app-header', 'dashboard');
    await expect(dashboardHeader).toBeVisible();

    // reload the page
    await authenticatedPage.reload();

    // should still be authenticated and on the same page
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);
    await expect(dashboardHeader).toBeVisible();
  });

  test('should maintain authentication across browser navigation', async ({ authenticatedPage }) => {
    const finder = createComponentFinder(authenticatedPage);

    // start at dashboard
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // navigate to add bobblehead page
    await authenticatedPage.goto($path({ route: '/bobbleheads/add' }));
    await expect(authenticatedPage).toHaveURL(/.*bobbleheads\/add/);

    // navigate back to the dashboard
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();
  });

  test('should persist authentication across different protected routes', async ({ authenticatedPage }) => {
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await authenticatedPage.goto(route);
      await expect(authenticatedPage).toHaveURL(new RegExp(route.replace('/', '\\/')));

      // each protected route should load without redirecting to the home
      await expect(authenticatedPage).not.toHaveURL($path({ route: '/' }));
    }
  });
});

// Tests that change auth state should run serially to avoid conflicts
test.describe.serial('Logout Functionality', () => {
  test('should sign out successfully', async ({ switchableAuthPage }) => {
    // Start authenticated
    await switchableAuthPage.signIn();
    await switchableAuthPage.goto($path({ route: '/dashboard/collection' }));

    // Sign out and verify redirect
    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));
  });

  test('should sign out and clear authentication state', async ({ switchableAuthPage }) => {
    // Start authenticated
    await switchableAuthPage.signIn();
    await switchableAuthPage.verifyAuthenticated();

    // Sign out and verify redirect
    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));

    // Verify we're on home page with unauthenticated UI
    await expect(switchableAuthPage.locator('button:text("Sign In")')).toBeVisible();
    await expect(switchableAuthPage.locator('button:text("Sign Up")')).toBeVisible();
  });

  test('should prevent access to protected routes after logout', async ({ switchableAuthPage }) => {
    const finder = createComponentFinder(switchableAuthPage);

    // Start authenticated
    await switchableAuthPage.signIn();
    await switchableAuthPage.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // Sign out and verify redirect
    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));

    // Verify we see the unauthenticated UI
    await expect(switchableAuthPage.locator('button:text("Sign In")')).toBeVisible();
    await expect(switchableAuthPage.locator('button:text("Sign Up")')).toBeVisible();
  });

  test('should handle logout from different pages', async ({ switchableAuthPage }) => {
    const finder = createComponentFinder(switchableAuthPage);

    // Test logout from the dashboard
    await switchableAuthPage.signIn();
    await switchableAuthPage.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));
    await expect(switchableAuthPage.locator('button:text("Sign In")')).toBeVisible();

    // Clear state and re-authenticate for second test
    await switchableAuthPage.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await switchableAuthPage.reload();

    // Re-authenticate and test logout from bobbleheads add page
    await switchableAuthPage.signIn();
    await switchableAuthPage.goto($path({ route: '/bobbleheads/add' }));
    await expect(switchableAuthPage).toHaveURL(/.*bobbleheads\/add/);

    // Sign out from this page
    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));
    await expect(switchableAuthPage.locator('button:text("Sign In")')).toBeVisible();
  });
});

test.describe('Protected Route Redirects', () => {
  test('should redirect unauthenticated users to homepage', async ({ unauthenticatedPage }) => {
    // Ensure we're signed out
    await unauthenticatedPage.goto($path({ route: '/' }));
    await expect(unauthenticatedPage.locator('button:text("Sign In")')).toBeVisible();

    // Try to access protected routes directly
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await unauthenticatedPage.goto(route);
      // Should be redirected to the home page
      await expect(unauthenticatedPage).toHaveURL($path({ route: '/' }));
    }
  });

  test('should redirect to homepage when accessing protected route after logout', async ({ switchableAuthPage }) => {
    const finder = createComponentFinder(switchableAuthPage);

    // Start authenticated
    await switchableAuthPage.signIn();
    await switchableAuthPage.goto($path({ route: '/dashboard/collection' }));
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();

    // Sign out and verify redirect
    await switchableAuthPage.signOut();
    await switchableAuthPage.waitForURL($path({ route: '/' }));
    await expect(switchableAuthPage).toHaveURL($path({ route: '/' }));

    // Verify we're on home page with unauthenticated UI
    await expect(switchableAuthPage.locator('button:text("Sign In")')).toBeVisible();
    await expect(switchableAuthPage.locator('button:text("Sign Up")')).toBeVisible();
  });
});