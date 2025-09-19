import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { test as setup } from '@playwright/test';
import { $path } from 'next-typesafe-url';
import path from 'path';
import { fileURLToPath } from 'url';

import { createComponentFinder } from './helpers/test-helpers';

// setup must be run serially
setup.describe.configure({ mode: 'serial' });

// configure Playwright with Clerk
// eslint-disable-next-line no-empty-pattern
setup('global setup', async ({}) => {
  await clerkSetup();
});

// define the path to the storage file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authFile = path.join(__dirname, '../../playwright/.clerk/user.json');

setup('authenticate and save state to storage', async ({ page }) => {
  const finder = createComponentFinder(page);

  // navigate to the home page to load Clerk
  await page.goto($path({ route: '/' }));

  // sign in using Clerk test helper
  await clerk.signIn({
    page,
    signInParams: {
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      strategy: 'password',
    },
  });

  // navigate to the dashboard to verify authentication
  await page.goto($path({ route: '/dashboard/collection' }));

  // wait for an element that only authenticated users can see
  await finder.layout('user-avatar', 'button').waitFor({ timeout: 10000 });

  // save the authentication state
  await page.context().storageState({ path: authFile });
});
