import type { bobbleheadPhotos } from '@/lib/db/schema';
import type { FindOptions, UserQueryContext } from '@/lib/queries/base/query-context';
import type {
  AdjacentBobblehead,
  BobbleheadRecord,
  BobbleheadWithRelations,
} from '@/lib/queries/bobbleheads/bobbleheads.query';
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
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads.query';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createFacadeCacheKey, createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { isTempPhoto } from '@/lib/utils/photo-transform.utils';
import {
  captureFacadeWarning,
  facadeBreadcrumb,
  trackFacadeWarning,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

const facadeName = 'BOBBLEHEADS_FACADE';

export interface CreateBobbleheadResult {
  bobblehead: BobbleheadRecord;
  collectionSlug: null | string;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
}

export class BobbleheadsFacade extends BaseFacade {
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
        facade: facadeName,
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
      {
        includeResultSummary: (result) => ({
          bobbleheadId,
          photoCount: result.length,
        }),
      },
    );
  }

  /**
   * Batch delete multiple bobbleheads with ownership verification.
   * Handles Cloudinary cleanup and tag removal for all deleted bobbleheads.
   *
   * Cache invalidation: Calls invalidateOnDelete for each successfully deleted bobblehead.
   *
   * @param ids - Array of bobblehead IDs to delete
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Object with count of deleted bobbleheads and array of deleted records
   */
  static async batchDeleteAsync(
    ids: Array<string>,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ count: number; deletedBobbleheads: Array<BobbleheadRecord> }> {
    return await executeFacadeOperation(
      {
        data: { count: ids.length, userId },
        facade: facadeName,
        method: 'batchDeleteAsync',
        operation: OPERATIONS.BOBBLEHEADS.BATCH_DELETE,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);

        // Delete bobbleheads and get photo URLs for cleanup
        const { deletedBobbleheads, photoUrls } = await BobbleheadsQuery.batchDeleteAsync(ids, context);

        if (deletedBobbleheads.length === 0) {
          return { count: 0, deletedBobbleheads: [] };
        }

        // Attempt to clean up photos from Cloudinary (non-blocking)
        if (photoUrls.length > 0) {
          try {
            const deletionResults = await CloudinaryService.deletePhotosByUrls(photoUrls);

            const successfulDeletions = deletionResults.filter((result) => result.success).length;
            const failedDeletions = deletionResults.filter((result) => !result.success);

            if (successfulDeletions > 0) {
              facadeBreadcrumb(`Successfully deleted ${successfulDeletions} photos from Cloudinary`, {
                count: successfulDeletions,
                totalBobbleheads: deletedBobbleheads.length,
              });
            }

            if (failedDeletions.length > 0) {
              trackFacadeWarning(
                facadeName,
                'batchDeleteAsync',
                `Failed to delete ${failedDeletions.length} photos from Cloudinary`,
                { count: failedDeletions.length, failures: failedDeletions },
              );
            }
          } catch (error) {
            // Don't fail the entire operation if Cloudinary cleanup fails
            captureFacadeWarning(error, facadeName, OPERATIONS.BOBBLEHEADS.BATCH_DELETE, {
              operation: 'cloudinary-cleanup',
              photoCount: photoUrls.length,
            });
          }
        }

        // Remove tag associations for each deleted bobblehead
        for (const bobblehead of deletedBobbleheads) {
          try {
            const wasTagRemovalSuccessful = await TagsFacade.removeAllFromBobblehead(bobblehead.id, userId);

            if (!wasTagRemovalSuccessful) {
              trackFacadeWarning(
                facadeName,
                'batchDeleteAsync',
                'Failed to remove tags during bobblehead deletion',
                {
                  bobbleheadId: bobblehead.id,
                },
              );
            }
          } catch (error) {
            // Don't fail the entire operation if tag removal fails
            captureFacadeWarning(error, facadeName, OPERATIONS.BOBBLEHEADS.BATCH_DELETE, {
              bobbleheadId: bobblehead.id,
              operation: 'tag-removal',
            });
          }
        }

        // Invalidate cache for each deleted bobblehead
        deletedBobbleheads.forEach((bobblehead) => {
          this.invalidateOnDelete(bobblehead.id, userId, bobblehead.collectionId, bobblehead.slug);
        });

        return {
          count: deletedBobbleheads.length,
          deletedBobbleheads,
        };
      },
      {
        includeResultSummary: (result) => ({
          deletedCount: result.count,
          deletedIds: result.deletedBobbleheads.map((b) => b.id),
        }),
      },
    );
  }

  /**
   * Batch update the featured status of multiple bobbleheads.
   * Requires ownership verification for all bobbleheads.
   *
   * Cache invalidation: Calls invalidateOnUpdate for each successfully updated bobblehead.
   *
   * @param ids - Array of bobblehead IDs to update
   * @param isFeatured - New featured status (true or false)
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of updated bobblehead records (only owned by user)
   */
  static async batchUpdateFeaturedAsync(
    ids: Array<string>,
    isFeatured: boolean,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    return await executeFacadeOperation(
      {
        data: { count: ids.length, isFeatured, userId },
        facade: facadeName,
        method: 'batchUpdateFeaturedAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_FEATURED,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);
        const results = await BobbleheadsQuery.batchUpdateFeaturedAsync(ids, isFeatured, context);

        // Invalidate cache for each updated bobblehead
        results.forEach((bobblehead) => {
          this.invalidateOnUpdate(bobblehead, userId);
        });

        return results;
      },
      {
        includeResultSummary: (result) => ({
          isFeatured,
          updatedCount: result.length,
          updatedIds: result.map((b) => b.id),
        }),
      },
    );
  }

  /**
   * Create a new bobblehead.
   *
   * Cache invalidation: Calls invalidateOnCreate after successful creation.
   *
   * @param data - Bobblehead data to create
   * @param userId - User ID creating the bobblehead
   * @param dbInstance - Optional database instance for transactions
   * @returns Created bobblehead record or null if creation failed
   */
  static async createAsync(
    data: InsertBobblehead,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { data, userId },
        facade: facadeName,
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
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          created: result !== null,
        }),
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
        facade: facadeName,
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
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.bobblehead.id,
          collectionSlug: result?.collectionSlug,
          created: result !== null,
          photoCount: result?.photos.length,
        }),
      },
    );
  }

  /**
   * Delete a bobblehead and its associated photos.
   * Handles Cloudinary cleanup and tag removal (non-blocking).
   *
   * Cache invalidation: Calls invalidateOnDelete after successful deletion.
   *
   * @param data - Delete parameters including bobbleheadId
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Deleted bobblehead record or null if not found/unauthorized
   */
  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { bobbleheadId: data.bobbleheadId },
        facade: facadeName,
        method: 'deleteAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);

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
                facadeName,
                'deleteAsync',
                `Failed to delete ${failedDeletions.length} photos from Cloudinary`,
                { bobbleheadId: bobblehead.id, count: failedDeletions.length, failures: failedDeletions },
              );
            }
          } catch (error) {
            // don't fail the entire operation if Cloudinary cleanup fails
            captureFacadeWarning(error, facadeName, 'cloudinary-cleanup', {
              bobbleheadId: bobblehead.id,
            });
          }
        }

        // remove tag associations
        const wasTagRemovalSuccessful = await TagsFacade.removeAllFromBobblehead(bobblehead.id, userId);

        if (!wasTagRemovalSuccessful) {
          trackFacadeWarning(facadeName, 'deleteAsync', 'Failed to remove tags during bobblehead deletion', {
            bobbleheadId: bobblehead.id,
          });
        }

        // Invalidate caches
        this.invalidateOnDelete(bobblehead.id, userId, bobblehead.collectionId, bobblehead.slug);

        return bobblehead;
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          collectionId: result?.collectionId,
          deleted: result !== null,
        }),
      },
    );
  }

  /**
   * Delete a photo from database and Cloudinary.
   * Cloudinary cleanup is non-blocking.
   *
   * Cache invalidation: Calls onPhotoChange after successful deletion.
   *
   * @param data - Delete parameters including bobbleheadId and photoId
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Deleted photo record or null if not found/unauthorized
   */
  static async deletePhotoAsync(
    data: DeleteBobbleheadPhoto,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    return await executeFacadeOperation(
      {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facadeName,
        method: 'deletePhotoAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE_PHOTO,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);

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
            trackFacadeWarning(facadeName, 'deletePhotoAsync', 'Failed to delete photo from Cloudinary', {
              failures: failedDeletions,
              photoId: deletedPhoto.id,
            });
          }
        } catch (error) {
          // don't fail the entire operation if Cloudinary cleanup fails
          captureFacadeWarning(error, facadeName, 'cloudinary-cleanup', {
            photoId: deletedPhoto.id,
          });
        }

        // invalidate caches
        invalidateMetadataCache('bobblehead', data.bobbleheadId);
        CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'delete');

        return deletedPhoto;
      },
      {
        includeResultSummary: (result) => ({
          deleted: result !== null,
          photoId: result?.id,
        }),
      },
    );
  }

  /**
   * Get a bobblehead by ID with optional viewer context.
   * Returns null if not found or if viewer lacks permission.
   *
   * Caching: Uses domain-specific cache with bobblehead-based invalidation.
   *
   * @param id - The unique identifier of the bobblehead
   * @param viewerUserId - Optional viewer for permission context (sees own + public)
   * @param dbInstance - Optional database instance for transaction support
   * @returns The bobblehead record or null if not found/unauthorized
   */
  static async getBobbleheadByIdAsync(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getBobbleheadByIdAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_ID,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.bobbleheads.byId(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.findByIdAsync(id, context);
          },
          id,
          {
            context: {
              entityId: id,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadByIdAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          found: result !== null,
        }),
      },
    );
  }

  /**
   * Get a bobblehead by slug with optional viewer context.
   * Returns null if not found or if viewer lacks permission.
   *
   * Caching: Uses domain-specific cache with bobblehead-based invalidation.
   *
   * @param slug - The unique slug of the bobblehead
   * @param viewerUserId - Optional viewer for permission context (sees own + public)
   * @param dbInstance - Optional database instance for transaction support
   * @returns The bobblehead record or null if not found/unauthorized
   */
  static async getBobbleheadBySlugAsync(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadBySlugAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_SLUG,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.bobbleheads.byId(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.findBySlugAsync(slug, context);
          },
          slug,
          {
            context: {
              entityId: slug,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadBySlugAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          found: result !== null,
        }),
      },
    );
  }

  /**
   * Get a bobblehead by slug with full relations (photos, tags, collection, etc.).
   * Returns null if not found or if viewer lacks permission.
   *
   * Caching: Uses domain-specific cache with bobblehead-based invalidation.
   *
   * @param slug - The unique slug of the bobblehead
   * @param viewerUserId - Optional viewer for permission context (sees own + public)
   * @param dbInstance - Optional database instance for transaction support
   * @returns The bobblehead with relations or null if not found/unauthorized
   */
  static async getBobbleheadBySlugWithRelationsAsync(
    slug: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadWithRelations | null> {
    return await executeFacadeOperation(
      {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadBySlugWithRelationsAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_SLUG_WITH_RELATIONS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.bobbleheads.withRelations(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.findBySlugWithRelationsAsync(slug, context);
          },
          slug,
          {
            context: {
              entityId: slug,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadBySlugWithRelationsAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          found: result !== null,
          photoCount: result?.photos?.length,
          tagCount: result?.tags?.length,
        }),
      },
    );
  }

  /**
   * Get content performance metrics for multiple bobbleheads.
   * Delegates to ViewTrackingFacade for analytics data.
   *
   * @param bobbleheadIds - Array of bobblehead IDs to get performance for
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Content performance metrics for the bobbleheads
   */
  static async getBobbleheadContentPerformanceAsync(
    bobbleheadIds: Array<string>,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    return executeFacadeOperation(
      {
        data: { bobbleheadCount: bobbleheadIds.length },
        facade: facadeName,
        method: 'getBobbleheadContentPerformanceAsync',
        operation: OPERATIONS.ANALYTICS.GET_CONTENT_PERFORMANCE,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getContentPerformanceAsync(
          bobbleheadIds,
          'bobblehead',
          viewerUserId,
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          metricsCount: Object.keys(result || {}).length,
        }),
      },
    );
  }

  /**
   * Get engagement metrics for multiple bobbleheads.
   * Delegates to ViewTrackingFacade for analytics data.
   *
   * @param bobbleheadIds - Array of bobblehead IDs to get engagement for
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Engagement metrics for the bobbleheads
   */
  static async getBobbleheadEngagementMetricsAsync(
    bobbleheadIds: Array<string>,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    return executeFacadeOperation(
      {
        data: { bobbleheadCount: bobbleheadIds.length },
        facade: facadeName,
        method: 'getBobbleheadEngagementMetricsAsync',
        operation: OPERATIONS.ANALYTICS.GET_ENGAGEMENT_METRICS,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getEngagementMetricsAsync(
          bobbleheadIds,
          'bobblehead',
          viewerUserId,
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          metricsCount: Object.keys(result || {}).length,
        }),
      },
    );
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
  static async getBobbleheadNavigationDataAsync(
    bobbleheadId: string,
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadNavigationDataSchema> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId, collectionId },
        facade: facadeName,
        method: 'getBobbleheadNavigationDataAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_NAVIGATION_DATA,
        userId: viewerUserId,
      },
      async () => {
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

        return CacheService.cached(
          async () => {
            // Create appropriate query context based on user presence
            const context = this.getViewerContext(viewerUserId, dbInstance);

            // Execute both queries in parallel for optimal performance
            const [adjacentResult, positionResult] = await Promise.all([
              BobbleheadsQuery.getAdjacentBobbleheadsInCollectionAsync(bobbleheadId, collectionId, context),
              BobbleheadsQuery.getBobbleheadPositionInCollectionAsync(bobbleheadId, collectionId, context),
            ]);

            // Handle edge case where position query returns null (bobblehead not found in collection)
            // Default to position 0 and count 0 to indicate no valid position
            const currentPosition = positionResult?.currentPosition ?? 0;
            const totalCount = positionResult?.totalCount ?? 0;

            // Extract adjacent bobbleheads with loop-around logic
            let { nextBobblehead, previousBobblehead } = adjacentResult;

            // Loop-around navigation: when at boundaries, wrap to the other end
            if (totalCount > 1) {
              // At newest bobblehead (no previous) - loop to oldest
              if (!previousBobblehead) {
                previousBobblehead = await BobbleheadsQuery.getLastBobbleheadInCollectionAsync(
                  collectionId,
                  context,
                );
              }

              // At oldest bobblehead (no next) - loop to newest
              if (!nextBobblehead) {
                nextBobblehead = await BobbleheadsQuery.getFirstBobbleheadInCollectionAsync(
                  collectionId,
                  context,
                );
              }
            }

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

            return {
              context: contextData,
              currentPosition,
              nextBobblehead: transformBobblehead(nextBobblehead),
              previousBobblehead: transformBobblehead(previousBobblehead),
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
      },
      {
        includeResultSummary: (result) => ({
          currentPosition: result.currentPosition,
          hasContext: result.context !== null,
          hasNext: result.nextBobblehead !== null,
          hasPrevious: result.previousBobblehead !== null,
          totalCount: result.totalCount,
        }),
      },
    );
  }

  /**
   * Get all photos for a bobblehead.
   *
   * Caching: Uses domain-specific cache with photo-based invalidation.
   *
   * @param bobbleheadId - The ID of the bobblehead
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of photo records for the bobblehead
   */
  static async getBobbleheadPhotosAsync(
    bobbleheadId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    return executeFacadeOperation(
      {
        data: { bobbleheadId },
        facade: facadeName,
        method: 'getBobbleheadPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_PHOTOS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.bobbleheads.photos(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.getPhotosAsync(bobbleheadId, context);
          },
          bobbleheadId,
          {
            context: {
              entityId: bobbleheadId,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadPhotosAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          photoCount: result.length,
        }),
      },
    );
  }

  /**
   * Get all bobbleheads in a collection.
   *
   * Caching: Uses domain-specific cache with collection-based invalidation.
   *
   * @param collectionId - The ID of the collection
   * @param options - Optional find options (limit, offset, etc.)
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of bobblehead records in the collection
   */
  static async getBobbleheadsByCollectionAsync(
    collectionId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    return executeFacadeOperation(
      {
        data: { collectionId, hasOptions: Object.keys(options).length > 0 },
        facade: facadeName,
        method: 'getBobbleheadsByCollectionAsync',
        operation: OPERATIONS.BOBBLEHEADS.FIND_BY_COLLECTION,
        userId: viewerUserId,
      },
      async () => {
        const optionsHash = createHashFromObject({ options, viewerUserId });
        return CacheService.bobbleheads.byCollection(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.findByCollectionAsync(collectionId, options, context);
          },
          collectionId,
          optionsHash,
          {
            context: {
              entityId: collectionId,
              entityType: 'collection',
              facade: facadeName,
              operation: 'getBobbleheadsByCollectionAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadCount: result.length,
        }),
      },
    );
  }

  /**
   * Get all bobbleheads owned by a user.
   *
   * Caching: Uses domain-specific cache with user-based invalidation.
   *
   * @param userId - The ID of the user whose bobbleheads to retrieve
   * @param options - Optional find options (limit, offset, etc.)
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of bobblehead records owned by the user
   */
  static async getBobbleheadsByUserAsync(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadRecord>> {
    return executeFacadeOperation(
      {
        data: { hasOptions: Object.keys(options).length > 0, userId },
        facade: facadeName,
        method: 'getBobbleheadsByUserAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_USER,
        userId: viewerUserId || userId,
      },
      async () => {
        const optionsHash = createHashFromObject({ options, viewerUserId });
        return CacheService.bobbleheads.byUser(
          () => {
            const context = this.getOwnerOrViewerContext(userId, viewerUserId, dbInstance);
            return BobbleheadsQuery.findByUserAsync(userId, options, context);
          },
          userId,
          optionsHash,
          {
            context: {
              entityId: userId,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadsByUserAsync',
              userId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadCount: result.length,
        }),
      },
    );
  }

  /**
   * Get bobblehead metadata for SEO and social sharing.
   * Returns minimal bobblehead information optimized for metadata generation.
   *
   * Caching: Uses MEDIUM TTL (30 minutes) with bobblehead-based invalidation.
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
  static async getBobbleheadSeoMetadataAsync(
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
    return executeFacadeOperation(
      {
        data: { slug },
        facade: facadeName,
        method: 'getBobbleheadSeoMetadataAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_SEO_METADATA,
      },
      async () => {
        return CacheService.bobbleheads.byId(
          () => {
            const context = this.getPublicContext(dbInstance);
            return BobbleheadsQuery.getBobbleheadMetadataAsync(slug, context);
          },
          slug,
          {
            context: {
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadSeoMetadataAsync',
            },
            ttl: CACHE_CONFIG.TTL.MEDIUM, // 30 minutes - balance between freshness and performance
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          category: result?.category,
          found: result !== null,
          hasImage: result?.primaryImage !== null,
        }),
      },
    );
  }

  /**
   * Get view count for a bobblehead.
   * Delegates to ViewTrackingFacade for analytics data.
   *
   * @param bobbleheadId - The ID of the bobblehead
   * @param shouldIncludeAnonymous - Whether to include anonymous views (default: true)
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Total view count for the bobblehead
   */
  static async getBobbleheadViewCountAsync(
    bobbleheadId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<number> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId, shouldIncludeAnonymous },
        facade: facadeName,
        method: 'getBobbleheadViewCountAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_COUNT,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getViewCountAsync(
          'bobblehead',
          bobbleheadId,
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
   * Get view statistics for a bobblehead.
   * Delegates to ViewTrackingFacade for analytics data.
   *
   * @param bobbleheadId - The ID of the bobblehead
   * @param options - Optional settings for timeframe and anonymous inclusion
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns View statistics for the bobblehead
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
    return executeFacadeOperation(
      {
        data: { bobbleheadId, timeframe: options?.timeframe },
        facade: facadeName,
        method: 'getBobbleheadViewStatsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getViewStatsAsync(
          'bobblehead',
          bobbleheadId,
          options,
          viewerUserId,
          dbInstance,
        );
      },
      {
        includeResultSummary: (result) => ({
          totalViews: result?.totalViews,
          uniqueViewers: result?.uniqueViewers,
        }),
      },
    );
  }

  /**
   * Get a bobblehead by ID with full relations (photos, tags, collection, etc.).
   *
   * Caching: Uses domain-specific cache with bobblehead-based invalidation.
   *
   * @param id - The unique identifier of the bobblehead
   * @param viewerUserId - Optional viewer for permission context (sees own + public)
   * @param dbInstance - Optional database instance for transaction support
   * @returns The bobblehead with relations or null if not found/unauthorized
   */
  static async getBobbleheadWithRelationsAsync(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadWithRelations | null> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getBobbleheadWithRelationsAsync',
        operation: OPERATIONS.BOBBLEHEADS.GET_WITH_RELATIONS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.bobbleheads.withRelations(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.findByIdWithRelationsAsync(id, context);
          },
          id,
          {
            context: {
              entityId: id,
              entityType: 'bobblehead',
              facade: facadeName,
              operation: 'getBobbleheadWithRelationsAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          found: result !== null,
          photoCount: result?.photos?.length,
          tagCount: result?.tags?.length,
        }),
      },
    );
  }

  /**
   * Get trending bobbleheads based on view data.
   * Delegates to ViewTrackingFacade for analytics data.
   *
   * @param options - Optional settings for timeframe, limit, and anonymous inclusion
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of trending bobbleheads with view counts
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
    return executeFacadeOperation(
      {
        data: { limit: options?.limit, timeframe: options?.timeframe },
        facade: facadeName,
        method: 'getTrendingBobbleheadsAsync',
        operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.getTrendingContentAsync('bobblehead', options, viewerUserId, dbInstance);
      },
      {
        includeResultSummary: (result) => ({
          trendingCount: result?.length || 0,
        }),
      },
    );
  }

  /**
   * Record a view for a bobblehead.
   * Delegates to ViewTrackingFacade for analytics recording.
   *
   * @param bobbleheadId - The ID of the bobblehead being viewed
   * @param viewerUserId - Optional viewer user ID
   * @param metadata - Optional metadata about the view (IP, user agent, etc.)
   * @param dbInstance - Optional database instance for transaction support
   * @returns The created view record or null if deduplicated
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
    return executeFacadeOperation(
      {
        data: { bobbleheadId, hasMetadata: !!metadata },
        facade: facadeName,
        method: 'recordBobbleheadViewAsync',
        operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
        userId: viewerUserId,
      },
      async () => {
        return ViewTrackingFacade.recordViewAsync(
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
      },
      {
        includeResultSummary: (result) => ({
          recorded: result !== null,
          viewId: result?.id,
        }),
      },
    );
  }

  /**
   * Reorder photos by updating their sortOrder values.
   *
   * Cache invalidation: Calls onPhotoChange after successful reorder.
   *
   * @param data - Reorder parameters including bobbleheadId and photoOrder array
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Array of updated photo records
   */
  static async reorderPhotosAsync(
    data: ReorderBobbleheadPhotos,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId: data.bobbleheadId, photoCount: data.photoOrder.length },
        facade: facadeName,
        method: 'reorderPhotosAsync',
        operation: OPERATIONS.BOBBLEHEADS.REORDER_PHOTOS,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);

        // batch update all photo sortOrder values
        const updatedPhotos = await BobbleheadsQuery.batchUpdatePhotoSortOrderAsync(data, userId, context);

        // invalidate caches
        invalidateMetadataCache('bobblehead', data.bobbleheadId);
        CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'reorder');

        return updatedPhotos;
      },
      {
        includeResultSummary: (result) => ({
          reorderedCount: result.length,
        }),
      },
    );
  }

  /**
   * Search bobbleheads by term with optional filters.
   *
   * Caching: Uses domain-specific cache with search-based invalidation.
   *
   * @param searchTerm - The search term to query
   * @param filters - Optional filters for category, collection, manufacturer, etc.
   * @param options - Optional find options (limit, offset, etc.)
   * @param viewerUserId - Optional viewer for permission context
   * @param dbInstance - Optional database instance for transaction support
   * @returns Array of matching bobblehead records
   */
  static async searchBobbleheadsAsync(
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
    return executeFacadeOperation(
      {
        data: { hasFilters: Object.keys(filters).length > 0, searchTerm },
        facade: facadeName,
        method: 'searchBobbleheadsAsync',
        operation: OPERATIONS.BOBBLEHEADS.SEARCH,
        userId: viewerUserId,
      },
      async () => {
        const filtersHash = createHashFromObject(filters || {});
        return CacheService.bobbleheads.search(
          () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);
            return BobbleheadsQuery.searchAsync(searchTerm, filters, options, context);
          },
          searchTerm,
          filtersHash,
          {
            context: {
              entityType: 'search',
              facade: facadeName,
              operation: 'searchBobbleheadsAsync',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultCount: result.length,
        }),
      },
    );
  }

  /**
   * Update a bobblehead with new data.
   * Regenerates slug if name is changed.
   *
   * Cache invalidation: Calls invalidateOnUpdate after successful update.
   *
   * @param data - Update data including bobblehead ID and fields to update
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated bobblehead record or null if not found/unauthorized
   */
  static async updateAsync(
    data: UpdateBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return executeFacadeOperation(
      {
        data: { id: data.id, name: data.name },
        facade: facadeName,
        method: 'updateAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);
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
            updateData.slug = ensureUniqueSlug(baseSlug, existingSlugs);
          }
        }

        const updatedBobblehead = await BobbleheadsQuery.updateAsync(updateData, userId, context);

        if (updatedBobblehead) {
          this.invalidateOnUpdate(updatedBobblehead, userId);
        }

        return updatedBobblehead;
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          slugUpdated: result?.slug !== data.id,
          updated: result !== null,
        }),
      },
    );
  }

  /**
   * Update the featured status of a single bobblehead.
   * Requires ownership verification.
   *
   * Cache invalidation: Calls invalidateOnUpdate after successful update.
   *
   * @param id - ID of the bobblehead to update
   * @param isFeatured - New featured status (true or false)
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated bobblehead record or null if not found/unauthorized
   */
  static async updateFeaturedAsync(
    id: string,
    isFeatured: boolean,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    return await executeFacadeOperation(
      {
        data: { id, isFeatured, userId },
        facade: facadeName,
        method: 'updateFeaturedAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_FEATURED,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);
        const result = await BobbleheadsQuery.updateFeaturedAsync(id, isFeatured, context);

        if (result) {
          this.invalidateOnUpdate(result, userId);
        }

        return result;
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result?.id,
          isFeatured,
          updated: result !== null,
        }),
      },
    );
  }

  /**
   * Update photo metadata (altText and caption).
   *
   * Cache invalidation: Calls onPhotoChange after successful update.
   *
   * @param data - Update data including bobbleheadId, photoId, and metadata fields
   * @param userId - User ID for ownership verification
   * @param dbInstance - Optional database instance for transactions
   * @returns Updated photo record or null if not found/unauthorized
   */
  static async updatePhotoMetadataAsync(
    data: UpdateBobbleheadPhotoMetadata,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId: data.bobbleheadId, photoId: data.photoId },
        facade: facadeName,
        method: 'updatePhotoMetadataAsync',
        operation: OPERATIONS.BOBBLEHEADS.UPDATE_PHOTO_METADATA,
        userId,
      },
      async () => {
        const context = this.getUserContext(userId, dbInstance ?? db);

        // update photo metadata
        const updatedPhoto = await BobbleheadsQuery.updatePhotoMetadataAsync(data, userId, context);

        if (!updatedPhoto) {
          return null;
        }

        // invalidate caches
        invalidateMetadataCache('bobblehead', data.bobbleheadId);
        CacheRevalidationService.bobbleheads.onPhotoChange(data.bobbleheadId, userId, 'update');

        return updatedPhoto;
      },
      {
        includeResultSummary: (result) => ({
          photoId: result?.id,
          updated: result !== null,
        }),
      },
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Generate a unique slug for a bobblehead name.
   * Ensures uniqueness across all existing slugs in the system.
   *
   * @param name - The bobblehead name to generate a slug from
   * @param context - Query context for database access
   * @returns A unique slug string
   */
  private static async generateUniqueSlugAsync(name: string, context: UserQueryContext): Promise<string> {
    const existingSlugs = await BobbleheadsQuery.getSlugsAsync(context);
    return ensureUniqueSlug(generateSlug(name), existingSlugs);
  }

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
    context: UserQueryContext,
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
        facadeName,
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
      captureFacadeWarning(error, facadeName, OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO, {
        bobbleheadId,
        photoCount: photos.length,
      });

      try {
        const fallbackRecords = photos.map((photo) => this.mapPhotoToRecord(photo, bobbleheadId));
        const result = await this.insertPhotoRecordsAsync(fallbackRecords, context);

        trackFacadeWarning(
          facadeName,
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
        captureFacadeWarning(fallbackError, facadeName, OPERATIONS.BOBBLEHEADS.UPLOAD_PHOTO, {
          bobbleheadId,
          context: 'fallback-save-failed',
        });
        return [];
      }
    }
  }
}
