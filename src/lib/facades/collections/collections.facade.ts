import type { FindOptions } from '@/lib/queries/base/query-context';
import type {
  BobbleheadListRecord,
  CollectionRecord,
  CollectionWithRelations,
} from '@/lib/queries/collections/collections.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { db } from '@/lib/db';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { createFacadeError } from '@/lib/utils/error-builders';

export interface CollectionDashboardData {
  description: null | string;
  id: string;
  isPublic: boolean;
  metrics: CollectionMetrics;
  name: string;
  subCollections: Array<{
    bobbleheadCount: number;
    description: null | string;
    id: string;
    name: string;
  }>;
}

export interface CollectionMetrics {
  directBobbleheads: number;
  featuredBobbleheads: number;
  hasSubcollections: boolean;
  lastUpdated: Date;
  subcollectionBobbleheads: number;
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

export type PublicCollection = Awaited<ReturnType<typeof CollectionsFacade.getCollectionForPublicView>>;

export class CollectionsFacade {
  static computeMetrics(collection: CollectionWithRelations): CollectionMetrics {
    // count direct bobbleheads (not in subcollections)
    const directBobbleheads = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subcollectionId === null,
    );

    // count bobbleheads in subcollections
    const subcollectionBobbleheads = collection.subCollections.reduce(
      (sum, subCollection) => sum + subCollection.bobbleheads.length,
      0,
    );

    // count featured bobbleheads across collection and subcollections
    const directFeatured = directBobbleheads.filter((b) => b.isFeatured).length;
    const subcollectionFeatured = collection.subCollections.reduce(
      (sum, sub) => sum + sub.bobbleheads.filter((b) => b.isFeatured).length,
      0,
    );

    // find the most recent update across a collection and subcollections
    const lastUpdated = [collection.updatedAt, ...collection.subCollections.map((sc) => sc.updatedAt)].reduce(
      (latest, date) => (date > latest ? date : latest),
      collection.updatedAt,
    );

    return {
      directBobbleheads: directBobbleheads.length,
      featuredBobbleheads: directFeatured + subcollectionFeatured,
      hasSubcollections: collection.subCollections.length > 0,
      lastUpdated,
      subcollectionBobbleheads,
      totalBobbleheads: directBobbleheads.length + subcollectionBobbleheads,
    };
  }

