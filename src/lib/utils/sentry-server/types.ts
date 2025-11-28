/**
 * Server-side Sentry utility types
 * Used by breadcrumb helpers and future performance/error tracking utilities
 */

export interface FacadeBreadcrumbData {
  [key: string]: unknown;
}

export interface FacadeOperationContext {
  facade: string;
  method: string;
  userId?: string;
}

export type ServerBreadcrumbLevel = 'error' | 'info' | 'warning';

export interface WithFacadeBreadcrumbsOptions<T> {
  /** Custom message for entry breadcrumb. Defaults to "Starting {method}" */
  entryMessage?: string;
  /** Extract summary data from result to include in success breadcrumb */
  includeResultSummary?: (result: T) => FacadeBreadcrumbData;
  /** Custom message for success breadcrumb. Defaults to "{method} completed successfully" */
  successMessage?: string;
}
