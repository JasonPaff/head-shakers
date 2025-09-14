import { and, asc, desc, eq, ilike, isNull, or, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import { db } from '@/lib/db';
import { bobbleheadPhotos, bobbleheads, collections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadListRecord = {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  condition: null | string;
  description: null | string;
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

export class CollectionsQuery extends BaseQuery {
  static async createAsync(data: InsertCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await (dbInstance ?? db)
      .insert(collections)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  static async deleteAsync(data: DeleteCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await (dbInstance ?? db)
      .delete(collections)
      .where(and(eq(collections.id, data.collectionId), eq(collections.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  static async findById(id: string, context: QueryContext): Promise<CollectionRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.id, id),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

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

  static async getAllCollectionBobbleheadsWithPhotos(
    collectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const dbInstance = this.getDbInstance(context);

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
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          collectionFilter,
          bobbleheadFilter,
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
  }

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
        description: bobbleheads.description,
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

  static async getCollectionBobbleheadsWithPhotos(
    collectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
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
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
  }

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

  static async updateAsync(data: UpdateCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await (dbInstance ?? db)
      .update(collections)
      .set({ ...data, userId })
      .where(and(eq(collections.id, data.collectionId), eq(collections.userId, userId)))
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
