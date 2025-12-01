import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type {
  BobbleheadListRecord,
  CollectionDashboardListRecord,
} from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { BobbleheadsDashboardQuery } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'COLLECTIONS_DASHBOARD_FACADE';

export class CollectionsDashboardFacade extends BaseFacade {
  static async getBobbleheadsByCollectionSlugAsync(
    collectionSlug: string,
    userId: string,
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance: DatabaseExecutor = db,
  ): Promise<{
    bobbleheads: Array<
      BobbleheadListRecord & {
        collectionId: string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
      }
    >;
    collectionId: string;
  }> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getBobbleheadsByCollectionSlugAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEADS_BY_COLLECTION_SLUG,
      },
      async () => {
        const optionsHash = createHashFromObject({ options, photos: true, userId });
        return CacheService.bobbleheads.byCollection(
          async () => {
            const context = this.getUserContext(userId, dbInstance);
            //
            const bobbleheads = await BobbleheadsDashboardQuery.getListAsync(
              collectionSlug,
              context,
              options,
            );

            return { bobbleheads, collectionId: bobbleheads[0]?.collectionId ?? 'unknown' };
          },
          collectionSlug,
          optionsHash,
          {
            context: {
              entityId: collectionSlug,
              entityType: 'collection',
              facade,
              operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEADS_BY_COLLECTION_SLUG,
              userId,
            },
          },
        );
      },
    );
  }

  static async getHeaderByCollectionSlugAsync(
    userId: string,
    collectionSlug: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionDashboardHeaderRecord> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getCollectionHeaderForUserBySlug',
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
              operation: 'getCollectionHeaderForUserBySlug',
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
        method: 'getDashboardListByUserId',
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
