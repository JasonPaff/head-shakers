import { expect, test } from '@playwright/test';

import { createComponentFinder } from './helpers/test-helpers';

test.describe('Home Page - Unauthenticated', () => {
  test('should display unauthenticated home page content', async ({ page }) => {
    const finder = createComponentFinder(page);

    // Navigate to home page
    await page.goto('/');

    // Verify app header is present
    await expect(finder.layout('app-header')).toBeVisible();

    // Verify user is NOT authenticated by checking for Sign In/Sign Up buttons
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

    // Verify user avatar button is NOT present (should be signed out)
    await expect(finder.layout('user-avatar', 'button')).not.toBeVisible();

    // Verify basic navigation sections are still present
    await expect(finder.layout('app-header', 'navigation-section')).toBeVisible();
    await expect(finder.layout('app-header', 'user-section')).toBeVisible();

    // Verify the page loaded successfully (basic content check)
    await expect(page).toHaveTitle(/Head Shakers/);
  });

  test('should have working logo navigation when unauthenticated', async ({ page }) => {
    const finder = createComponentFinder(page);

    // Navigate to home page
    await page.goto('/');

    // Verify logo link is present and clickable
    await expect(finder.layout('app-header', 'logo-link')).toBeVisible();

    // Click logo to verify it's functional
    await finder.layout('app-header', 'logo-link').click();

    // Should stay on or navigate to home page
    await expect(page).toHaveURL(/\//);

    // Verify sign in/up buttons are still present after navigation
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  });

  test('should show sign in modal when clicking sign in button', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');

    // Click sign in button
    await page.getByRole('button', { name: /sign in/i }).click();

    // Wait for sign in modal to appear (Clerk modal - try different selectors)
    await expect(
      page.locator('.cl-modal, [data-clerk-modal], .cl-modalContent, .cl-card').first()
    ).toBeVisible({ timeout: 10000 });
  });
});