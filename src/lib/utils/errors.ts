/**
 * Database-specific error subtypes
 */
export enum DatabaseErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  CONSTRAINT_VIOLATION = 'CONSTRAINT_VIOLATION',
  DEADLOCK = 'DEADLOCK',
  FOREIGN_KEY_CONSTRAINT = 'FOREIGN_KEY_CONSTRAINT',
  NOT_NULL_CONSTRAINT = 'NOT_NULL_CONSTRAINT',
  TIMEOUT = 'TIMEOUT',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  UNIQUE_CONSTRAINT = 'UNIQUE_CONSTRAINT',
}

/**
 * Error classification system for consistent error handling across server actions
 */
export enum ErrorType {
  AUTHORIZATION = 'AUTHORIZATION',
  BUSINESS_RULE = 'BUSINESS_RULE',
  DATABASE = 'DATABASE',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  INTERNAL = 'INTERNAL',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT = 'RATE_LIMIT',
  VALIDATION = 'VALIDATION',
}

/**
 * Enhanced error class with structured error information
 */
export class ActionError extends Error {
  constructor(
    public readonly type: ErrorType,
    public readonly code: string,
    message?: string,
    public readonly context?: Record<string, unknown>,
    public readonly isRecoverable: boolean = false,
    public readonly statusCode: number = 400,
    public readonly originalError?: Error,
  ) {
    super(message || code);
    this.name = 'ActionError';

    // maintain stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionError);
    }
  }

  toJSON() {
    return {
      code: this.code,
      context: this.context,
      message: this.message,
      recoverable: this.isRecoverable,
      statusCode: this.statusCode,
      type: this.type,
    };
  }
}

/**
 * Error classification utility
 */
export function classifyDatabaseError(error: unknown): DatabaseErrorType | null {
  if (!isDatabaseError(error)) return null;

  if (isUniqueConstraintError(error)) return DatabaseErrorType.UNIQUE_CONSTRAINT;
  if (isForeignKeyConstraintError(error)) return DatabaseErrorType.FOREIGN_KEY_CONSTRAINT;
  if (isNotNullConstraintError(error)) return DatabaseErrorType.NOT_NULL_CONSTRAINT;
  if (isConnectionError(error)) return DatabaseErrorType.CONNECTION_FAILED;
  if (isTimeoutError(error)) return DatabaseErrorType.TIMEOUT;
  if (isDeadlockError(error)) return DatabaseErrorType.DEADLOCK;

  // generic constraint violation
  const code = (error as unknown as { code: string }).code;
  if (code?.startsWith('23')) return DatabaseErrorType.CONSTRAINT_VIOLATION;

  return DatabaseErrorType.TRANSACTION_FAILED;
}

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code?.startsWith('08') || // postgreSQL connection exception
    message.includes('connection refused') ||
    message.includes('connection timeout') ||
    message.includes('connection closed') ||
    message.includes('connection lost')
  );
}

/**
 * Database error detection utilities
 */
export function isDatabaseError(error: unknown): error is Error {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    // postgreSQL error codes
    (typeof code === 'string' &&
      (code.startsWith('23') || // integrity constraint violation
        code.startsWith('08') || // connection exception
        code.startsWith('40') || // transaction rollback
        code.startsWith('53') || // insufficient resources
        code.startsWith('57'))) || // operator intervention
    // common error message patterns
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('constraint') ||
    message.includes('duplicate') ||
    message.includes('deadlock') ||
    message.includes('foreign key')
  );
}

export function isDeadlockError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code === '40P01' || // postgreSQL deadlock detected
    message.includes('deadlock')
  );
}

export function isForeignKeyConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code === '23503' || // postgreSQL foreign key violation
    message.includes('foreign key') ||
    message.includes('violates foreign key constraint')
  );
}

export function isNotNullConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code === '23502' || // postgreSQL not null violation
    message.includes('not null') ||
    message.includes('null value in column')
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // database errors that might be transient
  if (isConnectionError(error) || isTimeoutError(error) || isDeadlockError(error)) {
    return true;
  }

  // external service errors (5xx status codes)
  if (
    (error as unknown as { status: number }).status >= 500 &&
    (error as unknown as { status: number }).status < 600
  ) {
    return true;
  }

  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code === '57014' || // postgreSQL query timeout
    message.includes('timeout') ||
    message.includes('timed out')
  );
}

export function isUniqueConstraintError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = (error as unknown as { code: string }).code;

  return (
    code === '23505' || // postgreSQL unique violation
    message.includes('duplicate') ||
    message.includes('unique constraint') ||
    message.includes('already exists')
  );
}
