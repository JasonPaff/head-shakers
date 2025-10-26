import * as Sentry from '@sentry/nextjs';

import type { bobbleheadPhotos } from '@/lib/db/schema';
import type { FindOptions } from '@/lib/queries/base/query-context';
import type { BobbleheadRecord, BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteBobblehead,
  DeleteBobbleheadPhoto,
  InsertBobblehead,
  InsertBobbleheadPhoto,
  ReorderBobbleheadPhotos,
  UpdateBobblehead,
} from '@/lib/validations/bobbleheads.validation';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
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
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { createFacadeError } from '@/lib/utils/error-builders';

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
    data: InsertBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return BobbleheadsQuery.createAsync(data, userId, context);
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

      return bobblehead;
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
    data: UpdateBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return BobbleheadsQuery.updateAsync(data, userId, context);
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
}
