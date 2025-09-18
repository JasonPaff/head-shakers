import { expect, test } from '@playwright/test';
import { $path } from 'next-typesafe-url';

test.describe('App Navigation', () => {
  test('should navigate through main pages', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));
    await expect(page).toHaveURL(/.*dashboard\/collection/);

    const addBobbleheadPath = $path({ route: '/bobbleheads/add' });
    await page.click(`a[href="${addBobbleheadPath}"]`);
    await expect(page).toHaveURL(/.*bobbleheads\/add/);

    const dashboardPath = $path({ route: '/dashboard/collection' });
    await page.click(`a[href="${dashboardPath}"]`);
    await expect(page).toHaveURL(/.*dashboard\/collection/);
  });

  test('should show user profile menu', async ({ page }) => {
    await page.goto($path({ route: '/dashboard/collection' }));

    const userButton = page.locator('.cl-userButtonTrigger');
    await expect(userButton).toBeVisible();

    await userButton.click();

    const userMenu = page.locator('.cl-userButtonPopoverCard');
    await expect(userMenu).toBeVisible();
  });

  test('should handle 404 pages', async ({ page }) => {
    await page.goto('/non-existent-page');

    const notFoundText = page.locator('text=/not found/i');
    await expect(notFoundText).toBeVisible();
  });
});
