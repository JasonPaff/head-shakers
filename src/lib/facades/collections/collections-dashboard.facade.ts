import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'collections_dashboard_facade';

export class CollectionsDashboardFacade extends BaseFacade {
  static async getHeaderByCollectionSlugAsync(
    userId: string,
    collectionSlug: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionDashboardHeaderRecord | null> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getHeaderByCollectionSlugAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_HEADER_BY_COLLECTION_SLUG,
      },
      async () => {
        return CacheService.collections.dashboardHeader(
          async () => {
            const context = this.getUserContext(userId, dbInstance);
            return await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync(collectionSlug, context);
          },
          userId,
          collectionSlug,
          {
            context: {
              facade,
              operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_HEADER_BY_COLLECTION_SLUG,
            },
          },
        );
      },
    );
  }

  static async getListByUserIdAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<CollectionDashboardListRecord>> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade,
        method: 'getListByUserIdAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_LIST_BY_USER_ID,
        userId,
      },
      async () => {
        return CacheService.collections.dashboard(async () => {
          const context = this.getUserContext(userId, dbInstance);
          return await CollectionsDashboardQuery.getListByUserIdAsync(context);
        }, userId);
      },
    );
  }
}
