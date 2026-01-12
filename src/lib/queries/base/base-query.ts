import type { AnyColumn, SQL } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { RetryResult } from '@/lib/utils/retry';

import { DEFAULTS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseContextHelpers } from '@/lib/queries/base/base-context-helpers';
import {
  buildPermissionFilter,
  buildSoftDeleteFilter,
  combineFilters,
} from '@/lib/queries/base/permission-filters';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { withDatabaseRetry } from '@/lib/utils/retry';

/**
 * Abstract base class for all query operations
 * Extends BaseContextHelpers for query context utilities
 */
export abstract class BaseQuery extends BaseContextHelpers {
  protected static combineFilters = combineFilters;

  /**
   * Apply pagination constraints to query options
   * Enforces maximum limit from DEFAULTS.PAGINATION.MAX_LIMIT
   */
  protected static applyPagination(options: FindOptions): { limit?: number; offset?: number } {
    const { limit, offset } = options;

    return {
      limit: limit ? Math.min(limit, DEFAULTS.PAGINATION.MAX_LIMIT) : undefined,
      offset: offset && offset > 0 ? offset : undefined,
    };
  }

  /**
   * Build combined permission and soft delete filters for a table
   * Returns undefined if no filters are applicable
   */
  protected static buildBaseFilters(
    isPublicColumn: AnyColumn | undefined,
    userIdColumn: AnyColumn,
    deletedAtColumn: AnyColumn | undefined,
    context: QueryContext,
  ): SQL | undefined {
    const filters: Array<SQL | undefined> = [];

    // Add the permission filter if isPublic column exists
    if (isPublicColumn) {
      filters.push(buildPermissionFilter(isPublicColumn, userIdColumn, context));
    }

    // Add soft delete filter if deletedAt column exists
    if (deletedAtColumn) {
      filters.push(buildSoftDeleteFilter(deletedAtColumn, context));
    }

    return combineFilters(...filters);
  }

  /**
   * Execute a database operation with retry logic and circuit breaker protection
   * Automatically handles transient database errors and connection issues
   */
  protected static async executeWithRetryAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<T> {
    const circuitBreaker = circuitBreakers.database(operationName);

    const result = await circuitBreaker.execute(async () => {
      const retryResult = await withDatabaseRetry(operation, {
        maxAttempts: 3,
        operationName,
      });

      return retryResult.result;
    });

    return result.result;
  }

  /**
   * Execute a database operation with retry logic and return full retry metadata
   * Useful when you need detailed information about retry attempts
   */
  protected static async executeWithRetryDetailsAsync<T>(
    operation: () => Promise<T>,
    operationName: string,
  ): Promise<RetryResult<T>> {
    const circuitBreaker = circuitBreakers.database(operationName);

    const result = await circuitBreaker.execute(async () => {
      return withDatabaseRetry(operation, {
        maxAttempts: 3,
        operationName,
      });
    });

    return result.result;
  }

  /**
   * Get the database instance to use (transaction or main db)
   */
  protected static getDbInstance(context: QueryContext): DatabaseExecutor {
    return context.dbInstance ?? db;
  }
}
