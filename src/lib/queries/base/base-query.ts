import type { AnyColumn, SQL } from 'drizzle-orm';

import { cache } from 'react';

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
import { createValidationError } from '@/lib/utils/error-builders';
import { withDatabaseRetry } from '@/lib/utils/retry';

/**
 * abstract base class for all query operations
 * provides consistent patterns for permissions, caching, and data access
 */
export abstract class BaseQuery {
  /**
   * combine multiple filters with AND logic
   */
  protected static combineFilters = combineFilters;

  /**
   * apply pagination to find options
   */
  protected static applyPagination(options: FindOptions): { limit?: number; offset?: number } {
    const { limit, offset } = options;

    return {
      limit: limit ? Math.min(limit, DEFAULTS.PAGINATION.MAX_LIMIT) : undefined,
      offset: offset && offset > 0 ? offset : undefined,
    };
  }

  /**
   * build base filters for queries with standard permission and soft delete logic
   */
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
  protected static async executeWithRetry<T>(
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

  /**
   * get user ID from context (prefer requiredUserId over userId)
   */
  protected static getUserId(context: QueryContext): string | undefined {
    return context.requiredUserId ?? context.userId;
  }

  /**
   * check if a user is the owner of a record
   */
  protected static isOwner(recordUserId: string, context: QueryContext): boolean {
    const contextUserId = this.getUserId(context);
    return contextUserId === recordUserId;
  }

  /**
   * validate that required context is provided
   */
  protected static validateContext(context: QueryContext, isUserIdRequired = false): void {
    if (isUserIdRequired && !context.userId && !context.requiredUserId) {
      throw createValidationError(
        'MISSING_USER_CONTEXT',
        'User authentication required for this operation',
        { operation: 'query' },
      );
    }
  }

  /**
   * create a cached version of a query function with retry logic
   * uses React cache for request-level deduplication and includes database retry protection
   */
  protected cached<TArgs extends ReadonlyArray<unknown>, TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    keyFn?: (...args: TArgs) => string,
  ): (...args: TArgs) => Promise<TReturn> {
    if (keyFn) {
      // custom cache key function
      const cacheMap = new Map<string, Promise<TReturn>>();

      return cache(async (...args: TArgs): Promise<TReturn> => {
        const key = keyFn(...args);

        if (cacheMap.has(key)) {
          return cacheMap.get(key)!;
        }

        const promise = fn(...args);
        cacheMap.set(key, promise);

        return promise;
      });
    }

    // use React's built-in cache with function identity
    return cache(fn);
  }
}
