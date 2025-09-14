import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertSubCollection, SelectSubCollection } from '@/lib/validations/subcollections.validation';

import { db } from '@/lib/db';
import { bobbleheadPhotos, bobbleheads, collections, subCollections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * subcollection domain query service
 * handles all database operations for subcollections
 */
export class SubcollectionsQuery extends BaseQuery {
  /**
   * create a new subcollection
   */
  static async createAsync(data: InsertSubCollection, dbInstance: DatabaseExecutor = db) {
    const result = await (dbInstance ?? db).insert(subCollections).values(data).returning();
    return result?.[0] || null;
  }

  /**
   * delete a subcollection
   */
  static async deleteAsync(
    subcollectionId: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectSubCollection> {
    const result = await (dbInstance ?? db)
      .delete(subCollections)
      .where(
        and(
          eq(subCollections.id, subcollectionId),
          eq(
            subCollections.collectionId,
            dbInstance.select({ id: collections.id }).from(collections).where(eq(collections.userId, userId)),
          ),
        ),
      )
      .returning();
    return result?.[0] || null;
  }

  /**
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance = this.getDbInstance(context);

    const bobbleheadFilter = this.buildBaseFilters(
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.isDeleted,
      context,
    );

    const searchCondition = this._getSearchCondition(options?.searchTerm);
    const sortOrder = this._getSortOrder(options?.sortBy);

    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        condition: bobbleheads.currentCondition,
        description: bobbleheads.description,
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
      .where(
        this.combineFilters(
          eq(bobbleheads.subcollectionId, subcollectionId),
          bobbleheadFilter,
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
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

  /**
   * update a subcollection
   */
  static async updateAsync(
    subcollectionId: string,
    data: Partial<InsertSubCollection>,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectSubCollection> {
    const result = await (dbInstance ?? db)
      .update(subCollections)
      .set(data)
      .where(
        and(
          eq(subCollections.id, subcollectionId),
          eq(
            subCollections.collectionId,
            dbInstance.select({ id: collections.id }).from(collections).where(eq(collections.userId, userId)),
          ),
        ),
      )
      .returning();
    return result?.[0] || null;
  }

  private static _getSearchCondition(searchTerm?: string) {
    if (!searchTerm) return undefined;
    return or(
      ilike(bobbleheads.name, `%${searchTerm}%`),
      ilike(bobbleheads.description, `%${searchTerm}%`),
      ilike(bobbleheads.characterName, `%${searchTerm}%`),
    );
  }

  private static _getSortOrder(sortBy?: string) {
    switch (sortBy) {
      case 'name_asc':
        return asc(bobbleheads.name);
      case 'name_desc':
        return desc(bobbleheads.name);
      case 'oldest':
        return asc(bobbleheads.createdAt);
      case 'newest':
      default:
        return desc(bobbleheads.createdAt);
    }
  }
}
