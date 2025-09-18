import type { Page } from '@playwright/test';

import { clerk } from '@clerk/testing/playwright';
import { $path } from 'next-typesafe-url';

export async function signInWithTestUser(page: Page) {
  await page.goto($path({ route: '/' }));
  await clerk.signIn({
    page,
    signInParams: {
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
      strategy: 'password',
    },
  });
}

export async function signOutUser(page: Page) {
  await clerk.signOut({ page });
}

export async function waitForClerkLoaded(page: Page) {
  await clerk.loaded({ page });
}

export const testIds = {
  addBobbleheadButton: '[data-testid="add-bobblehead-button"]',
  bobbleheadCard: '[data-testid="bobblehead-card"]',
  collectionCard: '[data-testid="collection-card"]',
  dashboardHeader: '[data-testid="dashboard-header"]',
  userButton: '.cl-userButtonTrigger',
  userMenu: '.cl-userButtonPopoverCard',
} as const;

// Type-safe route helpers using $path
export const routes = {
  addBobblehead: () => $path({ route: '/bobbleheads/add' }),
  dashboard: () => $path({ route: '/dashboard/collection' }),
  home: () => $path({ route: '/' }),
} as const;
