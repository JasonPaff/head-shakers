import { isRetryableError } from './errors';

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /** Initial backoff delay in milliseconds (default: 100) */
  backoffMs?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Custom delay function */
  calculateDelay?: (attempt: number, baseDelay: number) => number;
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Maximum backoff delay in milliseconds (default: 5000) */
  maxBackoffMs?: number;
  /** Callback function called before each retry attempt */
  onRetry?: (error: unknown, attempt: number, delay: number) => Promise<void> | void;
  /** Operation name for logging and debugging */
  operationName?: string;
  /** Custom function to determine if an error should be retried */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Whether to add jitter to prevent thundering herd (default: true) */
  shouldUseJitter?: boolean;
}

/**
 * Result of a retry operation including metadata
 */
export interface RetryResult<T> {
  /** Details about each attempt */
  attemptDetails: Array<{
    attempt: number;
    delayMs?: number;
    durationMs: number;
    error?: unknown;
    wasSuccessful: boolean;
  }>;
  /** Number of attempts made (1 means no retries) */
  attempts: number;
  /** The successful result */
  result: T;
  /** Total time spent including delays */
  totalTimeMs: number;
  /** Whether any retries were performed */
  wasRetried: boolean;
}

/**
 * Default retry configuration type
 */
type DefaultRetryConfig = Required<
  Omit<RetryOptions, 'calculateDelay' | 'onRetry' | 'operationName' | 'shouldRetry'>
>;

/**
 * Default retry configuration
 */
const DEFAULT_RETRY_OPTIONS: DefaultRetryConfig = {
  backoffMs: 100,
  backoffMultiplier: 2,
  maxAttempts: 3,
  maxBackoffMs: 5000,
  shouldUseJitter: true,
};

/**
 * Type guard to check if a result came from a retry operation
 */
export function isRetryResult<T>(value: RetryResult<T> | T): value is RetryResult<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'result' in value &&
    'attempts' in value &&
    'wasRetried' in value &&
    'attemptDetails' in value
  );
}

/**
 * Utility to extract just the result from a RetryResult
 * Useful when you want retry behavior but don't need the metadata
 *
 * @param retryPromise - Promise that returns RetryResult
 * @returns Promise with just the result value
 */
export async function unwrapRetryResult<T>(retryPromise: Promise<RetryResult<T>>): Promise<T> {
  const result = await retryPromise;
  return result.result;
}

/**
 * Retry wrapper specifically for database operations
 * Uses database-specific retry logic and error detection
 *
 * @param operation - Database operation to execute
 * @param options - Retry options with database-specific defaults
 */
export async function withDatabaseRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const databaseOptions: RetryOptions = {
    backoffMs: 200,
    maxAttempts: 3,
    maxBackoffMs: 2000,
    operationName: 'database-operation',
    shouldRetry: (error) => {
      // Only retry specific database errors
      if (!(error instanceof Error)) return false;

      const message = error.message.toLowerCase();
      const code = (error as { code?: string }).code;

      // Retry on connection issues, deadlocks, and timeouts
      return (
        isRetryableError(error) ||
        code === '40P01' || // PostgreSQL deadlock
        code === '57014' || // PostgreSQL timeout
        message.includes('connection') ||
        message.includes('deadlock') ||
        message.includes('timeout')
      );
    },
    ...options,
  };

  return withRetry(operation, databaseOptions);
}

