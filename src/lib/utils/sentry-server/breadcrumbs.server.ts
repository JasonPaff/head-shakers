import * as Sentry from '@sentry/nextjs';

import type { SENTRY_CONTEXTS } from '@/lib/constants';

import { SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS, SENTRY_TAGS } from '@/lib/constants';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { includeFullResult } from '@/lib/utils/facade-helpers';

import type {
  ActionBreadcrumbData,
  ActionErrorContext,
  ActionOperationContext,
  CacheInvalidationConfig,
  FacadeBreadcrumbData,
  FacadeOperationContext,
  ServerBreadcrumbLevel,
  WithActionBreadcrumbsOptions,
  WithFacadeBreadcrumbsOptions,
} from './types';

// =============================================================================
// Basic Breadcrumb Functions (Layer 0)
// =============================================================================

/**
 * Add an action breadcrumb with BUSINESS_LOGIC category.
 * Use for entry, success, and warning breadcrumbs in server actions.
 *
 * @example
 * actionBreadcrumb('Processing payment');
 * actionBreadcrumb('Payment completed', { orderId, amount });
 * actionBreadcrumb('Partial failure in batch', { failedCount: 3 }, 'warning');
 */
export function actionBreadcrumb(
  message: string,
  data?: ActionBreadcrumbData,
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
 * Capture a non-critical exception in a facade with proper tags and warning level.
 * Use for errors that should be logged but shouldn't fail the main operation.
 *
 * @example
 * // Email sending failure (non-critical)
 * catch (emailError) {
 *   captureFacadeWarning(emailError, facadeName, OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL, {
 *     signupId,
 *   });
 * }
 *
 * @example
 * // Cloudinary cleanup failure
 * catch (error) {
 *   captureFacadeWarning(error, 'BobbleheadsFacade', 'cloudinary-cleanup', {
 *     bobbleheadId,
 *     photoCount: urls.length,
 *   });
 * }
 */
export function captureFacadeWarning(
  error: unknown,
  facade: string,
  operation: string,
  extra?: Record<string, unknown>,
): void {
  Sentry.captureException(error, {
    extra,
    level: 'warning',
    tags: {
      [SENTRY_TAGS.COMPONENT]: facade,
      [SENTRY_TAGS.OPERATION]: operation,
    },
  });
}

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
 * Set Sentry context with type-safe context key.
 * Reduces boilerplate for Sentry.setContext(SENTRY_CONTEXTS.XXX, data).
 *
 * @param contextType - The context type value from SENTRY_CONTEXTS
 * @param data - The data to set in the context
 * @example
 * setActionContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, bobbleheadData);
 * setActionContext(SENTRY_CONTEXTS.COLLECTION_DATA, { name, slug, userId });
 * setActionContext(SENTRY_CONTEXTS.INPUT_INFO, { filters, pagination, sort });
 */
export function setActionContext(
  contextType: (typeof SENTRY_CONTEXTS)[keyof typeof SENTRY_CONTEXTS],
  data: Record<string, unknown>,
): void {
  Sentry.setContext(contextType, data);
}

// =============================================================================
// Tracking Functions (Layer 1)
// =============================================================================

/**
 * Track server action operation start.
 * Creates an entry breadcrumb with action and operation context.
 *
 * @example
 * trackActionEntry('CREATE_BOBBLEHEAD', 'bobbleheads.create');
 * trackActionEntry('UPDATE_COLLECTION', 'collections.update', { collectionId });
 */
export function trackActionEntry(actionName: string, operation: string, data?: ActionBreadcrumbData): void {
  actionBreadcrumb(`${actionName}: ${operation} started`, {
    actionName,
    operation,
    ...data,
  });
}

/**
 * Track server action operation success with optional result data.
 * Creates a success breadcrumb with action and operation context.
 *
 * @example
 * trackActionSuccess('CREATE_BOBBLEHEAD', 'bobbleheads.create', { bobbleheadId });
 * trackActionSuccess('BATCH_DELETE', 'bobbleheads.batchDelete', { deletedCount: 5 });
 */
