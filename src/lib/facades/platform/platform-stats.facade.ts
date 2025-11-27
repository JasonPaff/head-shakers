import * as Sentry from '@sentry/nextjs';

import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'PlatformStatsFacade';

/**
 * Platform-wide statistics result
 */
export interface HomePageHeroStats {
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
   * Returns total active counts of:
   * - Bobbleheads
   * - Collections
   * - Collectors
   *
   * @param dbInstance - Optional database instance for transactions
   * @returns Platform statistics with total counts
   */
  static async getHomePageHeroStatsAsync(dbInstance?: DatabaseExecutor): Promise<HomePageHeroStats> {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching platform statistics',
    });

    try {
      return await CacheService.platform.stats(
        async () => {
          const context = createPublicQueryContext({ dbInstance });

          // Fetch all counts in parallel for performance
          const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
            BobbleheadsQuery.getBobbleheadCountAsync(context),
            CollectionsQuery.getCollectionCountAsync(context),
            UsersQuery.getUserCountAsync(context),
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
        {
          context: {
            entityType: CACHE_ENTITY_TYPE.PLATFORM,
            facade: facadeName,
            operation: OPERATIONS.PLATFORM.GET_STATS,
          },
          ttl: CACHE_CONFIG.TTL.MEDIUM,
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getHomePageHeroStatsAsync',
        operation: OPERATIONS.PLATFORM.GET_STATS,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
