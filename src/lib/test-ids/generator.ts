/**
 * Utility functions for generating consistent testids
 * Provides runtime testid generation and validation
 */

import type {
  ComponentTestId,
  FormFieldTestIdPattern,
  TableCellTestIdPattern,
  TestIdBuilder,
  TestIdNamespace,
  TestIdPattern,
} from './types';

/**
 * Separator used in testid generation
 */
const TESTID_SEPARATOR = '-';

/**
 * Pattern for validating testids
 */
const TESTID_PATTERN = /^[a-z]+(-[a-z0-9]+)*$/;

/**
 * Generate a testid for form fields with field name
 */
export function generateFormFieldTestId(fieldName: string, suffix?: string): string {
  const normalizedFieldName = fieldName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, TESTID_SEPARATOR)
    .replace(/^-+|-+$/g, '');

  const parts = ['form', 'field', normalizedFieldName];

  if (suffix) {
    const normalizedSuffix = suffix
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, TESTID_SEPARATOR)
      .replace(/^-+|-+$/g, '');

    if (normalizedSuffix) {
      parts.push(normalizedSuffix);
    }
  }

  return parts.join(TESTID_SEPARATOR);
}

/**
 * Generate a testid for table elements with row/column info
 */
export function generateTableCellTestId(row: number | string, column: string): string {
  const normalizedColumn = column
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, TESTID_SEPARATOR)
    .replace(/^-+|-+$/g, '');

  return ['table', 'cell', 'row', String(row), 'col', normalizedColumn].join(TESTID_SEPARATOR);
}

/**
 * Generate a testid with namespace and component type
 */
export function generateTestId(
  namespace: TestIdNamespace,
  component: ComponentTestId,
  suffix?: string,
): string {
  const parts: Array<string> = [namespace, component];

  if (suffix) {
    // normalize suffix to lowercase and replace spaces/special chars with hyphens
    const normalizedSuffix = suffix
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, TESTID_SEPARATOR)
      .replace(/^-+|-+$/g, ''); // remove leading/trailing hyphens

    if (normalizedSuffix) {
      parts.push(normalizedSuffix);
    }
  }

  return parts.join(TESTID_SEPARATOR);
}

/**
 * Validate that a testid follows the correct pattern
 */
export function validateTestId(testId: string): boolean {
  return TESTID_PATTERN.test(testId);
}

/**
 * TestIdBuilder implementation
 */
export const testIdBuilder: TestIdBuilder = {
  build: generateTestId,
  buildFormField: generateFormFieldTestId,
  buildTableCell: generateTableCellTestId,
  validate: validateTestId,
};

/**
 * Helper function to create form field testid from the pattern object
 */
export function createFormFieldTestId(pattern: FormFieldTestIdPattern): string {
  return generateFormFieldTestId(pattern.fieldName, pattern.suffix);
}

/**
 * Helper function to create table cell testid from the pattern object
 */
export function createTableCellTestId(pattern: TableCellTestIdPattern): string {
  return generateTableCellTestId(pattern.row, pattern.column);
}

/**
 * Helper function to create testid from the pattern object
 */
export function createTestId(pattern: TestIdPattern): string {
  return generateTestId(pattern.namespace, pattern.component, pattern.suffix);
}

/**
 * Utility to extract the component from a testid
 */
export function extractComponent(testId: string): ComponentTestId | null {
  const parts = testId.split(TESTID_SEPARATOR);

  if (parts.length >= 2 && parts[1]) {
    const component = parts[1];
    // use type guard to check if the component is valid
    if (isValidComponentTestId(component)) {
      return component;
    }
  }

  return null;
}

/**
 * Utility to extract namespace from a testid
 */
export function extractNamespace(testId: string): null | TestIdNamespace {
  const parts = testId.split(TESTID_SEPARATOR);
  const namespace = parts[0];

  if (namespace && isValidTestIdNamespace(namespace)) {
    return namespace;
  }

  return null;
}

/**
 * Type guard to check if a string is a valid ComponentTestId
 */
