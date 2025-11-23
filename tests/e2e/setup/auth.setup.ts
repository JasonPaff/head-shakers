import { clerk } from '@clerk/testing/playwright';
import { expect, type Page, test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

import { createComponentFinder } from '../helpers/test-helpers';

// Auth storage paths (use process.cwd() for consistent resolution)
const authDir = path.resolve(process.cwd(), 'playwright/.auth');
const adminAuthFile = path.join(authDir, 'admin.json');
const userAuthFile = path.join(authDir, 'user.json');
const newUserAuthFile = path.join(authDir, 'new-user.json');

// Ensure auth directory exists
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

// Validate required environment variables
function validateEnvVars(): void {
  const required = [
    'E2E_CLERK_ADMIN_USERNAME',
    'E2E_CLERK_ADMIN_PASSWORD',
    'E2E_CLERK_USER_USERNAME',
    'E2E_CLERK_USER_PASSWORD',
    'E2E_CLERK_NEW_USER_USERNAME',
    'E2E_CLERK_NEW_USER_PASSWORD',
  ];

  const missing = required.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables for E2E auth setup: ${missing.join(', ')}. ` +
        'Please ensure .env.e2e is properly configured with Clerk test user credentials.',
    );
  }
}

// Validate env vars at module load time (fails fast if misconfigured)
validateEnvVars();

// Test user credentials from environment (safe to use ! after validation)
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

  // Use Clerk's official loaded() helper - more reliable than custom waitForFunction
  // Increased timeout to handle slow network conditions and cold starts
  await clerk.loaded({ page });

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
