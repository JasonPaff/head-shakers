import * as Sentry from '@sentry/nextjs';
import { eq } from 'drizzle-orm';

import type { bobbleheadPhotos } from '@/lib/db/schema';
import type { FindOptions } from '@/lib/queries/base/query-context';
import type {
  AdjacentBobblehead,
  BobbleheadRecord,
  BobbleheadWithRelations,
} from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { BobbleheadNavigationDataSchema } from '@/lib/validations/bobblehead-navigation.validation';
import type {
  DeleteBobblehead,
  DeleteBobbleheadPhoto,
  InsertBobblehead,
  InsertBobbleheadPhoto,
  ReorderBobbleheadPhotos,
  UpdateBobblehead,
  UpdateBobbleheadPhotoMetadata,
} from '@/lib/validations/bobbleheads.validation';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { bobbleheadCollections, bobbleheads } from '@/lib/db/schema';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createFacadeCacheKey, createHashFromObject } from '@/lib/utils/cache.utils';
import { createFacadeError } from '@/lib/utils/error-builders';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

const facadeName = 'BobbleheadsFacade';

export class BobbleheadsFacade {
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance?: DatabaseExecutor) {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.addPhotoAsync(data, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, url: data.url },
        facade: facadeName,
        method: 'addPhotoAsync',
        operation: 'addPhoto',
      };
      throw createFacadeError(context, error);
    }
  }

  static async createAsync(
    data: InsertBobblehead & { collectionIds: Array<string> },
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // generate slug from name
        const baseSlug = generateSlug(data.name);

        // query all existing bobblehead slugs to check for collisions
        const existingSlugs = await tx
          .select({ slug: bobbleheads.slug })
          .from(bobbleheads)
          .then((results) => results.map((r) => r.slug));

        // ensure slug is unique across all bobbleheads
        const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

        // extract collectionIds and remove from data for bobblehead insert
        const { collectionIds, ...bobbleheadData } = data;

        // create bobblehead with unique slug
        const createdBobblehead = await BobbleheadsQuery.createAsync(
          { ...bobbleheadData, slug: uniqueSlug },
          userId,
          context,
        );

        if (!createdBobblehead) {
          return null;
        }

        // insert junction table entries for each collection
        if (collectionIds.length > 0) {
          await tx.insert(bobbleheadCollections).values(
            collectionIds.map((collectionId) => ({
              bobbleheadId: createdBobblehead.id,
              collectionId,
            })),
          );
        }

        // invalidate cache for all affected collections
        for (const collectionId of collectionIds) {
          CacheRevalidationService.bobbleheads.onCreate(
            createdBobblehead.id,
            userId,
            collectionId,
            createdBobblehead.slug,
          );
        }

        // add breadcrumb on success
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            bobbleheadId: createdBobblehead.id,
            collectionCount: collectionIds.length,
            operation: 'create',
            userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Created bobblehead ${createdBobblehead.id} with ${collectionIds.length} collection(s)`,
        });

        return createdBobblehead;
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { manufacturer: data.manufacturer, name: data.name },
        facade: facadeName,
        method: 'createAsync',
        operation: OPERATIONS.BOBBLEHEADS.CREATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // get collection associations before deletion for cache invalidation
        const associations = await tx
          .select({ collectionId: bobbleheadCollections.collectionId })
          .from(bobbleheadCollections)
          .where(eq(bobbleheadCollections.bobbleheadId, data.bobbleheadId));

        const collectionIds = associations.map((a) => a.collectionId);

        // get bobblehead and photos, then delete from the database
        const deleteResult = await BobbleheadsQuery.deleteAsync(data, userId, context);

        const { bobblehead, photos } = deleteResult;

        if (!bobblehead) {
          return null;
        }

      // attempt to clean up photos from Cloudinary (non-blocking)
      if (photos && photos.length > 0) {
        try {
          const photoUrls = photos.map((photo) => photo.url);
          const deletionResults = await CloudinaryService.deletePhotosByUrls(photoUrls);

          const successfulDeletions = deletionResults.filter((result) => result.success).length;
          const failedDeletions = deletionResults.filter((result) => !result.success);

          if (successfulDeletions > 0) {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: { bobbleheadId: bobblehead.id, count: successfulDeletions },
              level: SENTRY_LEVELS.INFO,
              message: `Successfully deleted ${successfulDeletions} photos from Cloudinary`,
            });
          }

          if (failedDeletions.length > 0) {
            Sentry.addBreadcrumb({
              category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
              data: { bobbleheadId: bobblehead.id, count: failedDeletions.length, failures: failedDeletions },
              level: SENTRY_LEVELS.WARNING,
              message: `Failed to delete ${failedDeletions.length} photos from Cloudinary`,
            });
          }
        } catch (error) {
          // don't fail the entire operation if Cloudinary cleanup fails
          Sentry.captureException(error, {
            extra: { bobbleheadId: bobblehead.id, operation: 'cloudinary-cleanup' },
            level: 'warning',
          });
        }
      }

        // remove tag associations
        const wasTagRemovalSuccessful = await TagsFacade.removeAllFromBobblehead(bobblehead.id, userId);

        if (!wasTagRemovalSuccessful) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { bobbleheadId: bobblehead.id },
            level: SENTRY_LEVELS.WARNING,
            message: 'Failed to remove tags during bobblehead deletion',
          });
        }

        // invalidate cache for all affected collections
        for (const collectionId of collectionIds) {
          CacheRevalidationService.bobbleheads.onDelete(bobblehead.id, userId, collectionId, bobblehead.slug);
        }

        // add breadcrumb on success
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            bobbleheadId: bobblehead.id,
            collectionCount: collectionIds.length,
            operation: 'delete',
            userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Deleted bobblehead ${bobblehead.id} from ${collectionIds.length} collection(s)`,
        });

        return bobblehead;
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId },
        facade: facadeName,
        method: 'deleteAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * delete a photo from database and Cloudinary
   */
  static async deletePhotoAsync(
    data: DeleteBobbleheadPhoto,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // delete from database first
      const deletedPhoto = await BobbleheadsQuery.deletePhotoAsync(data, userId, context);

      if (!deletedPhoto) {
        return null;
      }

      // attempt to clean up photo from Cloudinary (non-blocking)
      try {
        const deletionResults = await CloudinaryService.deletePhotosByUrls([deletedPhoto.url]);
        const failedDeletions = deletionResults.filter((result) => !result.success);

        if (failedDeletions.length > 0) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { failures: failedDeletions, photoId: deletedPhoto.id },
            level: SENTRY_LEVELS.WARNING,
            message: 'Failed to delete photo from Cloudinary',
          });
        }
      } catch (error) {
        // don't fail the entire operation if Cloudinary cleanup fails
        Sentry.captureException(error, {
          extra: { operation: 'cloudinary-cleanup', photoId: deletedPhoto.id },
          level: 'warning',
        });
      }

      // invalidate caches
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'delete');

      return deletedPhoto;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facadeName,
        method: 'deletePhotoAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getBobbleheadById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return CacheService.bobbleheads.byId(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return BobbleheadsQuery.findByIdAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'bobblehead',
          facade: 'BobbleheadsFacade',
          operation: 'getById',
          userId: viewerUserId,
        },
      },
    );
  }

  static async getBobbleheadBySlug(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadBySlug',
        operation: 'getBySlug',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getBobbleheadBySlugWithRelations(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadWithRelations | null> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugWithRelationsAsync(slug, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadBySlugWithRelations',
        operation: 'getBySlugWithRelations',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get content performance metrics for multiple bobbleheads
   */
  static async getBobbleheadContentPerformanceAsync(
    bobbleheadIds: Array<string>,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getContentPerformanceAsync(
        bobbleheadIds,
        'bobblehead',
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadIds },
        facade: facadeName,
        method: 'getBobbleheadContentPerformanceAsync',
        operation: 'getContentPerformance',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get engagement metrics for multiple bobbleheads
   */
  static async getBobbleheadEngagementMetricsAsync(
    bobbleheadIds: Array<string>,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getEngagementMetricsAsync(
        bobbleheadIds,
        'bobblehead',
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadIds },
        facade: facadeName,
        method: 'getBobbleheadEngagementMetricsAsync',
        operation: 'getEngagementMetrics',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get navigation data for a bobblehead within its collection context.
   * Returns adjacent bobbleheads (previous/next) based on createdAt ordering.
   *
   * Caching: Uses MEDIUM TTL (1800 seconds / 30 minutes) with collection-based invalidation.
   *
   * @param bobbleheadId - The ID of the current bobblehead
   * @param collectionId - The ID of the collection containing the bobblehead
   * @param viewerUserId - Optional viewer user ID for permission context
   * @param dbInstance - Optional database instance for transactions
   * @returns Navigation data with previous and next bobbleheads
   */
  static async getBobbleheadNavigationData(
    bobbleheadId: string,
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadNavigationDataSchema> {
    try {
      // Create unique cache key incorporating all parameters
      const cacheKey = createFacadeCacheKey('bobblehead', 'navigation', bobbleheadId, {
        collectionId,
        viewerUserId,
      });

      // Generate cache tags for invalidation
      const cacheTags = [
        ...CacheTagGenerators.bobblehead.read(bobbleheadId, viewerUserId),
        CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId),
      ];

      return await CacheService.cached(
        async () => {
          // Create appropriate query context based on user presence
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          // Execute both queries in parallel for optimal performance
          const [adjacentResult, positionResult] = await Promise.all([
            BobbleheadsQuery.getAdjacentBobbleheadsInCollectionAsync(bobbleheadId, collectionId, context),
            BobbleheadsQuery.getBobbleheadPositionInCollectionAsync(bobbleheadId, collectionId, context),
          ]);

          // Handle edge case where position query returns null (bobblehead not found in collection)
          // Default to position 0 and count 0 to indicate no valid position
          const currentPosition = positionResult?.currentPosition ?? 0;
          const totalCount = positionResult?.totalCount ?? 0;

          // Fetch collection information
          let contextData: BobbleheadNavigationDataSchema['context'] = null;
          const collection = await CollectionsFacade.getCollectionById(collectionId, viewerUserId);
          if (collection) {
            contextData = {
              contextId: collection.id,
              contextName: collection.name,
              contextSlug: collection.slug,
              contextType: 'collection',
            };
          }

          // Transform result to match the expected schema (minimal navigation data)
          // The query now joins with bobbleheadPhotos to include the primary photo URL
          const transformBobblehead = (
            bobblehead: AdjacentBobblehead | null,
          ): BobbleheadNavigationDataSchema['nextBobblehead'] => {
            if (!bobblehead) return null;

            return {
              id: bobblehead.id,
              name: bobblehead.name,
              photoUrl: bobblehead.photoUrl,
              slug: bobblehead.slug,
            };
          };

          // Add breadcrumb for successful cache miss (data fetched)
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {
              bobbleheadId,
              collectionId,
              contextName: contextData?.contextName || null,
              contextType: contextData?.contextType || null,
              currentPosition,
              hasNext: !!adjacentResult.nextBobblehead,
              hasPrevious: !!adjacentResult.previousBobblehead,
              totalCount,
            },
            level: SENTRY_LEVELS.INFO,
            message: 'Fetched bobblehead navigation data',
          });

          return {
            context: contextData,
            currentPosition,
            nextBobblehead: transformBobblehead(adjacentResult.nextBobblehead),
            previousBobblehead: transformBobblehead(adjacentResult.previousBobblehead),
            totalCount,
          };
        },
        cacheKey,
        {
          context: {
            entityId: bobbleheadId,
            entityType: 'bobblehead',
            facade: facadeName,
            operation: 'getNavigationData',
            userId: viewerUserId,
          },
          tags: cacheTags,
          ttl: CACHE_CONFIG.TTL.MEDIUM, // 30 minutes - 1800 seconds
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { bobbleheadId, collectionId },
        facade: facadeName,
        method: 'getBobbleheadNavigationData',
        operation: 'getNavigationData',
        userId: viewerUserId,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  static async getBobbleheadPhotos(
    bobbleheadId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return CacheService.bobbleheads.photos(
        () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });
          return BobbleheadsQuery.getPhotosAsync(bobbleheadId, context);
        },
        bobbleheadId,
        {
          context: {
            entityId: bobbleheadId,
            entityType: 'bobblehead',
            facade: 'BobbleheadsFacade',
            operation: 'getPhotos',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId },
        facade: facadeName,
        method: 'getBobbleheadPhotos',
        operation: OPERATIONS.BOBBLEHEADS.GET_PHOTOS,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getBobbleheadsByCollection(
    collectionId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    try {
      const optionsHash = createHashFromObject({ options, viewerUserId });
      return CacheService.bobbleheads.byCollection(
        () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });
          return BobbleheadsQuery.findByCollectionAsync(collectionId, options, context);
        },
        collectionId,
        optionsHash,
        {
          context: {
            entityId: collectionId,
            entityType: 'collection',
            facade: 'BobbleheadsFacade',
            operation: 'findByCollection',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, options },
        facade: facadeName,
        method: 'getBobbleheadsByCollection',
        operation: OPERATIONS.BOBBLEHEADS.FIND_BY_COLLECTION,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getBobbleheadsByUser(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    try {
      const optionsHash = createHashFromObject({ options, viewerUserId });
      return CacheService.bobbleheads.byUser(
        () => {
          const context =
            viewerUserId && viewerUserId === userId ?
              createProtectedQueryContext(userId, { dbInstance })
            : createUserQueryContext(viewerUserId || userId, { dbInstance });
          return BobbleheadsQuery.findByUserAsync(userId, options, context);
        },
        userId,
        optionsHash,
        {
          context: { entityType: 'bobblehead', facade: 'BobbleheadsFacade', operation: 'findByUser', userId },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: facadeName,
        method: 'getBobbleheadsByUser',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_USER,
        userId: viewerUserId || userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get bobblehead metadata for SEO and social sharing
   * returns minimal bobblehead information optimized for metadata generation
   *
   * Cache invalidation triggers:
   * - Bobblehead updates (name, description, category)
   * - Primary image changes
   * - Owner profile updates
   *
   * @param slug - Bobblehead's unique slug
   * @param dbInstance - Optional database instance for transactions
   * @returns Bobblehead metadata or null if not found
   */
  static async getBobbleheadSeoMetadata(
    slug: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    category: null | string;
    createdAt: Date;
    description: null | string;
    name: string;
    owner: {
      username: string;
    };
    primaryImage: null | string;
    slug: string;
  }> {
    return CacheService.bobbleheads.byId(
      () => {
        const context = createPublicQueryContext({ dbInstance });
        return BobbleheadsQuery.getBobbleheadMetadata(slug, context);
      },
      slug,
      {
        context: {
          entityType: 'bobblehead',
          facade: 'BobbleheadsFacade',
          operation: 'getSeoMetadata',
        },
        ttl: 1800, // 30 minutes - balance between freshness and performance
      },
    );
  }

  /**
   * Get view count for a bobblehead
   */
  static async getBobbleheadViewCountAsync(
    bobbleheadId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<number> {
    try {
      return await ViewTrackingFacade.getViewCountAsync(
        'bobblehead',
        bobbleheadId,
        shouldIncludeAnonymous,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId },
        facade: facadeName,
        method: 'getBobbleheadViewCountAsync',
        operation: 'getViewCount',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view statistics for a bobblehead
   */
  static async getBobbleheadViewStatsAsync(
    bobbleheadId: string,
    options?: {
      includeAnonymous?: boolean;
      timeframe?: 'day' | 'hour' | 'month' | 'week' | 'year';
    },
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getViewStatsAsync(
        'bobblehead',
        bobbleheadId,
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId, options },
        facade: facadeName,
        method: 'getBobbleheadViewStatsAsync',
        operation: 'getViewStats',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getBobbleheadWithRelations(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadWithRelations | null> {
    return CacheService.bobbleheads.withRelations(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return BobbleheadsQuery.findByIdWithRelationsAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'bobblehead',
          facade: 'BobbleheadsFacade',
          operation: 'getWithRelations',
          userId: viewerUserId,
        },
      },
    );
  }

  /**
   * Get trending bobbleheads based on view data
   */
  static async getTrendingBobbleheadsAsync(
    options?: {
      includeAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    },
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.getTrendingContentAsync(
        'bobblehead',
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options },
        facade: facadeName,
        method: 'getTrendingBobbleheadsAsync',
        operation: 'getTrendingContent',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Record a view for a bobblehead
   */
  static async recordBobbleheadViewAsync(
    bobbleheadId: string,
    viewerUserId?: string,
    metadata?: {
      ipAddress?: string;
      referrerUrl?: string;
      userAgent?: string;
      viewDuration?: number;
    },
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      return await ViewTrackingFacade.recordViewAsync(
        {
          ipAddress: metadata?.ipAddress,
          referrerUrl: metadata?.referrerUrl,
          targetId: bobbleheadId,
          targetType: 'bobblehead',
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
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId },
        facade: facadeName,
        method: 'recordBobbleheadViewAsync',
        operation: 'recordView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * reorder photos by updating their sortOrder values
   */
  static async reorderPhotosAsync(
    data: ReorderBobbleheadPhotos,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // batch update all photo sortOrder values
      const updatedPhotos = await BobbleheadsQuery.batchUpdatePhotoSortOrderAsync(data, userId, context);

      // invalidate caches
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'reorder');

      return updatedPhotos;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoCount: data.photoOrder.length },
        facade: facadeName,
        method: 'reorderPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async searchBobbleheads(
    searchTerm: string,
    filters: {
      category?: string;
      collectionId?: string;
      manufacturer?: string;
      maxYear?: number;
      minYear?: number;
      status?: string;
      userId?: string;
    } = {},
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    try {
      const filtersHash = createHashFromObject(filters || {});
      return CacheService.bobbleheads.search(
        () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });
          return BobbleheadsQuery.searchAsync(searchTerm, filters, options, context);
        },
        searchTerm,
        filtersHash,
        {
          context: {
            entityType: 'search',
            facade: 'BobbleheadsFacade',
            operation: 'search',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { filters, options, searchTerm },
        facade: facadeName,
        method: 'searchBobbleheads',
        operation: OPERATIONS.BOBBLEHEADS.SEARCH,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async updateAsync(
    data: UpdateBobblehead & { collectionIds?: Array<string> },
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      return await (dbInstance ?? db).transaction(async (tx) => {
        const context = createProtectedQueryContext(userId, { dbInstance: tx });

        // verify ownership
        const existing = await tx.query.bobbleheads.findFirst({
          where: (b, { eq }) => eq(b.id, data.id),
        });

        if (!existing || existing.userId !== userId) {
          return null;
        }

        // extract collectionIds and remove from data for bobblehead update
        const { collectionIds, ...bobbleheadUpdateData } = data;

        let updateData: Omit<UpdateBobblehead, 'collectionIds'> & { slug?: string } = { ...bobbleheadUpdateData };

        // if name is being updated, check if it actually changed before regenerating slug
        if (data.name && existing.name !== data.name) {
          const baseSlug = generateSlug(data.name);

          // query existing slugs excluding current bobblehead
          const existingSlugs = await tx
            .select({ slug: bobbleheads.slug })
            .from(bobbleheads)
            .then((results) => results.map((r) => r.slug).filter((slug) => slug !== existing.slug));

          // ensure new slug is unique
          const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
          updateData = { ...updateData, slug: uniqueSlug };
        }

        // update bobblehead
        const updatedBobblehead = await BobbleheadsQuery.updateAsync(updateData, userId, context);

        if (!updatedBobblehead) {
          return null;
        }

        // handle collection changes if collectionIds are provided
        if (collectionIds !== undefined) {
          // get existing collection associations before deletion for cache invalidation
          const existingAssociations = await tx
            .select({ collectionId: bobbleheadCollections.collectionId })
            .from(bobbleheadCollections)
            .where(eq(bobbleheadCollections.bobbleheadId, updatedBobblehead.id));

          const oldCollectionIds = existingAssociations.map((a) => a.collectionId);

          // delete existing junction table entries
          await tx
            .delete(bobbleheadCollections)
            .where(eq(bobbleheadCollections.bobbleheadId, updatedBobblehead.id));

          // insert new junction table entries
          if (collectionIds.length > 0) {
            await tx.insert(bobbleheadCollections).values(
              collectionIds.map((collectionId) => ({
                bobbleheadId: updatedBobblehead.id,
                collectionId,
              })),
            );
          }

          // invalidate cache for all affected collections (old and new)
          const allAffectedCollections = [...new Set([...collectionIds, ...oldCollectionIds])];
          for (const collectionId of allAffectedCollections) {
            CacheRevalidationService.bobbleheads.onUpdate(
              updatedBobblehead.id,
              userId,
              collectionId,
              updatedBobblehead.slug,
            );
          }
        } else {
          // no collection changes, just invalidate bobblehead cache without specific collection
          CacheRevalidationService.bobbleheads.onUpdate(
            updatedBobblehead.id,
            userId,
            undefined,
            updatedBobblehead.slug,
          );
        }

        // add breadcrumb on success
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: {
            bobbleheadId: updatedBobblehead.id,
            collectionCount: collectionIds?.length,
            collectionsUpdated: collectionIds !== undefined,
            operation: 'update',
            userId,
          },
          level: SENTRY_LEVELS.INFO,
          message: `Updated bobblehead ${updatedBobblehead.id}${collectionIds !== undefined ? ` with ${collectionIds.length} collection(s)` : ''}`,
        });

        return updatedBobblehead;
      });
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id: data.id, name: data.name },
        facade: facadeName,
        method: 'updateAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * update photo metadata (altText and caption)
   */
  static async updatePhotoMetadataAsync(
    data: UpdateBobbleheadPhotoMetadata,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

      // update photo metadata
      const updatedPhoto = await BobbleheadsQuery.updatePhotoMetadataAsync(data, userId, context);

      if (!updatedPhoto) {
        return null;
      }

      // invalidate caches
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'update');

      return updatedPhoto;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facadeName,
        method: 'updatePhotoMetadataAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
