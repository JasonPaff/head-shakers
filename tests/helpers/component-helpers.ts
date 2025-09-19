/**
 * Component-specific testid utilities for testing
 * Provides specialized helpers for different component types
 */

import type { Locator, Page } from '@playwright/test';

import {
  type ComponentTestId,
  generateFormFieldTestId,
  generateTableCellTestId,
  generateTestId,
  type TestIdNamespace,
} from '@/lib/test-ids';

/**
 * Card component testid utilities
 */
export class CardTestHelper {
  get card(): Locator {
    return this.page.locator(`[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix)}"]`);
  }

  get content(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix ? `${this.cardSuffix}-content` : 'content')}"]`,
    );
  }

  get description(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix ? `${this.cardSuffix}-description` : 'description')}"]`,
    );
  }

  get footer(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix ? `${this.cardSuffix}-footer` : 'footer')}"]`,
    );
  }

  get header(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix ? `${this.cardSuffix}-header` : 'header')}"]`,
    );
  }

  get title(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId(this.namespace, 'card', this.cardSuffix ? `${this.cardSuffix}-title` : 'title')}"]`,
    );
  }

  constructor(
    private page: Page,
    private cardSuffix?: string,
    private namespace: TestIdNamespace = 'ui',
  ) {}

  async click(): Promise<void> {
    await this.card.click();
  }

  async expectTitle(expectedTitle: string): Promise<void> {
    const actualTitle = await this.title.textContent();
    if (actualTitle !== expectedTitle) {
      throw new Error(`Expected title "${expectedTitle}" but got "${actualTitle}"`);
    }
  }

  async expectVisible(): Promise<void> {
    await this.card.waitFor({ state: 'visible' });
  }
}

/**
 * Dialog component testid utilities
 */
export class DialogTestHelper {
  get closeButton(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dialog', this.dialogSuffix ? `${this.dialogSuffix}-close` : 'close')}"]`,
    );
  }

  get content(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dialog', this.dialogSuffix ? `${this.dialogSuffix}-content` : 'content')}"]`,
    );
  }

  get description(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dialog', this.dialogSuffix ? `${this.dialogSuffix}-description` : 'description')}"]`,
    );
  }

  get title(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dialog', this.dialogSuffix ? `${this.dialogSuffix}-title` : 'title')}"]`,
    );
  }

  get trigger(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dialog', this.dialogSuffix ? `${this.dialogSuffix}-trigger` : 'trigger')}"]`,
    );
  }

  constructor(
    private page: Page,
    private dialogSuffix?: string,
  ) {}

  async close(): Promise<void> {
    await this.closeButton.click();
    await this.content.waitFor({ state: 'hidden' });
  }

  async open(): Promise<void> {
    await this.trigger.click();
    await this.content.waitFor({ state: 'visible' });
  }
}

/**
 * Dropdown/Select component testid utilities
 */
export class DropdownTestHelper {
  get content(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dropdown-menu', this.dropdownSuffix ? `${this.dropdownSuffix}-content` : 'content')}"]`,
    );
  }

  get trigger(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dropdown-menu', this.dropdownSuffix ? `${this.dropdownSuffix}-trigger` : 'trigger')}"]`,
    );
  }

  constructor(
    private page: Page,
    private dropdownSuffix?: string,
  ) {}

  async expectItemExists(itemValue: string): Promise<void> {
    await this.open();
    await this.item(itemValue).waitFor({ state: 'visible' });
  }

  item(itemValue: string): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'dropdown-menu', this.dropdownSuffix ? `${this.dropdownSuffix}-item-${itemValue}` : `item-${itemValue}`)}"]`,
    );
  }

  async open(): Promise<void> {
    await this.trigger.click();
    await this.content.waitFor({ state: 'visible' });
  }

  async selectItem(itemValue: string): Promise<void> {
    await this.open();
    await this.item(itemValue).click();
    await this.content.waitFor({ state: 'hidden' });
  }
}

/**
 * Form component testid utilities
 */
export class FormTestHelper {
  get submitButton(): Locator {
    return this.page.locator(`[data-testid="${generateTestId('form', 'form-submit', this.formSuffix)}"]`);
  }

  constructor(
    private page: Page,
    private formSuffix?: string,
  ) {}

  async checkField(fieldName: string): Promise<void> {
    await this.field(fieldName).check();
  }

  description(fieldName: string): Locator {
    return this.page.locator(`[data-testid="${generateFormFieldTestId(fieldName, 'description')}"]`);
  }

  error(fieldName: string): Locator {
    return this.page.locator(`[data-testid="${generateFormFieldTestId(fieldName, 'error')}"]`);
  }

  async expectFieldError(fieldName: string, expectedError: string): Promise<void> {
    await this.error(fieldName).waitFor({ state: 'visible' });
    const errorText = await this.error(fieldName).textContent();
    if (errorText !== expectedError) {
      throw new Error(`Expected error "${expectedError}" but got "${errorText}"`);
    }
  }

  async expectFieldValue(fieldName: string, expectedValue: string): Promise<void> {
    const actualValue = await this.field(fieldName).inputValue();
    if (actualValue !== expectedValue) {
      throw new Error(`Expected field value "${expectedValue}" but got "${actualValue}"`);
    }
  }

