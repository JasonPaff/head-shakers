import { addBreadcrumb, captureMessage } from '@sentry/nextjs';

export interface PerformanceMetrics {
  duration: number;
  errorCount?: number;
  isCacheHit?: boolean;
  itemCount?: number;
  memoryUsage?: number;
  operation: string;
}

export class PerformanceMonitor {
  private metadata: Record<string, unknown> = {};
  private operation: string;
  private startTime: number;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = performance.now();
  }

  addMetadata(key: string, value: unknown): this {
    this.metadata[key] = value;
    return this;
  }

  end(): PerformanceMetrics {
    const endTime = performance.now();
    const duration = endTime - this.startTime;

    const metrics: PerformanceMetrics = {
      duration,
      operation: this.operation,
      ...this.metadata,
    };

    // add Sentry breadcrumb for performance tracking
    addBreadcrumb({
      category: 'performance',
      data: metrics,
      level: 'info',
      message: `${this.operation} completed in ${duration.toFixed(2)}ms`,
    });

    // log slow operations
    if (duration > 1000) {
      // more than 1 second
      captureMessage(`Slow operation detected: ${this.operation}`, {
        extra: metrics as unknown as Record<string, unknown>,
        level: 'warning',
      });
    }

    return metrics;
  }

  setCacheHit(hit: boolean): this {
    this.metadata.cacheHit = hit;
    return this;
  }

  setErrorCount(count: number): this {
    this.metadata.errorCount = count;
    return this;
  }

  setItemCount(count: number): this {
    this.metadata.itemCount = count;
    return this;
  }
}

// cache performance diagnostics
export function createCachePerformanceDiagnostics() {
  const operations: Array<PerformanceMetrics> = [];

  return {
    getDiagnostics: () => {
      const cacheOperations = operations.filter((op) => op.operation.startsWith('cache:'));
      const dbOperations = operations.filter((op) => op.operation.startsWith('db:'));

      return {
        cache: {
          averageDuration: cacheOperations.reduce((sum, op) => sum + op.duration, 0) / cacheOperations.length,
          errorRate: cacheOperations.filter((op) => (op.errorCount || 0) > 0).length / cacheOperations.length,
          hitRate: cacheOperations.filter((op) => op.isCacheHit).length / cacheOperations.length,
          totalOperations: cacheOperations.length,
        },
        database: {
          averageDuration: dbOperations.reduce((sum, op) => sum + op.duration, 0) / dbOperations.length,
          errorRate: dbOperations.filter((op) => (op.errorCount || 0) > 0).length / dbOperations.length,
          totalOperations: dbOperations.length,
        },
        memory: getMemoryUsage(),
      };
    },

    recordOperation: (metrics: PerformanceMetrics) => {
      operations.push(metrics);
    },

    reset: () => {
      operations.length = 0;
    },
  };
}

// memory usage monitoring
export function getMemoryUsage(): {
  external: number;
  heapTotal: number;
  heapUsed: number;
  rss: number;
} {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage();
    return {
      external: Math.round((usage.external / 1024 / 1024) * 100) / 100, // MB
      heapTotal: Math.round((usage.heapTotal / 1024 / 1024) * 100) / 100, // MB
      heapUsed: Math.round((usage.heapUsed / 1024 / 1024) * 100) / 100, // MB
      rss: Math.round((usage.rss / 1024 / 1024) * 100) / 100, // MB
    };
  }

  return {
    external: 0,
    heapTotal: 0,
    heapUsed: 0,
    rss: 0,
  };
}

// utility to log performance summary
export function logPerformanceSummary(metrics: PerformanceMetrics[]): void {
  if (metrics.length === 0) return;

  const summary = {
    averageDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
    cacheHitRate: metrics.filter((m) => m.isCacheHit === true).length / metrics.length,
    errorRate: metrics.filter((m) => (m.errorCount || 0) > 0).length / metrics.length,
    slowestOperation: metrics.reduce((slowest, current) =>
      current.duration > slowest.duration ? current : slowest,
    ),
    totalDuration: metrics.reduce((sum, m) => sum + m.duration, 0),
    totalOperations: metrics.length,
  };

  captureMessage('Performance summary', {
    extra: summary,
    level: 'info',
  });

  // log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Performance Summary:', summary);
  }
}

// specific performance monitoring for cache operations
export async function measureCacheOperation<T>(
  operation: string,
  cacheKey: string,
  cacheOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
): Promise<{ data: T; metrics: PerformanceMetrics }> {
  const monitor = measurePerformance(`cache:${operation}`).addMetadata('cacheKey', cacheKey);

  try {
    // try the cache operation first
    const data = await cacheOperation();
    const metrics = monitor.setCacheHit(true).end();

    return { data, metrics };
  } catch (error) {
    monitor.addMetadata('cacheError', error);

    if (fallbackOperation) {
      // try the fallback operation
      const fallbackMonitor = measurePerformance(`fallback:${operation}`)
        .addMetadata('cacheKey', cacheKey)
        .setCacheHit(false);

      try {
        const data = await fallbackOperation();
        const metrics = fallbackMonitor.end();

        return { data, metrics };
      } catch (fallbackError) {
        fallbackMonitor.setErrorCount(1).end();
        throw fallbackError;
      }
    } else {
      monitor.setCacheHit(false).setErrorCount(1).end();
      throw error;
    }
  }
}

// database query performance monitoring
export async function measureDatabaseOperation<T>(
  operation: string,
  query: () => Promise<T>,
): Promise<{ data: T; metrics: PerformanceMetrics }> {
  const monitor = measurePerformance(`db:${operation}`);

  try {
    const data = await query();

    // try to determine item count for arrays
    let itemCount: number | undefined;
    if (Array.isArray(data)) {
      itemCount = data.length;
    } else if (data && typeof data === 'object' && 'length' in data) {
      itemCount = (data as { length: number }).length;
    }

    const metrics = monitor.setItemCount(itemCount || 0).end();

    return { data, metrics };
  } catch (error) {
    monitor.setErrorCount(1).end();
    throw error;
  }
}

// featured content-specific performance monitoring
export async function measureFeaturedContentOperation<T>(
  operation: string,
  contentType?: string,
  cacheOperation?: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
): Promise<T> {
  const cacheKey = contentType ? `featured-content:${contentType}` : 'featured-content:all';

  if (cacheOperation && fallbackOperation) {
    const { data } = await measureCacheOperation(operation, cacheKey, cacheOperation, fallbackOperation);
    return data;
  } else if (cacheOperation) {
    const { data } = await measureCacheOperation(operation, cacheKey, cacheOperation);
    return data;
  } else if (fallbackOperation) {
    const { data } = await measureDatabaseOperation(operation, fallbackOperation);
    return data;
  } else {
    throw new Error('Either cache or fallback operation must be provided');
  }
}

export function measurePerformance(operation: string): PerformanceMonitor {
  return new PerformanceMonitor(operation);
}
