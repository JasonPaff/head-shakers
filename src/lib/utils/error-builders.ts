import { ERROR_MESSAGES } from '@/lib/constants';

import type { ErrorContext as BaseErrorContext } from './action-error-handler';
import type {
  DatabaseErrorContext,
  FacadeErrorContext,
  MiddlewareErrorContext,
  QueryErrorContext,
  ServiceErrorContext,
} from './error-types';

import { ActionError, ErrorType, isRetryableError } from './errors';

/**
 * creates an authorization error
 */
export function createAuthorizationError(
  message: string = ERROR_MESSAGES.AUTH.UNAUTHORIZED,
  context?: Record<string, unknown>,
): ActionError {
  return new ActionError(ErrorType.AUTHORIZATION, 'UNAUTHORIZED', message, context, false, 401);
}

/**
 * creates a business rule violation error
 */
export function createBusinessRuleError(
  code: string,
  message: string,
  context?: Record<string, unknown>,
): ActionError {
  return new ActionError(ErrorType.BUSINESS_RULE, code, message, context, false, 422);
}

/**
 * creates a database error with retry logic detection
 */
export function createDatabaseError(
  code: string,
  message: string,
  context: DatabaseErrorContext,
  originalError?: Error,
): ActionError {
  const isRecoverable = originalError ? isRetryableError(originalError) : false;
  const statusCode = isRecoverable ? 503 : 500;

  return new ActionError(
    ErrorType.DATABASE,
    code,
    message,
    {
      ...context,
      operation: context.operation,
      query: context.query,
      table: context.table,
    },
    isRecoverable,
    statusCode,
    originalError,
  );
}

/**
 * creates an external service error with retry detection
 */
export function createExternalServiceError(
  service: string,
  message: string,
  context: ServiceErrorContext,
  originalError?: Error,
): ActionError {
  const isRecoverable = originalError ? isRetryableError(originalError) : (context.isRetryable ?? false);
  const statusCode = context.httpStatus ?? (isRecoverable ? 503 : 502);

  return new ActionError(
    ErrorType.EXTERNAL_SERVICE,
    `${service.toUpperCase()}_ERROR`,
    message,
    {
      ...context,
      service,
    },
    isRecoverable,
    statusCode,
    originalError,
  );
}

/**
 * creates an error from a facade operation
 */
export function createFacadeError(context: FacadeErrorContext, originalError?: unknown): ActionError {
  const { data, facade, method, operation } = context;

  // if it's already an ActionError, enhance it with facade context
  if (originalError instanceof ActionError) {
    return new ActionError(
      originalError.type,
      originalError.code,
      originalError.message,
      {
        ...originalError.context,
        facade,
        method,
        operation,
        ...(data && { hasData: true }),
      },
      originalError.isRecoverable,
      originalError.statusCode,
      originalError.originalError,
    );
  }

  // determine the error type based on the original error
  if (originalError instanceof Error) {
    const message = originalError.message.toLowerCase();

    // check for specific error patterns
    if (message.includes('not found')) {
      return createNotFoundError(facade, data?.id as string, { facade, method, operation });
    }

    if (message.includes('unauthorized') || message.includes('authentication')) {
      return createAuthorizationError(originalError.message, { facade, method, operation });
    }

    if (message.includes('forbidden') || message.includes('permission')) {
      return createForbiddenError(originalError.message, { facade, method, operation });
    }

    // default to database error for facade operations
    return createDatabaseError(
      `${facade.toUpperCase()}_${operation.toUpperCase()}_FAILED`,
      `Failed to ${operation} in ${facade}`,
      {
        operation,
        table: facade,
      },
      originalError,
    );
  }

  return createInternalError(`Unexpected error in ${facade}.${method}`, context, originalError as Error);
}

/**
 * creates a forbidden error for insufficient permissions
 */
export function createForbiddenError(
  message: string = ERROR_MESSAGES.AUTH.INSUFFICIENT_PERMISSIONS,
  context?: Record<string, unknown>,
): ActionError {
  return new ActionError(ErrorType.AUTHORIZATION, 'FORBIDDEN', message, context, false, 403);
}

/**
 * creates an internal server error (use sparingly)
 */
export function createInternalError(
  message: string = ERROR_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
  context?: Record<string, unknown>,
  originalError?: Error,
): ActionError {
  return new ActionError(ErrorType.INTERNAL, 'INTERNAL_ERROR', message, context, false, 500, originalError);
}

/**
 * creates an error from middleware
 */
