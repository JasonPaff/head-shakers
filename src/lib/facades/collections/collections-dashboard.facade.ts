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
  /**
   * Get bobbleheads for a collection with pagination support.
   * Returns bobbleheads, collection ID, and pagination metadata.
   *
   * Caching: Data and count use separate cache keys for optimal reuse.
   * - Data cache: Includes page/pageSize in options hash
   * - Count cache: Excludes pagination params, reused across pages
   *
   * @param collectionSlug - The collection slug identifier
   * @param userId - The user ID for permission context
   * @param options - Optional query options (filters, pagination, search)
   * @param dbInstance - Optional database instance for transaction support
   * @returns Bobblehead list with pagination metadata
   */
  static async getBobbleheadListByCollectionSlugAsync(
    collectionSlug: string,
    userId: string,
    options?: BobbleheadDashboardQueryOptions,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{
    bobbleheads: Array<BobbleheadDashboardListRecord>;
    collectionId: string;
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
    };
  }> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getBobbleheadListByCollectionSlugAsync',
        operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEAD_LIST_BY_COLLECTION_SLUG,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        // Create separate hashes for data and count caching
        // Data hash includes pagination for page-specific cache keys
        const paginatedOptionsHash = createHashFromObject({
          category: options?.category,
          condition: options?.condition,
          featured: options?.featured,
          page: options?.page,
          pageSize: options?.pageSize,
          photos: true,
          searchTerm: options?.searchTerm,
          userId,
        });

        // Count hash excludes pagination for reuse across pages
        const filtersHash = createHashFromObject({
          category: options?.category,
          condition: options?.condition,
          featured: options?.featured,
          searchTerm: options?.searchTerm,
          userId,
        });

        // Execute data and count queries in parallel with separate caching
        const [dataResult, totalCount] = await Promise.all([
          CacheService.bobbleheads.byCollection(
            async () => {
              const bobbleheads = await BobbleheadsDashboardQuery.getListAsync(
                collectionSlug,
                context,
                options,
              );

              return { bobbleheads, collectionId: bobbleheads[0]?.collectionId ?? 'unknown' };
            },
            collectionSlug,
            paginatedOptionsHash,
            {
              context: {
                entityId: collectionSlug,
                entityType: CACHE_ENTITY_TYPE.BOBBLEHEAD,
                facade,
                operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_BOBBLEHEAD_LIST_BY_COLLECTION_SLUG,
                userId,
              },
            },
          ),
          CacheService.bobbleheads.countByCollection(
            async () => {
              return await BobbleheadsDashboardQuery.getCountAsync(collectionSlug, context, {
                category: options?.category,
                condition: options?.condition,
                featured: options?.featured,
                searchTerm: options?.searchTerm,
              });
            },
            collectionSlug,
            filtersHash,
            {
              context: {
                entityId: collectionSlug,
                entityType: CACHE_ENTITY_TYPE.BOBBLEHEAD,
                facade,
                operation: 'count-by-collection',
                userId,
              },
            },
          ),
        ]);

        // Calculate pagination metadata
        const page = options?.page ?? 1;
        const pageSize = options?.pageSize ?? 24;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
          bobbleheads: dataResult.bobbleheads,
          collectionId: dataResult.collectionId,
          pagination: {
            currentPage: page,
            pageSize,
            totalCount,
            totalPages,
          },
        };
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
