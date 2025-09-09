import { and, eq, isNull, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';

import { bobbleheadPhotos, bobbleheads, collections, subCollections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadListRecord = {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  condition: null | string;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  manufacturer: null | string;
  name: null | string;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  status: null | string;
  weight: null | number;
};

/**
 * gype definitions for query results
 */
export type CollectionRecord = typeof collections.$inferSelect;

export type CollectionWithRelations = CollectionRecord & {
  bobbleheads: Array<{
    id: string;
    isFeatured: boolean;
    subcollectionId: null | string;
    updatedAt: Date;
  }>;
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
};

/**
 * collection domain query service
 * handles all database operations for collections with consistent patterns
 */
export class CollectionsQuery extends BaseQuery {
  /**
   * find collection by ID with standard permission filtering
   */
  static async findById(id: string, context: QueryContext): Promise<CollectionRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.id, id),
          this.buildBaseFilters(
            collections.isPublic,
            collections.userId,
            undefined, // no soft delete for collections
            context,
          ),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find the collection with all related data (bobbleheads and subcollections)
   */
  static async findByIdWithRelations(
    id: string,
    context: QueryContext,
  ): Promise<CollectionWithRelations | null> {
    const dbInstance = this.getDbInstance(context);

    // build permission filter
    const permissionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    // first get the collection
    const collection = await dbInstance.query.collections.findFirst({
      where: this.combineFilters(eq(collections.id, id), permissionFilter),
      with: {
        bobbleheads: {
          columns: {
            id: true,
            isFeatured: true,
            subcollectionId: true,
            updatedAt: true,
          },
          where: eq(bobbleheads.isDeleted, false),
        },
        subCollections: {
          with: {
            bobbleheads: {
              columns: {
                id: true,
                isFeatured: true,
                updatedAt: true,
              },
              where: eq(bobbleheads.isDeleted, false),
            },
          },
        },
      },
    });

    return collection || null;
  }

  /**
   * find collections by user with options
   */
  static async findByUser(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CollectionRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.userId, userId),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .orderBy(sql`lower(${collections.name}) asc`);

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * get bobbleheads in a collection (not in subcollections)
   */
  static async getBobbleheadsInCollection(
    collectionId: string,
    context: QueryContext,
  ): Promise<Array<BobbleheadListRecord>> {
    const dbInstance = this.getDbInstance(context);

    // build permission filters for both collection and bobbleheads
    const collectionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    const bobbleheadFilter = this.buildBaseFilters(
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
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
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          isNull(bobbleheads.subcollectionId),
          collectionFilter,
          bobbleheadFilter,
        ),
      )
      .orderBy(bobbleheads.createdAt);
  }

  /**
   * get bobbleheads in a collection with photo data for public display
   */
  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    context: QueryContext,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance = this.getDbInstance(context);

    // build permission filters for both collection and bobbleheads
    const collectionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    const bobbleheadFilter = this.buildBaseFilters(
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    return dbInstance
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
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          isNull(bobbleheads.subcollectionId),
          collectionFilter,
          bobbleheadFilter,
        ),
      )
      .orderBy(bobbleheads.createdAt);
  }

  /**
   * get dashboard data for user's collections
   */
  static async getDashboardData(
    userId: string,
    context: QueryContext,
  ): Promise<Array<CollectionWithRelations>> {
    const dbInstance = this.getDbInstance(context);

    // get user's collections with all relations for dashboard
    return await dbInstance.query.collections.findMany({
      orderBy: [sql`lower(${collections.name}) asc`],
      where: eq(collections.userId, userId),
      with: {
        bobbleheads: {
          columns: {
            id: true,
            isFeatured: true,
            subcollectionId: true,
            updatedAt: true,
          },
          where: eq(bobbleheads.isDeleted, false),
        },
        subCollections: {
          with: {
            bobbleheads: {
              columns: {
                id: true,
                isFeatured: true,
                updatedAt: true,
              },
              where: eq(bobbleheads.isDeleted, false),
            },
          },
        },
      },
    });
  }

  /**
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    context: QueryContext,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance = this.getDbInstance(context);

    const bobbleheadFilter = this.buildBaseFilters(
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    return dbInstance
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
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(this.combineFilters(eq(bobbleheads.subcollectionId, subcollectionId), bobbleheadFilter))
      .orderBy(bobbleheads.createdAt);
  }

  /**
   * get a specific subcollection for public view with collection context
   */
  static async getSubCollectionForPublicView(
    collectionId: string,
    subcollectionId: string,
    context: QueryContext,
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
    const dbInstance = this.getDbInstance(context);

    // check if the collection exists and is accessible
    const collection = await dbInstance.query.collections.findFirst({
      where: this.combineFilters(
        eq(collections.id, collectionId),
        this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
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

    // get the specific subcollection with its bobbleheads
    const subCollection = await dbInstance.query.subCollections.findFirst({
      where: and(eq(subCollections.collectionId, collectionId), eq(subCollections.id, subcollectionId)),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, undefined, context) ||
              eq(bobbleheads.isPublic, true),
          ),
        },
      },
    });

    if (!subCollection) {
      return null;
    }

    const featuredBobbleheadCount = subCollection.bobbleheads.filter(
      (bobblehead: { isFeatured: boolean }) => bobblehead.isFeatured,
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
   * Get subcollections for a collection
   */
  static async getSubCollectionsByCollection(
    collectionId: string,
    context: QueryContext,
  ): Promise<Array<{ id: string; name: string }>> {
    const dbInstance = this.getDbInstance(context);

    // build permission filter for the parent collection
    const collectionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    return dbInstance
      .select({
        id: subCollections.id,
        name: subCollections.name,
      })
      .from(subCollections)
      .innerJoin(collections, eq(subCollections.collectionId, collections.id))
      .where(this.combineFilters(eq(subCollections.collectionId, collectionId), collectionFilter))
      .orderBy(sql`lower(${subCollections.name}) asc`);
  }

  /**
   * get subcollections for a collection with detailed data for public display
   */
  static async getSubCollectionsForPublicView(
    collectionId: string,
    context: QueryContext,
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
    const dbInstance = this.getDbInstance(context);

    // check if the collection exists and is accessible
    const collection = await dbInstance.query.collections.findFirst({
      where: this.combineFilters(
        eq(collections.id, collectionId),
        this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
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

    // get subcollections with bobblehead counts
    const subCollectionData = await dbInstance.query.subCollections.findMany({
      orderBy: [sql`lower(${subCollections.name}) asc`],
      where: eq(subCollections.collectionId, collectionId),
      with: {
        bobbleheads: {
          where: and(
            eq(bobbleheads.isDeleted, false),
            this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, undefined, context) ||
              eq(bobbleheads.isPublic, true),
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
}
