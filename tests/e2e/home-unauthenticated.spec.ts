import { expect, test } from '@playwright/test';

import { createComponentFinder } from './helpers/test-helpers';

test.describe('Home Page - Unauthenticated', () => {
  test('should display unauthenticated home page content', async ({ page }) => {
    const finder = createComponentFinder(page);

    // navigate to home page
    await page.goto('/');

    // verify app header is present
    await expect(finder.layout('app-header')).toBeVisible();

    // verify the user is NOT authenticated by checking for Sign In/Sign Up buttons
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

    // verify the user avatar button is NOT present (should be signed out)
    await expect(finder.layout('user-avatar', 'button')).not.toBeVisible();

    // verify basic navigation sections are still present
    await expect(finder.layout('app-header', 'navigation-section')).toBeVisible();
    await expect(finder.layout('app-header', 'user-section')).toBeVisible();

    // verify the page loaded successfully (basic content check)
    await expect(page).toHaveTitle(/Head Shakers/);
  });

  test('should have working logo navigation when unauthenticated', async ({ page }) => {
    const finder = createComponentFinder(page);

    // navigate to home page
    await page.goto('/');

    // verify logo link is present and clickable
    await expect(finder.layout('app-header', 'logo-link')).toBeVisible();

    // click logo to verify it's functional
    await finder.layout('app-header', 'logo-link').click();

    // should stay on or navigate to the home page
    await expect(page).toHaveURL(/\//);

    // verify sign in/up buttons are still present after navigation
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should show sign in modal when clicking sign in button', async ({ page }) => {
    // navigate to home page
    await page.goto('/');

    // click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // wait for sign in modal to appear (Clerk modal - try different selectors)
    await expect(
      page.locator('.cl-modal, [data-clerk-modal], .cl-modalContent, .cl-card').first(),
    ).toBeVisible({ timeout: 10000 });
  });
});
