import type { FindOptions } from '@/lib/queries/base/query-context';
import type { BobbleheadRecord, BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';
import type { BobbleheadWithRelations as ServiceBobbleheadWithRelations } from '@/lib/services/bobbleheads.service';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { BobbleheadsService } from '@/lib/services/bobbleheads.service';

/**
 * unified Bobbleheads Facade
 * combines query operations with business logic validation
 * provides a clean API for all bobblehead operations
 */
export class BobbleheadsFacade {
  // Legacy service methods for backward compatibility
  static async addPhotoAsync(
    data: Parameters<typeof BobbleheadsService.addPhotoAsync>[0],
    dbInstance?: DatabaseExecutor,
  ) {
    return BobbleheadsService.addPhotoAsync(data, dbInstance);
  }

  /**
   * check if a user can view a bobblehead
   */
  static canUserViewBobblehead(
    bobblehead: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return BobbleheadsService.canUserViewBobblehead(bobblehead, currentUserId);
  }

  /**
   * compute business metrics for a bobblehead
   */
  static computeMetrics(
    bobblehead: ServiceBobbleheadWithRelations,
  ): ReturnType<typeof BobbleheadsService.computeMetrics> {
    return BobbleheadsService.computeMetrics(bobblehead);
  }

  static async createAsync(
    data: Parameters<typeof BobbleheadsService.createAsync>[0],
    userId: string,
    dbInstance?: DatabaseExecutor,
  ) {
    return BobbleheadsService.createAsync(data, userId, dbInstance);
  }

  /**
   * get a bobblehead by ID with permission checking
   */
  static async getBobbleheadById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadRecord | null> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return BobbleheadsQuery.findById(id, context);
  }

  /**
   * get photos for a bobblehead
   */
  static async getBobbleheadPhotos(
    bobbleheadId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return BobbleheadsQuery.getPhotos(bobbleheadId, context);
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
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return BobbleheadsQuery.findByCollection(collectionId, options, context);
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
    const context =
      viewerUserId && viewerUserId === userId ?
        createProtectedQueryContext(userId, { dbInstance })
      : createUserQueryContext(viewerUserId || userId, { dbInstance });

    return BobbleheadsQuery.findByUser(userId, options, context);
  }

  /**
   * get a bobblehead with all related data (photos, tags, collection info)
   */
  static async getBobbleheadWithRelations(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<BobbleheadWithRelations | null> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return BobbleheadsQuery.findByIdWithRelations(id, context);
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
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return BobbleheadsQuery.search(searchTerm, filters, options, context);
  }

  /**
   * validate bobblehead creation data
   */
  static validateBobbleheadCreation(
    data: { collectionId: string; name?: null | string; subcollectionId?: null | string },
    userId: string,
  ): void {
    return BobbleheadsService.validateBobbleheadCreation(data, userId);
  }

  /**
   * validate bobblehead ownership
   */
  static validateBobbleheadOwnership(bobblehead: { userId: string }, currentUserId: string): void {
    return BobbleheadsService.validateBobbleheadOwnership(bobblehead, currentUserId);
  }

  /**
   * validate bobblehead update data
   */
  static validateBobbleheadUpdate(
    data: { [key: string]: unknown; name?: null | string },
    currentBobblehead: { userId: string },
    userId: string,
  ): void {
    return BobbleheadsService.validateBobbleheadUpdate(data, currentBobblehead, userId);
  }
}
