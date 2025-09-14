import { isRetryableError } from './errors';

/**
 * Circuit breaker states
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation, requests pass through
  HALF_OPEN = 'HALF_OPEN', // Testing if service has recovered
  OPEN = 'OPEN', // Circuit is open, requests fail fast
}

/**
 * Circuit breaker metrics and state information
 */
export interface CircuitBreakerMetrics {
  /** Number of failed requests */
  failedRequests: number;
  /** Failure rate as percentage (0-100) */
  failureRate: number;
  /** Timestamp when circuit was last opened */
  lastFailureTime?: Date;
  /** Timestamp when circuit state last changed */
  lastStateChangeTime: Date;
  /** Time until next retry attempt (only when OPEN) */
  nextRetryTime?: Date;
  /** Number of requests rejected due to open circuit */
  rejectedRequests: number;
  /** Current state of the circuit */
  state: CircuitState;
  /** Number of successful requests */
  successfulRequests: number;
  /** Total number of requests */
  totalRequests: number;
}

/**
 * Configuration options for circuit breaker
 */
export interface CircuitBreakerOptions {
  /** Maximum number of failures before opening circuit (default: 5) */
  failureThreshold?: number;
  /** Custom function to determine if an error should count as failure */
  isFailure?: (error: unknown) => boolean;
  /** Name of the circuit for logging and monitoring */
  name?: string;
  /** Function called when circuit state changes */
  onStateChange?: (newState: CircuitState, oldState: CircuitState) => void;
  /** Time in milliseconds to wait before attempting to close circuit (default: 60000) */
  resetTimeoutMs?: number;
  /** Number of successful requests needed to close circuit from half-open (default: 3) */
  successThreshold?: number;
  /** Timeout for operations in milliseconds (default: 30000) */
  timeoutMs?: number;
}

/**
 * Result of executing an operation through circuit breaker
 */
export interface CircuitBreakerResult<T> {
  /** Execution time in milliseconds */
  executionTimeMs: number;
  /** Circuit metrics at time of execution */
  metrics: CircuitBreakerMetrics;
  /** The result value */
  result: T;
  /** Whether the circuit breaker was used */
  wasExecuted: boolean;
  /** Whether the request was rejected due to circuit state */
  wasRejected: boolean;
}

/**
 * Health check result for circuit breaker
 */
export interface CircuitHealthStatus {
  /** Failure rate percentage */
  failureRate: number;
  /** Health status */
  isHealthy: boolean;
  /** Human readable status message */
  message: string;
  /** Circuit breaker name */
  name: string;
  /** Time until next retry (if OPEN) */
  nextRetryInMs?: number;
  /** Current state */
  state: CircuitState;
  /** Total requests processed */
  totalRequests: number;
}

/**
 * Circuit breaker implementation with timeout support
 *
 * States:
 * - CLOSED: Normal operation, all requests pass through
 * - OPEN: Circuit is open, requests fail fast without calling service
 * - HALF_OPEN: Testing mode, allowing limited requests to test recovery
 *
 * @example
 * ```typescript
 * const breaker = new CircuitBreaker('external-service', {
 *   failureThreshold: 5,
 *   resetTimeoutMs: 60000,
 *   onStateChange: (newState) => console.log(`Circuit ${newState}`)
 * });
 *
 * const result = await breaker.execute(() => callExternalService());
 * ```
 */
export class CircuitBreaker {
  private failedRequests = 0;
  private failureCount = 0;
  private lastFailureTime?: Date;
  private lastStateChangeTime = new Date();
  private nextRetryTime?: Date;
  private readonly options: Required<CircuitBreakerOptions>;
  private rejectedRequests = 0;
  private state: CircuitState = CircuitState.CLOSED;
  private successCount = 0;
  private successfulRequests = 0;

  private totalRequests = 0;

  constructor(
    private readonly name: string,
    options: CircuitBreakerOptions = {},
  ) {
    this.options = {
      failureThreshold: 5,
      isFailure: (error) => {
        // Consider all non-retryable errors as circuit failures
        // and server errors (5xx) as circuit failures
        if (!(error instanceof Error)) return true;

        const httpStatus = (error as { status?: number }).status;
        return !isRetryableError(error) || (httpStatus !== undefined && httpStatus >= 500);
      },
      name: name,
      onStateChange: () => {
        // Default: no-op
      },
      resetTimeoutMs: 60000,
      successThreshold: 3,
      timeoutMs: 30000,
      ...options,
    };
  }

  /**
   * Execute an operation through the circuit breaker
   *
   * @param operation - The operation to execute
   * @returns Promise with operation result and circuit breaker metadata
   */
  async execute<T>(operation: () => Promise<T>): Promise<CircuitBreakerResult<T>> {
    const startTime = Date.now();
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    this.checkStateTransition();

    // If circuit is OPEN, reject immediately
    if (this.state === CircuitState.OPEN) {
      this.rejectedRequests++;

      throw new CircuitBreakerError(`Circuit breaker ${this.name} is OPEN`, this.getMetrics());
    }

    try {
      // Execute operation with timeout
      const result = await this.executeWithTimeout(operation);

      // Record success
      this.onSuccess();
      const executionTime = Date.now() - startTime;

      return {
        executionTimeMs: executionTime,
        metrics: this.getMetrics(),
        result,
        wasExecuted: true,
        wasRejected: false,
      };
    } catch (error) {
      // Record failure if it meets failure criteria
      if (this.options.isFailure(error)) {
        this.onFailure();
      }

      throw error;
    }
  }

