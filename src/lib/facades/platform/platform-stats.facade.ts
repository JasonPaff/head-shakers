import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';
import { trackFacadeEntry, trackFacadeSuccess } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'PlatformStatsFacade';

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
   * Returns total active counts of:
   * - Bobbleheads
   * - Collections
   * - Collectors
   *
   * @param dbInstance - Optional database instance for transactions
   * @returns Platform statistics with total counts
   */
  static async getPlatformStatsAsync(dbInstance: DatabaseExecutor = db): Promise<PlatformStats> {
    const methodName = 'getPlatformStatsAsync';
    trackFacadeEntry(facadeName, methodName);

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

          const stats: PlatformStats = {
            totalBobbleheads: bobbleheadsCount,
            totalCollections: collectionsCount,
            totalCollectors: collectorsCount,
          };

          trackFacadeSuccess(facadeName, methodName, { ...stats });

          return stats;
        },
        {
          context: {
            entityType: CACHE_ENTITY_TYPE.PLATFORM,
            facade: facadeName,
            operation: OPERATIONS.PLATFORM.GET_STATS,
          },
          ttl: CACHE_CONFIG.TTL.EXTENDED,
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: methodName,
        operation: OPERATIONS.PLATFORM.GET_STATS,
      };
      throw createFacadeError(errorContext, error);
    }
  }
}
