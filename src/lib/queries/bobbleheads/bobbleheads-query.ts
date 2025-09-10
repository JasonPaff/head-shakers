import { desc, eq, like, or } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import {
  bobbleheadPhotos,
  bobbleheads,
  bobbleheadTags,
  collections,
  subCollections,
  tags,
} from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * bobblehead record with related data
 */
export type BobbleheadRecord = typeof bobbleheads.$inferSelect;

export type BobbleheadWithRelations = BobbleheadRecord & {
  collectionName: null | string;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
  subcollectionName: null | string;
  tags: Array<typeof tags.$inferSelect>;
};

/**
 * bobblehead domain query service
 * handles all database operations for bobbleheads with consistent patterns
 */
export class BobbleheadsQuery extends BaseQuery {
  /**
   * add a photo to a bobblehead
   */
  static async addPhoto(data: InsertBobbleheadPhoto, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);
    
    const result = await dbInstance
      .insert(bobbleheadPhotos)
      .values(data)
      .returning();

    return result?.[0] || null;
  }

  /**
   * create a new bobblehead
   */
  static async create(data: InsertBobblehead, userId: string, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);
    
    const result = await dbInstance
      .insert(bobbleheads)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * find bobbleheads by collection with options
   */
  static async findByCollection(
    collectionId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<BobbleheadRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select()
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
        ),
      )
      .orderBy(desc(bobbleheads.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * find bobblehead by ID with standard permission filtering
   */
  static async findById(id: string, context: QueryContext): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.id, id),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find bobblehead by ID with all related data (photos, tags, collections)
   */
  static async findByIdWithRelations(
    id: string,
    context: QueryContext,
  ): Promise<BobbleheadWithRelations | null> {
    const dbInstance = this.getDbInstance(context);

    // get the bobblehead with collection/subcollection info
    const result = await dbInstance
      .select({
        bobblehead: bobbleheads,
        collection: collections,
        subcollection: subCollections,
      })
      .from(bobbleheads)
      .leftJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(subCollections, eq(bobbleheads.subcollectionId, subCollections.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.id, id),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
        ),
      )
      .limit(1);

    if (!result[0]) return null;

    // check if a collection is accessible (unless viewer is an owner)
    const collection = result[0].collection;
    if (collection && context.userId !== collection.userId && !collection.isPublic) {
      return null;
    }

    // get photos
    const photos = await dbInstance
      .select()
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, id))
      .orderBy(bobbleheadPhotos.sortOrder, bobbleheadPhotos.uploadedAt);

    // get tags
    const bobbleheadTagsData = await dbInstance
      .select({
        tag: tags,
      })
      .from(bobbleheadTags)
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(eq(bobbleheadTags.bobbleheadId, id));

    return {
      ...result[0].bobblehead,
      collectionName: result[0].collection?.name || null,
      photos,
      subcollectionName: result[0].subcollection?.name || null,
      tags: bobbleheadTagsData.map((t) => t.tag),
    };
  }

  /**
   * find bobbleheads by user with options
   */
  static async findByUser(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<BobbleheadRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    // if the context user matches the target user, use protected context
    const isOwnerViewing = context.userId === userId;
    const finalContext = isOwnerViewing ? { ...context, requiredUserId: userId } : context;

    const query = dbInstance
      .select()
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.userId, userId),
          this.buildBaseFilters(
            bobbleheads.isPublic,
            bobbleheads.userId,
            bobbleheads.isDeleted,
            finalContext,
          ),
        ),
      )
      .orderBy(desc(bobbleheads.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  /**
   * get photos for a bobblehead
   */
  static async getPhotos(
    bobbleheadId: string,
    context: QueryContext,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select()
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, bobbleheadId))
      .orderBy(bobbleheadPhotos.sortOrder, bobbleheadPhotos.uploadedAt);
  }

  /**
   * search bobbleheads with advanced filtering
   */
  static async search(
    searchTerm: string,
    filters: {
      category?: string;
      collectionId?: string;
      manufacturer?: string;
      maxYear?: number;
      minYear?: number;
      status?: string;
      userId?: string;
    } = {},
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<BobbleheadRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const conditions = [
      this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
    ];

    // add search term conditions
    const escapedSearchTerm = searchTerm.replace(/[%_]/g, '\\$&');
    if (escapedSearchTerm) {
      conditions.push(
        or(
          like(bobbleheads.name, `%${escapedSearchTerm}%`),
          like(bobbleheads.description, `%${escapedSearchTerm}%`),
          like(bobbleheads.characterName, `%${escapedSearchTerm}%`),
          like(bobbleheads.manufacturer, `%${escapedSearchTerm}%`),
          like(bobbleheads.series, `%${escapedSearchTerm}%`),
        ),
      );
    }

    // add filters
    if (filters.userId) conditions.push(eq(bobbleheads.userId, filters.userId));
    if (filters.collectionId) conditions.push(eq(bobbleheads.collectionId, filters.collectionId));
    if (filters.category) conditions.push(eq(bobbleheads.category, filters.category));
    if (filters.manufacturer) conditions.push(eq(bobbleheads.manufacturer, filters.manufacturer));
    if (filters.status) conditions.push(eq(bobbleheads.status, filters.status));
    if (filters.minYear) conditions.push(eq(bobbleheads.year, filters.minYear));
    if (filters.maxYear) conditions.push(eq(bobbleheads.year, filters.maxYear));

    const query = dbInstance
      .select()
      .from(bobbleheads)
      .where(this.combineFilters(...conditions.filter(Boolean)))
      .orderBy(desc(bobbleheads.createdAt));

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }
}
