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
  | 'app-footer'
  | 'app-header'
  | 'app-sidebar'
  | 'avatar'
  | 'badge'
  | 'bobblehead-card'
  | 'bobblehead-details'
  | 'bobblehead-edit-cancel'
  | 'bobblehead-edit-dialog'
  | 'bobblehead-edit-form'
  | 'bobblehead-edit-submit'
  | 'bobblehead-form'
  | 'bobblehead-gallery'
  | 'bobblehead-grid'
  | 'bobblehead-nav'
  | 'bobblehead-photo'
  | 'bobbleheads-empty-state'
  | 'bobbleheads-empty-state-cta'
  | 'breadcrumb'
  | 'browse-collection-card'
  | 'browse-collections-table'
  | 'browse-subcollection-item'
  | 'browse-subcollections-section'
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
  | 'collections-empty-state'
  | 'collections-empty-state-cta'
  | 'command'
  | 'comments-button'
  | 'content-layout'
  | 'context-menu'
  | 'dialog'
  | 'dropdown-menu'
  | 'dropdown-menu-checkbox-item'
  | 'dropdown-menu-content'
  | 'dropdown-menu-group'
  | 'dropdown-menu-item'
  | 'dropdown-menu-label'
  | 'dropdown-menu-portal'
  | 'dropdown-menu-radio-group'
  | 'dropdown-menu-radio-item'
  | 'dropdown-menu-separator'
  | 'dropdown-menu-shortcut'
  | 'dropdown-menu-sub'
  | 'dropdown-menu-sub-content'
  | 'dropdown-menu-sub-trigger'
  | 'dropdown-menu-trigger'
  | 'empty-state'
  | 'follow-button'
  | 'form'
  | 'form-description'
  | 'form-error'

  // Layout Components
  | 'form-field'
  | 'form-label'
  | 'form-submit'
  | 'hover-card'
  | 'icon'
  | 'icon-apple'
  | 'icon-aria'
  | 'icon-github'
  | 'icon-google'
  | 'icon-logo'
  | 'icon-npm'
  | 'icon-paypal'
  | 'icon-pnpm'
  | 'icon-radix'
  | 'icon-react'
  | 'icon-spinner'
  | 'icon-tailwind'
  | 'icon-twitter'
  | 'icon-yarn'
  | 'input'
  | 'label'
  | 'like-button'
  | 'loading'
  | 'main-nav'

  // Feature Components
  | 'menubar'
  | 'mobile-nav'
  | 'navigation-menu'
  | 'pagination'
  | 'popover'
  | 'progress'
  | 'public-header'
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
  | 'skeleton-button'
  | 'skeleton-sidebar'
  | 'skeleton-user-button'
  | 'slider'
  | 'sonner'
  | 'spinner'
  | 'subcollection-actions'
  | 'subcollection-actions-delete'
  | 'subcollection-actions-edit'
  | 'subcollection-actions-trigger'
  | 'subcollection-card'
  | 'subcollection-card-image-link'
  | 'subcollection-card-title-link'
  | 'subcollection-empty-state'
  | 'subcollection-grid'
  | 'subcollection-list-item'
  | 'subcollections-empty-state'
  | 'subcollections-empty-state-cta'
  | 'switch'
  | 'table'
  | 'tabs'
  | 'tag-badge'
  | 'tag-list'
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
