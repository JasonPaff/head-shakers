import type { ActionError, DatabaseErrorType, ErrorType } from './errors';

/**
 * Type definitions for error contexts across different layers of the application.
 * These types ensure consistent error information capture and processing.
 */

/**
 * Error categories for monitoring and alerting
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
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  LOW = 'low',
  MEDIUM = 'medium',
}

/**
 * Union type of all specific error contexts
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
 * Error context for authentication/authorization operations
 */
export interface AuthErrorContext extends BaseErrorContext {
  /** Action being attempted */
  action?: string;
  /** Clerk user ID if available */
  clerkUserId?: string;
  /** Required permission level */
  requiredRole?: string;
  /** Resource being accessed */
  resource?: string;
  /** User ID if known */
  userId?: string;
  /** User's actual role */
  userRole?: string;
}

/**
 * Base error context that all specific contexts extend
 */
export interface BaseErrorContext {
  /** Allow additional properties */
  [key: string]: unknown;
  /** Additional metadata about the error */
  metadata?: Record<string, unknown>;
  /** The operation being performed when the error occurred */
  operation: string;
  /** Timestamp when the error occurred */
  timestamp?: Date;
}

/**
 * Error context for business logic operations
 */
export interface BusinessLogicErrorContext extends BaseErrorContext {
  /** Current state of the entity */
  currentState?: Record<string, unknown>;
  /** Entity ID */
  entityId?: string;
  /** Business entity type */
  entityType?: string;
  /** Expected state for the operation */
  expectedState?: Record<string, unknown>;
  /** Business rule that was violated */
  rule: string;
}

/**
 * Error context for caching operations
 */
export interface CacheErrorContext extends BaseErrorContext {
  /** Cache operation type */
  cacheOperation: 'DELETE' | 'GET' | 'INVALIDATE' | 'SET';
  /** Cache hit/miss status */
  cacheStatus?: 'ERROR' | 'HIT' | 'MISS';
  /** Cache key */
  key: string;
  /** Cache provider (redis, memory, etc.) */
  provider: string;
  /** TTL value */
  ttl?: number;
}

/**
 * Error context for database operations
 */
export interface DatabaseErrorContext extends BaseErrorContext {
  /** Connection pool information */
  connectionInfo?: {
    activeConnections?: number;
    idleConnections?: number;
  };
  /** Database error type classification */
  dbErrorType?: DatabaseErrorType;
  /** Whether the operation was in a transaction */
  isInTransaction?: boolean;
  /** SQL query being executed (sanitized) */
  query?: string;
  /** Database table being accessed */
  table?: string;
}

/**
 * Complete error information structure
 */
export interface EnhancedErrorInfo {
  /** The base ActionError */
  error: ActionError;
  /** Additional metadata */
  metadata: ErrorMetadata;
  /** Performance impact information */
  performance?: {
    cpuUsage?: number;
    memoryUsage?: number;
    operationTimeMs: number;
  };
  /** Recovery information */
  recovery?: ErrorRecoveryInfo;
  /** Related errors in the same operation */
  relatedErrors?: ActionError[];
}

/**
 * Utility type for extracting error context based on error type
 */
export type ErrorContextForType<T extends ErrorType> = T extends ErrorType.DATABASE
  ? DatabaseErrorContext
  : T extends ErrorType.EXTERNAL_SERVICE
  ? ServiceErrorContext
  : T extends ErrorType.VALIDATION
  ? ValidationErrorContext
  : T extends ErrorType.AUTHORIZATION
  ? AuthErrorContext
  : T extends ErrorType.BUSINESS_RULE
  ? BusinessLogicErrorContext
  : T extends ErrorType.RATE_LIMIT
  ? RateLimitErrorContext
  : BaseErrorContext;

/**
 * Helper type for error handler functions
 */
export type ErrorHandler<TContext extends BaseErrorContext = BaseErrorContext> = (
  error: unknown,
  context: TContext,
) => ActionError;

/**
 * Extended error information for monitoring and analytics
 */
export interface ErrorMetadata {
  /** Error category for classification */
  category: ErrorCategory;
  /** Error fingerprint for deduplication */
  fingerprint?: string;
  /** Whether error should trigger alerts */
  isAlertable: boolean;
  /** Whether error affects user experience */
  isUserFacing: boolean;
  /** Related request ID */
  requestId?: string;
  /** Session ID if available */
  sessionId?: string;
  /** Error severity level */
  severity: ErrorSeverity;
  /** Tags for filtering and searching */
  tags?: string[];
}