export function createMiddlewareError(context: MiddlewareErrorContext, originalError?: unknown): ActionError {
  const { actionName, middleware, operation } = context;

  // if it's already an ActionError, enhance with middleware context
  if (originalError instanceof ActionError) {
    return new ActionError(
      originalError.type,
      originalError.code,
      originalError.message,
      {
        ...originalError.context,
        actionName,
        middleware,
      },
      originalError.isRecoverable,
      originalError.statusCode,
      originalError.originalError,
    );
  }

  // handle specific middleware errors
  if (originalError instanceof Error) {
    const message = originalError.message;

    if (message.includes(ERROR_MESSAGES.AUTH.UNAUTHORIZED)) {
      return createAuthorizationError(message, context);
    }

    if (message.includes(ERROR_MESSAGES.AUTH.USER_NOT_FOUND)) {
      return createNotFoundError('User', undefined, context);
    }

    if (message.includes('Rate limit')) {
      return createRateLimitError(message, context);
    }
  }

  return createInternalError(
    `Middleware error in ${middleware}`,
    {
      ...context,
      operation,
    },
    originalError as Error,
  );
}

/**
 * creates a not found error
 */
export function createNotFoundError(
  resource: string,
  id?: string,
  context?: Record<string, unknown>,
): ActionError {
  const message = `${resource} not found${id ? `: ${id}` : ''}`;
  return new ActionError(
    ErrorType.NOT_FOUND,
    'RESOURCE_NOT_FOUND',
    message,
    {
      ...context,
      id,
      resource,
    },
    false,
    404,
  );
}

/**
 * creates an error from a query operation
 */
export function createQueryError(context: QueryErrorContext, originalError?: unknown): ActionError {
  const { filters, method, operation, query, table } = context;

  // if it's already an ActionError, enhance with query context
  if (originalError instanceof ActionError) {
    return new ActionError(
      originalError.type,
      originalError.code,
      originalError.message,
      {
        ...originalError.context,
        method,
        operation,
        query,
        table,
        ...(filters && { hasFilters: true }),
      },
      originalError.isRecoverable,
      originalError.statusCode,
      originalError.originalError,
    );
  }

  // handle specific query errors
  if (originalError instanceof Error) {
    const message = originalError.message.toLowerCase();

    if (message.includes('user id is required')) {
      return createValidationError('MISSING_USER_CONTEXT', originalError.message, context);
    }

    // default to database error
    return createDatabaseError(
      `QUERY_${operation.toUpperCase()}_FAILED`,
      `Query operation failed: ${operation}`,
      {
        operation,
        query,
        table,
      },
      originalError,
    );
  }

  return createInternalError(`Unexpected error in ${query}.${method}`, context, originalError as Error);
}

// ============================================================================
// layer-specific error builders
// ============================================================================

/**
 * creates a rate limit error
 */
export function createRateLimitError(
  message: string = ERROR_MESSAGES.RATE_LIMIT.EXCEEDED,
  context?: Record<string, unknown>,
): ActionError {
  return new ActionError(ErrorType.RATE_LIMIT, 'RATE_LIMIT_EXCEEDED', message, context, false, 429);
}

/**
 * creates an error from a service operation
 */
export function createServiceError(context: ServiceErrorContext, originalError?: unknown): ActionError {
  const { method, operation, service } = context;

  // if it's already an ActionError, enhance with service context
  if (originalError instanceof ActionError) {
    return new ActionError(
      originalError.type,
      originalError.code,
      originalError.message,
      {
        ...originalError.context,
        method,
        operation,
        service,
      },
      originalError.isRecoverable,
      originalError.statusCode,
      originalError.originalError,
    );
  }

  // service errors are typically external service errors
  if (originalError instanceof Error) {
    return createExternalServiceError(service, originalError.message, context, originalError);
  }

  return createInternalError(`Unexpected error in ${service}.${method}`, context, originalError as Error);
}

/**
 * creates a validation error with a consistent structure
 */
export function createValidationError(
  code: string,
  message: string,
  context?: Record<string, unknown>,
  originalError?: Error,
): ActionError {
  return new ActionError(ErrorType.VALIDATION, code, message, context, false, 400, originalError);
}

/**
 * ensures an error is an ActionError, converting if necessary
 */
export function ensureActionError(error: unknown, defaultContext?: Record<string, unknown>): ActionError {
  if (isActionError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return createInternalError(error.message, defaultContext, error);
  }

  return createInternalError('An unknown error occurred', defaultContext);
}

// ============================================================================
// helper utilities
// ============================================================================

/**
 * type guard to check if an error is an ActionError
 */
export function isActionError(error: unknown): error is ActionError {
  return error instanceof ActionError;
}

/**
 * wraps an async operation with consistent error handling
 */
export async function withErrorContext<T>(
  operation: () => Promise<T>,
  context: BaseErrorContext,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // import dynamically to avoid circular dependency
    const { handleActionError } = await import('./action-error-handler');
    return handleActionError(error, context);
  }
}
