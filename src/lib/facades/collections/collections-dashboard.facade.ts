import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { CollectionDashboardListData } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'COLLECTIONS_DASHBOARD_FACADE';

export class CollectionsDashboardFacade extends BaseFacade {
  static async getCollectionHeaderForUserBySlugAsync(
    userId: string,
    slug: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionDashboardHeaderRecord> {
    return await executeFacadeOperation(
      {
        data: { slug, userId },
        facade,
        method: 'getCollectionHeaderForUserBySlug',
        operation: OPERATIONS.COLLECTIONS.GET_COLLECTION_HEADER_FOR_USER_BY_SLUG,
      },
      async () => {
        return CacheService.collections.dashboardHeader(
          async () => {
            const context = this.getUserContext(userId, dbInstance);
            return await CollectionsDashboardQuery.getCollectionHeaderForUserBySlugAsync(slug, context);
          },
          userId,
          slug,
          {
            context: {
              facade,
              operation: 'getCollectionHeaderForUserBySlug',
            },
          },
        );
      },
    );
  }

  static async getDashboardListByUserIdAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<CollectionDashboardListData>> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade,
        method: 'getDashboardListByUserId',
        operation: OPERATIONS.COLLECTIONS.GET_DASHBOARD_LIST_BY_USER_ID,
        userId,
      },
      async () => {
        return CacheService.collections.dashboard(async () => {
          const context = this.getUserContext(userId, dbInstance);
          return await CollectionsDashboardQuery.getDashboardListByUserIdAsync(userId, context);
        }, userId);
      },
    );
  }
}
