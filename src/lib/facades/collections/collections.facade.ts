import { cache } from 'react';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord, CollectionRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';

/**
 * dashboard data for a collection
 */
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

/**
 * business metrics computed from collection data
 */
export interface CollectionMetrics {
  /** number of direct bobbleheads (not in subcollections) */
  directBobbleheads: number;
  /** number of featured bobbleheads */
  featuredBobbleheads: number;
  /** whether the collection has subcollections */
  hasSubcollections: boolean;
  /** last updated timestamp (collection or any subcollection) */
  lastUpdated: Date;
  /** number of bobbleheads in subcollections */
  subcollectionBobbleheads: number;
  /** total number of bobbleheads across the collection and subcollections */
  totalBobbleheads: number;
}

/**
 * collection with related data for business operations
 */
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

/**
 * handles all business logic and orchestration for collections
 */
export class CollectionsFacade {
  /**
   * get a collection by ID with permission checking
   */
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

  /**
   * get a collection with relations for dashboard/detailed views
   */
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

  /**
   * get a collection by ID for public access with computed metrics
   */
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

  /**
   * get user's collections for dashboard
   */
  static getUserCollectionsForDashboard = cache(
    async (userId: string, dbInstance?: DatabaseExecutor): Promise<Array<CollectionDashboardData>> => {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const collections = await CollectionsQuery.getDashboardData(userId, context);

      // Transform using business logic
      return collections.map((collection) => this.transformForDashboard(collection));
    },
  );

  /**
   * compute business metrics for a collection
   */
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
   * create a new collection
   */
  static async createAsync(data: InsertCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    return await CollectionsQuery.createAsync(data, userId, dbInstance);
  }

  /**
   * delete a collection
   */
  static async deleteAsync(data: DeleteCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    return await CollectionsQuery.deleteAsync(data, userId, dbInstance);
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
   * get bobbleheads in a collection with photo data for public display
   */
  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getCollectionBobbleheadsWithPhotos(collectionId, context);
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
   * transform collection data for the dashboard display
   */
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

  /**
   * update a collection
   */
  static async updateAsync(data: UpdateCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    return await CollectionsQuery.updateAsync(data, userId, dbInstance);
  }
}