  /**
   * Compute metrics with view data included
   */
  static async computeMetricsWithViews(
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
      // return base metrics if view data fails to load
      console.warn('Failed to load view data for collection metrics:', error);
      return baseMetrics;
    }
  }

  static async createAsync(data: InsertCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return await CollectionsQuery.createAsync(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { isPublic: data.isPublic, name: data.name },
        facade: 'CollectionsFacade',
        method: 'createAsync',
        operation: 'create',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async deleteAsync(data: DeleteCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return await CollectionsQuery.deleteAsync(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId: data.collectionId },
        facade: 'CollectionsFacade',
        method: 'deleteAsync',
        operation: 'delete',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getAllCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
        subcollectionId: null | string;
        subcollectionName: null | string;
      }
    >
  > {
    try {
      const optionsHash = createHashFromObject({ all: true, options, photos: true, viewerUserId });
      return CacheService.bobbleheads.byCollection(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const bobbleheads = await CollectionsQuery.getAllCollectionBobbleheadsWithPhotosAsync(
            collectionId,
            context,
            options,
          );

          if (bobbleheads.length === 0) {
            return bobbleheads;
          }

          const bobbleheadIds = bobbleheads.map((b) => b.id);
          const likesMap = await SocialFacade.getLikesForMultipleContentItems(
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
            facade: 'CollectionsFacade',
            operation: 'getAllBobbleheadsWithPhotos',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getAllCollectionBobbleheadsWithPhotos',
        operation: 'getAllBobbleheadsWithPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionBobbleheads(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord>> {
    try {
      const optionsHash = createHashFromObject({ scope: 'basic', viewerUserId });
      return CacheService.bobbleheads.byCollection(
        () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });
          return CollectionsQuery.getBobbleheadsInCollectionAsync(collectionId, context);
        },
        collectionId,
        optionsHash,
        {
          context: {
            entityId: collectionId,
            entityType: 'collection',
            facade: 'CollectionsFacade',
            operation: 'getBobbleheads',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBobbleheads',
        operation: 'getBobbleheads',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
        subcollectionId: null | string;
        subcollectionName: null | string;
      }
    >
  > {
    try {
      const optionsHash = createHashFromObject({ options, photos: true, viewerUserId });
      return CacheService.bobbleheads.byCollection(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const bobbleheads = await CollectionsQuery.getCollectionBobbleheadsWithPhotosAsync(
            collectionId,
            context,
            options,
          );

          if (bobbleheads.length === 0) {
            return bobbleheads;
          }

          const bobbleheadIds = bobbleheads.map((b) => b.id);
          const likesMap = await SocialFacade.getLikesForMultipleContentItems(
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
            facade: 'CollectionsFacade',
            operation: 'getBobbleheadsWithPhotos',
            userId: viewerUserId,
          },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionBobbleheadsWithPhotos',
        operation: 'getBobbleheadsWithPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionRecord | null> {
    return CacheService.collections.byId(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return CollectionsQuery.findByIdAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'collection',
          facade: 'CollectionsFacade',
          operation: 'getById',
          userId: viewerUserId,
        },
      },
    );
  }

  static async getCollectionForPublicView(id: string, viewerUserId?: string, dbInstance?: DatabaseExecutor) {
    const collection = await this.getCollectionWithRelations(id, viewerUserId, dbInstance);

    if (!collection) {
      return null;
    }

    const metrics = this.computeMetrics(collection);

    return {
      createdAt: collection.createdAt,
      description: collection.description,
      id: collection.id,
      isPublic: collection.isPublic,
      lastUpdatedAt: metrics.lastUpdated,
      name: collection.name,
      subCollectionCount: collection.subCollections.length,
      totalBobbleheadCount: metrics.totalBobbleheads,
      userId: collection.userId,
    };
  }

  static async getCollectionsByUser(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionRecord>> {
    try {
      const optionsHash = createHashFromObject({ options, viewerUserId });
      return CacheService.collections.byUser(
        () => {
          const context =
            viewerUserId && viewerUserId === userId ?
              createProtectedQueryContext(userId, { dbInstance })
            : createUserQueryContext(viewerUserId || userId, { dbInstance });
          return CollectionsQuery.findByUserAsync(userId, options, context);
        },
        userId,
        optionsHash,
        {
          context: { entityType: 'collection', facade: 'CollectionsFacade', operation: 'findByUser', userId },
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, userId },
        facade: 'CollectionsFacade',
        method: 'getCollectionsByUser',
        operation: 'findByUser',
        userId: viewerUserId || userId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view count for a collection
   */
  static async getCollectionViewCountAsync(
    collectionId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<number> {
    try {
      return await ViewTrackingFacade.getViewCountAsync(
        'collection',
        collectionId,
        shouldIncludeAnonymous,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'getCollectionViewCountAsync',
        operation: 'getViewCount',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view statistics for a collection
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
    try {
      return await ViewTrackingFacade.getViewStatsAsync(
        'collection',
        collectionId,
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, options },
        facade: 'CollectionsFacade',
        method: 'getCollectionViewStatsAsync',
        operation: 'getViewStats',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getCollectionWithRelations(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<CollectionWithRelations | null> {
    return CacheService.collections.withRelations(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return CollectionsQuery.findByIdWithRelationsAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: 'collection',
          facade: 'CollectionsFacade',
          operation: 'getWithRelations',
          userId: viewerUserId,
        },
      },
    );
  }

  /**
   * Get trending collections based on view data
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
    try {
      return await ViewTrackingFacade.getTrendingContentAsync(
        'collection',
        options,
        viewerUserId,
        dbInstance,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options },
        facade: 'CollectionsFacade',
        method: 'getTrendingCollectionsAsync',
        operation: 'getTrendingContent',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static async getUserCollectionsForDashboard(
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionDashboardData>> {
    return CacheService.collections.dashboard(
      () => {
        const context = createProtectedQueryContext(userId, { dbInstance });
        return CollectionsQuery.getDashboardDataAsync(userId, context).then((collections) =>
          collections.map((collection) => this.transformForDashboard(collection)),
        );
      },
      userId,
      { context: { entityType: 'collection', facade: 'CollectionsFacade', operation: 'dashboard', userId } },
    );
  }

  /**
   * Record a view for a collection
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
    try {
      return await ViewTrackingFacade.recordViewAsync(
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
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'CollectionsFacade',
        method: 'recordCollectionViewAsync',
        operation: 'recordView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  static transformForDashboard(collection: CollectionWithRelations): CollectionDashboardData {
    const metrics = this.computeMetrics(collection);

    return {
      description: collection.description,
      id: collection.id,
      isPublic: collection.isPublic,
      metrics,
      name: collection.name,
      subCollections: collection.subCollections.map((sub) => ({
        bobbleheadCount: sub.bobbleheads.length,
        description: sub.description,
        id: sub.id,
        name: sub.name,
      })),
    };
  }

  static async updateAsync(data: UpdateCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return await CollectionsQuery.updateAsync(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId: data.collectionId },
        facade: 'CollectionsFacade',
        method: 'updateAsync',
        operation: 'update',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
