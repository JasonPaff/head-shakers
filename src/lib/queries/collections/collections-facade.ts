import type { FindOptions } from '@/lib/queries/base/query-context';
import type { CollectionRecord } from '@/lib/queries/collections/collections-query';
import type { CollectionWithRelations } from '@/lib/services/collections.service';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { type BobbleheadListRecord, CollectionsQuery } from '@/lib/queries/collections/collections-query';
import { CollectionsService } from '@/lib/services/collections.service';

/**
 * unified Collections Facade
 * combines query operations with business logic validation
 * provides a clean API for all collection operations
 */
export class CollectionsFacade {
  /**
   * check if a user can view a collection
   */
  static canUserViewCollection(
    collection: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return CollectionsService.canUserViewCollection(collection, currentUserId);
  }

  /**
   * compute business metrics for a collection
   */
  static computeMetrics(
    collection: CollectionWithRelations,
  ): ReturnType<typeof CollectionsService.computeMetrics> {
    return CollectionsService.computeMetrics(collection);
  }

  /**
   * get bobbleheads in a collection (not in subcollections)
   */
  static async getCollectionBobbleheads(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getBobbleheadsInCollection(collectionId, context);
  }

  /**
   * get a collection by ID with permission checking
   */
  static async getCollectionById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionRecord | null> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.findById(id, context);
  }

  /**
   * get a collection by user with filtering options
   */
  static async getCollectionsByUser(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionRecord>> {
    const context =
      viewerUserId && viewerUserId === userId ?
        createProtectedQueryContext(userId, { dbInstance })
      : createUserQueryContext(viewerUserId || userId, { dbInstance });

    return CollectionsQuery.findByUser(userId, options, context);
  }

  /**
   * get a collection with relations for dashboard/detailed views
   */
  static async getCollectionWithRelations(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionWithRelations | null> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.findByIdWithRelations(id, context);
  }

  /**
   * get subcollections for a collection
   */
  static async getSubCollectionsByCollection(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<{ id: string; name: string }>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getSubCollectionsByCollection(collectionId, context);
  }

  /**
   * get user's collections for dashboard
   */
  static async getUserCollectionsForDashboard(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<{
      description: null | string;
      id: string;
      isPublic: boolean;
      metrics: ReturnType<typeof CollectionsService.computeMetrics>;
      name: string;
      subCollections: Array<{
        bobbleheadCount: number;
        id: string;
        name: string;
      }>;
    }>
  > {
    const context = createProtectedQueryContext(userId, { dbInstance });
    const collections = await CollectionsQuery.getDashboardData(userId, context);

    // transform using service business logic
    return collections.map((collection) => {
      const metrics = CollectionsService.computeMetrics(collection);
      return {
        description: collection.description,
        id: collection.id,
        isPublic: collection.isPublic,
        metrics,
        name: collection.name,
        subCollections: collection.subCollections.map((sub) => ({
          bobbleheadCount: sub.bobbleheads.length,
          id: sub.id,
          name: sub.name,
        })),
      };
    });
  }

  /**
   * Transform collection data for the dashboard display
   */
  static transformForDashboard(
    collection: CollectionWithRelations,
  ): ReturnType<typeof CollectionsService.transformForDashboard> {
    return CollectionsService.transformForDashboard(collection);
  }

  /**
   * validate collection creation data
   */
  static validateCollectionCreation(
    data: { description?: null | string; name: string },
    userId: string,
  ): void {
    return CollectionsService.validateCollectionCreation(data, userId);
  }

  /**
   * validate collection update data
   */
  static validateCollectionUpdate(
    data: { description?: null | string; name?: string },
    currentCollection: { userId: string },
    userId: string,
  ): void {
    return CollectionsService.validateCollectionUpdate(data, currentCollection, userId);
  }
}
