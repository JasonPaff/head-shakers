import type { Locator, Page } from '@playwright/test';

import type { ComponentTestId, TestIdNamespace } from '@/lib/test-ids';

import { generateFormFieldTestId, generateTableCellTestId, generateTestId } from '@/lib/test-ids';

export const testIds = {
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
  ui: (component: ComponentTestId, suffix?: string) =>
    `[data-testid="${generateTestId('ui', component, suffix)}"]`,
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

export function createComponentFinder(page: Page): ComponentFinder {
  return new ComponentFinder(page);
}
