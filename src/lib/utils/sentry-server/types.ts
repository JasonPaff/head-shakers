import type { SENTRY_CONTEXTS } from '@/lib/constants';

/**
 * Server-side Sentry utility types
 * Used by breadcrumb helpers and future performance/error tracking utilities
 */

// =============================================================================
// Shared Types
// =============================================================================

export interface ActionBreadcrumbData {
  [key: string]: unknown;
}

// =============================================================================
// Facade Types
// =============================================================================

/**
 * Context for action error handling wrapper.
 * Extends ActionOperationContext with error-specific fields.
 */
export interface ActionErrorContext extends ActionOperationContext {
  /** Original input data for error context (will be included in Sentry) */
  input?: unknown;
  /** Additional metadata (e.g., { actionName }) */
  metadata?: Record<string, unknown>;
}

/**
 * Context for action breadcrumb wrappers.
 * Used by withActionBreadcrumbs to track action lifecycle.
 */
export interface ActionOperationContext {
  /** Action name from ACTION_NAMES constant */
  actionName: string;
  /** Additional data to include in Sentry context */
  contextData?: Record<string, unknown>;
  /** Key from SENTRY_CONTEXTS to set context data under */
  contextType?: (typeof SENTRY_CONTEXTS)[keyof typeof SENTRY_CONTEXTS];
  /** Operation name from OPERATIONS constant */
  operation: string;
  /** User ID if authenticated */
  userId?: string;
}

/**
 * Configuration for tracking cache invalidation results.
 */
export interface CacheInvalidationConfig {
  /** ID of the entity being invalidated */
  entityId: string;
  /** Type of entity (e.g., 'bobblehead', 'collection', 'like') */
  entityType: string;
  /** Operation that triggered the invalidation */
  operation: string;
  /** User ID if available */
  userId?: string;
}

// =============================================================================
// Action Types
// =============================================================================

export interface FacadeBreadcrumbData {
  [key: string]: unknown;
}

export interface FacadeOperationContext {
  facade: string;
  method: string;
  userId?: string;
}

export type ServerBreadcrumbLevel = 'error' | 'info' | 'warning';

export interface WithActionBreadcrumbsOptions<T> {
  /** Custom message for entry breadcrumb. Defaults to "{actionName}: {operation} started" */
  entryMessage?: string;
  /** Extract summary data from result to include in success breadcrumb */
  includeResultSummary?: (result: T) => ActionBreadcrumbData;
  /** Custom message for success breadcrumb. Defaults to "{actionName}: {operation} completed" */
  successMessage?: string;
}

// =============================================================================
// Cache Invalidation Types
// =============================================================================

export interface WithFacadeBreadcrumbsOptions<T> {
  /** Custom message for entry breadcrumb. Defaults to "Starting {method}" */
  entryMessage?: string;
  /** Extract summary data from result to include in success breadcrumb */
  includeResultSummary?: (result: T) => FacadeBreadcrumbData;
  /** Custom message for success breadcrumb. Defaults to "{method} completed successfully" */
  successMessage?: string;
}
