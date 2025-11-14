import { and, desc, eq, like, or } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type {
  DeleteBobblehead,
  DeleteBobbleheadPhoto,
  InsertBobblehead,
  InsertBobbleheadPhoto,
  ReorderBobbleheadPhotos,
  UpdateBobblehead,
} from '@/lib/validations/bobbleheads.validation';

import {
  bobbleheadPhotos,
  bobbleheads,
  bobbleheadTags,
  collections,
  subCollections,
  tags,
  users,
} from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadDeleteResult = {
  bobblehead: BobbleheadRecord | null;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
};

/**
 * bobblehead record with related data
 */
export type BobbleheadRecord = typeof bobbleheads.$inferSelect;

export type BobbleheadWithRelations = BobbleheadRecord & {
  collectionName: null | string;
  collectionSlug: null | string;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
  subcollectionName: null | string;
  subcollectionSlug: null | string;
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
  static async addPhotoAsync(data: InsertBobbleheadPhoto, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.insert(bobbleheadPhotos).values(data).returning();

    return result?.[0] || null;
  }

  /**
   * batch update photo sortOrder values in a transaction
   */
  static async batchUpdatePhotoSortOrderAsync(
    data: ReorderBobbleheadPhotos,
    userId: string,
    context: QueryContext,
  ): Promise<Array<typeof bobbleheadPhotos.$inferSelect>> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership of the bobblehead first
    const bobblehead = await dbInstance
      .select()
      .from(bobbleheads)
      .where(and(eq(bobbleheads.id, data.bobbleheadId), eq(bobbleheads.userId, userId)))
      .limit(1);

    if (!bobblehead[0]) {
      return [];
    }

    // update each photo's sortOrder
    const updatePromises = data.photoOrder.map((photoUpdate) =>
      dbInstance
        .update(bobbleheadPhotos)
        .set({ sortOrder: photoUpdate.sortOrder })
        .where(
          and(eq(bobbleheadPhotos.id, photoUpdate.id), eq(bobbleheadPhotos.bobbleheadId, data.bobbleheadId)),
        )
        .returning(),
    );

    const results = await Promise.all(updatePromises);

    return results
      .map((result) => result[0])
      .filter((photo): photo is typeof bobbleheadPhotos.$inferSelect => photo !== undefined);
  }

  /**
   * create a new bobblehead
   */
  static async createAsync(
    data: InsertBobblehead & { slug: string },
    userId: string,
    context: QueryContext,
  ): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(bobbleheads)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  /**
   * delete a bobblehead with photos
   */
  static async deleteAsync(
    data: DeleteBobblehead,
    userId: string,
    context: QueryContext,
  ): Promise<BobbleheadDeleteResult> {
    const dbInstance = this.getDbInstance(context);

    // get the photos associated with this bobblehead before deletion
    const photos = await this.getPhotosAsync(data.bobbleheadId, context);

    // delete the bobblehead (cascade will handle photo records)
    const result = await dbInstance
      .delete(bobbleheads)
      .where(and(eq(bobbleheads.id, data.bobbleheadId), eq(bobbleheads.userId, userId)))
      .returning();

    const deletedBobblehead = result?.[0] || null;

    return {
      bobblehead: deletedBobblehead,
      photos,
    };
  }

  /**
   * delete a photo with ownership validation
   */
  static async deletePhotoAsync(
    data: DeleteBobbleheadPhoto,
    userId: string,
    context: QueryContext,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership before deletion
    const photo = await this.getPhotoByIdAsync(data.photoId, data.bobbleheadId, userId, context);

    if (!photo) {
      return null;
    }

    // delete the photo
    const result = await dbInstance
      .delete(bobbleheadPhotos)
      .where(and(eq(bobbleheadPhotos.id, data.photoId), eq(bobbleheadPhotos.bobbleheadId, data.bobbleheadId)))
      .returning();

    return result?.[0] || null;
  }

  /**
   * find bobbleheads by collection with options
   */
  static async findByCollectionAsync(
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
  static async findByIdAsync(id: string, context: QueryContext): Promise<BobbleheadRecord | null> {
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
  static async findByIdWithRelationsAsync(
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
      collectionSlug: result[0].collection?.slug || null,
      photos,
      subcollectionName: result[0].subcollection?.name || null,
      subcollectionSlug: result[0].subcollection?.slug || null,
      tags: bobbleheadTagsData.map((t) => t.tag),
    };
  }

  /**
   * find bobblehead by slug with standard permission filtering
   */
  static async findBySlugAsync(slug: string, context: QueryContext): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.slug, slug),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find bobblehead by slug with all related data (photos, tags, collections)
   */
  static async findBySlugWithRelationsAsync(
    slug: string,
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
          eq(bobbleheads.slug, slug),
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

    const bobbleheadId = result[0].bobblehead.id;

    // get photos
    const photos = await dbInstance
      .select()
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, bobbleheadId))
      .orderBy(bobbleheadPhotos.sortOrder, bobbleheadPhotos.uploadedAt);

    // get tags
    const bobbleheadTagsData = await dbInstance
      .select({
        tag: tags,
      })
      .from(bobbleheadTags)
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(eq(bobbleheadTags.bobbleheadId, bobbleheadId));

    return {
      ...result[0].bobblehead,
      collectionName: result[0].collection?.name || null,
      collectionSlug: result[0].collection?.slug || null,
      photos,
      subcollectionName: result[0].subcollection?.name || null,
      subcollectionSlug: result[0].subcollection?.slug || null,
      tags: bobbleheadTagsData.map((t) => t.tag),
    };
  }

  /**
   * find bobbleheads by user with options
   */
  static async findByUserAsync(
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
   * get bobblehead metadata for SEO and social sharing
   * returns minimal fields needed for metadata generation with owner info
   */
  static async getBobbleheadMetadata(
    slug: string,
    context: QueryContext,
  ): Promise<null | {
    category: null | string;
    createdAt: Date;
    description: null | string;
    name: string;
    owner: {
      displayName: string;
      username: string;
    };
    primaryImage: null | string;
    slug: string;
  }> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        category: bobbleheads.category,
        createdAt: bobbleheads.createdAt,
        description: bobbleheads.description,
        name: bobbleheads.name,
        ownerDisplayName: users.displayName,
        ownerUsername: users.username,
        primaryImage: bobbleheadPhotos.url,
        slug: bobbleheads.slug,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(bobbleheads.slug, slug),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.isDeleted, context),
        ),
      )
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const row = result[0];

    return {
      category: row.category,
      createdAt: row.createdAt,
      description: row.description,
      name: row.name,
      owner: {
        displayName: row.ownerDisplayName,
        username: row.ownerUsername,
      },
      primaryImage: row.primaryImage,
      slug: row.slug,
    };
  }

  /**
   * get a photo by id with ownership validation
   */
  static async getPhotoByIdAsync(
    photoId: string,
    bobbleheadId: string,
    userId: string,
    context: QueryContext,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    const dbInstance = this.getDbInstance(context);

    // join with bobbleheads to validate ownership
    const result = await dbInstance
      .select({ photo: bobbleheadPhotos })
      .from(bobbleheadPhotos)
      .innerJoin(bobbleheads, eq(bobbleheadPhotos.bobbleheadId, bobbleheads.id))
      .where(
        and(
          eq(bobbleheadPhotos.id, photoId),
          eq(bobbleheadPhotos.bobbleheadId, bobbleheadId),
          eq(bobbleheads.userId, userId),
        ),
      )
      .limit(1);

    return result[0]?.photo || null;
  }

  /**
   * get photos for a bobblehead
   */
  static async getPhotosAsync(
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
  static async searchAsync(
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

  /**
   * update an existing bobblehead
   */
  static async updateAsync(
    data: UpdateBobblehead,
    userId: string,
    context: QueryContext,
  ): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const { id, ...updateData } = data;

    const result = await dbInstance
      .update(bobbleheads)
      .set(updateData)
      .where(and(eq(bobbleheads.id, id), eq(bobbleheads.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  /**
   * update sortOrder for a single photo
   */
  static async updatePhotoSortOrderAsync(
    photoId: string,
    bobbleheadId: string,
    sortOrder: number,
    userId: string,
    context: QueryContext,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership via join
    const result = await dbInstance
      .update(bobbleheadPhotos)
      .set({ sortOrder })
      .from(bobbleheads)
      .where(
        and(
          eq(bobbleheadPhotos.id, photoId),
          eq(bobbleheadPhotos.bobbleheadId, bobbleheadId),
          eq(bobbleheads.id, bobbleheadId),
          eq(bobbleheads.userId, userId),
        ),
      )
      .returning();

    return result?.[0] || null;
  }
}
