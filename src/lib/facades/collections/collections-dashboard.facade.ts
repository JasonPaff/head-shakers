import type {
  BobbleheadDashboardListRecord,
  BobbleheadDashboardQueryOptions,
} from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { BobbleheadsDashboardQuery } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'colllection_dashboard_facade';

export class CollectionsDashboardFacade extends BaseFacade {
  // TODO: move to bobbleheads facade
  static async getBobbleheadListByCollectionSlugAsync(
    collectionSlug: string,
    userId: string,
    options?: BobbleheadDashboardQueryOptions,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{
    // TODO: fix this type
    bobbleheads: Array<BobbleheadDashboardListRecord>;
    collectionId: string;
  }> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getBobbleheadListByCollectionSlugAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEAD_LIST_BY_COLLECTION_SLUG,
      },
      async () => {
        // TODO: fix caching
        const optionsHash = createHashFromObject({ options, photos: true, userId });
        return CacheService.bobbleheads.byCollection(
          async () => {
            const context = this.getUserContext(userId, dbInstance);

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
              entityType: CACHE_ENTITY_TYPE.BOBBLEHEAD,
              facade,
              operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEAD_LIST_BY_COLLECTION_SLUG,
              userId,
            },
          },
        );
      },
    );
  }

  static async getCategoriesForCollectionAsync(
    collectionSlug: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<string>> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getCategoriesForCollectionAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_CATEGORIES_FOR_COLLECTION,
      },
      async () => {
        return CacheService.bobbleheads.categoriesByCollection(
          async () => {
            const context = this.getUserContext(userId, dbInstance);
            return await BobbleheadsDashboardQuery.getCategoriesAsync(collectionSlug, context);
          },
          collectionSlug,
          userId,
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