/**
 * Executes an async operation with exponential backoff retry logic
 *
 * @param operation - The async operation to execute
 * @param options - Retry configuration options
 * @returns Promise with the operation result and retry metadata
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => databaseQuery(),
 *   {
 *     maxAttempts: 3,
 *     operationName: 'getUserById',
 *     onRetry: (error, attempt) => console.log(`Retry ${attempt}: ${error}`)
 *   }
 * );
 *
 * console.log(`Operation completed in ${result.attempts} attempts`);
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  const startTime = Date.now();
  const attemptDetails: RetryResult<T>['attemptDetails'] = [];
  let lastError: unknown;

  // Validate configuration
  if (config.maxAttempts < 1) {
    throw new Error('maxAttempts must be at least 1');
  }

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    const attemptStart = Date.now();

    try {
      const result = await operation();
      const attemptDuration = Date.now() - attemptStart;

      attemptDetails.push({
        attempt,
        durationMs: attemptDuration,
        wasSuccessful: true,
      });

      return {
        attemptDetails,
        attempts: attempt,
        result,
        totalTimeMs: Date.now() - startTime,
        wasRetried: attempt > 1,
      };
    } catch (error) {
      const attemptDuration = Date.now() - attemptStart;
      lastError = error;

      // Check if we should retry this error
      const shouldRetryThisError =
        config.shouldRetry ? config.shouldRetry(error, attempt) : isRetryableError(error);

      // If this is the last attempt or we shouldn't retry, fail
      if (attempt === config.maxAttempts || !shouldRetryThisError) {
        attemptDetails.push({
          attempt,
          durationMs: attemptDuration,
          error,
          wasSuccessful: false,
        });

        throw error;
      }

      // Calculate delay for next attempt
      const delay =
        config.calculateDelay ?
          config.calculateDelay(attempt, config.backoffMs)
        : calculateExponentialBackoff(attempt, config);

      attemptDetails.push({
        attempt,
        delayMs: delay,
        durationMs: attemptDuration,
        error,
        wasSuccessful: false,
      });

      // Call retry callback if provided
      if (config.onRetry) {
        try {
          await config.onRetry(error, attempt, delay);
        } catch (callbackError) {
          console.warn('Retry callback error:', callbackError);
        }
      }

      // Log retry attempt
      if (config.operationName) {
        console.log(
          `Retrying ${config.operationName} (attempt ${attempt + 1}/${config.maxAttempts}) ` +
            `after ${delay}ms delay. Error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Creates a retry decorator for functions
 * Useful for automatically adding retry behavior to existing functions
 *
 * @param options - Retry configuration
 * @returns A decorator function
 *
 * @example
 * ```typescript
 * const retryableDbQuery = withRetryDecorator({ maxAttempts: 3 })(
 *   async (id: string) => await db.user.findById(id)
 * );
 *
 * const result = await retryableDbQuery('user-123');
 * ```
 */
export function withRetryDecorator<TArgs extends Array<unknown>, TReturn>(options: RetryOptions = {}) {
  return function decorator(
    fn: (...args: TArgs) => Promise<TReturn>,
  ): (...args: TArgs) => Promise<RetryResult<TReturn>> {
    return async (...args: TArgs) => {
      return withRetry(() => fn(...args), options);
    };
  };
}

/**
 * Retry wrapper specifically for external service calls
 * Uses service-specific retry logic with more aggressive backoff
 *
 * @param operation - External service operation to execute
 * @param serviceName - Name of the external service for logging
 * @param options - Retry options with service-specific defaults
 */
export async function withServiceRetry<T>(
  operation: () => Promise<T>,
  serviceName: string,
  options: RetryOptions = {},
): Promise<RetryResult<T>> {
  const serviceOptions: RetryOptions = {
    backoffMs: 1000,
    maxAttempts: 3,
    maxBackoffMs: 10000,
    onRetry: (error, attempt) => {
      // Log external service retries more verbosely
      console.warn(
        `${serviceName} service retry ${attempt}: ${error instanceof Error ? error.message : String(error)}`,
      );
    },
    operationName: `${serviceName}-service`,
    shouldRetry: (error) => {
      // Only retry specific service errors
      if (!(error instanceof Error)) return false;

      const httpStatus = (error as { status?: number }).status;
      const message = error.message.toLowerCase();

      // Don't retry client errors (4xx) except rate limits
      if (httpStatus && httpStatus >= 400 && httpStatus < 500 && httpStatus !== 429) {
        return false;
      }

      // Retry server errors (5xx), timeouts, and network issues
      return (
        (httpStatus && httpStatus >= 500) ||
        httpStatus === 429 ||
        message.includes('timeout') ||
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('fetch') ||
        isRetryableError(error)
      );
    },
    ...options,
  };

  return withRetry(operation, serviceOptions);
}

/**
 * Calculates exponential backoff delay with optional jitter
 */
function calculateExponentialBackoff(attempt: number, config: DefaultRetryConfig): number {
  // Calculate base exponential delay
  let delay = config.backoffMs * Math.pow(config.backoffMultiplier, attempt - 1);

  // Apply maximum delay cap
  delay = Math.min(delay, config.maxBackoffMs);

  // Add jitter to prevent thundering herd
  if (config.shouldUseJitter) {
    // Use full jitter: random delay between 0 and calculated delay
    delay = Math.random() * delay;
  }

  return Math.floor(delay);
}

/**
 * Sleep utility function
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
