import type { FacadeErrorContext } from './error-types';
import type { FacadeBreadcrumbData, WithFacadeBreadcrumbsOptions } from './sentry-server/types';

import { createFacadeError } from './error-builders';

/**
 * Configuration for facade operation execution
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

/**
 * Simplified version when operation name matches method name.
 *
 * Common case that reduces config verbosity. Use when the operation
 * identifier is the same as the method name. Does NOT include Sentry
 * breadcrumbs - use for simple operations that don't need tracking.
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
  const { withFacadeBreadcrumbs } = await import('./sentry-server/breadcrumbs.server');

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

/**
 * Execute a facade operation with error handling but WITHOUT breadcrumbs.
 *
 * Wraps the operation in a try-catch and converts errors to ActionError
 * with proper facade context. Use for simple operations that don't need
 * Sentry breadcrumb tracking.
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

/**
 * Helper for includeResultSummary that spreads the entire result.
 * Use when you want all result data included in breadcrumbs.
 *
 * Handles various result types:
 * - Objects: spreads all properties
 * - Arrays: converts to object with numeric string keys
 * - null/undefined: returns empty object
 *
 * @example
 * return executeFacadeOperation(
 *   { facade: facadeName, method: 'getDataAsync', operation: 'getData' },
 *   async () => fetchData(),
 *   { includeResultSummary: includeFullResult },
 * );
 */
export function includeFullResult<T>(result: T): FacadeBreadcrumbData {
  return { ...result } as FacadeBreadcrumbData;
}
