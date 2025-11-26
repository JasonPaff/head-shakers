import * as Sentry from '@sentry/nextjs';
import { count, isNull } from 'drizzle-orm';

import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { bobbleheads, collections } from '@/lib/db/schema';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'PlatformStatsFacade';

/**
 * Platform-wide statistics result
 */
export interface PlatformStats {
  totalBobbleheads: number;
  totalCollections: number;
  totalCollectors: number;
}

/**
 * Platform Statistics Facade
 * Provides aggregated platform-wide statistics for public display
 */
export class PlatformStatsFacade {
  /**
   * Get platform-wide statistics
   *
   * Returns total counts of:
   * - Bobbleheads (excluding deleted)
   * - Collections (all collections)
   * - Collectors (total users)
   *
   * @param dbInstance - Optional database instance for transactions
   * @returns Platform statistics with total counts
   */
  static async getPlatformStats(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
    try {
      return await CacheService.cached(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          const executor = dbInstance ?? db;

          // Fetch all counts in parallel for performance
          const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
            // Count bobbleheads excluding soft-deleted
            executor
              .select({ count: count() })
              .from(bobbleheads)
              .where(isNull(bobbleheads.deletedAt))
              .then((result) => result[0]?.count || 0),

            // Count all collections
            executor
              .select({ count: count() })
              .from(collections)
              .then((result) => result[0]?.count || 0),

            // Count all users (collectors)
            UsersQuery.countUsersForAdminAsync({}, context),
          ]);

          // Add breadcrumb for successful stats fetch
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              bobbleheadsCount,
              collectionsCount,
              collectorsCount,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Platform statistics fetched successfully',
          });

          return {
            totalBobbleheads: bobbleheadsCount,
            totalCollections: collectionsCount,
            totalCollectors: collectorsCount,
          };
        },
        'platform:stats',
        {
          context: {
            entityType: 'platform',
            facade: facadeName,
            operation: 'getPlatformStats',
          },
          tags: [CACHE_CONFIG.TAGS.GLOBAL_STATS, CACHE_CONFIG.TAGS.PUBLIC_CONTENT],
          ttl: CACHE_CONFIG.TTL.MEDIUM,
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getPlatformStats',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
