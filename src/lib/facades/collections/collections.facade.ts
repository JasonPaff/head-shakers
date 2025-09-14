import { cache } from 'react';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord, CollectionRecord } from '@/lib/queries/collections/collections.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { db } from '@/lib/db';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { createFacadeError } from '@/lib/utils/error-builders';

export interface CollectionDashboardData {
  description: null | string;
  id: string;
  isPublic: boolean;
  metrics: CollectionMetrics;
  name: string;
  subCollections: Array<{
    bobbleheadCount: number;
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
}

export interface CollectionWithRelations {
  bobbleheads: Array<{
    id: string;
    isFeatured: boolean;
    subcollectionId: null | string;
    updatedAt: Date;
  }>;
  createdAt: Date;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
  subCollections: Array<{
    bobbleheads: Array<{
      id: string;
      isFeatured: boolean;
      updatedAt: Date;
    }>;
    id: string;
    name: string;
    updatedAt: Date;
  }>;
  updatedAt: Date;
  userId: string;
}

export type PublicCollection = Awaited<ReturnType<typeof CollectionsFacade.getCollectionForPublicView>>;

export class CollectionsFacade {
  static getCollectionById = cache(
    async (
      id: string,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<CollectionRecord | null> => {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return CollectionsQuery.findById(id, context);
    },
  );

  static getCollectionWithRelations = cache(
    async (
      id: string,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<CollectionWithRelations | null> => {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return CollectionsQuery.findByIdWithRelations(id, context);
    },
  );

  static getCollectionForPublicView = cache(
    async (id: string, viewerUserId?: string, dbInstance?: DatabaseExecutor) => {
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
    },
  );

  static getUserCollectionsForDashboard = cache(
    async (userId: string, dbInstance?: DatabaseExecutor): Promise<Array<CollectionDashboardData>> => {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const collections = await CollectionsQuery.getDashboardData(userId, context);

      // Transform using business logic
      return collections.map((collection) => this.transformForDashboard(collection));
    },
  );

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

  static async createAsync(data: InsertCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      return await CollectionsQuery.createAsync(data, userId, dbInstance);
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
      return await CollectionsQuery.deleteAsync(data, userId, dbInstance);
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const bobbleheads = await CollectionsQuery.getAllCollectionBobbleheadsWithPhotos(
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return CollectionsQuery.getBobbleheadsInCollection(collectionId, context);
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
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const bobbleheads = await CollectionsQuery.getCollectionBobbleheadsWithPhotos(
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

  static async getCollectionsByUser(
    userId: string,
    options: FindOptions = {},
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<CollectionRecord>> {
    try {
      const context =
        viewerUserId && viewerUserId === userId ?
          createProtectedQueryContext(userId, { dbInstance })
        : createUserQueryContext(viewerUserId || userId, { dbInstance });

      return CollectionsQuery.findByUser(userId, options, context);
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
        id: sub.id,
        name: sub.name,
      })),
    };
  }

  static async updateAsync(data: UpdateCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      return await CollectionsQuery.updateAsync(data, userId, dbInstance);
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
