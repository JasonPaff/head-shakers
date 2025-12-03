import type {
  BobbleheadDashboardListRecord,
  BobbleheadDashboardQueryOptions,
} from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { BobbleheadsDashboardQuery } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facade = 'bobbleheads_dashboard_facade';

export class BobbleheadsDashboardFacade extends BaseFacade {
  static async getCategoriesByCollectionSlugAsync(
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
            return await BobbleheadsDashboardQuery.getCategoriesByCollectionSlugAsync(
              collectionSlug,
              context,
            );
          },
          collectionSlug,
          userId,
        );
      },
    );
  }

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
  static async getListByCollectionSlugAsync(
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
}