function isValidComponentTestId(component: string): component is ComponentTestId {
  const validComponents = [
    'accordion',
    'admin-dashboard',
    'alert',
    'alert-dialog',
    'app-header',
    'app-sidebar',
    'avatar',
    'badge',
    'bobblehead-card',
    'bobblehead-details',
    'bobblehead-form',
    'bobblehead-gallery',
    'bobblehead-grid',
    'bobbleheads-empty-state',
    'bobbleheads-empty-state-cta',
    'breadcrumb',
    'browse-collection-card',
    'browse-collections-table',
    'browse-subcollection-item',
    'browse-subcollections-section',
    'button',
    'calendar',
    'card',
    'checkbox',
    'collection-card',
    'collection-form',
    'collection-grid',
    'collections-empty-state',
    'collections-empty-state-cta',
    'command',
    'context-menu',
    'dialog',
    'empty-state',
    'dropdown-menu',
    'dropdown-menu-checkbox-item',
    'dropdown-menu-content',
    'dropdown-menu-group',
    'dropdown-menu-item',
    'dropdown-menu-label',
    'dropdown-menu-portal',
    'dropdown-menu-radio-group',
    'dropdown-menu-radio-item',
    'dropdown-menu-separator',
    'dropdown-menu-shortcut',
    'dropdown-menu-sub',
    'dropdown-menu-sub-content',
    'dropdown-menu-sub-trigger',
    'dropdown-menu-trigger',
    'follow-button',
    'form',
    'form-description',
    'form-error',
    'form-field',
    'form-label',
    'form-submit',
    'hover-card',
    'icon',
    'icon-apple',
    'icon-aria',
    'icon-github',
    'icon-google',
    'icon-logo',
    'icon-npm',
    'icon-paypal',
    'icon-pnpm',
    'icon-radix',
    'icon-react',
    'icon-spinner',
    'icon-tailwind',
    'icon-twitter',
    'icon-yarn',
    'input',
    'label',
    'like-button',
    'loading',
    'main-nav',
    'menubar',
    'mobile-nav',
    'navigation-menu',
    'pagination',
    'popover',
    'progress',
    'radio-group',
    'resizable',
    'scroll-area',
    'search-command',
    'search-results',
    'content-layout',
    'action-menu',
    'bobblehead-edit-cancel',
    'bobblehead-edit-dialog',
    'bobblehead-edit-form',
    'bobblehead-edit-submit',
    'bobblehead-nav',
    'bobblehead-photo',
    'collection-create-cancel',
    'collection-create-dialog',
    'collection-create-form',
    'collection-create-submit',
    'collection-edit-cancel',
    'collection-edit-dialog',
    'collection-edit-form',
    'collection-edit-submit',
    'comments-button',
    'select',
    'separator',
    'share-button',
    'sheet',
    'skeleton',
    'skeleton-button',
    'skeleton-sidebar',
    'skeleton-user-button',
    'slider',
    'sonner',
    'spinner',
    'subcollection-actions',
    'subcollection-actions-delete',
    'subcollection-actions-edit',
    'subcollection-actions-trigger',
    'subcollection-card',
    'subcollection-card-image-link',
    'subcollection-card-title-link',
    'subcollection-empty-state',
    'subcollection-grid',
    'subcollection-list-item',
    'subcollections-empty-state',
    'subcollections-empty-state-cta',
    'switch',
    'table',
    'tabs',
    'tag-badge',
    'tag-list',
    'textarea',
    'theme-toggle',
    'toast',
    'toggle',
    'toggle-group',
    'tooltip',
    'user-avatar',
    'user-nav',
    'user-profile',
    'view-details-button',
  ] as const;

  return validComponents.includes(component as ComponentTestId);
}

/**
 * Type guard to check if a string is a valid TestIdNamespace
 */
function isValidTestIdNamespace(namespace: string): namespace is TestIdNamespace {
  const validNamespaces: Array<TestIdNamespace> = ['feature', 'form', 'layout', 'ui'];
  return validNamespaces.includes(namespace as TestIdNamespace);
}
