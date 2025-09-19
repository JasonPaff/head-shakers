/**
 * Core TypeScript types and interfaces for the testid system
 * Provides compile-time safety and prevents typos while ensuring consistency
 */

export type ComponentTestId =
  // UI Components
  | 'accordion'
  | 'action-menu'
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
  | 'bobblehead-nav'
  | 'bobblehead-photo'
  | 'breadcrumb'
  | 'button'
  | 'calendar'
  | 'card'
  | 'checkbox'
  | 'collection-card'
  | 'collection-create-cancel'
  | 'collection-create-dialog'
  | 'collection-create-form'
  | 'collection-create-submit'
  | 'collection-edit-cancel'
  | 'collection-edit-dialog'
  | 'collection-edit-form'
  | 'collection-edit-submit'
  | 'collection-form'
  | 'collection-grid'
  | 'command'
  | 'comments-button'
  | 'content-layout'
  | 'context-menu'
  | 'dialog'
  | 'dropdown-menu'
  | 'follow-button'
  | 'form'
  | 'form-description'

  // Layout Components
  | 'form-error'
  | 'form-field'
  | 'form-label'
  | 'form-submit'
  | 'hover-card'
  | 'input'
  | 'label'
  | 'like-button'

  // Feature Components
  | 'main-nav'
  | 'menubar'
  | 'mobile-nav'
  | 'navigation-menu'
  | 'pagination'
  | 'popover'
  | 'progress'
  | 'radio-group'
  | 'resizable'
  | 'scroll-area'
  | 'search-command'
  | 'search-results'
  | 'select'
  | 'separator'
  | 'share-button'
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
  | 'toggle-group'

  // Form Components
  | 'tooltip'
  | 'user-avatar'
  | 'user-nav'
  | 'user-profile'
  | 'view-details-button';

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
