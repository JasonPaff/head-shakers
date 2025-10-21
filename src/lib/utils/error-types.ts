import type { ActionError, DatabaseErrorType, ErrorType } from './errors';

/**
 * error categories for monitoring and alerting
 */
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  DATA_INTEGRITY = 'data_integrity',
  EXTERNAL_SERVICE = 'external_service',
  INFRASTRUCTURE = 'infrastructure',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SYSTEM = 'system',
  USER_INPUT = 'user_input',
}

/**
 * error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  LOW = 'low',
  MEDIUM = 'medium',
}

/**
 * union type of all specific error contexts
 */
export type AnyErrorContext =
  | AuthErrorContext
  | BusinessLogicErrorContext
  | CacheErrorContext
  | DatabaseErrorContext
  | FacadeErrorContext
  | FileErrorContext
  | MiddlewareErrorContext
  | QueryErrorContext
  | RateLimitErrorContext
  | ServiceErrorContext
  | ValidationErrorContext;

/**
 * error context for authentication/authorization operations
 */
export interface AuthErrorContext extends BaseErrorContext {
  /** action being attempted */
  action?: string;
  /** clerk user id if available */
  clerkUserId?: string;
  /** required permission level */
  requiredRole?: string;
  /** resource being accessed */
  resource?: string;
  /** user id if known */
  userId?: string;
  /** user's actual role */
  userRole?: string;
}

/**
 * base error context that all specific contexts extend
 */
export interface BaseErrorContext {
  /** allow additional properties */
  [key: string]: unknown;
  /** additional metadata about the error */
  metadata?: Record<string, unknown>;
  /** the operation being performed when the error occurred */
  operation: string;
  /** timestamp when the error occurred */
  timestamp?: Date;
}

/**
 * error context for business logic operations
 */
export interface BusinessLogicErrorContext extends BaseErrorContext {
  /** current state of the entity */
  currentState?: Record<string, unknown>;
  /** entity id */
  entityId?: string;
  /** business entity type */
  entityType?: string;
  /** expected state for the operation */
  expectedState?: Record<string, unknown>;
  /** business rule that was violated */
  rule: string;
}

/**
 * error context for caching operations
 */
export interface CacheErrorContext extends BaseErrorContext {
  /** cache operation type */
  cacheOperation: 'DELETE' | 'GET' | 'INVALIDATE' | 'SET';
  /** cache hit/miss status */
  cacheStatus?: 'ERROR' | 'HIT' | 'MISS';
  /** cache key */
  key: string;
  /** cache provider (redis, memory, etc.) */
  provider: string;
  /** TTL value */
  ttl?: number;
}

/**
 * error context for database operations
 */
export interface DatabaseErrorContext extends BaseErrorContext {
  /** connection pool information */
  connectionInfo?: {
    activeConnections?: number;
    idleConnections?: number;
  };
  /** database error type classification */
  dbErrorType?: DatabaseErrorType;
  /** whether the operation was in a transaction */
  isInTransaction?: boolean;
  /** SQL query being executed (sanitized) */
  query?: string;
  /** database table being accessed */
  table?: string;
}

/**
 * complete error information structure
 */
export interface EnhancedErrorInfo {
  /** the base ActionError */
  error: ActionError;
  /** additional metadata */
  metadata: ErrorMetadata;
  /** performance impact information */
  performance?: {
    cpuUsage?: number;
    memoryUsage?: number;
    operationTimeMs: number;
  };
  /** recovery information */
  recovery?: ErrorRecoveryInfo;
  /** related errors in the same operation */
  relatedErrors?: Array<ActionError>;
}

/**
 * utility type for extracting error context based on error type
 */
export type ErrorContextForType<T extends ErrorType> =
  T extends ErrorType.DATABASE ? DatabaseErrorContext
  : T extends ErrorType.EXTERNAL_SERVICE ? ServiceErrorContext
  : T extends ErrorType.VALIDATION ? ValidationErrorContext
  : T extends ErrorType.AUTHORIZATION ? AuthErrorContext
  : T extends ErrorType.BUSINESS_RULE ? BusinessLogicErrorContext
  : T extends ErrorType.RATE_LIMIT ? RateLimitErrorContext
  : BaseErrorContext;

/**
 * helper type for error handler functions
 */
export type ErrorHandler<TContext extends BaseErrorContext = BaseErrorContext> = (
  error: unknown,
  context: TContext,
) => ActionError;

/**
 * extended error information for monitoring and analytics
 */
export interface ErrorMetadata {
  /** error category for classification */
  category: ErrorCategory;
  /** error fingerprint for deduplication */
  fingerprint?: string;
  /** whether error should trigger alerts */
  isAlertable: boolean;
  /** whether error affects user experience */
  isUserFacing: boolean;
  /** related request ID */
  requestId?: string;
  /** session ID if available */
  sessionId?: string;
  /** error severity level */
  severity: ErrorSeverity;
  /** tags for filtering and searching */
  tags?: Array<string>;
}

