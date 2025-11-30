import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { UsersQuery } from '@/lib/queries/users/users-query';
import { CacheService } from '@/lib/services/cache.service';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

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
export class PlatformStatsFacade extends BaseFacade {
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
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getPlatformStatsAsync',
        operation: OPERATIONS.PLATFORM.GET_STATS,
      },
      async () => {
        return await CacheService.platform.stats(
          async () => {
            const context = this.getPublicContext(dbInstance);

            const [bobbleheadsCount, collectionsCount, collectorsCount] = await Promise.all([
              BobbleheadsQuery.getBobbleheadCountAsync(context),
              CollectionsQuery.getCollectionCountAsync(context),
              UsersQuery.getUserCountAsync(context),
            ]);

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
            ttl: CACHE_CONFIG.TTL.EXTENDED,
          },
        );
      },
    );
  }
}
