/**
 * Core TypeScript types and interfaces for the testid system
 * Provides compile-time safety and prevents typos while ensuring consistency
 */

export type ComponentTestId =
  // UI Components
  | 'accordion'
  | 'admin-dashboard'
  | 'alert'
  | 'alert-dialog'
  | 'app-header'
  | 'app-sidebar'
  | 'avatar'
  | 'badge'
  | 'bobblehead-card'
  | 'bobblehead-details'
  | 'bobblehead-form'
  | 'bobblehead-gallery'
  | 'breadcrumb'
  | 'button'
  | 'calendar'
  | 'card'
  | 'checkbox'
  | 'collection-card'
  | 'collection-form'
  | 'collection-grid'
  | 'command'
  | 'content-layout'
  | 'context-menu'
  | 'dialog'
  | 'dropdown-menu'
  | 'follow-button'
  | 'form'
  | 'form-description'
  | 'form-error'
  | 'form-field'
  | 'form-label'
  | 'form-submit'
  | 'hover-card'
  | 'input'
  | 'label'
  | 'like-button'
  | 'main-nav'
  | 'menubar'
  | 'mobile-nav'
  | 'navigation-menu'

  // Layout Components
  | 'pagination'
  | 'popover'
  | 'progress'
  | 'radio-group'
  | 'resizable'
  | 'scroll-area'
  | 'search-command'
  | 'search-results'

  // Feature Components
  | 'select'
  | 'separator'
  | 'sheet'
  | 'skeleton'
  | 'slider'
  | 'sonner'
  | 'switch'
  | 'table'
  | 'tabs'
  | 'textarea'
  | 'theme-toggle'
  | 'toast'
  | 'toggle'

  // Form Components
  | 'toggle-group'
  | 'tooltip'
  | 'user-avatar'
  | 'user-nav'
  | 'user-profile';

export interface ComponentTestIdProps {
  /**
   * Optional testId prop for components
   * When provided, will be used as the data-testid attribute
   */
  testId?: string;
}

export type FormFieldTestIdPattern = {
  fieldName: string;
  suffix?: string;
};

export type TableCellTestIdPattern = {
  column: string;
  row: number | string;
};

export interface TestIdBuilder {
  /**
   * Generate a testid with namespace and component type
   */
  build(namespace: TestIdNamespace, component: ComponentTestId, suffix?: string): string;

  /**
   * Generate a testid for form fields with field name
   */
  buildFormField(fieldName: string, suffix?: string): string;

  /**
   * Generate a testid for table elements with row/column info
   */
  buildTableCell(row: number | string, column: string): string;

  /**
   * Validate that a testid follows the correct pattern
   */
  validate(testId: string): boolean;
}

export type TestIdNamespace = 'feature' | 'form' | 'layout' | 'ui';

export type TestIdPattern = {
  component: ComponentTestId;
  namespace: TestIdNamespace;
  suffix?: string;
};
