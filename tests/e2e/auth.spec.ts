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

    // verify authentication state is cleared by trying to access the protected route
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL($path({ route: '/' }));
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

    // try to access multiple protected routes
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // should be redirected to home instead of accessing the protected route
      await expect(page).toHaveURL($path({ route: '/' }));
    }
  });

  test('should handle logout from different pages', async ({ page }) => {
    const pagesWithLogout = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const pageRoute of pagesWithLogout) {
      // navigate to the page
      await page.goto(pageRoute);

      // verify we're authenticated
      await expect(page).not.toHaveURL($path({ route: '/' }));

      // sign out from this page and wait for navigation
      await clerk.signOut({ page });
      await page.waitForURL($path({ route: '/' }));

      // should redirect to home
      await expect(page).toHaveURL($path({ route: '/' }));

      // re-authenticate for next iteration (except last one)
      if (pageRoute !== pagesWithLogout[pagesWithLogout.length - 1]) {
        await clerk.signIn({
          page,
          signInParams: {
            identifier: process.env.E2E_CLERK_USER_USERNAME!,
            password: process.env.E2E_CLERK_USER_PASSWORD!,
            strategy: 'password',
          },
        });
      }
    }
  });
});

test.describe('Protected Route Redirects', () => {
  test('should redirect unauthenticated users to homepage', async ({ page }) => {
    // ensure we're signed out
    await page.goto($path({ route: '/' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));

    // try to access protected routes directly
    const protectedRoutes = [$path({ route: '/dashboard/collection' }), $path({ route: '/bobbleheads/add' })];

    for (const route of protectedRoutes) {
      await page.goto(route);
      // should be redirected to the home page
      await expect(page).toHaveURL($path({ route: '/' }));
    }
  });

  test('should handle deep-linked protected routes', async ({ page }) => {
    const finder = createComponentFinder(page);

    // ensure we're signed out
    await page.goto($path({ route: '/' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    // try accessing a deeply nested protected route
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL($path({ route: '/' }));

    // sign in
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });

    // now should be able to access the protected route
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);
    await expect(finder.layout('app-header', 'dashboard')).toBeVisible();
  });

  test('should preserve intended destination after authentication', async ({ page }) => {
    // ensure we're signed out
    await page.goto($path({ route: '/' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));

    // try to access the protected route (gets redirected to the home)
    await page.goto($path({ route: '/bobbleheads/add' }));
    await expect(page).toHaveURL($path({ route: '/' }));

    // sign in from the home page
    await clerk.signIn({
      page,
      signInParams: {
        identifier: process.env.E2E_CLERK_USER_USERNAME!,
        password: process.env.E2E_CLERK_USER_PASSWORD!,
        strategy: 'password',
      },
    });

    // now should be able to access the originally intended route
    await page.goto($path({ route: '/bobbleheads/add' }));
    await expect(page).toHaveURL(/.*bobbleheads\/add/);
    await expect(page.locator('h1')).toContainText(/add.*bobblehead/i);
  });
});

test.describe('Unauthenticated Access', () => {
  test('should redirect to homepage when accessing protected route', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await clerk.signOut({ page });
    await page.waitForURL($path({ route: '/' }));
    await expect(page).toHaveURL($path({ route: '/' }));
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL($path({ route: '/' }));
  });
});
