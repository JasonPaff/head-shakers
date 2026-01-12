import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type {
  BobbleheadListRecord,
  BrowseCategoriesResult,
  BrowseCollectionsResult,
  CategoryRecord,
  CollectionRecord,
  CollectionWithRelations,
} from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { BrowseCategoriesInput } from '@/lib/validations/browse-categories.validation';
import type { BrowseCollectionsInput } from '@/lib/validations/browse-collections.validation';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { CACHE_ENTITY_TYPE, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { UsersFacade } from '@/lib/facades/users/users.facade';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

export interface CollectionMetrics {
  featuredBobbleheads: number;
  lastUpdated: Date;
  totalBobbleheads: number;
  viewCount?: number;
  viewStats?: {
    anonymousViews: number;
    authenticatedViews: number;
    averageViewDuration: null | number;
    totalViews: number;
    uniqueViewers: number;
  };
}

export type PublicCollection = Awaited<ReturnType<typeof CollectionsFacade.getCollectionForPublicViewAsync>>;

const facadeName = 'CollectionsFacade';

export class CollectionsFacade extends BaseFacade {
  /**
   * Browse collections by category with filtering, sorting, and pagination.
   *
   * Cache behavior: Uses CacheService.collections.public with MEDIUM TTL (30 min).
   * Invalidated by: collection creates, updates, deletes.
   *
   * @param input - Browse categories input with filters, sorting, and pagination
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Paginated browse categories result with collections and pagination info
   */
  static async browseCategoriesAsync(
    input: BrowseCategoriesInput,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<BrowseCategoriesResult> {
    return executeFacadeOperation(
      {
        data: {
          hasCategory: Boolean(input.filters?.category),
          hasQuery: Boolean(input.filters?.query),
          page: input.pagination?.page,
        },
        facade: facadeName,
        method: 'browseCategoriesAsync',
        operation: OPERATIONS.COLLECTIONS.BROWSE_CATEGORIES,
        userId: viewerUserId,
      },
      async () => {
        const inputHash = createHashFromObject(input);
        return CacheService.collections.public(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            const result = await CollectionsQuery.getBrowseCategoriesAsync(input, context);

            // Transform results to include Cloudinary URLs for first bobblehead photos
            const transformedCollections = result.collections.map((record) => ({
              ...record,
              firstBobbleheadPhoto:
                record.firstBobbleheadPhoto ?
                  CloudinaryService.getOptimizedUrl(record.firstBobbleheadPhoto, {
                    crop: 'fill',
                    gravity: 'auto',
                    height: 300,
                    quality: 'auto',
                    width: 300,
                  })
                : null,
            }));

            return {
              ...result,
              collections: transformedCollections,
            };
          },
          inputHash,
          {
            context: {
              entityType: 'collection',
              facade: facadeName,
              operation: 'browseCategoriesAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
        }),
      },
    );
  }

  /**
   * Browse collections with filtering, sorting, and pagination.
   *
   * Cache behavior: Uses CacheService.collections.public with MEDIUM TTL (30 min).
   * Invalidated by: collection creates, updates, deletes.
   *
   * @param input - Browse collections input with filters, sorting, and pagination
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Paginated browse collections result with collections and pagination info
   */
  static async browseCollectionsAsync(
    input: BrowseCollectionsInput,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<BrowseCollectionsResult> {
    return executeFacadeOperation(
      {
        data: {
          hasCategoryId: Boolean(input.filters?.categoryId),
          hasQuery: Boolean(input.filters?.query),
          page: input.pagination?.page,
        },
        facade: facadeName,
        method: 'browseCollectionsAsync',
        operation: OPERATIONS.COLLECTIONS.BROWSE,
        userId: viewerUserId,
      },
      async () => {
        const inputHash = createHashFromObject(input);
        return CacheService.collections.public(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            const result = await CollectionsQuery.getBrowseCollectionsAsync(input, context);

            // Transform results to include Cloudinary URLs for first bobblehead photos
            const transformedCollections = result.collections.map((record) => ({
              ...record,
              firstBobbleheadPhoto:
                record.firstBobbleheadPhoto ?
                  CloudinaryService.getOptimizedUrl(record.firstBobbleheadPhoto, {
                    crop: 'fill',
                    gravity: 'auto',
                    height: 300,
                    quality: 'auto',
                    width: 300,
                  })
                : null,
            }));

            return {
              ...result,
              collections: transformedCollections,
            };
          },
          inputHash,
          {
            context: {
              entityType: 'collection',
              facade: facadeName,
              operation: 'browseCollectionsAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
        }),
      },
    );
  }

  /**
   * Compute metrics with view data included.
   *
   * @param collection - Collection with relations to compute metrics for
   * @param shouldIncludeViewData - Whether to include view data in metrics
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Collection metrics with optional view data
   */
  static async computeMetricsWithViewsAsync(
    collection: CollectionWithRelations,
    shouldIncludeViewData = false,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionMetrics> {
    const baseMetrics = this.computeMetrics(collection);

    if (!shouldIncludeViewData) {
      return baseMetrics;
    }

    try {
      const [viewCount, viewStats] = await Promise.all([
        this.getCollectionViewCountAsync(collection.id, true, viewerUserId, dbInstance),
        this.getCollectionViewStatsAsync(
          collection.id,
          { includeAnonymous: true, timeframe: 'month' },
          viewerUserId,
          dbInstance,
        ),
      ]);

      return {
        ...baseMetrics,
        viewCount,
        viewStats,
      };
    } catch (error) {
      // Log warning but don't fail - return base metrics
      captureFacadeWarning(error, facadeName, 'computeMetricsWithViewsAsync', {
        collectionId: collection.id,
      });
      return baseMetrics;
    }
  }

  /**
   * Create a new collection.
   *
   * Cache behavior: Invalidates user collections cache after creation.
   *
   * @param collection - Collection data to create
   * @param userId - User ID of the collection owner
   * @param dbInstance - Optional database executor for transactions
   * @returns The created collection record, or null if creation failed
   */
  static async createCollectionAsync(
    collection: InsertCollection,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionRecord | null> {
    return executeFacadeOperation(
      {
        data: { name: collection.name },
        facade: facadeName,
        method: 'createCollectionAsync',
        operation: OPERATIONS.COLLECTIONS.CREATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        const existingSlugs = await CollectionsQuery.getCollectionSlugsByUserIdAsync(userId, context);

        const baseSlug = generateSlug(collection.name);
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

        const newCollection = await CollectionsQuery.createCollectionAsync(
          { ...collection, slug: uniqueSlug },
          userId,
          context,
        );

        if (newCollection) {
          invalidateMetadataCache(CACHE_ENTITY_TYPE.COLLECTION, newCollection.id);
          // Revalidate user's dashboard with their username
          const user = await UsersFacade.getUserByIdAsync(userId);
          if (user?.username) {
            revalidatePath(
              $path({
                route: '/user/[username]/dashboard/collection',
                routeParams: { username: user.username },
              }),
            );
          }
          CacheRevalidationService.collections.onCreate(newCollection.id, userId, newCollection.slug);
        }

        return newCollection;
      },
      {
        includeResultSummary: (result) => ({
          id: result?.id,
          slug: result?.slug,
        }),
      },
    );
  }

  /**
   * Delete a collection.
   *
   * Cache behavior: Invalidates collection caches after deletion.
   * Also cleans up cover photo from Cloudinary (non-blocking).
   *
   * @param collection - Collection data with ID to delete
   * @param userId - User ID of the collection owner
   * @param dbInstance - Optional database executor for transactions
   * @returns The deleted collection record, or null if not found
   */
  static async deleteAsync(
    collection: DeleteCollection,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionRecord | null> {
    return executeFacadeOperation(
      {
        data: { collectionId: collection.collectionId },
        facade: facadeName,
        method: 'deleteAsync',
        operation: OPERATIONS.COLLECTIONS.DELETE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);
        const deletedCollection = await CollectionsQuery.deleteAsync(collection, userId, context);

        if (!deletedCollection) {
          return null;
        }

        // Non-blocking cleanup of cover photo from Cloudinary
        if (deletedCollection.coverImageUrl) {
          try {
            const publicId = CloudinaryService.extractPublicIdFromUrl(deletedCollection.coverImageUrl);
            if (publicId) {
              await CloudinaryService.deletePhotosFromCloudinary([publicId]);
            }
          } catch (cloudinaryError) {
            // Log the error but don't fail the deletion operation
            captureFacadeWarning(cloudinaryError, facadeName, 'cloudinary-cleanup', {
              collectionId: deletedCollection.id,
            });
          }
        }

        invalidateMetadataCache(CACHE_ENTITY_TYPE.COLLECTION, deletedCollection.id);
        // Revalidate user's dashboard with their username
        const user = await UsersFacade.getUserByIdAsync(userId);
        if (user?.username) {
          revalidatePath(
            $path({
              route: '/user/[username]/dashboard/collection',
              routeParams: { username: user.username },
            }),
          );
        }
        CacheRevalidationService.collections.onDelete(deletedCollection.id, userId);

        return deletedCollection;
      },
      {
        includeResultSummary: (result) => ({
          deleted: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get all bobbleheads in a collection with photos and like data.
   *
   * Cache behavior: Uses CacheService.bobbleheads.byCollection with MEDIUM TTL.
   * Invalidated by: bobblehead changes, photo changes.
   *
   * @param collectionId - Collection ID to get bobbleheads from
   * @param viewerUserId - Optional viewer user ID for like status
   * @param options - Optional search and sort options
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of bobbleheads with photos and like data
   */
  static async getAllCollectionBobbleheadsWithPhotosAsync(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance: DatabaseExecutor = db,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
      }
    >
  > {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'getAllCollectionBobbleheadsWithPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.FIND_BY_COLLECTION,
        userId: viewerUserId,
      },
      async () => {
        const optionsHash = createHashFromObject({ all: true, options, photos: true, viewerUserId });
        return CacheService.bobbleheads.byCollection(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            const bobbleheads = await CollectionsQuery.getAllCollectionBobbleheadsWithPhotosAsync(
              collectionId,
              context,
              options,
            );

            if (bobbleheads.length === 0) {
              return bobbleheads;
            }

            const bobbleheadIds = bobbleheads.map((b) => b.id);
            const likesMap = await SocialFacade.getLikesForMultipleContentItemsAsync(
              bobbleheadIds,
              'bobblehead',
              viewerUserId,
              dbInstance,
            );

            return bobbleheads.map((bobblehead) => ({
              ...bobblehead,
              likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null },
            }));
          },
          collectionId,
          optionsHash,
          {
            context: {
              entityId: collectionId,
              entityType: 'collection',
              facade: facadeName,
              operation: 'getAllBobbleheadsWithPhotos',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get a collection by ID.
   *
   * Cache behavior: Uses CacheService.collections.byId with LONG TTL (1 hour).
   * Invalidated by: collection updates, deletes.
   *
   * @param collectionId - Collection ID to retrieve
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns The collection record, or null if not found
   */
  static async getByIdAsync(
    collectionId: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionRecord | null> {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'getByIdAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.collections.byId(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return await CollectionsQuery.getByIdAsync(collectionId, context);
          },
          collectionId,
          {
            context: {
              entityId: collectionId,
              entityType: CACHE_ENTITY_TYPE.COLLECTION,
              facade: facadeName,
              operation: 'getById',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get all distinct categories with counts.
   *
   * Cache behavior: Uses CacheService.collections.public with MEDIUM TTL.
   * Invalidated by: collection category changes.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of category records with counts
   */
  static async getCategoriesAsync(dbInstance: DatabaseExecutor = db): Promise<Array<CategoryRecord>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getCategoriesAsync',
        operation: OPERATIONS.COLLECTIONS.GET_CATEGORIES,
      },
      async () => {
        return CacheService.collections.public(
          async () => {
            const context = this.getPublicContext(dbInstance);
            return await CollectionsQuery.getDistinctCategoriesAsync(context);
          },
          'categories',
          {
            context: {
              entityType: 'collection',
              facade: facadeName,
              operation: 'getCategoriesAsync',
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get bobbleheads in a collection (basic list).
   *
   * Cache behavior: Uses CacheService.bobbleheads.byCollection with MEDIUM TTL.
   * Invalidated by: bobblehead changes.
   *
   * @param collectionId - Collection ID to get bobbleheads from
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of bobblehead list records
   */
  static async getCollectionBobbleheadsAsync(
    collectionId: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<BobbleheadListRecord>> {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'getCollectionBobbleheadsAsync',
        operation: OPERATIONS.BOBBLEHEADS.FIND_BY_COLLECTION,
        userId: viewerUserId,
      },
      async () => {
        const optionsHash = createHashFromObject({ scope: 'basic', viewerUserId });
        return CacheService.bobbleheads.byCollection(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return CollectionsQuery.getBobbleheadsInCollectionAsync(collectionId, context);
          },
          collectionId,
          optionsHash,
          {
            context: {
              entityId: collectionId,
              entityType: 'collection',
              facade: facadeName,
              operation: 'getBobbleheads',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get bobbleheads in a collection with photos and like data.
   *
   * Cache behavior: Uses CacheService.bobbleheads.byCollection with MEDIUM TTL.
   * Invalidated by: bobblehead changes, photo changes.
   *
   * @param collectionId - Collection ID to get bobbleheads from
   * @param viewerUserId - Optional viewer user ID for like status
   * @param options - Optional search and sort options
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of bobbleheads with photos and like data
   */
  static async getCollectionBobbleheadsWithPhotosAsync(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance: DatabaseExecutor = db,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
      }
    >
  > {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'getCollectionBobbleheadsWithPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.FIND_BY_COLLECTION,
        userId: viewerUserId,
      },
      async () => {
        const optionsHash = createHashFromObject({ options, photos: true, viewerUserId });
        return CacheService.bobbleheads.byCollection(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            const bobbleheads = await CollectionsQuery.getCollectionBobbleheadsWithPhotosAsync(
              collectionId,
              context,
              options,
            );

            if (bobbleheads.length === 0) {
              return bobbleheads;
            }

            const bobbleheadIds = bobbleheads.map((b) => b.id);
            const likesMap = await SocialFacade.getLikesForMultipleContentItemsAsync(
              bobbleheadIds,
              'bobblehead',
              viewerUserId,
              dbInstance,
            );

            return bobbleheads.map((bobblehead) => ({
              ...bobblehead,
              likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null },
            }));
          },
          collectionId,
          optionsHash,
          {
            context: {
              entityId: collectionId,
              entityType: 'collection',
              facade: facadeName,
              operation: 'getBobbleheadsWithPhotos',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get a collection by slug.
   *
   * @param slug - Collection slug
   * @param userId - Owner user ID
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns The collection record, or null if not found
   */
  static async getCollectionBySlugAsync(
    slug: string,
    userId: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionRecord | null> {
    return executeFacadeOperation(
      {
        data: { slug, userId },
        facade: facadeName,
        method: 'getCollectionBySlugAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        const context = this.getViewerContext(viewerUserId, dbInstance);
        return CollectionsQuery.findBySlugAsync(slug, userId, context);
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get a collection by slug with relations.
   *
   * @param slug - Collection slug
   * @param userId - Owner user ID
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns The collection with relations, or null if not found
   */
  static async getCollectionBySlugWithRelationsAsync(
    slug: string,
    userId: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionWithRelations | null> {
    return executeFacadeOperation(
      {
        data: { slug, userId },
        facade: facadeName,
        method: 'getCollectionBySlugWithRelationsAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        const context = this.getViewerContext(viewerUserId, dbInstance);
        return CollectionsQuery.findBySlugWithRelationsAsync(slug, userId, context);
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadCount: result?.bobbleheads.length ?? 0,
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get a collection formatted for public view.
   *
   * @param id - Collection ID
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Public collection data, or null if not found
   */
  static async getCollectionForPublicViewAsync(
    id: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ) {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getCollectionForPublicViewAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        const collection = await this.getCollectionWithRelationsAsync(id, viewerUserId, dbInstance);

        if (!collection) {
          return null;
        }

        const metrics = this.computeMetrics(collection);

        return {
          coverImageUrl: collection.coverImageUrl,
          createdAt: collection.createdAt,
          description: collection.description,
          id: collection.id,
          isPublic: collection.isPublic,
          lastUpdatedAt: metrics.lastUpdated,
          name: collection.name,
          slug: collection.slug,
          totalBobbleheadCount: metrics.totalBobbleheads,
          userId: collection.userId,
        };
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get collections by user.
   *
   * Cache behavior: Uses CacheService.collections.byUser with MEDIUM TTL.
   * Invalidated by: collection creates, updates, deletes for user.
   *
   * @param userId - Owner user ID
   * @param options - Optional find options (limit, offset, sort)
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of collection records
   */
  static async getCollectionsByUserAsync(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<CollectionRecord>> {
    return executeFacadeOperation(
      {
        data: { userId },
        facade: facadeName,
        method: 'getCollectionsByUserAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_USER,
        userId: viewerUserId ?? userId,
      },
      async () => {
        const optionsHash = createHashFromObject({ options, viewerUserId });
        return CacheService.collections.byUser(
          () => {
            const context = this.getOwnerOrViewerContext(userId, viewerUserId, dbInstance);
            return CollectionsQuery.findByUserAsync(userId, options, context);
          },
          userId,
          optionsHash,
          {
            context: { entityType: 'collection', facade: facadeName, operation: 'findByUser', userId },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get collection metadata for SEO and social sharing.
   * Returns minimal collection information optimized for metadata generation.
   *
   * Cache behavior: Uses CacheService.collections.byId with custom TTL (30 min).
   * Invalidated by: collection updates (name, description, cover image),
   * bobblehead count changes, owner profile updates, visibility changes.
   *
   * @param slug - Collection's unique slug
   * @param userId - Owner's user ID
   * @param dbInstance - Optional database instance for transactions
   * @returns Collection metadata or null if not found
   */
  static async getCollectionSeoMetadataAsync(
    slug: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | {
    coverImage: null | string;
    description: null | string;
    isPublic: boolean;
    itemCount: number;
    name: string;
    owner: {
      username: string;
    };
    slug: string;
  }> {
    return executeFacadeOperation(
      {
        data: { slug, userId },
        facade: facadeName,
        method: 'getCollectionSeoMetadataAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId,
      },
      async () => {
        return CacheService.collections.byId(
          () => {
            const context = this.getPublicContext(dbInstance);
            return CollectionsQuery.getCollectionMetadataAsync(slug, userId, context);
          },
          `${userId}:${slug}`,
          {
            context: {
              entityType: 'collection',
              facade: facadeName,
              operation: 'getSeoMetadata',
              userId,
            },
            ttl: 1800, // 30 minutes - balance between freshness and performance
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          itemCount: result?.itemCount,
        }),
      },
    );
  }

  /**
   * Get the view count for a collection.
   *
   * @param collectionId - Collection ID
   * @param shouldIncludeAnonymous - Whether to include anonymous views
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor for transactions
   * @returns View count
   */
  static async getCollectionViewCountAsync(
    collectionId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<number> {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'getCollectionViewCountAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getViewCountAsync(
          'collection',
          collectionId,
          shouldIncludeAnonymous,
          viewerUserId,
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          viewCount: result,
        }),
      },
    );
  }

  /**
   * Get view statistics for a collection.
   *
   * @param collectionId - Collection ID
   * @param options - View stats options
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor for transactions
   * @returns View statistics
   */
  static async getCollectionViewStatsAsync(
    collectionId: string,
    options?: {
      includeAnonymous?: boolean;
      timeframe?: 'day' | 'hour' | 'month' | 'week' | 'year';
    },
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ) {
    return executeFacadeOperation(
      {
        data: { collectionId, timeframe: options?.timeframe },
        facade: facadeName,
        method: 'getCollectionViewStatsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getViewStatsAsync(
          'collection',
          collectionId,
          options,
          viewerUserId,
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          totalViews: result.totalViews,
          uniqueViewers: result.uniqueViewers,
        }),
      },
    );
  }

  /**
   * Get a collection with relations.
   *
   * Cache behavior: Uses CacheService.collections.withRelations with LONG TTL.
   * Invalidated by: collection updates, bobblehead changes.
   *
   * @param id - Collection ID
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database executor for transactions
   * @returns The collection with relations, or null if not found
   */
  static async getCollectionWithRelationsAsync(
    id: string,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionWithRelations | null> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getCollectionWithRelationsAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.collections.withRelations(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return CollectionsQuery.findByIdWithRelationsAsync(id, context);
          },
          id,
          {
            context: {
              entityId: id,
              entityType: 'collection',
              facade: facadeName,
              operation: 'getWithRelations',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadCount: result?.bobbleheads.length ?? 0,
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Check if collection name is available for user (case-insensitive).
   *
   * @param name - Collection name to check
   * @param userId - User ID to check against
   * @param excludeCollectionId - Optional collection ID to exclude (for updates)
   * @param dbInstance - Optional database instance for transactions
   * @returns True if name is available, false if already taken
   */
  static async getIsCollectionNameAvailableAsync(
    name: string,
    userId: string,
    excludeCollectionId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    return executeFacadeOperation(
      {
        data: { excludeCollectionId, name },
        facade: facadeName,
        method: 'getIsCollectionNameAvailableAsync',
        operation: OPERATIONS.COLLECTIONS.GET_BY_ID,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);
        const exists = await CollectionsQuery.getIsCollectionNameAvailableAsync(
          name,
          userId,
          context,
          excludeCollectionId,
        );
        return !exists;
      },
      {
        includeResultSummary: (result) => ({
          isAvailable: result,
        }),
      },
    );
  }

  /**
   * Get trending collections based on view data.
   *
   * @param options - Trending options (limit, timeframe, includeAnonymous)
   * @param viewerUserId - Optional viewer user ID
   * @param dbInstance - Optional database executor for transactions
   * @returns Trending content data
   */
  static async getTrendingCollectionsAsync(
    options?: {
      includeAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    },
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ) {
    return executeFacadeOperation(
      {
        data: { limit: options?.limit, timeframe: options?.timeframe },
        facade: facadeName,
        method: 'getTrendingCollectionsAsync',
        operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getTrendingContentAsync('collection', options, viewerUserId, dbInstance);
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Record a view for a collection.
   *
   * @param collectionId - Collection ID
   * @param viewerUserId - Optional viewer user ID
   * @param metadata - View metadata (IP, user agent, referrer, duration)
   * @param dbInstance - Optional database executor for transactions
   * @returns View recording result
   */
  static async recordCollectionViewAsync(
    collectionId: string,
    viewerUserId?: string,
    metadata?: {
      ipAddress?: string;
      referrerUrl?: string;
      userAgent?: string;
      viewDuration?: number;
    },
    dbInstance: DatabaseExecutor = db,
  ) {
    return executeFacadeOperation(
      {
        data: { collectionId },
        facade: facadeName,
        method: 'recordCollectionViewAsync',
        operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.recordViewAsync(
          {
            ipAddress: metadata?.ipAddress,
            referrerUrl: metadata?.referrerUrl,
            targetId: collectionId,
            targetType: 'collection',
            userAgent: metadata?.userAgent,
            viewDuration: metadata?.viewDuration,
            viewerId: viewerUserId,
          },
          viewerUserId,
          {
            deduplicationWindow: 300, // 5 minutes
            shouldRespectPrivacySettings: true,
          },
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          isRecorded: result !== null,
          viewId: result?.id,
        }),
      },
    );
  }

  /**
   * Update a collection.
   *
   * Cache behavior: Invalidates collection caches after update.
   *
   * @param data - Update data with collection ID
   * @param userId - User ID of the collection owner
   * @param dbInstance - Optional database executor for transactions
   * @returns The updated collection record, or null if not found or name conflict
   */
  static async updateAsync(
    data: UpdateCollection,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CollectionRecord | null> {
    return executeFacadeOperation(
      {
        data: { collectionId: data.collectionId },
        facade: facadeName,
        method: 'updateAsync',
        operation: OPERATIONS.COLLECTIONS.UPDATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);

        const updateData: UpdateCollection & { slug?: string } = { ...data };

        // If name is being updated, regenerate slug
        if (data.name) {
          // Check name uniqueness (excluding current collection)
          const isNameAvailable = await this.getIsCollectionNameAvailableAsync(
            data.name,
            userId,
            data.collectionId,
            dbInstance,
          );
          if (!isNameAvailable) {
            return null;
          }

          const baseSlug = generateSlug(data.name);

          // Get existing slugs via query layer
          const existingSlugs = await CollectionsQuery.getCollectionSlugsByUserIdAsync(userId, context);
          // Filter out current collection's slug for uniqueness check
          const filteredSlugs = existingSlugs.filter((slug) => slug !== data.collectionId);

          updateData.slug = ensureUniqueSlug(baseSlug, filteredSlugs);
        }

        const updatedCollection = await CollectionsQuery.updateAsync(updateData, userId, context);

        if (updatedCollection) {
          invalidateMetadataCache(CACHE_ENTITY_TYPE.COLLECTION, updatedCollection.id);
          // Revalidate user's dashboard with their username
          const user = await UsersFacade.getUserByIdAsync(userId);
          if (user?.username) {
            revalidatePath(
              $path({
                route: '/user/[username]/dashboard/collection',
                routeParams: { username: user.username },
              }),
            );
          }
          CacheRevalidationService.collections.onUpdate(updatedCollection.id, userId);
        }

        return updatedCollection;
      },
      {
        includeResultSummary: (result) => ({
          id: result?.id,
          updated: result !== null,
        }),
      },
    );
  }

  /**
   * Compute metrics from collection with relations.
   * @private
   */
  private static computeMetrics(collection: CollectionWithRelations): CollectionMetrics {
    // Count featured bobbleheads
    const featuredBobbleheads = collection.bobbleheads.filter((b) => b.isFeatured).length;

    // Find the most recent update
    const lastUpdated = collection.updatedAt;

    return {
      featuredBobbleheads,
      lastUpdated,
      totalBobbleheads: collection.bobbleheads.length,
    };
  }
}