export function trackActionSuccess(actionName: string, operation: string, data?: ActionBreadcrumbData): void {
  actionBreadcrumb(`${actionName}: ${operation} completed`, {
    actionName,
    operation,
    ...data,
  });
}

/**
 * Track server action warning for partial failures or non-critical issues.
 * Creates a warning-level breadcrumb with action and operation context.
 *
 * @example
 * trackActionWarning('CREATE_BOBBLEHEAD', 'photo.move', 'Some photos failed to move', {
 *   failedCount: 2,
 *   totalCount: 10,
 * });
 */
export function trackActionWarning(
  actionName: string,
  operation: string,
  message: string,
  data?: ActionBreadcrumbData,
): void {
  actionBreadcrumb(
    message,
    {
      actionName,
      operation,
      ...data,
    },
    'warning',
  );
}

/**
 * Track cache invalidation result with automatic warning on failure.
 * Use for logging cache invalidation outcomes without failing the main operation.
 *
 * @param config - Configuration for the cache invalidation tracking
 * @param result - The result from CacheRevalidationService
 * @example
 * const result = CacheRevalidationService.bobbleheads.onUpdate(bobbleheadId, userId);
 * trackCacheInvalidation(
 *   { entityType: 'bobblehead', entityId: bobbleheadId, operation: 'update', userId },
 *   result,
 * );
 */
