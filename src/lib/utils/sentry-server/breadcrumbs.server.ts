import * as Sentry from '@sentry/nextjs';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';

import type {
  FacadeBreadcrumbData,
  FacadeOperationContext,
  ServerBreadcrumbLevel,
  WithFacadeBreadcrumbsOptions,
} from './types';

/**
 * Add a facade breadcrumb with BUSINESS_LOGIC category.
 * Use for entry, success, and warning breadcrumbs in facades.
 *
 * @example
 * facadeBreadcrumb('Fetching user data');
 * facadeBreadcrumb('User data fetched', { userId, count: 5 });
 * facadeBreadcrumb('Failed to process some items', { failed: 3 }, 'warning');
 */
export function facadeBreadcrumb(
  message: string,
  data?: FacadeBreadcrumbData,
  level: ServerBreadcrumbLevel = 'info',
): void {
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
    data,
    level: SENTRY_LEVELS[level.toUpperCase() as keyof typeof SENTRY_LEVELS],
    message,
  });
}

/**
 * Track facade operation start.
 * Creates an entry breadcrumb with facade and method context.
 *
 * @example
 * trackFacadeEntry('UsersFacade', 'getUserByIdAsync');
 * trackFacadeEntry('BobbleheadsFacade', 'createAsync', { collectionId });
 */
export function trackFacadeEntry(facade: string, method: string, data?: FacadeBreadcrumbData): void {
  facadeBreadcrumb(`${facade}.${method} started`, {
    facade,
    method,
    ...data,
  });
}

/**
 * Track facade operation error.
 * Creates an error-level breadcrumb with facade and method context.
 *
 * @example
 * trackFacadeError('BobbleheadsFacade', 'createAsync', 'Database transaction failed', {
 *   errorType: 'TransactionError',
 * });
 */
export function trackFacadeError(
  facade: string,
  method: string,
  message: string,
  data?: FacadeBreadcrumbData,
): void {
  facadeBreadcrumb(
    message,
    {
      facade,
      method,
      ...data,
    },
    'error',
  );
}

/**
 * Track facade operation success with optional result data.
 * Creates a success breadcrumb with facade and method context.
 *
 * @example
 * trackFacadeSuccess('UsersFacade', 'getUserByIdAsync', { found: true });
 * trackFacadeSuccess('BobbleheadsFacade', 'createAsync', { bobbleheadId, photoCount: 3 });
 */
export function trackFacadeSuccess(facade: string, method: string, data?: FacadeBreadcrumbData): void {
  facadeBreadcrumb(`${facade}.${method} completed`, {
    facade,
    method,
    ...data,
  });
}

/**
 * Track facade operation warning for partial failures or non-critical issues.
 * Creates a warning-level breadcrumb with facade and method context.
 *
 * @example
 * trackFacadeWarning('BobbleheadsFacade', 'deleteAsync', 'Failed to delete 2 photos from Cloudinary', {
 *   bobbleheadId,
 *   failedCount: 2,
 * });
 */
export function trackFacadeWarning(
  facade: string,
  method: string,
  message: string,
  data?: FacadeBreadcrumbData,
): void {
  facadeBreadcrumb(
    message,
    {
      facade,
      method,
      ...data,
    },
    'warning',
  );
}

/**
 * Wrap a facade operation with automatic entry/success/error breadcrumbs.
 * Use for straightforward operations where you want all tracking handled automatically.
 *
 * @example
 * // Basic usage
 * return withFacadeBreadcrumbs(
 *   { facade: 'UsersFacade', method: 'getUserByIdAsync' },
 *   async () => {
 *     return await UsersQuery.getUserByIdAsync(id, context);
 *   },
 * );
 *
 * @example
 * // With result summary
 * return withFacadeBreadcrumbs(
 *   { facade: 'PlatformStatsFacade', method: 'getStatsAsync' },
 *   async () => {
 *     const stats = await fetchStats();
 *     return stats;
 *   },
 *   {
 *     includeResultSummary: (stats) => ({
 *       totalBobbleheads: stats.totalBobbleheads,
 *       totalCollections: stats.totalCollections,
 *     }),
 *   },
 * );
 */
export async function withFacadeBreadcrumbs<T>(
  context: FacadeOperationContext,
  operation: () => Promise<T>,
  options?: WithFacadeBreadcrumbsOptions<T>,
): Promise<T> {
  const { facade, method, userId } = context;
  const entryMessage = options?.entryMessage ?? `${facade}.${method} started`;
  const successMessage = options?.successMessage ?? `${facade}.${method} completed`;

  // Entry breadcrumb
  facadeBreadcrumb(entryMessage, {
    facade,
    method,
    ...(userId && { userId }),
  });

  try {
    const result = await operation();

    // Success breadcrumb with optional result summary
    const resultData = options?.includeResultSummary?.(result);
    facadeBreadcrumb(successMessage, {
      facade,
      method,
      ...(userId && { userId }),
      ...resultData,
    });

    return result;
  } catch (error) {
    // Error breadcrumb
    facadeBreadcrumb(
      `${facade}.${method} failed`,
      {
        errorType: error instanceof Error ? error.constructor.name : 'unknown',
        facade,
        method,
        ...(userId && { userId }),
      },
      'error',
    );

    throw error;
  }
}
