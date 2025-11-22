import { test as base, type BrowserContext, type Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { type ComponentFinder, createComponentFinder } from '../helpers/test-helpers';
import { type E2EBranchInfo } from '../utils/neon-branch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auth storage paths
const authDir = path.join(__dirname, '../../../playwright/.auth');
const adminAuth = path.join(authDir, 'admin.json');
const userAuth = path.join(authDir, 'user.json');
const newUserAuth = path.join(authDir, 'new-user.json');

// Branch info file
const branchInfoFile = path.join(__dirname, '../../../playwright/.e2e-branch.json');

export interface TestFixtures {
  adminFinder: ComponentFinder;
  adminPage: Page;
  finder: ComponentFinder;
  newUserFinder: ComponentFinder;
  newUserPage: Page;
  userFinder: ComponentFinder;
  userPage: Page;
}

export interface WorkerFixtures {
  branchInfo: E2EBranchInfo | null;
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ComponentFinder for admin page
  adminFinder: async ({ adminPage }, use) => {
    const finder = createComponentFinder(adminPage);
    await use(finder);
  },

  // Test-scoped fixture for admin page with separate browser context
  adminPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: adminAuth,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Worker-scoped fixture for database branch info
  branchInfo: [
    async ({}, use) => {
      let branchInfo: E2EBranchInfo | null = null;

      if (fs.existsSync(branchInfoFile)) {
        try {
          branchInfo = JSON.parse(fs.readFileSync(branchInfoFile, 'utf-8'));
        } catch {
          console.warn('Failed to read branch info file');
        }
      }

      await use(branchInfo);
    },
    { scope: 'worker' },
  ],

  // Test-scoped fixture for ComponentFinder on the default page
  finder: async ({ page }, use) => {
    const finder = createComponentFinder(page);
    await use(finder);
  },

  // ComponentFinder for new user page
  newUserFinder: async ({ newUserPage }, use) => {
    const finder = createComponentFinder(newUserPage);
    await use(finder);
  },

  // Test-scoped fixture for new user page with separate browser context
  newUserPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: newUserAuth,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // ComponentFinder for user page
  userFinder: async ({ userPage }, use) => {
    const finder = createComponentFinder(userPage);
    await use(finder);
  },

  // Test-scoped fixture for user page with separate browser context
  userPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: userAuth,
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