export function trackCacheInvalidation(
  config: CacheInvalidationConfig,
  result: { error?: string; isSuccess: boolean; tagsInvalidated?: Array<string> },
): void {
  const { entityId, entityType, operation, userId } = config;

  if (result.isSuccess) {
    actionBreadcrumb(`Cache invalidated for ${entityType}`, {
      entityId,
      entityType,
      operation,
      tagsInvalidated: result.tagsInvalidated,
      ...(userId && { userId }),
    });
  } else {
    Sentry.captureException(new Error(`Cache invalidation failed for ${entityType}`), {
      extra: {
        entityId,
        entityType,
        error: result.error,
        operation,
        tagsAttempted: result.tagsInvalidated,
        ...(userId && { userId }),
      },
      level: 'warning',
    });
  }
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

// =============================================================================
// Wrapper Functions (Layer 2)
// =============================================================================

/**
 * Wrap a server action operation with automatic entry/success/error breadcrumbs.
 * Use for straightforward operations where you want all tracking handled automatically.
 * Does NOT handle errors - use withActionErrorHandling for that.
 *
 * @example
 * // Basic usage
 * return withActionBreadcrumbs(
 *   { actionName: 'GET_CATEGORIES', operation: 'collections.getCategories' },
 *   async () => {
 *     return await CollectionsFacade.getCategories(dbInstance);
 *   },
 * );
 *
 * @example
 * // With context and result summary
 * return withActionBreadcrumbs(
 *   {
 *     actionName: 'CREATE_BOBBLEHEAD',
 *     operation: 'bobbleheads.create',
 *     userId: ctx.userId,
 *     contextType: 'BOBBLEHEAD_DATA',
 *     contextData: bobbleheadData,
 *   },
 *   async () => {
 *     const result = await BobbleheadsFacade.createAsync(data, userId);
 *     return { data: result, success: true };
 *   },
 *   {
 *     includeResultSummary: (result) => ({
 *       bobbleheadId: result.data.id,
 *       name: result.data.name,
 *     }),
 *   },
 * );
 */
export async function withActionBreadcrumbs<T>(
  context: ActionOperationContext,
  operation: () => Promise<T>,
  options?: WithActionBreadcrumbsOptions<T>,
): Promise<T> {
  const { actionName, contextData, contextType, operation: op, userId } = context;

  // Set Sentry context if provided
  if (contextType && contextData) {
    setActionContext(contextType, contextData);
  }

  const entryMessage = options?.entryMessage ?? `${actionName}: ${op} started`;
  const successMessage = options?.successMessage ?? `${actionName}: ${op} completed`;

  // Entry breadcrumb
  actionBreadcrumb(entryMessage, {
    actionName,
    operation: op,
    ...(userId && { userId }),
  });

  try {
    const result = await operation();

    // Success breadcrumb with optional result summary
    const resultData = options?.includeResultSummary?.(result);
    actionBreadcrumb(successMessage, {
      actionName,
      operation: op,
      ...(userId && { userId }),
      ...resultData,
    });

    return result;
  } catch (error) {
    // Error breadcrumb (but don't handle the error - let it propagate)
    actionBreadcrumb(
      `${actionName}: ${op} failed`,
      {
        actionName,
        errorType: error instanceof Error ? error.constructor.name : 'unknown',
        operation: op,
        ...(userId && { userId }),
      },
      'error',
    );

    throw error;
  }
}

/**
 * Wrap a server action operation with automatic breadcrumbs AND error handling.
 * Combines withActionBreadcrumbs with handleActionError for complete action wrapping.
 *
 * This is the most comprehensive wrapper - it handles:
 * 1. Setting Sentry context (if contextType/contextData provided)
 * 2. Entry breadcrumb on start
 * 3. Success breadcrumb on completion
 * 4. Error breadcrumb + handleActionError on failure
 *
 * @example
 * // Simple action with full error handling
 * return withActionErrorHandling(
 *   {
 *     actionName: ACTION_NAMES.COLLECTIONS.CREATE,
 *     operation: OPERATIONS.COLLECTIONS.CREATE,
 *     userId: ctx.userId,
 *     input: parsedInput,
 *     contextType: 'COLLECTION_DATA',
 *     contextData: collectionData,
 *   },
 *   async () => {
 *     const newCollection = await CollectionsFacade.createAsync(collectionData, ctx.userId, db);
 *     if (!newCollection) {
 *       throw new ActionError(ErrorType.INTERNAL, 'CREATE_FAILED', 'Failed to create');
 *     }
 *     return { data: newCollection, success: true };
 *   },
 *   { includeResultSummary: (r) => ({ collectionId: r.data.id }) },
 * );
 */
export async function withActionErrorHandling<T>(
  context: ActionErrorContext,
  operation: () => Promise<T>,
  breadcrumbOptions?: WithActionBreadcrumbsOptions<T>,
): Promise<T> {
  const { actionName, contextData, contextType, input, metadata, operation: op, userId } = context;

  // Set Sentry context if provided
  if (contextType && contextData) {
    setActionContext(contextType, contextData);
  }

  const entryMessage = breadcrumbOptions?.entryMessage ?? `${actionName}: ${op} started`;
  const successMessage = breadcrumbOptions?.successMessage ?? `${actionName}: ${op} completed`;

  // Entry breadcrumb
  actionBreadcrumb(entryMessage, {
    actionName,
    operation: op,
    ...(userId && { userId }),
  });

  try {
    const result = await operation();

    // Success breadcrumb with optional result summary
    const resultData = breadcrumbOptions?.includeResultSummary?.(result);
    actionBreadcrumb(successMessage, {
      actionName,
      operation: op,
      ...(userId && { userId }),
      ...resultData,
    });

    return result;
  } catch (error) {
    // Error breadcrumb
    actionBreadcrumb(
      `${actionName}: ${op} failed`,
      {
        actionName,
        errorType: error instanceof Error ? error.constructor.name : 'unknown',
        operation: op,
        ...(userId && { userId }),
      },
      'error',
    );

    // Delegate to handleActionError which will throw the appropriate ActionError
    handleActionError(error, {
      input: input as Record<string, unknown> | undefined,
      metadata: metadata ?? { actionName },
      operation: op,
      userId,
    });
  }
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

    // Success breadcrumb with result summary (defaults to the full result)
    const summarize = options?.includeResultSummary ?? includeFullResult;
    const resultData = summarize(result);
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
