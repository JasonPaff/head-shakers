import * as Sentry from '@sentry/nextjs';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

import { ERROR_MESSAGES } from '@/lib/constants';
import {
  ActionError,
  classifyDatabaseError,
  DatabaseErrorType,
  ErrorType,
  isDatabaseError,
  isRetryableError,
} from '@/lib/utils/errors';

/**
 * Context information for error handling
 */
export interface ErrorContext {
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  operation: string;
  userId?: string;
}

/**
 * Comprehensive error handler for server actions
 * Provides consistent error classification, logging, and response formatting
 */
export function handleActionError(error: unknown, context: ErrorContext): never {
  const { input, metadata, operation, userId } = context;

  // enhanced Sentry context
  Sentry.setContext('error_handling', {
    hasInput: !!input,
    inputSize: input ? JSON.stringify(input).length : 0,
    metadata,
    operation,
    timestamp: new Date().toISOString(),
    userId,
  });

  // handle Zod validation errors
  if (error instanceof ZodError) {
    const validationError = fromZodError(error);

    Sentry.addBreadcrumb({
      category: 'validation',
      data: { issues: error.issues },
      level: 'warning',
      message: `Validation failed for operation: ${operation}`,
    });

    throw new ActionError(
      ErrorType.VALIDATION,
      'VALIDATION_FAILED',
      validationError.message,
      {
        input: input ? Object.keys(input) : undefined, // Don't log actual input values
        issues: error.issues,
        operation,
      },
      false,
      400,
      error,
    );
  }

  // handle known ActionError instances
  if (error instanceof ActionError) {
    // add operation context if not present
    if (!error.context?.operation) {
      const enhancedError = new ActionError(
        error.type,
        error.code,
        error.message,
        { ...error.context, operation },
        error.isRecoverable,
        error.statusCode,
        error.originalError,
      );

      Sentry.captureException(enhancedError, {
        level: error.isRecoverable ? 'warning' : 'error',
        tags: {
          errorCode: error.code,
          errorType: error.type,
          operation,
          recoverable: error.isRecoverable,
        },
      });

      throw enhancedError;
    }

    // log and re-throw existing ActionError
    Sentry.captureException(error, {
      level: error.isRecoverable ? 'warning' : 'error',
      tags: {
        errorCode: error.code,
        errorType: error.type,
        operation,
        recoverable: error.isRecoverable,
      },
    });

    throw error;
  }

  // handle database errors
  if (isDatabaseError(error)) {
    const dbErrorType = classifyDatabaseError(error);
    const isRecoverable = isRetryableError(error);

    let actionError: ActionError;

    switch (dbErrorType) {
      case DatabaseErrorType.CONNECTION_FAILED:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'CONNECTION_FAILED',
          ERROR_MESSAGES.DATABASE.CONNECTION_FAILED,
          { dbErrorType, operation },
          true,
          503,
          error,
        );
        break;

      case DatabaseErrorType.DEADLOCK:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'DEADLOCK_DETECTED',
          'Database deadlock detected',
          { dbErrorType, operation },
          true,
          409,
          error,
        );
        break;

      case DatabaseErrorType.FOREIGN_KEY_CONSTRAINT:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'FOREIGN_KEY_VIOLATION',
          ERROR_MESSAGES.DATABASE.CONSTRAINT_VIOLATION,
          { dbErrorType, operation },
          false,
          400,
          error,
        );
        break;

      case DatabaseErrorType.NOT_NULL_CONSTRAINT:
        actionError = new ActionError(
          ErrorType.VALIDATION,
          'REQUIRED_FIELD_MISSING',
          'Required field is missing',
          { dbErrorType, operation },
          false,
          400,
          error,
        );
        break;

      case DatabaseErrorType.TIMEOUT:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'QUERY_TIMEOUT',
          'Database operation timed out',
          { dbErrorType, operation },
          true,
          504,
          error,
        );
        break;

      case DatabaseErrorType.UNIQUE_CONSTRAINT:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'DUPLICATE_ENTRY',
          ERROR_MESSAGES.DATABASE.DUPLICATE_ENTRY,
          { dbErrorType, operation },
          false,
          409,
          error,
        );
        break;

      default:
        actionError = new ActionError(
          ErrorType.DATABASE,
          'DATABASE_ERROR',
          ERROR_MESSAGES.DATABASE.QUERY_FAILED,
          { dbErrorType, operation },
          isRecoverable,
          500,
          error,
        );
    }

    Sentry.captureException(actionError, {
      extra: {
        originalError: error.message,
        sqlCode: (error as unknown as { code: string }).code,
      },
      level: isRecoverable ? 'warning' : 'error',
      tags: {
        dbErrorType,
        errorType: 'DATABASE',
        operation,
        recoverable: isRecoverable,
      },
    });

    throw actionError;
  }

  // handle rate limit errors (from existing AppError or external sources)
  if (
    error instanceof Error &&
    (error.message.includes('Rate limit') ||
      (error as unknown as { code: string }).code === 'RATE_LIMIT_EXCEEDED')
  ) {
    const rateLimitError = new ActionError(
      ErrorType.RATE_LIMIT,
      'RATE_LIMIT_EXCEEDED',
      ERROR_MESSAGES.RATE_LIMIT.EXCEEDED,
      { operation },
      false,
      429,
      error,
    );

    Sentry.captureException(rateLimitError, {
      level: 'warning',
      tags: {
        errorType: 'RATE_LIMIT',
        operation,
      },
    });

    throw rateLimitError;
  }

  // handle external service errors
  if (
    error instanceof Error &&
    (error.message.includes('fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('service') ||
      (error as unknown as { status: string }).status)
  ) {
    const status = (error as unknown as { status: string }).status;
    const isRetryable = isRetryableError(error);

    const serviceError = new ActionError(
      ErrorType.EXTERNAL_SERVICE,
      'EXTERNAL_SERVICE_ERROR',
      ERROR_MESSAGES.EXTERNAL.SERVICE_UNAVAILABLE,
      {
        httpStatus: status,
        operation,
        service: extractServiceName(error.message),
      },
      isRetryable,
      Number(status) >= 400 && Number(status) < 600 ? Number(status) : 503,
      error,
    );

    Sentry.captureException(serviceError, {
      level: isRetryable ? 'warning' : 'error',
      tags: {
        errorType: 'EXTERNAL_SERVICE',
        httpStatus: status,
        operation,
        recoverable: isRetryable,
      },
    });

    throw serviceError;
  }

  // handle unknown errors - be very careful about information disclosure
  console.error('Unexpected error in server action:', {
    message: error instanceof Error ? error.message : 'Unknown error',
    operation,
    stack: error instanceof Error ? error.stack : undefined,
  });

  const unexpectedError = new ActionError(
    ErrorType.INTERNAL,
    'INTERNAL_SERVER_ERROR',
    ERROR_MESSAGES.GENERIC.INTERNAL_SERVER_ERROR,
    { operation },
    false,
    500,
    error instanceof Error ? error : new Error('Unknown error'),
  );

  Sentry.captureException(unexpectedError, {
    extra: {
      originalError: error,
      originalErrorType: typeof error,
    },
    level: 'error',
    tags: {
      errorType: 'INTERNAL',
      operation,
      unexpected: true,
    },
  });

  throw unexpectedError;
}

/**
 * Extract the service name from an error message for better categorization
 */
function extractServiceName(message: string): string | undefined {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('cloudinary')) return 'cloudinary';
  if (lowerMessage.includes('resend')) return 'resend';
  if (lowerMessage.includes('ably')) return 'ably';
  if (lowerMessage.includes('redis') || lowerMessage.includes('upstash')) return 'redis';
  if (lowerMessage.includes('clerk')) return 'clerk';

  return undefined;
}