// ============================================================================
// Error classification and detection types
// ============================================================================

/**
 * Error recovery information
 */
export interface ErrorRecoveryInfo {
  /** Recovery strategy used */
  recoveryStrategy?: string;
  /** Total time spent on recovery */
  recoveryTimeMs?: number;
  /** Number of retry attempts */
  retryAttempts?: number;
  /** Whether automatic recovery was attempted */
  wasAutoRecoveryAttempted: boolean;
  /** Whether recovery was successful */
  wasRecoverySuccessful?: boolean;
}

/**
 * Error transformation function type
 */
export type ErrorTransformer<TInput = unknown, TOutput = ActionError> = (
  input: TInput,
  context?: BaseErrorContext,
) => TOutput;

/**
 * Error context for facade layer operations
 */
export interface FacadeErrorContext extends BaseErrorContext {
  /** Input data (sanitized for logging) */
  data?: Record<string, unknown>;
  /** Name of the facade class */
  facade: string;
  /** Method name that failed */
  method: string;
  /** User ID if available */
  userId?: string;
  /** Whether operation involved caching */
  wasCached?: boolean;
}

/**
 * Error context for file operations
 */
export interface FileErrorContext extends BaseErrorContext {
  /** File name or path */
  fileName?: string;
  /** File operation type */
  fileOperation: 'DELETE' | 'MOVE' | 'TRANSFORM' | 'UPLOAD';
  /** File size in bytes */
  fileSize?: number;
  /** File type */
  fileType?: string;
  /** Storage provider */
  storageProvider?: string;
}

/**
 * Error context for middleware operations
 */
export interface MiddlewareErrorContext extends BaseErrorContext {
  /** Action name being processed */
  actionName?: string;
  /** IP address */
  ipAddress?: string;
  /** Name of the middleware */
  middleware: string;
  /** Request path */
  path?: string;
  /** User agent */
  userAgent?: string;
}

// ============================================================================
// Type guards and utilities
// ============================================================================

/**
 * Error context for query layer operations
 */
export interface QueryErrorContext extends BaseErrorContext {
  /** Query context type */
  contextType?: 'admin' | 'public' | 'user';
  /** Query filters applied (sanitized) */
  filters?: Record<string, unknown>;
  /** Query method that failed */
  method: string;
  /** Pagination info if applicable */
  pagination?: {
    limit?: number;
    offset?: number;
  };
  /** Name of the query class */
  query: string;
  /** Database table being queried */
  table?: string;
}

/**
 * Error context for rate limiting operations
 */
export interface RateLimitErrorContext extends BaseErrorContext {
  /** Current request count */
  currentCount: number;
  /** Rate limit key */
  key: string;
  /** Maximum allowed requests */
  limit: number;
  /** Reset time */
  resetTime?: Date;
  /** Time window in seconds */
  windowSeconds: number;
}

/**
 * Error context for service layer operations (external services)
 */
export interface ServiceErrorContext extends BaseErrorContext {
  /** Circuit breaker state */
  circuitBreakerState?: 'CLOSED' | 'HALF_OPEN' | 'OPEN';
  /** API endpoint called */
  endpoint?: string;
  /** HTTP status code if applicable */
  httpStatus?: number;
  /** Whether the error is retryable */
  isRetryable?: boolean;
  /** Service method that failed */
  method: string;
  /** Name of the service */
  service: string;
  /** Request timeout value */
  timeout?: number;
}

/**
 * Error context for validation operations
 */
export interface ValidationErrorContext extends BaseErrorContext {
  /** Expected format or range */
  expected?: string;
  /** Field that failed validation */
  field?: string;
  /** Validation rule that failed */
  rule?: string;
  /** Schema name being validated */
  schema?: string;
  /** Input value that failed (sanitized) */
  value?: unknown;
}

/**
 * Type guard to check if a context is a database error context
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
 * Type guard to check if a context is a facade error context
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
 * Type guard to check if a context is a service error context
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
 * Type guard to check if a context is a validation error context
 */
export function isValidationErrorContext(context: unknown): context is ValidationErrorContext {
  return (
    typeof context === 'object' &&
    context !== null &&
    'schema' in context &&
    typeof (context as ValidationErrorContext).schema === 'string'
  );
}