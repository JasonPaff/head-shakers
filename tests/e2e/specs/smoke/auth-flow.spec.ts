import { expect, test } from '../../fixtures/base.fixture';
import { DashboardPage } from '../../pages/dashboard.page';
import { HomePage } from '../../pages/home.page';

test.describe('Authentication Flow Verification', () => {
  test('authenticated user can access dashboard', async ({ finder, page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Verify user is authenticated
    await expect(finder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });

    // Verify we're on the dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test('authenticated user can navigate to home and back', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    const homePage = new HomePage(page);

    // Start on dashboard
    await dashboardPage.goto();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to home
    await homePage.goto();
    await expect(page).toHaveURL('/');

    // Navigate back to dashboard
    await dashboardPage.goto();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('user avatar menu is accessible', async ({ finder, page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Wait for avatar to be visible
    const userAvatar = finder.layout('user-avatar', 'button');
    await expect(userAvatar).toBeVisible({ timeout: 15000 });

    // Click to open user menu
    await userAvatar.click();

    // Verify user menu opened (check for common menu items)
    await expect(page.getByRole('menu')).toBeVisible();
  });

  test('session persists across page navigation', async ({ finder, page }) => {
    const dashboardPage = new DashboardPage(page);

    // Navigate to dashboard
    await dashboardPage.goto();
    await expect(finder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });

    // Reload the page
    await page.reload();

    // Verify still authenticated after reload
    await expect(finder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Multi-Role Verification', () => {
  test('admin page can be created', async ({ adminFinder, adminPage }) => {
    // Navigate admin page to dashboard
    await adminPage.goto('/dashboard/collection');

    // Verify admin is authenticated
    await expect(adminFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
  });

  test('user page can be created', async ({ userFinder, userPage }) => {
    // Navigate user page to dashboard
    await userPage.goto('/dashboard/collection');

    // Verify user is authenticated
    await expect(userFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
  });

  test('new user page can be created', async ({ newUserFinder, newUserPage }) => {
    // Navigate new user page to dashboard
    await newUserPage.goto('/dashboard/collection');

    // Verify new user is authenticated
    await expect(newUserFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
  });

  test('multiple roles can interact simultaneously', async ({
    adminFinder,
    adminPage,
    userFinder,
    userPage,
  }) => {
    // Both users navigate to dashboard
    await Promise.all([adminPage.goto('/dashboard/collection'), userPage.goto('/dashboard/collection')]);

    // Verify both are authenticated
    await expect(adminFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
    await expect(userFinder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });
  });
});