// ============================================================================
// Error classification and detection types
// ============================================================================

/**
 * error recovery information
 */
export interface ErrorRecoveryInfo {
  /** recovery strategy used */
  recoveryStrategy?: string;
  /** total time spent on recovery */
  recoveryTimeMs?: number;
  /** number of retry attempts */
  retryAttempts?: number;
  /** whether automatic recovery was attempted */
  wasAutoRecoveryAttempted: boolean;
  /** whether recovery was successful */
  wasRecoverySuccessful?: boolean;
}

/**
 * error transformation function type
 */
export type ErrorTransformer<TInput = unknown, TOutput = ActionError> = (
  input: TInput,
  context?: BaseErrorContext,
) => TOutput;

/**
 * error context for facade layer operations
 */
export interface FacadeErrorContext extends BaseErrorContext {
  /** input data (sanitized for logging) */
  data?: Record<string, unknown>;
  /** name of the facade class */
  facade: string;
  /** method name that failed */
  method: string;
  /** user ID if available */
  userId?: string;
  /** whether the operation involved caching */
  wasCached?: boolean;
}

/**
 * error context for file operations
 */
export interface FileErrorContext extends BaseErrorContext {
  /** file name or path */
  fileName?: string;
  /** file operation type */
  fileOperation: 'DELETE' | 'MOVE' | 'TRANSFORM' | 'UPLOAD';
  /** file size in bytes */
  fileSize?: number;
  /** file type */
  fileType?: string;
  /** storage provider */
  storageProvider?: string;
}

/**
 * error context for middleware operations
 */
export interface MiddlewareErrorContext extends BaseErrorContext {
  /** action name being processed */
  actionName?: string;
  /** ip address */
  ipAddress?: string;
  /** name of the middleware */
  middleware: string;
  /** request path */
  path?: string;
  /** user agent */
  userAgent?: string;
}

// ============================================================================
// type guards and utilities
// ============================================================================

/**
 * error context for query layer operations
 */
export interface QueryErrorContext extends BaseErrorContext {
  /** query context type */
  contextType?: 'admin' | 'public' | 'user';
  /** query filters applied (sanitized) */
  filters?: Record<string, unknown>;
  /** query method that failed */
  method: string;
  /** pagination info if applicable */
  pagination?: {
    limit?: number;
    offset?: number;
  };
  /** name of the query class */
  query: string;
  /** database table being queried */
  table?: string;
}

/**
 * error context for rate limiting operations
 */
export interface RateLimitErrorContext extends BaseErrorContext {
  /** current request count */
  currentCount: number;
  /** rate limit key */
  key: string;
  /** maximum allowed requests */
  limit: number;
  /** reset time */
  resetTime?: Date;
  /** time window in seconds */
  windowSeconds: number;
}

/**
 * error context for service layer operations (external services)
 */
export interface ServiceErrorContext extends BaseErrorContext {
  /** circuit breaker state */
  circuitBreakerState?: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  /* API endpoint called */
  endpoint?: string;
  /** HTTP status code if applicable */
  httpStatus?: number;
  /** whether the error is retryable */
  isRetryable?: boolean;
  /** service method that failed */
  method: string;
  /** name of the service */
  service: string;
  /** request timeout value */
  timeout?: number;
}

/**
 * error context for validation operations
 */
export interface ValidationErrorContext extends BaseErrorContext {
  /** expected format or range */
  expected?: string;
  /** field that failed validation */
  field?: string;
  /** validation rule that failed */
  rule?: string;
  /** schema name being validated */
  schema?: string;
  /** input value that failed (sanitized) */
  value?: unknown;
}

/**
 * type guard to check if a context is a database error context
 */
export function isDatabaseErrorContext(context: unknown): context is DatabaseErrorContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'table' in context &&
    typeof (context as DatabaseErrorContext).table === 'string'
  );
}

/**
 * type guard to check if a context is a facade error context
 */
export function isFacadeErrorContext(context: unknown): context is FacadeErrorContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'facade' in context &&
    typeof (context as FacadeErrorContext).facade === 'string'
  );
}

/**
 * type guard to check if a context is a service error context
 */
export function isServiceErrorContext(context: unknown): context is ServiceErrorContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'service' in context &&
    typeof (context as ServiceErrorContext).service === 'string'
  );
}

/**
 * type guard to check if a context is a validation error context
 */
export function isValidationErrorContext(context: unknown): context is ValidationErrorContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'schema' in context &&
    typeof (context as ValidationErrorContext).schema === 'string'
  );
}
