import type { FacadeErrorContext } from './error-types';
import type { FacadeBreadcrumbData, WithFacadeBreadcrumbsOptions } from './sentry-server/types';

import { createFacadeError } from './error-builders';
import { withFacadeBreadcrumbs } from './sentry-server/breadcrumbs.server';

// =============================================================================
// Types
// =============================================================================

/**
 * Configuration for facade operation execution.
 *
 * Provides a standardized structure for tracking facade operations,
 * including error context and optional user/data information for
 * debugging and monitoring purposes.
 */
export interface FacadeOperationConfig {
  /** Additional data for error context (sanitized for logging) */
  data?: Record<string, unknown>;
  /** Name of the facade class */
  facade: string;
  /** Method name being executed */
  method: string;
  /** Operation identifier (from OPERATIONS constants) */
  operation: string;
  /** User ID if available */
  userId?: string;
}

// =============================================================================
// Convenience Wrappers
// =============================================================================

/**
 * Simplified version when operation name matches method name.
 *
 * Common case that reduces config verbosity. Use when the operation
 * identifier is the same as the method name. Does NOT include Sentry
 * breadcrumbs - use for simple operations that don't need tracking.
 *
 * @param facade - Name of the facade class
 * @param method - Method name being executed (also used as the operation identifier)
 * @param operation - Async function to execute within the error handling wrapper
 * @param options - Optional user ID and additional data for error context
 * @returns The result of the operation
 * @throws ActionError with enhanced facade context if the operation fails
 *
 * @example
 * return executeFacadeMethod(
 *   facadeName,
 *   'getBobbleheadBySlug',
 *   async () => {
 *     const context = viewerUserId
 *       ? createUserQueryContext(viewerUserId, { dbInstance })
 *       : createPublicQueryContext({ dbInstance });
 *     return BobbleheadsQuery.findBySlugAsync(slug, context);
 *   },
 *   { userId: viewerUserId, data: { slug } },
 * );
 */
export async function executeFacadeMethod<T>(
  facade: string,
  method: string,
  operation: () => Promise<T>,
  options?: { data?: Record<string, unknown>; userId?: string },
): Promise<T> {
  return executeFacadeOperationWithoutBreadcrumbs(
    {
      data: options?.data,
      facade,
      method,
      operation: method,
      userId: options?.userId,
    },
    operation,
  );
}

/**
 * Execute a facade operation with breadcrumbs AND error handling.
 *
 * Combines withFacadeBreadcrumbs with error handling for complete
 * facade operation wrapping. This is the default helper for most
 * facade operations as they typically need Sentry breadcrumb tracking.
 *
 * @param config - Configuration containing facade name, method, operation, and optional user/data context
 * @param operation - Async function to execute within the breadcrumb and error handling wrapper
 * @param breadcrumbOptions - Optional configuration for customizing breadcrumb messages and result summaries
 * @returns The result of the operation
 * @throws ActionError with enhanced facade context if the operation fails
 *
 * @example
 * return executeFacadeOperation(
 *   {
 *     facade: facadeName,
 *     method: 'getPlatformStatsAsync',
 *     operation: OPERATIONS.PLATFORM.GET_STATS,
 *   },
 *   async () => {
 *     return await CacheService.platform.stats(async () => {
 *       // ... fetch stats
 *     });
 *   },
 *   {
 *     includeResultSummary: (stats) => ({
 *       totalBobbleheads: stats.totalBobbleheads,
 *       totalCollections: stats.totalCollections,
 *     }),
 *   },
 * );
 */
export async function executeFacadeOperation<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
  breadcrumbOptions?: WithFacadeBreadcrumbsOptions<T>,
): Promise<T> {
  return withFacadeBreadcrumbs(
    { facade: config.facade, method: config.method, userId: config.userId },
    async () => {
      try {
        return await operation();
      } catch (error) {
        const errorContext: FacadeErrorContext = {
          data: config.data,
          facade: config.facade,
          method: config.method,
          operation: config.operation,
          userId: config.userId,
        };
        throw createFacadeError(errorContext, error);
      }
    },
    breadcrumbOptions,
  );
}

// =============================================================================
// Core Operation Helpers
// =============================================================================

/**
 * Execute a facade operation with error handling but WITHOUT breadcrumbs.
 *
 * Wraps the operation in a try-catch and converts errors to ActionError
 * with proper facade context. Use for simple operations that don't need
 * Sentry breadcrumb tracking.
 *
 * @param config - Configuration containing facade name, method, operation, and optional user/data context
 * @param operation - Async function to execute within the error handling wrapper
 * @returns The result of the operation
 * @throws ActionError with enhanced facade context if the operation fails
 *
 * @example
 * return executeFacadeOperationWithoutBreadcrumbs(
 *   {
 *     facade: facadeName,
 *     method: 'getBobbleheadBySlug',
 *     operation: 'getBySlug',
 *     userId: viewerUserId,
 *     data: { slug },
 *   },
 *   async () => {
 *     const context = viewerUserId
 *       ? createUserQueryContext(viewerUserId, { dbInstance })
 *       : createPublicQueryContext({ dbInstance });
 *     return BobbleheadsQuery.findBySlugAsync(slug, context);
 *   },
 * );
 */
export async function executeFacadeOperationWithoutBreadcrumbs<T>(
  config: FacadeOperationConfig,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      data: config.data,
      facade: config.facade,
      method: config.method,
      operation: config.operation,
      userId: config.userId,
    };
    throw createFacadeError(errorContext, error);
  }
}

// =============================================================================
// Breadcrumb Utilities
// =============================================================================

/**
 * Helper for includeResultSummary that spreads the entire result.
 * Use when you want all result data included in breadcrumbs.
 *
 * Handles various result types by wrapping the value appropriately:
 * - Objects: spreads all properties
 * - Primitives (string, number, boolean): wrapped as `{ value: result }`
 * - null/undefined: returns empty object
 * - Arrays: wrapped as `{ items: result, count: result.length }`
 *
 * @param result - The result to include in breadcrumb data
 * @returns The result formatted as FacadeBreadcrumbData
 *
 * @example
 * return executeFacadeOperation(
 *   { facade: facadeName, method: 'getDataAsync', operation: 'getData' },
 *   async () => fetchData(),
 *   { includeResultSummary: includeFullResult },
 * );
 */
export function includeFullResult<T>(result: T): FacadeBreadcrumbData {
  // Handle null/undefined
  if (result === null || result === undefined) {
    return {};
  }

  // Handle primitives
  if (typeof result !== 'object') {
    return { value: result };
  }

  // Handle arrays
  if (Array.isArray(result)) {
    return { count: result.length, items: result };
  }

  // Handle objects - spread properties
  // Type assertion needed because TypeScript cannot verify that spreading
  // an arbitrary object satisfies the index signature requirement
  return { ...result } as FacadeBreadcrumbData;
}
