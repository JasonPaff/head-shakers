import { cache } from 'react';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { BobbleheadRecord, BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteBobblehead,
  InsertBobblehead,
  InsertBobbleheadPhoto,
} from '@/lib/validations/bobbleheads.validation';

import { OPERATIONS } from '@/lib/constants';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { createFacadeError } from '@/lib/utils/error-builders';

export class BobbleheadsFacade {
  static getBobbleheadById = cache(
    async (
      id: string,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<BobbleheadRecord | null> => {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return BobbleheadsQuery.findByIdAsync(id, context);
    },
  );

  static getBobbleheadWithRelations = cache(
    async (
      id: string,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<BobbleheadWithRelations | null> => {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return BobbleheadsQuery.findByIdWithRelationsAsync(id, context);
    },
  );

  static getUserDashboardStats = cache(
    async (
      userId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<{
      collectionValue: number;
      profileViews: number;
      totalItems: number;
    }> => {
      const context = createUserQueryContext(userId, { dbInstance });

      const userBobbleheads = await BobbleheadsQuery.findByUserAsync(userId, {}, context);

      // calculate total value from purchase prices
      const totalValue = userBobbleheads.reduce((sum, bobblehead) => {
        return sum + (bobblehead.purchasePrice || 0);
      }, 0);

      return {
        collectionValue: Math.round(totalValue),
        profileViews: userBobbleheads.length * 5 + 100, // TODO: implement real view tracking
        totalItems: userBobbleheads.length,
      };
    },
  );

  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance?: DatabaseExecutor) {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.addPhotoAsync(data, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId, url: data.url },
        facade: 'BobbleheadsFacade',
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
        facade: 'BobbleheadsFacade',
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
            console.log(
              `Successfully deleted ${successfulDeletions} photos from Cloudinary for bobblehead ${bobblehead.id}`,
            );
          }

          if (failedDeletions.length > 0) {
            console.warn(
              `Failed to delete ${failedDeletions.length} photos from Cloudinary for bobblehead ${bobblehead.id}:`,
              failedDeletions,
            );
          }
        } catch (error) {
          // don't fail the entire operation if Cloudinary cleanup fails
          console.error(`Cloudinary cleanup failed for bobblehead ${bobblehead.id}:`, error);
        }
      }

      // remove tag associations
      const wasTagRemovalSuccessful = await TagsFacade.removeAllFromBobblehead(bobblehead.id, userId);

      if (!wasTagRemovalSuccessful) {
        console.warn(`Failed to remove tags from bobblehead ${bobblehead.id} during deletion`);
      }

      return bobblehead;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId },
        facade: 'BobbleheadsFacade',
        method: 'deleteAsync',
        operation: OPERATIONS.BOBBLEHEADS.DELETE,
        userId,
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return BobbleheadsQuery.getPhotosAsync(bobbleheadId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId },
        facade: 'BobbleheadsFacade',
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return BobbleheadsQuery.findByCollectionAsync(collectionId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, options },
        facade: 'BobbleheadsFacade',
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
      const context =
        viewerUserId && viewerUserId === userId ?
          createProtectedQueryContext(userId, { dbInstance })
        : createUserQueryContext(viewerUserId || userId, { dbInstance });

      return BobbleheadsQuery.findByUserAsync(userId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: 'BobbleheadsFacade',
        method: 'getBobbleheadsByUser',
        operation: OPERATIONS.BOBBLEHEADS.GET_BY_USER,
        userId: viewerUserId || userId,
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return BobbleheadsQuery.searchAsync(searchTerm, filters, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { filters, options, searchTerm },
        facade: 'BobbleheadsFacade',
        method: 'searchBobbleheads',
        operation: OPERATIONS.BOBBLEHEADS.SEARCH,
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }
}
