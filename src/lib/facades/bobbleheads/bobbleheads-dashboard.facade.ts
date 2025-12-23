import type {
  BobbleheadDashboardListRecord,
  BobbleheadDashboardQueryOptions,
} from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import type { BobbleheadRecord } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { CollectionSelectorRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { BobbleheadsDashboardQuery } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

export type BobbleheadForEdit = BobbleheadRecord & {
  tags: Array<{ id: string; name: string }>;
};

const facade = 'bobbleheads_dashboard_facade';

export class BobbleheadsDashboardFacade extends BaseFacade {
  /**
   * Get a bobblehead by ID for editing purposes.
   * Returns bobblehead data with tags. Photos are fetched separately client-side.
   *
   * Permission: Only the owner can fetch bobblehead for editing.
   *
   * @param bobbleheadId - The bobblehead ID to fetch
   * @param userId - The user ID (must be the owner)
   * @param dbInstance - Optional database instance for transaction support
   * @returns Bobblehead data with tags, or null if not found or not owner
   */
  static async getBobbleheadForEditAsync(
    bobbleheadId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<BobbleheadForEdit | null> {
    return await executeFacadeOperation(
      {
        data: { bobbleheadId, userId },
        facade,
        method: 'getBobbleheadForEditAsync',
        operation: OPERATIONS.BOBBLEHEADS_DASHBOARD.GET_BOBBLEHEAD_FOR_EDIT,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);
        const bobbleheadWithRelations = await BobbleheadsQuery.findByIdWithRelationsAsync(
          bobbleheadId,
          context,
        );

        // Return null if not found or user doesn't own it
        if (!bobbleheadWithRelations || bobbleheadWithRelations.userId !== userId) {
          return null;
        }

        // Return bobblehead with tags only (photos are fetched client-side)
        return {
          ...bobbleheadWithRelations,
          tags: bobbleheadWithRelations.tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
          })),
        };
      },
    );
  }

  static async getCategoriesByCollectionSlugAsync(
    collectionSlug: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<string>> {
    return await executeFacadeOperation(
      {
        data: { collectionSlug, userId },
        facade,
        method: 'getCategoriesByCollectionSlugAsync',
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
          sortBy: options?.sortBy,
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

  /**
   * Get user's collection selectors for dropdown/combobox components.
   * Returns minimal data: {id, name, slug}[] for efficient rendering.
   *
   * Caching: Uses MEDIUM TTL (30 minutes) as user collections change infrequently.
   * Cache invalidation triggers:
   * - Collection created
   * - Collection deleted
   * - Collection renamed (name/slug change)
   *
   * @param userId - The user ID to fetch collections for
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of collection selectors ordered by name
   */
  static async getUserCollectionSelectorsAsync(
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<CollectionSelectorRecord>> {
    return await executeFacadeOperation(
      {
        data: { userId },
        facade,
        method: 'getUserCollectionSelectorsAsync',
        operation: OPERATIONS.BOBBLEHEADS_DASHBOARD.GET_USER_COLLECTION_SELECTORS,
      },
      async () => {
        return CacheService.collections.selectorsByUser(
          async () => {
            const context = this.getUserContext(userId, dbInstance);
            return await CollectionsDashboardQuery.getSelectorsByUserIdAsync(context);
          },
          userId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.COLLECTION,
              facade,
              operation: OPERATIONS.BOBBLEHEADS_DASHBOARD.GET_USER_COLLECTION_SELECTORS,
              userId,
            },
          },
        );
      },
    );
  }
}
