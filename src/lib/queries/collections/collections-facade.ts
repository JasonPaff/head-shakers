import { and, eq, isNull, sql } from 'drizzle-orm';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { CollectionRecord } from '@/lib/queries/collections/collections-query';
import type { CollectionWithRelations } from '@/lib/services/collections.service';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { bobbleheadPhotos, bobbleheads, collections, subCollections } from '@/lib/db/schema';
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
   * get bobbleheads in a collection with photo data for public display
   */
  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance_ = dbInstance ?? db;
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance: dbInstance_ })
      : createPublicQueryContext({ dbInstance: dbInstance_ });

    // build permission filters for both collection and bobbleheads
    const collectionFilter = CollectionsQuery['buildBaseFilters'](
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    const bobbleheadFilter = CollectionsQuery['buildBaseFilters'](
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    return dbInstance_
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        status: bobbleheads.status,
        weight: bobbleheads.weight,
      })
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(
          eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId),
          eq(bobbleheadPhotos.isPrimary, true),
        ),
      )
      .where(
        CollectionsQuery['combineFilters'](
          eq(bobbleheads.collectionId, collectionId),
          isNull(bobbleheads.subcollectionId),
          collectionFilter,
          bobbleheadFilter,
        ),
      )
      .orderBy(bobbleheads.createdAt);
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
   * get a collection by ID for public access with computed metrics
   */
  static async getCollectionForPublicView(
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
  }> {
    const collection = await this.getCollectionWithRelations(id, viewerUserId, dbInstance);
    
    if (!collection) {
      return null;
    }

    const metrics = CollectionsService.computeMetrics(collection);

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
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance_ = dbInstance ?? db;
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance: dbInstance_ })
      : createPublicQueryContext({ dbInstance: dbInstance_ });

    const bobbleheadFilter = CollectionsQuery['buildBaseFilters'](
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    return dbInstance_
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        status: bobbleheads.status,
        weight: bobbleheads.weight,
      })
      .from(bobbleheads)
      .leftJoin(
        bobbleheadPhotos,
        and(
          eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId),
          eq(bobbleheadPhotos.isPrimary, true),
        ),
      )
      .where(
        CollectionsQuery['combineFilters'](
          eq(bobbleheads.subcollectionId, subcollectionId),
          bobbleheadFilter,
        ),
      )
      .orderBy(bobbleheads.createdAt);
  }

  /**
   * get a specific subcollection for public view with collection context
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
    const dbInstance_ = dbInstance ?? db;
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance: dbInstance_ })
      : createPublicQueryContext({ dbInstance: dbInstance_ });

    // First check if the collection exists and is accessible
    const collection = await dbInstance_.query.collections.findFirst({
      where: CollectionsQuery['combineFilters'](
        eq(collections.id, collectionId),
        CollectionsQuery['buildBaseFilters'](
          collections.isPublic,
          collections.userId,
          undefined,
          context,
        ),
      ),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // Get the specific subcollection with its bobbleheads
    const subCollection = await dbInstance_.query.subCollections.findFirst({
      where: and(eq(subCollections.collectionId, collectionId), eq(subCollections.id, subcollectionId)),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            CollectionsQuery['buildBaseFilters'](
              bobbleheads.isPublic,
              bobbleheads.userId,
              undefined,
              context,
            ) || eq(bobbleheads.isPublic, true),
          ),
        },
      },
    });

    if (!subCollection) {
      return null;
    }

    const featuredBobbleheadCount = subCollection.bobbleheads.filter(
      (bobblehead) => bobblehead.isFeatured,
    ).length;

    return {
      bobbleheadCount: subCollection.bobbleheads.length,
      collectionId: subCollection.collectionId,
      collectionName: collection.name,
      createdAt: subCollection.createdAt,
      description: subCollection.description,
      featuredBobbleheadCount,
      featurePhoto: subCollection.coverImageUrl,
      id: subCollection.id,
      lastUpdatedAt: subCollection.updatedAt,
      name: subCollection.name,
      userId: collection.user?.id,
    };
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
   * get subcollections for a collection with detailed data for public display
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
    const dbInstance_ = dbInstance ?? db;
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance: dbInstance_ })
      : createPublicQueryContext({ dbInstance: dbInstance_ });

    // First check if the collection exists and is accessible
    const collection = await dbInstance_.query.collections.findFirst({
      where: CollectionsQuery['combineFilters'](
        eq(collections.id, collectionId),
        CollectionsQuery['buildBaseFilters'](
          collections.isPublic,
          collections.userId,
          undefined,
          context,
        ),
      ),
      with: {
        user: {
          columns: {
            id: true,
          },
        },
      },
    });

    if (!collection) {
      return null;
    }

    // Get subcollections with bobblehead counts
    const subCollectionData = await dbInstance_.query.subCollections.findMany({
      orderBy: [sql`lower(${subCollections.name}) asc`],
      where: eq(subCollections.collectionId, collectionId),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            CollectionsQuery['buildBaseFilters'](
              bobbleheads.isPublic,
              bobbleheads.userId,
              undefined,
              context,
            ) || eq(bobbleheads.isPublic, true),
          ),
        },
      },
    });

    return {
      subCollections: subCollectionData.map((subCollection) => ({
        bobbleheadCount: subCollection.bobbleheads.length,
        description: subCollection.description,
        featurePhoto: subCollection.coverImageUrl,
        id: subCollection.id,
        name: subCollection.name,
      })),
      userId: collection.user?.id,
    };
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
