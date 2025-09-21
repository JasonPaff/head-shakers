import { expect } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { test } from './fixtures/auth-fixtures';

test.describe('App Navigation', () => {
  test('should navigate through main pages when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);

    // navigate to the new bobblehead page using direct navigation
    await authenticatedPage.goto($path({ route: '/bobbleheads/add' }));
    await expect(authenticatedPage).toHaveURL(/.*bobbleheads\/add/);

    // navigate back to the dashboard
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));
    await expect(authenticatedPage).toHaveURL(/.*dashboard\/collection/);
  });

  test('should show user profile menu when authenticated', async ({ authenticatedPage }) => {
    await authenticatedPage.goto($path({ route: '/dashboard/collection' }));

    const userButton = authenticatedPage.locator('.cl-userButtonTrigger');
    await expect(userButton).toBeVisible();

    await userButton.click();

    const userMenu = authenticatedPage.locator('.cl-userButtonPopoverCard');
    await expect(userMenu).toBeVisible();
  });

  test('should handle 404 pages', async ({ unauthenticatedPage }) => {
    await unauthenticatedPage.goto('/non-existent-page');

    // check for 404 or "Page Not Found" text
    const pageContent = await unauthenticatedPage.textContent('body');
    expect(pageContent).toMatch(/404/i);
  });

  test('should navigate to public pages when unauthenticated', async ({ unauthenticatedPage }) => {
    // test navigation to home page
    await unauthenticatedPage.goto($path({ route: '/' }));
    await expect(unauthenticatedPage).toHaveURL($path({ route: '/' }));

    // verify we see unauthenticated UI
    await expect(unauthenticatedPage.locator('button:text("Sign In")')).toBeVisible();
    await expect(unauthenticatedPage.locator('button:text("Sign Up")')).toBeVisible();
  });
});
