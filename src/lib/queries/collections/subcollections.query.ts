import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { InsertSubCollection, SelectSubCollection } from '@/lib/validations/subcollections.validation';

import { DEFAULTS } from '@/lib/constants';
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
  static async createAsync(data: InsertSubCollection & { slug: string }, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(subCollections).values(data).returning();
    return result?.[0] || null;
  }

  /**
   * delete a subcollection
   */
  static async deleteAsync(
    subcollectionId: string,
    userId: string,
    context: QueryContext,
  ): Promise<null | SelectSubCollection> {
    const database = this.getDbInstance(context);

    // First verify the subcollection belongs to a collection owned by the user
    const subcollection = await database
      .select()
      .from(subCollections)
      .innerJoin(collections, eq(subCollections.collectionId, collections.id))
      .where(and(eq(subCollections.id, subcollectionId), eq(collections.userId, userId)))
      .limit(1);

    if (!subcollection || subcollection.length === 0) {
      return null;
    }

    // Delete the subcollection
    const result = await database
      .delete(subCollections)
      .where(eq(subCollections.id, subcollectionId))
      .returning();

    return result?.[0] || null;
  }

  /**
   * find a subcollection by slug within a collection
   */
  static async findBySlugAsync(
    collectionSlug: string,
    subcollectionSlug: string,
    userId: string,
    context: QueryContext,
  ): Promise<null | SelectSubCollection> {
    const database = this.getDbInstance(context);

    // First get the collection by slug
    const collection = await database
      .select({ id: collections.id })
      .from(collections)
      .where(and(eq(collections.slug, collectionSlug), eq(collections.userId, userId)))
      .limit(1)
      .then((results) => results[0]);

    if (!collection) return null;

    // Then get the subcollection by slug within that collection
    return await database
      .select()
      .from(subCollections)
      .where(and(eq(subCollections.collectionId, collection.id), eq(subCollections.slug, subcollectionSlug)))
      .limit(1)
      .then((results) => results[0] ?? null);
  }

  /**
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotosAsync(
    subcollectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: null | string;
        featurePhoto?: null | string;
        subcollectionId: null | string;
        subcollectionSlug: null | string;
      }
    >
  > {
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
      .select(this._selectBobbleheadWithPhoto())
      .from(bobbleheads)
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .leftJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(subCollections, eq(bobbleheads.subcollectionId, subCollections.id))
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
  static async getSubCollectionForPublicViewAsync(
    collectionId: string,
    subcollectionId: string,
    context: QueryContext,
  ): Promise<null | {
    bobbleheadCount: number;
    collectionId: string;
    collectionName: string;
    collectionSlug: string;
    coverImageUrl: null | string;
    createdAt: Date;
    description: null | string;
    featuredBobbleheadCount: number;
    featurePhoto: null | string;
    id: string;
    isPublic: boolean;
    lastUpdatedAt: Date;
    name: string;
    slug: string;
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
            eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
            this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, undefined, context) ||
              eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
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
      collectionSlug: collection.slug,
      coverImageUrl: subCollection.coverImageUrl,
      createdAt: subCollection.createdAt,
      description: subCollection.description,
      featuredBobbleheadCount,
      featurePhoto: subCollection.coverImageUrl,
      id: subCollection.id,
      isPublic: subCollection.isPublic,
      lastUpdatedAt: subCollection.updatedAt,
      name: subCollection.name,
      slug: subCollection.slug,
      userId: collection.user?.id,
    };
  }

  /**
   * Get subcollections for a collection
   */
  static async getSubCollectionsByCollectionAsync(
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
  static async getSubCollectionsForPublicViewAsync(
    collectionId: string,
    context: QueryContext,
  ): Promise<null | {
    subCollections: Array<{
      bobbleheadCount: number;
      coverImageUrl: null | string;
      description: null | string;
      featurePhoto: null | string;
      id: string;
      isPublic: boolean;
      name: string;
      slug: string;
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
            eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
            this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, undefined, context) ||
              eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          ),
        },
      },
    });

    return {
      subCollections: subCollectionData.map((subCollection) => ({
        bobbleheadCount: subCollection.bobbleheads.length,
        coverImageUrl: subCollection.coverImageUrl,
        description: subCollection.description,
        featurePhoto: subCollection.coverImageUrl,
        id: subCollection.id,
        isPublic: subCollection.isPublic,
        name: subCollection.name,
        slug: subCollection.slug,
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
    context: QueryContext,
  ): Promise<null | SelectSubCollection> {
    const database = this.getDbInstance(context);

    // First verify the subcollection belongs to a collection owned by the user
    const subcollection = await database
      .select()
      .from(subCollections)
      .innerJoin(collections, eq(subCollections.collectionId, collections.id))
      .where(and(eq(subCollections.id, subcollectionId), eq(collections.userId, userId)))
      .limit(1);

    if (!subcollection || subcollection.length === 0) {
      return null;
    }

    // Update the subcollection
    const result = await database
      .update(subCollections)
      .set(data)
      .where(eq(subCollections.id, subcollectionId))
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

  private static _selectBobbleheadWithPhoto() {
    return {
      acquisitionDate: bobbleheads.acquisitionDate,
      acquisitionMethod: bobbleheads.acquisitionMethod,
      category: bobbleheads.category,
      characterName: bobbleheads.characterName,
      collectionId: bobbleheads.collectionId,
      collectionSlug: collections.slug,
      condition: bobbleheads.currentCondition,
      customFields: bobbleheads.customFields,
      description: bobbleheads.description,
      featurePhoto: bobbleheadPhotos.url,
      height: bobbleheads.height,
      id: bobbleheads.id,
      isFeatured: bobbleheads.isFeatured,
      isPublic: bobbleheads.isPublic,
      manufacturer: bobbleheads.manufacturer,
      material: bobbleheads.material,
      name: bobbleheads.name,
      purchaseLocation: bobbleheads.purchaseLocation,
      purchasePrice: bobbleheads.purchasePrice,
      series: bobbleheads.series,
      slug: bobbleheads.slug,
      status: bobbleheads.status,
      subcollectionId: bobbleheads.subcollectionId,
      subcollectionSlug: subCollections.slug,
      weight: bobbleheads.weight,
      year: bobbleheads.year,
    };
  }
}