  field(fieldName: string, suffix?: string): Locator {
    return this.page.locator(`[data-testid="${generateFormFieldTestId(fieldName, suffix)}"]`);
  }

  async fillField(fieldName: string, value: string): Promise<void> {
    await this.field(fieldName).fill(value);
  }

  label(fieldName: string): Locator {
    return this.page.locator(`[data-testid="${generateFormFieldTestId(fieldName, 'label')}"]`);
  }

  async selectField(fieldName: string, value: string): Promise<void> {
    await this.field(fieldName).selectOption(value);
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async uncheckField(fieldName: string): Promise<void> {
    await this.field(fieldName).uncheck();
  }
}

/**
 * Table component testid utilities
 */
export class TableTestHelper {
  get body(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'table', this.tableSuffix ? `${this.tableSuffix}-body` : 'body')}"]`,
    );
  }

  get footer(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'table', this.tableSuffix ? `${this.tableSuffix}-footer` : 'footer')}"]`,
    );
  }

  get header(): Locator {
    return this.page.locator(
      `[data-testid="${generateTestId('ui', 'table', this.tableSuffix ? `${this.tableSuffix}-header` : 'header')}"]`,
    );
  }

  get table(): Locator {
    return this.page.locator(`[data-testid="${generateTestId('ui', 'table', this.tableSuffix)}"]`);
  }

  constructor(
    private page: Page,
    private tableSuffix?: string,
  ) {}

  cell(row: number | string, column: string): Locator {
    return this.page.locator(`[data-testid="${generateTableCellTestId(row, column)}"]`);
  }

  async clickCell(row: number | string, column: string): Promise<void> {
    await this.cell(row, column).click();
  }

  async expectCellValue(row: number | string, column: string, expectedValue: string): Promise<void> {
    const actualValue = await this.getCellText(row, column);
    if (actualValue !== expectedValue) {
      throw new Error(`Expected cell value "${expectedValue}" but got "${actualValue}"`);
    }
  }

  async expectRowCount(expectedCount: number): Promise<void> {
    const rows = this.body.locator('tr');
    const actualCount = await rows.count();
    if (actualCount !== expectedCount) {
      throw new Error(`Expected ${expectedCount} rows but got ${actualCount}`);
    }
  }

  async getCellText(row: number | string, column: string): Promise<string> {
    const cell = this.cell(row, column);
    return (await cell.textContent()) || '';
  }

  headerCell(column: string): Locator {
    return this.page.locator(`[data-testid="${generateTableCellTestId('header', column)}"]`);
  }

  row(rowIndex: number): Locator {
    return this.page.locator(`[data-testid="${generateTestId('ui', 'table', `row-${rowIndex}`)}"]`);
  }

  async sortByColumn(column: string): Promise<void> {
    await this.headerCell(column).click();
  }
}

export function createCardHelper(
  page: Page,
  suffix?: string,
  namespace: TestIdNamespace = 'ui',
): CardTestHelper {
  return new CardTestHelper(page, suffix, namespace);
}

/**
 * Factory functions for creating component test helpers
 */
export function createDialogHelper(page: Page, suffix?: string): DialogTestHelper {
  return new DialogTestHelper(page, suffix);
}

export function createDropdownHelper(page: Page, suffix?: string): DropdownTestHelper {
  return new DropdownTestHelper(page, suffix);
}

export function createFormHelper(page: Page, suffix?: string): FormTestHelper {
  return new FormTestHelper(page, suffix);
}

export function createTableHelper(page: Page, suffix?: string): TableTestHelper {
  return new TableTestHelper(page, suffix);
}

/**
 * Utility for checking empty states
 */
export async function expectEmptyState(
  page: Page,
  namespace: TestIdNamespace,
  component: ComponentTestId,
  suffix = 'empty',
): Promise<void> {
  const emptySelector = `[data-testid="${generateTestId(namespace, component, suffix)}"]`;
  await page.locator(emptySelector).waitFor({ state: 'visible' });
}

/**
 * Utility for checking error states
 */
export async function expectErrorState(
  page: Page,
  namespace: TestIdNamespace,
  component: ComponentTestId,
  suffix = 'error',
): Promise<void> {
  const errorSelector = `[data-testid="${generateTestId(namespace, component, suffix)}"]`;
  await page.locator(errorSelector).waitFor({ state: 'visible' });
}

/**
 * Utility for checking loading states
 */
export async function expectLoadingState(
  page: Page,
  namespace: TestIdNamespace,
  component: ComponentTestId,
  suffix = 'loading',
): Promise<void> {
  const loadingSelector = `[data-testid="${generateTestId(namespace, component, suffix)}"]`;
  await page.locator(loadingSelector).waitFor({ state: 'visible' });
}

/**
 * Utility for waiting for dynamic content to load
 */
export async function waitForDynamicContent(page: Page, testId: string, timeout = 10000): Promise<void> {
  await page.locator(`[data-testid="${testId}"]`).waitFor({ state: 'visible', timeout });
}
