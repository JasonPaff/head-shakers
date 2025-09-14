import type { CircuitBreakerOptions, CircuitHealthStatus } from './circuit-breaker';

import { CircuitBreaker, CircuitState, getCircuitHealth } from './circuit-breaker';

/**
 * Registry configuration for common circuit breaker patterns
 */
export interface RegistryConfig {
  /** Database operations configuration */
  database: CircuitBreakerOptions;
  /** External service operations configuration */
  externalService: CircuitBreakerOptions;
  /** Fast operations configuration */
  fast: CircuitBreakerOptions;
  /** Upload operations configuration */
  upload: CircuitBreakerOptions;
}

/**
 * Default configurations for different operation types
 */
const DEFAULT_REGISTRY_CONFIG: RegistryConfig = {
  database: {
    failureThreshold: 3,
    resetTimeoutMs: 30000, // 30 seconds for database recovery
    successThreshold: 2,
    timeoutMs: 10000, // 10 seconds for database operations
  },
  externalService: {
    failureThreshold: 5,
    resetTimeoutMs: 60000, // 1 minute for external service recovery
    successThreshold: 3,
    timeoutMs: 30000, // 30 seconds for external services
  },
  fast: {
    failureThreshold: 10,
    resetTimeoutMs: 15000, // 15 seconds for fast operations
    successThreshold: 2,
    timeoutMs: 5000, // 5 seconds for fast operations
  },
  upload: {
    failureThreshold: 3,
    resetTimeoutMs: 120000, // 2 minutes for upload service recovery
    successThreshold: 2,
    timeoutMs: 60000, // 60 seconds for upload operations
  },
};

/**
 * Circuit breaker registry statistics
 */
export interface RegistryStats {
  /** Number of registered circuit breakers */
  breakersCount: number;
  /** Health status of all breakers */
  healthSummary: {
    healthy: number;
    open: number;
    total: number;
    unhealthy: number;
  };
  /** Overall registry health percentage */
  overallHealthPercentage: number;
  /** Registry uptime in milliseconds */
  uptimeMs: number;
}

