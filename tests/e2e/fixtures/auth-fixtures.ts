import type { Page } from '@playwright/test';

import { clerk } from '@clerk/testing/playwright';
import { test as base } from '@playwright/test';
import { $path } from 'next-typesafe-url';

import { createComponentFinder } from '../helpers/test-helpers';

// auth state configuration
const AUTH_FILE = 'playwright/.clerk/user.json';
const CLEAN_STATE = { cookies: [], origins: [] };

interface AuthFixtures {
  authenticatedPage: Page;
  switchableAuthPage: SwitchableAuthPage;
  unauthenticatedPage: Page;
}

// extended page interface with auth helper methods
interface SwitchableAuthPage extends Page {
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  verifyAuthenticated: () => Promise<void>;
  verifyUnauthenticated: () => Promise<void>;
}

/**
 * Extended test with auth fixtures for common testing scenarios
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Page pre-authenticated using stored auth state from global setup
   * Use this for tests that need a user to be logged in throughout the test
   */
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: AUTH_FILE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  /**
   * Page that can switch between auth states during the test
   * Use this for tests that need to test login/logout flows or auth state changes
   */
  switchableAuthPage: async ({ page }, use) => {
    // clear any existing auth state
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // add helper methods to the page for auth state management
    const pageWithAuth = Object.assign(page, {
      /**
       * Sign in using Clerk test helper
       */
      async signIn() {
        await page.goto($path({ route: '/' }));
        await clerk.signIn({
          page,
          signInParams: {
            identifier: process.env.E2E_CLERK_USER_USERNAME!,
            password: process.env.E2E_CLERK_USER_PASSWORD!,
            strategy: 'password',
          },
        });
      },

      /**
       * Sign out using Clerk test helper
       */
      async signOut() {
        await clerk.signOut({ page });
      },

      /**
       * Verify the user is authenticated by checking for auth-only elements
       */
      async verifyAuthenticated() {
        const finder = createComponentFinder(page);
        await page.goto($path({ route: '/dashboard/collection' }));
        await finder.layout('app-header', 'dashboard').waitFor({ timeout: 10000 });
      },

      /**
       * Verify the user is not authenticated by checking for public elements
       */
      async verifyUnauthenticated() {
        await page.goto($path({ route: '/' }));
        await page.locator('button:text("Sign In")').waitFor({ timeout: 10000 });
      },
    }) as SwitchableAuthPage;

    await use(pageWithAuth);
  },

  /**
   * Page with clean state (no authentication)
   * Use this for tests that need to verify unauthenticated behavior
   */
  unauthenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: CLEAN_STATE,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
