import { cache } from 'react';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { CollectionRecord } from '@/lib/queries/collections/collections-query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { type BobbleheadListRecord, CollectionsQuery } from '@/lib/queries/collections/collections-query';

/**
 * Dashboard data for a collection
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
 * Business metrics computed from collection data
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
 * Collection with related data for business operations
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

export type PublicCollection = Awaited<ReturnType<typeof CollectionsFacade.getCollectionForPublicView>> & {};

export type PublicSubcollection = Awaited<
  ReturnType<typeof CollectionsFacade.getSubCollectionForPublicView>
> & {};

/**
 * Unified Collections Facade
 * Handles all business logic and orchestration for collections
 * Single source of truth for collection operations
 */
export class CollectionsFacade {
  // ============================================
  // Database Operations (using Query layer)
  // ============================================

  /**
   * Get a collection by ID with permission checking
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
   * Get a collection with relations for dashboard/detailed views
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
   * Get a collection by ID for public access with computed metrics
   */
  static getCollectionForPublicView = cache(
    async (
      id: string,
      viewerUserId?: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<null | {
      createdAt: Date;
      description: null | string;
      id: string;
      isPublic: boolean;
      lastUpdatedAt: Date;
      name: string;
      subCollectionCount: number;
      totalBobbleheadCount: number;
      userId?: string;
    }> => {
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
   * Get user's collections for dashboard
   */
  static getUserCollectionsForDashboard = cache(
    async (
      userId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<Array<CollectionDashboardData>> => {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const collections = await CollectionsQuery.getDashboardData(userId, context);

      // Transform using business logic
      return collections.map((collection) => this.transformForDashboard(collection));
    },
  );

  /**
   * Check if a user can view a collection (public or owned)
   */
  static canUserViewCollection(
    collection: { isPublic: boolean; userId: string },
    currentUserId?: string,
  ): boolean {
    return collection.isPublic || Boolean(currentUserId && collection.userId === currentUserId);
  }

  /**
   * Compute business metrics for a collection
   */
  static computeMetrics(collection: CollectionWithRelations): CollectionMetrics {
    // Count direct bobbleheads (not in subcollections)
    const directBobbleheads = collection.bobbleheads.filter(
      (bobblehead) => bobblehead.subcollectionId === null,
    );

    // Count bobbleheads in subcollections
    const subcollectionBobbleheads = collection.subCollections.reduce(
      (sum, subCollection) => sum + subCollection.bobbleheads.length,
      0,
    );

    // Count featured bobbleheads across collection and subcollections
    const directFeatured = directBobbleheads.filter((b) => b.isFeatured).length;
    const subcollectionFeatured = collection.subCollections.reduce(
      (sum, sub) => sum + sub.bobbleheads.filter((b) => b.isFeatured).length,
      0,
    );

    // Find the most recent update across a collection and subcollections
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
   * Create a new collection
   * TODO: Move to CollectionsQuery.create()
   */
  static async createAsync(
    data: { description?: null | string; isPublic?: boolean; name: string; },
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ) {
    // Validate before creation
    this.validateCollectionCreation(data, userId);

    const result = await (dbInstance ?? db)
      .insert(collections)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * Get bobbleheads in a collection (not in subcollections)
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
   * Get bobbleheads in a collection with photo data for public display
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
   * Get a collection by user with filtering options
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
   * Get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getSubcollectionBobbleheadsWithPhotos(subcollectionId, context);
  }

  // ============================================
  // Business Logic & Validation
  // ============================================

  /**
   * Get a specific subcollection for public view with collection context
   */
  static async getSubCollectionForPublicView(
    collectionId: string,
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    bobbleheadCount: number;
    collectionId: string;
    collectionName: string;
    createdAt: Date;
    description: null | string;
    featuredBobbleheadCount: number;
    featurePhoto: null | string;
    id: string;
    lastUpdatedAt: Date;
    name: string;
    userId?: string;
  }> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getSubCollectionForPublicView(collectionId, subcollectionId, context);
  }

  /**
   * Get subcollections for a collection
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
   * Get subcollections for a collection with detailed data for public display
   */
  static async getSubCollectionsForPublicView(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    subCollections: Array<{
      bobbleheadCount: number;
      description: null | string;
      featurePhoto: null | string;
      id: string;
      name: string;
    }>;
    userId?: string;
  }> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return CollectionsQuery.getSubCollectionsForPublicView(collectionId, context);
  }

  /**
   * Transform collection data for the dashboard display
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
   * Business logic for creating a collection
   */
  static validateCollectionCreation(
    data: {
      description?: null | string;
      name: string;
    },
    userId: string,
  ): void {
    this.validateUserId(userId, 'create collection');
    this.validateCollectionName(data.name);
    this.validateCollectionDescription(data.description);
  }

  /**
   * Validate collection description
   */
  static validateCollectionDescription(description?: null | string): void {
    if (description && description.length > 500) {
      throw new Error('Collection description must be 500 characters or less');
    }
  }

  /**
   * Validate collection name
   */
  static validateCollectionName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Collection name is required');
    }

    if (name.trim().length > 100) {
      throw new Error('Collection name must be 100 characters or less');
    }
  }

  /**
   * Validate collection ownership
   */
  static validateCollectionOwnership(collection: { userId: string }, currentUserId: string): void {
    if (collection.userId !== currentUserId) {
      throw new Error('User does not have permission to access this collection');
    }
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  /**
   * Business logic for updating a collection
   */
  static validateCollectionUpdate(
    data: {
      description?: null | string;
      name?: string;
    },
    currentCollection: { userId: string },
    userId: string,
  ): void {
    this.validateUserId(userId, 'update collection');
    this.validateCollectionOwnership(currentCollection, userId);

    if (data.name !== undefined) {
      this.validateCollectionName(data.name);
    }

    if (data.description !== undefined) {
      this.validateCollectionDescription(data.description);
    }
  }

  // ============================================
  // Database Operations (Direct - to be moved to Query layer eventually)
  // ============================================

  /**
   * Validate that a user ID is provided
   */
  private static validateUserId(
    userId: null | string | undefined,
    operation: string,
  ): asserts userId is string {
    if (!userId) {
      throw new Error(`User ID is required for ${operation}`);
    }
  }
}