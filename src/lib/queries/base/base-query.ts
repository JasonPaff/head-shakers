import type { AnyColumn, SQL } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { RetryResult } from '@/lib/utils/retry';

import { DEFAULTS } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  buildPermissionFilter,
  buildSoftDeleteFilter,
  combineFilters,
} from '@/lib/queries/base/permission-filters';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { withDatabaseRetry } from '@/lib/utils/retry';

/**
 * abstract base class for all query operations
 */
export abstract class BaseQuery {
  protected static combineFilters = combineFilters;

  protected static applyPagination(options: FindOptions): { limit?: number; offset?: number } {
    const { limit, offset } = options;

    return {
      limit: limit ? Math.min(limit, DEFAULTS.PAGINATION.MAX_LIMIT) : undefined,
      offset: offset && offset > 0 ? offset : undefined,
    };
  }

  protected static buildBaseFilters(
    isPublicColumn: AnyColumn | undefined,
    userIdColumn: AnyColumn,
    isDeletedColumn: AnyColumn | undefined,
    context: QueryContext,
  ): SQL | undefined {
    const filters: Array<SQL | undefined> = [];

    // add the permission filter if isPublic column exists
    if (isPublicColumn) {
      filters.push(buildPermissionFilter(isPublicColumn, userIdColumn, context));
    }

    // add soft delete filter if isDeleted column exists
    if (isDeletedColumn) {
      filters.push(buildSoftDeleteFilter(isDeletedColumn, context));
    }

    return combineFilters(...filters);
  }

  /**
   * execute a database operation with retry logic and circuit breaker protection
   * automatically handles transient database errors and connection issues
   */
  protected static async executeWithRetry<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
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
   * execute a database operation with retry logic and return full retry metadata
   * useful when you need detailed information about retry attempts
   */
  protected static async executeWithRetryDetails<T>(
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
   * get the database instance to use (transaction or main db)
   */
  protected static getDbInstance(context: QueryContext): DatabaseExecutor {
    return context.dbInstance ?? db;
  }
}