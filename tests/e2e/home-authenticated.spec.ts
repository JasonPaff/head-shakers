import { expect, test } from '@playwright/test';

import { createComponentFinder } from './helpers/test-helpers';

test.describe('Home Page - Authenticated', () => {
  test('should display authenticated home page content', async ({ page }) => {
    const finder = createComponentFinder(page);

    // navigate to home page
    await page.goto('/');

    // verify the app header is present
    await expect(finder.layout('app-header')).toBeVisible();

    // verify the user is authenticated by checking for the user avatar button
    await expect(finder.layout('user-avatar', 'button')).toBeVisible();

    // verify authenticated navigation sections are present
    await expect(finder.layout('app-header', 'navigation-section')).toBeVisible();
    await expect(finder.layout('app-header', 'search-section')).toBeVisible();
    await expect(finder.layout('app-header', 'user-section')).toBeVisible();

    // verify the page loaded successfully (basic content check)
    await expect(page).toHaveTitle(/Head Shakers/);
  });

  test('should have working navigation when authenticated', async ({ page }) => {
    const finder = createComponentFinder(page);

    // navigate to home page
    await page.goto('/');

    // verify logo link is present and clickable
    await expect(finder.layout('app-header', 'logo-link')).toBeVisible();

    // click logo to verify it's functional
    await finder.layout('app-header', 'logo-link').click();

    // should stay on or navigate to the home page
    await expect(page).toHaveURL(/\//);

    // verify the user section is still present after navigation
    await expect(finder.layout('user-avatar', 'button')).toBeVisible();
  });
});
