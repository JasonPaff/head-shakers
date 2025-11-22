import { clerk } from '@clerk/testing/playwright';
import { expect, type Page, test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { createComponentFinder } from '../helpers/test-helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auth storage paths
const authDir = path.join(__dirname, '../../../playwright/.auth');
const adminAuthFile = path.join(authDir, 'admin.json');
const userAuthFile = path.join(authDir, 'user.json');
const newUserAuthFile = path.join(authDir, 'new-user.json');

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Test user credentials from environment
const TEST_USERS = {
  admin: {
    identifier: process.env.E2E_CLERK_ADMIN_USERNAME!,
    name: 'admin',
    password: process.env.E2E_CLERK_ADMIN_PASSWORD!,
    storageFile: adminAuthFile,
  },
  newUser: {
    identifier: process.env.E2E_CLERK_NEW_USER_USERNAME!,
    name: 'new-user',
    password: process.env.E2E_CLERK_NEW_USER_PASSWORD!,
    storageFile: newUserAuthFile,
  },
  user: {
    identifier: process.env.E2E_CLERK_USER_USERNAME!,
    name: 'user',
    password: process.env.E2E_CLERK_USER_PASSWORD!,
    storageFile: userAuthFile,
  },
} as const;

async function authenticateUser(
  page: Page,
  user: (typeof TEST_USERS)[keyof typeof TEST_USERS],
): Promise<void> {
  const finder = createComponentFinder(page);

  console.log(`Authenticating ${user.name}...`);

  // Navigate to the home page to load Clerk
  await page.goto('/');

  // Wait for Clerk to load
  await page.waitForTimeout(1000);

  // Sign in using Clerk test helper
  await clerk.signIn({
    page,
    signInParams: {
      identifier: user.identifier,
      password: user.password,
      strategy: 'password',
    },
  });

  // Navigate to dashboard to verify authentication worked
  await page.goto('/dashboard/collection');

  // Wait for authenticated UI element
  await expect(finder.layout('user-avatar', 'button')).toBeVisible({ timeout: 15000 });

  // Save authentication state
  await page.context().storageState({ path: user.storageFile });

  console.log(`Authentication saved for ${user.name} to ${user.storageFile}`);
}

setup.describe('Multi-user authentication setup', () => {
  setup('authenticate admin user', async ({ page }) => {
    await authenticateUser(page, TEST_USERS.admin);
  });

  setup('authenticate regular user', async ({ page }) => {
    await authenticateUser(page, TEST_USERS.user);
  });

  setup('authenticate new user', async ({ page }) => {
    await authenticateUser(page, TEST_USERS.newUser);
  });
});