/**
 * Central registry for managing circuit breakers
 * Provides a singleton pattern for creating and accessing circuit breakers
 * with standard configurations and monitoring capabilities
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;

  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly config: RegistryConfig;
  private readonly startTime = Date.now();

  private constructor(config?: Partial<RegistryConfig>) {
    this.config = {
      ...DEFAULT_REGISTRY_CONFIG,
      ...config,
    };
  }

  /**
   * Get or create the singleton registry instance
   */
  static getInstance(config?: Partial<RegistryConfig>): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry(config);
    }
    return CircuitBreakerRegistry.instance;
  }

  /**
   * Get all health statuses from registered circuit breakers
   */
  getAllHealthStatuses(): Array<CircuitHealthStatus> {
    return Array.from(this.breakers.values()).map((breaker) => getCircuitHealth(breaker));
  }

  /**
   * Get a specific circuit breaker by name (if it exists)
   */
  getBreakerByName(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  /**
   * Get health status for a specific circuit breaker
   */
  getBreakerHealth(name: string): CircuitHealthStatus | null {
    const breaker = this.breakers.get(name);
    return breaker ? getCircuitHealth(breaker) : null;
  }

  /**
   * List all registered circuit breaker names
   */
  getBreakerNames(): Array<string> {
    return Array.from(this.breakers.keys());
  }

  /**
   * Get or create a circuit breaker with database-optimized settings
   */
  getDatabaseBreaker(name: string, customOptions?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    return this.getOrCreateBreaker(name, {
      ...this.config.database,
      ...customOptions,
    });
  }

  /**
   * Get or create a circuit breaker with external service settings
   */
  getExternalServiceBreaker(name: string, customOptions?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    return this.getOrCreateBreaker(name, {
      ...this.config.externalService,
      ...customOptions,
    });
  }

  /**
   * Get or create a circuit breaker with fast operation settings
   */
  getFastOperationBreaker(name: string, customOptions?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    return this.getOrCreateBreaker(name, {
      ...this.config.fast,
      ...customOptions,
    });
  }

  /**
   * Get registry statistics
   */
  getStats(): RegistryStats {
    const healthStatuses = this.getAllHealthStatuses();
    const healthy = healthStatuses.filter((status) => status.isHealthy).length;
    const open = healthStatuses.filter((status) => status.state === CircuitState.OPEN).length;
    const total = healthStatuses.length;

    return {
      breakersCount: this.breakers.size,
      healthSummary: {
        healthy,
        open,
        total,
        unhealthy: total - healthy,
      },
      overallHealthPercentage: total > 0 ? Math.round((healthy / total) * 100) : 100,
      uptimeMs: Date.now() - this.startTime,
    };
  }

  /**
   * Get or create a circuit breaker with upload operation settings
   */
  getUploadBreaker(name: string, customOptions?: Partial<CircuitBreakerOptions>): CircuitBreaker {
    return this.getOrCreateBreaker(name, {
      ...this.config.upload,
      ...customOptions,
    });
  }

  /**
   * Check if registry has any unhealthy breakers
   */
  hasUnhealthyBreakers(): boolean {
    return Array.from(this.breakers.values()).some((breaker) => !getCircuitHealth(breaker).isHealthy);
  }

  /**
   * Remove a circuit breaker from the registry
   */
  removeBreaker(name: string): boolean {
    return this.breakers.delete(name);
  }

  /**
   * Reset all circuit breakers to CLOSED state
   * Useful for testing or recovery scenarios
   */
  resetAllBreakers(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Reset a specific circuit breaker by name
   */
  resetBreaker(name: string): boolean {
    const breaker = this.breakers.get(name);
    if (breaker) {
      breaker.reset();
      return true;
    }
    return false;
  }

  /**
   * Get or create a circuit breaker with custom options
   */
  private getOrCreateBreaker(name: string, options: CircuitBreakerOptions): CircuitBreaker {
    let breaker = this.breakers.get(name);

    if (!breaker) {
      breaker = new CircuitBreaker(name, {
        ...options,
        onStateChange: (newState, oldState) => {
          // Log state changes for monitoring
          console.log(`Circuit breaker '${name}' state changed: ${oldState} → ${newState}`);

          // Call custom onStateChange if provided
          options.onStateChange?.(newState, oldState);
        },
      });

      this.breakers.set(name, breaker);
    }

    return breaker;
  }
}

/**
 * Convenience function to get the default registry instance
 */
export function getCircuitBreakerRegistry(config?: Partial<RegistryConfig>): CircuitBreakerRegistry {
  return CircuitBreakerRegistry.getInstance(config);
}

/**
 * Convenience functions for common circuit breaker patterns
 */
export const circuitBreakers = {
  /** Get a database circuit breaker */
  database: (name: string, options?: Partial<CircuitBreakerOptions>) =>
    getCircuitBreakerRegistry().getDatabaseBreaker(name, options),

  /** Get an external service circuit breaker */
  externalService: (name: string, options?: Partial<CircuitBreakerOptions>) =>
    getCircuitBreakerRegistry().getExternalServiceBreaker(name, options),

  /** Get a fast operation circuit breaker */
  fast: (name: string, options?: Partial<CircuitBreakerOptions>) =>
    getCircuitBreakerRegistry().getFastOperationBreaker(name, options),

  /** Get all health statuses */
  getHealthStatuses: () => getCircuitBreakerRegistry().getAllHealthStatuses(),

  /** Get registry statistics */
  getStats: () => getCircuitBreakerRegistry().getStats(),

  /** Get an upload circuit breaker */
  upload: (name: string, options?: Partial<CircuitBreakerOptions>) =>
    getCircuitBreakerRegistry().getUploadBreaker(name, options),
};
