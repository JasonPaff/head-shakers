import type { Locator, Page } from '@playwright/test';

import { $path } from 'next-typesafe-url';

import type { ComponentTestId, TestIdNamespace } from '@/lib/test-ids';

import { generateFormFieldTestId, generateTableCellTestId, generateTestId } from '@/lib/test-ids';

export const testIds = {
  // Legacy selectors for backward compatibility
  addBobbleheadButton: '[data-testid="add-bobblehead-button"]',
  bobbleheadCard: '[data-testid="bobblehead-card"]',
  collectionCard: '[data-testid="collection-card"]',
  dashboardHeader: '[data-testid="dashboard-header"]',
  feature: (component: ComponentTestId, suffix?: string) =>
    `[data-testid="${generateTestId('feature', component, suffix)}"]`,
  form: (component: ComponentTestId, suffix?: string) =>
    `[data-testid="${generateTestId('form', component, suffix)}"]`,

  formField: (fieldName: string, suffix?: string) =>
    `[data-testid="${generateFormFieldTestId(fieldName, suffix)}"]`,
  layout: (component: ComponentTestId, suffix?: string) =>
    `[data-testid="${generateTestId('layout', component, suffix)}"]`,
  tableCell: (row: number | string, column: string) =>
    `[data-testid="${generateTableCellTestId(row, column)}"]`,
  // Type-safe testid generators
  ui: (component: ComponentTestId, suffix?: string) =>
    `[data-testid="${generateTestId('ui', component, suffix)}"]`,
  userButton: '.cl-userButtonTrigger',
  userMenu: '.cl-userButtonPopoverCard',
} as const;

export class ComponentFinder {
  constructor(private page: Page) {}

  /**
   * Find any component by namespace and component type
   */
  component(namespace: TestIdNamespace, component: ComponentTestId, suffix?: string): Locator {
    return this.page.locator(`[data-testid="${generateTestId(namespace, component, suffix)}"]`);
  }

  /**
   * Find a feature component by testid
   */
  feature(component: ComponentTestId, suffix?: string): Locator {
    return this.page.locator(testIds.feature(component, suffix));
  }

  /**
   * Find a form component by testid
   */
  form(component: ComponentTestId, suffix?: string): Locator {
    return this.page.locator(testIds.form(component, suffix));
  }

  /**
   * Find a form field by field name
   */
  formField(fieldName: string, suffix?: string): Locator {
    return this.page.locator(testIds.formField(fieldName, suffix));
  }

  /**
   * Find a layout component by testid
   */
  layout(component: ComponentTestId, suffix?: string): Locator {
    return this.page.locator(testIds.layout(component, suffix));
  }

  /**
   * Find a table cell by row and column
   */
  tableCell(row: number | string, column: string): Locator {
    return this.page.locator(testIds.tableCell(row, column));
  }

  /**
   * Find a UI component by testid
   */
  ui(component: ComponentTestId, suffix?: string): Locator {
    return this.page.locator(testIds.ui(component, suffix));
  }
}

// testId assertion utilities for component testing
export class TestIdAssertions {
  constructor(private page: Page) {}

  /**
   * Assert that a component with the given testid exists
   */
  async expectComponentExists(
    namespace: TestIdNamespace,
    component: ComponentTestId,
    suffix?: string,
  ): Promise<void> {
    const selector = `[data-testid="${generateTestId(namespace, component, suffix)}"]`;
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }

  /**
   * Assert that a form field with the given name exists
   */
  async expectFormFieldExists(fieldName: string, suffix?: string): Promise<void> {
    const selector = testIds.formField(fieldName, suffix);
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }

  /**
   * Assert that a table cell exists
   */
  async expectTableCellExists(row: number | string, column: string): Promise<void> {
    const selector = testIds.tableCell(row, column);
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }
}

// Helper for creating ComponentFinder
export function createComponentFinder(page: Page): ComponentFinder {
  return new ComponentFinder(page);
}

// Helper for creating TestIdAssertions
export function createTestIdAssertions(page: Page): TestIdAssertions {
  return new TestIdAssertions(page);
}

// Namespace-specific helper functions
export const uiHelpers = {
  /**
   * Get selector for UI button with optional suffix
   */
  button: (suffix?: string) => testIds.ui('button', suffix),

  /**
   * Get selector for UI dialog with optional suffix
   */
  dialog: (suffix?: string) => testIds.ui('dialog', suffix),

  /**
   * Get selector for UI form with optional suffix
   */
  form: (suffix?: string) => testIds.ui('form', suffix),

  /**
   * Get selector for UI input with optional suffix
   */
  input: (suffix?: string) => testIds.ui('input', suffix),

  /**
   * Get selector for UI table with optional suffix
   */
  table: (suffix?: string) => testIds.ui('table', suffix),
};

export const featureHelpers = {
  /**
   * Get selector for bobblehead card with optional suffix
   */
  bobbleheadCard: (suffix?: string) => testIds.feature('bobblehead-card', suffix),

  /**
   * Get selector for collection card with optional suffix
   */
  collectionCard: (suffix?: string) => testIds.feature('collection-card', suffix),

  /**
   * Get selector for follow button with optional suffix
   */
  followButton: (suffix?: string) => testIds.feature('follow-button', suffix),

  /**
   * Get selector for like button with optional suffix
   */
  likeButton: (suffix?: string) => testIds.feature('like-button', suffix),
};

export const layoutHelpers = {
  /**
   * Get selector for app header with optional suffix
   */
  appHeader: (suffix?: string) => testIds.layout('app-header', suffix),

  /**
   * Get selector for app sidebar with optional suffix
   */
  appSidebar: (suffix?: string) => testIds.layout('app-sidebar', suffix),

  /**
   * Get selector for main nav with optional suffix
   */
  mainNav: (suffix?: string) => testIds.layout('main-nav', suffix),

  /**
   * Get selector for user nav with optional suffix
   */
  userNav: (suffix?: string) => testIds.layout('user-nav', suffix),
};

// Type-safe route helpers using $path
export const routes = {
  addBobblehead: () => $path({ route: '/bobbleheads/add' }),
  dashboard: () => $path({ route: '/dashboard/collection' }),
  home: () => $path({ route: '/' }),
} as const;
