import * as Sentry from '@sentry/nextjs';

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
import type { CloudinaryPhoto } from '@/lib/validations/photo-upload.validation';

import { CloudinaryPathBuilder, OPERATIONS } from '@/lib/constants';
import { CACHE_CONFIG } from '@/lib/constants/cache';
import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createFacadeCacheKey, createHashFromObject } from '@/lib/utils/cache.utils';
import { createFacadeError } from '@/lib/utils/error-builders';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { isTempPhoto } from '@/lib/utils/photo-transform.utils';
import {
  captureFacadeWarning,
  facadeBreadcrumb,
  trackFacadeWarning,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

const facade = 'bobbleheads_facade';

export interface CreateBobbleheadResult {
  bobblehead: BobbleheadRecord;
  collectionSlug: null | string;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
}

export class BobbleheadsFacade extends BaseFacade {
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance: DatabaseExecutor = db) {
    return await executeFacadeOperation(
      {
        data: { data },
        facade,
        method: 'addPhotoAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        return BobbleheadsQuery.addPhotoAsync(data, context);
      },
    );
  }

  /**
   * Add photos to an existing bobblehead.
   * Filters to only process new temp photos, moves them to permanent Cloudinary location,
   * and creates database records.
   *
   * Cache invalidation: Calls onPhotoChange after successful insertion.
   *
   * @param bobbleheadId - ID of the bobblehead to add photos to
   * @param collectionId - ID of the collection for the Cloudinary path
   * @param photos - Array of photos (only temp photos will be processed)
   * @param userId - User ID for the Cloudinary path and permissions
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of created photo records
   */
  static async addPhotosToExistingBobbleheadAsync(
    bobbleheadId: string,
    collectionId: string,
    photos: Array<CloudinaryPhoto>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    return await executeFacadeOperation(
      {
        data: { bobbleheadId, collectionId, photoCount: photos.length, userId },
        facade,
        method: 'addPhotosToExistingBobbleheadAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO,
      },
      async () => {
        // Filter to only process new temp photos
        const newPhotos = photos.filter(isTempPhoto);
        if (newPhotos.length === 0) {
          return [];
        }

        // Process photos (move to permanent location and create DB records)
        const uploadedPhotos = await this.processPhotosForBobbleheadAsync(
          newPhotos,
          bobbleheadId,
          collectionId,
          userId,
          dbInstance,
        );

        // Cache invalidation for photo addition
        invalidateMetadataCache('bobblehead', bobbleheadId);
        CacheRevalidationService.bobbleheads.onPhotoChange(bobbleheadId, userId, 'add');

        return uploadedPhotos;
      },
    );
  }

  static async createAsync(
    data: InsertBobblehead,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { data, userId },
        facade,
        method: 'createAsync',
        operation: OPERATIONS.BOBBLEHEADS.CREATE,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance);
        const uniqueSlug = await this.generateUniqueSlugAsync(data.name, context);

        const newBobblehead = await BobbleheadsQuery.createAsync({ ...data, slug: uniqueSlug }, context);

        if (newBobblehead) {
          this.invalidateOnCreate(newBobblehead, userId);
        }

        return newBobblehead;
      },
    );
  }

  /**
   * Create a bobblehead with optional photos.
   * Handles photo movement from temp to permanent Cloudinary location.
   * Uses transaction to ensure atomicity of bobblehead and photo creation.
   *
   * Cache invalidation: Calls invalidateOnCreate after successful commit.
   *
   * @param data - Bobblehead data to create
   * @param photos - Optional array of temp photos to process
   * @param userId - User creating the bobblehead
   * @param dbInstance - Optional database instance for transactions
   * @returns Created bobblehead with photos and collection slug
   */
  static async createWithPhotosAsync(
    data: InsertBobblehead,
    photos: Array<CloudinaryPhoto> | undefined,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<CreateBobbleheadResult | null> {
    return await executeFacadeOperation(
      {
        data: { collectionId: data.collectionId, name: data.name, userId },
        facade,
        method: 'createWithPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.CREATE_WITH_PHOTOS,
      },
      async () => {
        // TRANSACTION: Wrap bobblehead + photo creation for atomicity
        const result = await (dbInstance ?? db).transaction(async (tx) => {
          const txContext = this.getUserContext(userId, tx);

          // Generate unique slug and create bobblehead
          const uniqueSlug = await this.generateUniqueSlugAsync(data.name, txContext);
          const newBobblehead = await BobbleheadsQuery.createAsync({ ...data, slug: uniqueSlug }, txContext);

          if (!newBobblehead) {
            return null;
          }

          // Process photos within transaction
          let uploadedPhotos: Array<typeof bobbleheadPhotos.$inferSelect> = [];
          if (photos && photos.length > 0) {
            uploadedPhotos = await this.processPhotosForBobbleheadAsync(
              photos,
              newBobblehead.id,
              newBobblehead.collectionId,
              userId,
              tx,
            );
          }

          return { bobblehead: newBobblehead, photos: uploadedPhotos };
        });

        if (!result) {
          return null;
        }

        // OUTSIDE TRANSACTION: Collection lookup (read-only, non-critical for navigation)
        const collection = await CollectionsFacade.getByIdAsync(
          result.bobblehead.collectionId,
          userId,
          dbInstance,
        );
        const collectionSlug = collection?.slug ?? null;

        // CACHE INVALIDATION (after successful transaction commit)
        this.invalidateOnCreate(result.bobblehead, userId);

        facadeBreadcrumb('Created bobblehead with photos', {
          bobbleheadId: result.bobblehead.id,
          collectionSlug,
          photosCount: result.photos.length,
        });

        return {
          bobblehead: result.bobblehead,
          collectionSlug,
          photos: result.photos,
        };
      },
    );
  }

  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

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
            facadeBreadcrumb(`Successfully deleted ${successfulDeletions} photos from Cloudinary`, {
              bobbleheadId: bobblehead.id,
              count: successfulDeletions,
            });
          }

          if (failedDeletions.length > 0) {
            trackFacadeWarning(
              facade,
              'deleteAsync',
              `Failed to delete ${failedDeletions.length} photos from Cloudinary`,
              { bobbleheadId: bobblehead.id, count: failedDeletions.length, failures: failedDeletions },
            );
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
        trackFacadeWarning(facade, 'deleteAsync', 'Failed to remove tags during bobblehead deletion', {
          bobbleheadId: bobblehead.id,
        });
      }

      // Invalidate caches
      this.invalidateOnDelete(bobblehead.id, userId, bobblehead.collectionId, bobblehead.slug);

      return bobblehead;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId },
        facade: facade,
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
          trackFacadeWarning(facade, 'deletePhotoAsync', 'Failed to delete photo from Cloudinary', {
            failures: failedDeletions,
            photoId: deletedPhoto.id,
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
      invalidateMetadataCache('bobblehead', data.bobbleheadId);
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'delete');

      return deletedPhoto;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
          const collection = await CollectionsFacade.getByIdAsync(collectionId, viewerUserId);
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

          facadeBreadcrumb('Fetched bobblehead navigation data', {
            bobbleheadId,
            collectionId,
            contextName: contextData?.contextName || null,
            contextType: contextData?.contextType || null,
            currentPosition,
            hasNext: !!adjacentResult.nextBobblehead,
            hasPrevious: !!adjacentResult.previousBobblehead,
            totalCount,
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
            facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
        facade: facade,
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
      invalidateMetadataCache('bobblehead', data.bobbleheadId);
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'reorder');

      return updatedPhotos;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoCount: data.photoOrder.length },
        facade: facade,
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
        facade: facade,
        method: 'searchBobbleheads',
        operation: OPERATIONS.BOBBLEHEADS.SEARCH,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async updateAsync(
    data: UpdateBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      const dbInst = context.dbInstance ?? db;

      const updateData: UpdateBobblehead & { slug?: string } = { ...data };

      // if name is being updated, check if it actually changed before regenerating slug
      if (data.name) {
        // fetch existing bobblehead to compare name
        const existing = await dbInst.query.bobbleheads.findFirst({
          where: (b, { eq }) => eq(b.id, data.id),
        });

        // only regenerate slug if name has actually changed
        if (existing && existing.name !== data.name) {
          const baseSlug = generateSlug(data.name);

          // query existing slugs excluding current bobblehead
          const existingSlugs = await dbInst
            .select({ slug: bobbleheads.slug })
            .from(bobbleheads)
            .then((results) => results.map((r) => r.slug).filter((slug) => slug !== existing.slug));

          // ensure new slug is unique
          const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
          updateData.slug = uniqueSlug;
        }
      }

      const updatedBobblehead = await BobbleheadsQuery.updateAsync(updateData, userId, context);

      if (updatedBobblehead) {
        this.invalidateOnUpdate(updatedBobblehead, userId);
      }

      return updatedBobblehead;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id: data.id, name: data.name },
        facade: facade,
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
      invalidateMetadataCache('bobblehead', data.bobbleheadId);
      CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'update');

      return updatedPhoto;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facade,
        method: 'updatePhotoMetadataAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Generate a unique slug for a bobblehead name.
   * Ensures uniqueness across all existing slugs in the system.
   *
   * @param name - The bobblehead name to generate a slug from
   * @param context - Query context for database access
   * @returns A unique slug string
   */
  private static async generateUniqueSlugAsync(
    name: string,
    context: ReturnType<typeof createUserQueryContext>,
  ): Promise<string> {
    const existingSlugs = await BobbleheadsQuery.getSlugsAsync(context);
    return ensureUniqueSlug(generateSlug(name), existingSlugs);
  }

  // ============================================================================
  // HELPER METHODS - Cache Invalidation
  // ============================================================================

  /**
   * Insert photo records into the database.
   * Returns successfully inserted photos, filtering out any null results.
   *
   * @param records - Array of photo records to insert
   * @param context - Query context for database access
   * @returns Array of successfully inserted photo records
   */
  private static async insertPhotoRecordsAsync(
    records: Array<InsertBobbleheadPhoto>,
    context: ReturnType<typeof createUserQueryContext>,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    const results = await Promise.all(
      records.map((record) => BobbleheadsQuery.addPhotoAsync(record, context)),
    );
    return results.filter((p): p is typeof bobbleheadPhotos.$inferSelect => p !== null);
  }

  /**
   * Invalidate caches after bobblehead creation.
   * Triggers both metadata cache and tag-based cache invalidation.
   */
  private static invalidateOnCreate(bobblehead: BobbleheadRecord, userId: string): void {
    invalidateMetadataCache('bobblehead', bobblehead.id);
    CacheRevalidationService.bobbleheads.onCreate(
      bobblehead.id,
      userId,
      bobblehead.collectionId,
      bobblehead.slug,
    );
  }

  /**
   * Invalidate caches after bobblehead deletion.
   * Triggers both metadata cache and tag-based cache invalidation.
   */
  private static invalidateOnDelete(
    bobbleheadId: string,
    userId: string,
    collectionId?: string,
    slug?: string,
  ): void {
    invalidateMetadataCache('bobblehead', bobbleheadId);
    CacheRevalidationService.bobbleheads.onDelete(bobbleheadId, userId, collectionId, slug);
  }

  // ============================================================================
  // HELPER METHODS - Slug Generation
  // ============================================================================

  /**
   * Invalidate caches after bobblehead update.
   * Triggers both metadata cache and tag-based cache invalidation.
   */
  private static invalidateOnUpdate(bobblehead: BobbleheadRecord, userId: string): void {
    invalidateMetadataCache('bobblehead', bobblehead.id);
    CacheRevalidationService.bobbleheads.onUpdate(
      bobblehead.id,
      userId,
      bobblehead.collectionId,
      bobblehead.slug,
    );
  }

  // ============================================================================
  // HELPER METHODS - Photo Processing
  // ============================================================================

  /**
   * Map a CloudinaryPhoto to an InsertBobbleheadPhoto record.
   * Reusable for both primary and fallback paths.
   *
   * @param photo - The CloudinaryPhoto data
   * @param bobbleheadId - The ID of the bobblehead to attach the photo to
   * @param permanentUrl - Optional permanent URL if photo was successfully moved
   * @returns An InsertBobbleheadPhoto record ready for database insertion
   */
  private static mapPhotoToRecord(
    photo: CloudinaryPhoto,
    bobbleheadId: string,
    permanentUrl?: string,
  ): InsertBobbleheadPhoto {
    return {
      altText: photo.altText,
      bobbleheadId,
      caption: photo.caption,
      fileSize: photo.bytes,
      height: photo.height,
      isPrimary: photo.isPrimary,
      sortOrder: photo.sortOrder,
      url: permanentUrl ?? photo.url,
      width: photo.width,
    };
  }

  /**
   * Move photos from temp to permanent Cloudinary location.
   * Returns a map of publicId to new URL for successful moves.
   *
   * @param photos - Array of photos to move
   * @param permanentFolder - Target folder path in Cloudinary
   * @returns Map of original publicId to new permanent URL
   */
  private static async movePhotosToPermLocationAsync(
    photos: Array<CloudinaryPhoto>,
    permanentFolder: string,
  ): Promise<Map<string, string>> {
    const movedPhotos = await CloudinaryService.movePhotosToPermFolder(
      photos.map((p) => ({ publicId: p.publicId, url: p.url })),
      permanentFolder,
    );

    const urlMap = new Map<string, string>();
    const failedMoves: Array<string> = [];

    for (const moved of movedPhotos) {
      if (moved.oldPublicId !== moved.newPublicId) {
        urlMap.set(moved.oldPublicId, moved.newUrl);
      } else {
        failedMoves.push(moved.oldPublicId);
      }
    }

    if (failedMoves.length > 0) {
      trackFacadeWarning(
        facade,
        'movePhotosToPermLocationAsync',
        `Failed to move ${failedMoves.length} photos`,
        {
          failedCount: failedMoves.length,
        },
      );
    }

    return urlMap;
  }

  /**
   * Process photos for a bobblehead - moves from temp to permanent location and creates DB records.
   * Handles failures gracefully - will save with temp URLs as fallback if move fails.
   *
   * @param photos - Array of temp photos to process
   * @param bobbleheadId - ID of the bobblehead to attach photos to
   * @param collectionId - ID of the collection for the Cloudinary path
   * @param userId - User ID for the Cloudinary path
   * @param dbInstance - Database instance for transactions
   * @returns Array of created photo records
   */
  private static async processPhotosForBobbleheadAsync(
    photos: Array<CloudinaryPhoto>,
    bobbleheadId: string,
    collectionId: string,
    userId: string,
    dbInstance: DatabaseExecutor,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    const context = this.getUserContext(userId, dbInstance);
    const permanentFolder = CloudinaryPathBuilder.bobbleheadPath(userId, collectionId, bobbleheadId);

    try {
      // Move photos to permanent Cloudinary location
      const urlMap = await this.movePhotosToPermLocationAsync(photos, permanentFolder);

      // Create records with permanent URLs where available
      const records = photos.map((photo) =>
        this.mapPhotoToRecord(photo, bobbleheadId, urlMap.get(photo.publicId)),
      );

      return await this.insertPhotoRecordsAsync(records, context);
    } catch (error) {
      // Cloudinary move failed - fallback to saving with temp URLs
      captureFacadeWarning(error, facade, OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO, {
        bobbleheadId,
        photoCount: photos.length,
      });

      try {
        const fallbackRecords = photos.map((photo) => this.mapPhotoToRecord(photo, bobbleheadId));
        const result = await this.insertPhotoRecordsAsync(fallbackRecords, context);

        trackFacadeWarning(
          facade,
          'processPhotosForBobbleheadAsync',
          'Saved photos with temp URLs as fallback',
          {
            bobbleheadId,
            photoCount: result.length,
          },
        );

        return result;
      } catch (fallbackError) {
        // Fallback also failed - log and return empty array
        captureFacadeWarning(fallbackError, facade, OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO, {
          bobbleheadId,
          context: 'fallback-save-failed',
        });
        return [];
      }
    }
  }
}
