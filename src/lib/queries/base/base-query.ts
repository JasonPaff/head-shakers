import type { AnyColumn, SQL } from 'drizzle-orm';

import { cache } from 'react';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { DEFAULTS } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  buildPermissionFilter,
  buildSoftDeleteFilter,
  combineFilters,
} from '@/lib/queries/base/permission-filters';

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
      throw new Error('User ID is required for this operation');
    }
  }

  /**
   * create a cached version of a query function
   * uses React cache for request-level deduplication
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