  /**
   * Get current circuit breaker metrics
   */
  getMetrics(): CircuitBreakerMetrics {
    const failureRate =
      this.totalRequests > 0 ? Math.round((this.failedRequests / this.totalRequests) * 100) : 0;

    return {
      failedRequests: this.failedRequests,
      failureRate,
      lastFailureTime: this.lastFailureTime,
      lastStateChangeTime: this.lastStateChangeTime,
      nextRetryTime: this.nextRetryTime,
      rejectedRequests: this.rejectedRequests,
      state: this.state,
      successfulRequests: this.successfulRequests,
      totalRequests: this.totalRequests,
    };
  }

  /**
   * Get circuit breaker name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Force reset the circuit breaker to CLOSED state
   * Useful for manual recovery or testing
   */
  reset(): void {
    this.changeState(CircuitState.CLOSED);
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.nextRetryTime = undefined;
  }

  /**
   * Change circuit state and notify listeners
   */
  private changeState(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChangeTime = new Date();

    if (oldState !== newState) {
      this.options.onStateChange(newState, oldState);
    }
  }

  /**
   * Check if enough time has passed to transition from OPEN to HALF_OPEN
   */
  private checkStateTransition(): void {
    if (this.state === CircuitState.OPEN && this.nextRetryTime && new Date() >= this.nextRetryTime) {
      this.changeState(CircuitState.HALF_OPEN);
      this.successCount = 0; // Reset success count for half-open testing
    }
  }

  /**
   * Execute operation with timeout
   */
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.options.timeoutMs}ms`));
      }, this.options.timeoutMs);

      operation()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timer));
    });
  }

  /**
   * Handle failed operation
   */
  private onFailure(): void {
    this.failedRequests++;
    this.failureCount++;
    this.lastFailureTime = new Date();

    // If we exceed failure threshold, open the circuit
    if (this.failureCount >= this.options.failureThreshold) {
      this.openCircuit();
    }
  }

  /**
   * Handle successful operation
   */
  private onSuccess(): void {
    this.successfulRequests++;
    this.failureCount = 0; // Reset failure count on success

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;

      // If we have enough successes, close the circuit
      if (this.successCount >= this.options.successThreshold) {
        this.changeState(CircuitState.CLOSED);
      }
    }
  }

  /**
   * Open the circuit breaker
   */
  private openCircuit(): void {
    this.changeState(CircuitState.OPEN);
    this.nextRetryTime = new Date(Date.now() + this.options.resetTimeoutMs);
  }
}

/**
 * Circuit breaker specific error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public readonly metrics: CircuitBreakerMetrics,
  ) {
    super(message);
    this.name = 'CircuitBreakerError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CircuitBreakerError);
    }
  }
}

/**
 * Get health status of a circuit breaker
 */
export function getCircuitHealth(circuitBreaker: CircuitBreaker): CircuitHealthStatus {
  const metrics = circuitBreaker.getMetrics();
  const isHealthy =
    metrics.state === CircuitState.CLOSED ||
    (metrics.state === CircuitState.HALF_OPEN && metrics.failureRate < 50);

  let message: string;
  let nextRetryInMs: number | undefined;

  switch (metrics.state) {
    case CircuitState.CLOSED:
      message = `Circuit healthy - ${metrics.failureRate}% failure rate`;
      break;
    case CircuitState.HALF_OPEN:
      message = `Circuit testing recovery - ${metrics.failureRate}% failure rate`;
      break;
    case CircuitState.OPEN:
      nextRetryInMs =
        metrics.nextRetryTime ? Math.max(0, metrics.nextRetryTime.getTime() - Date.now()) : undefined;
      message = `Circuit OPEN - failing fast. Next retry in ${Math.round((nextRetryInMs || 0) / 1000)}s`;
      break;
  }

  return {
    failureRate: metrics.failureRate,
    isHealthy,
    message,
    name: circuitBreaker.getName(),
    nextRetryInMs,
    state: metrics.state,
    totalRequests: metrics.totalRequests,
  };
}

/**
 * Utility function to wrap any function with circuit breaker
 *
 * @param name - Circuit breaker name
 * @param operation - Function to wrap
 * @param options - Circuit breaker options
 * @returns Circuit breaker wrapped function
 *
 * @example
 * ```typescript
 * const protectedApiCall = withCircuitBreaker(
 *   'user-api',
 *   async (userId: string) => await userApi.getUser(userId),
 *   { failureThreshold: 3 }
 * );
 *
 * const user = await protectedApiCall('user-123');
 * ```
 */
export function withCircuitBreaker<TArgs extends unknown[], TReturn>(
  name: string,
  operation: (...args: TArgs) => Promise<TReturn>,
  options?: CircuitBreakerOptions,
): {
  (...args: TArgs): Promise<TReturn>;
  getMetrics(): CircuitBreakerMetrics;
  getState(): CircuitState;
  reset(): void;
} {
  const circuitBreaker = new CircuitBreaker(name, options);

  const wrappedFunction = async (...args: TArgs): Promise<TReturn> => {
    const result = await circuitBreaker.execute(() => operation(...args));
    return result.result;
  };

  // Add utility methods to the wrapped function
  wrappedFunction.getMetrics = () => circuitBreaker.getMetrics();
  wrappedFunction.getState = () => circuitBreaker.getState();
  wrappedFunction.reset = () => circuitBreaker.reset();

  return wrappedFunction;
}
