import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import path from 'path';

// Setup must be run serially
setup.describe.configure({ mode: 'serial' });

// Configure Playwright with Clerk
setup('global setup', async ({}) => {
  await clerkSetup();
});

// Define the path to the storage file
const authFile = path.join(__dirname, '../../playwright/.clerk/user.json');

setup('authenticate and save state to storage', async ({ page }) => {
  // Navigate to the home page to load Clerk
  await page.goto('/');

  // Sign in using Clerk test helper
  await clerk.signIn({
    page,
    signInParams: {
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      strategy: 'password',
    },
  });

  // Navigate to dashboard to verify authentication
  await page.goto('/dashboard');

  // Wait for an element that only authenticated users can see
  await page.waitForSelector('[data-testid="dashboard-header"]', {
    timeout: 10000,
  });

  // Save the authentication state
  await page.context().storageState({ path: authFile });
});
