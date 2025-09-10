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

import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { createFacadeError } from '@/lib/utils/error-builders';

/**
 * bobblehead with computed metrics and status
 */
export interface BobbleheadMetrics {
  /** estimated current value based on condition and market factors */
  estimatedValue?: number;
  /** whether bobblehead has required photos */
  hasPhotos: boolean;
  /** whether bobblehead has all required metadata */
  isComplete: boolean;
  /** last updated timestamp */
  lastUpdated: Date;
  /** number of photos */
  photoCount: number;
  /** number of tags */
  tagCount: number;
}

/**
 * bobblehead with related data for business operations
 */
export interface BobbleheadWithRelationsAndMetrics extends BobbleheadWithRelations {
  metrics?: BobbleheadMetrics;
}

/**
 * handles all business logic and orchestration for bobbleheads
 */
export class BobbleheadsFacade {
  /**
   * get a bobblehead by ID with permission checking
   */
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

      return BobbleheadsQuery.findById(id, context);
    },
  );

  /**
   * get a bobblehead with all related data (photos, tags, collection info)
   */
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

      return BobbleheadsQuery.findByIdWithRelations(id, context);
    },
  );

  /**
   * get user dashboard statistics
   */
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

      const userBobbleheads = await BobbleheadsQuery.findByUser(userId, {}, context);

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

  /**
   * add a photo to a bobblehead
   */
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance?: DatabaseExecutor) {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.addPhoto(data, context);
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

  /**
   * check if a user can view a bobblehead (public or owned)
   */
  static canUserViewBobblehead(
    bobblehead: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return bobblehead.isPublic || Boolean(currentUserId && bobblehead.userId === currentUserId);
  }

  /**
   * compute business metrics for a bobblehead
   */
  static computeMetrics(bobblehead: BobbleheadWithRelationsAndMetrics): BobbleheadMetrics {
    const photoCount = bobblehead.photos?.length || 0;
    const tagCount = bobblehead.tags?.length || 0;

    // determine if bobblehead has all required metadata
    const requiredFields = [
      bobblehead.name,
      bobblehead.characterName,
      bobblehead.manufacturer,
      bobblehead.currentCondition,
    ];
    const isComplete = requiredFields.every((field) => Boolean(field)) && photoCount > 0;

    // simple estimated value calculation based on condition and purchase price
    let estimatedValue: number | undefined;
    if (bobblehead.purchasePrice && bobblehead.currentCondition) {
      const conditionMultiplier = this.getConditionMultiplier(bobblehead.currentCondition);
      estimatedValue = Math.round(bobblehead.purchasePrice * conditionMultiplier);
    }

    return {
      estimatedValue,
      hasPhotos: photoCount > 0,
      isComplete,
      lastUpdated: bobblehead.updatedAt,
      photoCount,
      tagCount,
    };
  }

  /**
   * create a new bobblehead
   */
  static async createAsync(
    data: InsertBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return BobbleheadsQuery.create(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { manufacturer: data.manufacturer, name: data.name },
        facade: 'BobbleheadsFacade',
        method: 'createAsync',
        operation: 'create',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * delete a bobblehead with Cloudinary photo cleanup
   */
  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });

    // get bobblehead and photos, then delete from the database
    const deleteResult = await BobbleheadsQuery.delete(data, userId, context);

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

      return bobblehead;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId: data.bobbleheadId },
        facade: 'BobbleheadsFacade',
        method: 'deleteAsync',
        operation: 'delete',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get photos for a bobblehead
   */
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

      return BobbleheadsQuery.getPhotos(bobbleheadId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { bobbleheadId },
        facade: 'BobbleheadsFacade',
        method: 'getBobbleheadPhotos',
        operation: 'getPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get bobbleheads by collection with filtering options
   */
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

      return BobbleheadsQuery.findByCollection(collectionId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, options },
        facade: 'BobbleheadsFacade',
        method: 'getBobbleheadsByCollection',
        operation: 'findByCollection',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get bobbleheads by user with filtering options
   */
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

      return BobbleheadsQuery.findByUser(userId, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: 'BobbleheadsFacade',
        method: 'getBobbleheadsByUser',
        operation: 'findByUser',
        userId: viewerUserId || userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * search bobbleheads with advanced filtering
   */
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

      return BobbleheadsQuery.search(searchTerm, filters, options, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { filters, options, searchTerm },
        facade: 'BobbleheadsFacade',
        method: 'searchBobbleheads',
        operation: 'search',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get condition multiplier for value estimation
   */
  private static getConditionMultiplier(condition: string): number {
    const conditionMap: Record<string, number> = {
      Excellent: 1.0,
      Fair: 0.6,
      Good: 0.8,
      Mint: 1.2,
      'Near Mint': 1.1,
      Poor: 0.4,
    };

    return conditionMap[condition] || 1.0;
  }
}
