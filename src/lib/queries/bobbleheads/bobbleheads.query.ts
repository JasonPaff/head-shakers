import type { AnyColumn } from 'drizzle-orm';

import { and, asc, count, desc, eq, gt, gte, inArray, isNull, like, lt, ne, or } from 'drizzle-orm';

import type { FindOptions, QueryContext, UserQueryContext } from '@/lib/queries/base/query-context';
import type {
  DeleteBobblehead,
  DeleteBobbleheadPhoto,
  InsertBobblehead,
  InsertBobbleheadPhoto,
  ReorderBobbleheadPhotos,
  UpdateBobblehead,
  UpdateBobbleheadPhotoMetadata,
} from '@/lib/validations/bobbleheads.validation';

import { bobbleheadPhotos, bobbleheads, bobbleheadTags, collections, tags, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { buildSoftDeleteFilter } from '@/lib/queries/base/permission-filters';

/**
 * adjacent bobblehead with primary photo URL for navigation previews
 */
export type AdjacentBobblehead = BobbleheadRecord & {
  photoUrl: null | string;
};

/**
 * result type for adjacent bobblehead navigation within a collection
 */
export type AdjacentBobbleheadsResult = {
  nextBobblehead: AdjacentBobblehead | null;
  previousBobblehead: AdjacentBobblehead | null;
};

export type BobbleheadDeleteResult = {
  bobblehead: BobbleheadRecord | null;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
};

/**
 * result type for bobblehead position within a collection context
 */
export type BobbleheadPositionResult = {
  /** 1-indexed ordinal position based on createdAt DESC ordering (position 1 = newest) */
  currentPosition: number;
  /** total number of bobbleheads in the filtered collection context */
  totalCount: number;
};

/**
 * bobblehead record with related data
 */
export type BobbleheadRecord = typeof bobbleheads.$inferSelect;

export type BobbleheadWithRelations = BobbleheadRecord & {
  collectionName: null | string;
  collectionSlug: null | string;
  ownerUsername: null | string;
  photos: Array<typeof bobbleheadPhotos.$inferSelect>;
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
   * batch delete multiple bobbleheads with ownership verification
   * returns deleted bobbleheads and their photo URLs for Cloudinary cleanup
   */
  static async batchDeleteAsync(
    ids: Array<string>,
    context: UserQueryContext,
  ): Promise<{ deletedBobbleheads: Array<BobbleheadRecord>; photoUrls: Array<string> }> {
    const dbInstance = this.getDbInstance(context);

    if (ids.length === 0) {
      return { deletedBobbleheads: [], photoUrls: [] };
    }

    // get all photos for these bobbleheads before deletion
    const photos = await dbInstance
      .select()
      .from(bobbleheadPhotos)
      .where(inArray(bobbleheadPhotos.bobbleheadId, ids));

    const photoUrls = photos.map((photo) => photo.url);

    // delete bobbleheads with ownership verification (cascade will handle photo records)
    const deletedBobbleheads = await dbInstance
      .delete(bobbleheads)
      .where(this.combineFilters(inArray(bobbleheads.id, ids), eq(bobbleheads.userId, context.userId)))
      .returning();

    return {
      deletedBobbleheads,
      photoUrls,
    };
  }

  /**
   * batch update isFeatured status for multiple bobbleheads with ownership verification
   */
  static async batchUpdateFeaturedAsync(
    ids: Array<string>,
    isFeatured: boolean,
    context: UserQueryContext,
  ): Promise<Array<BobbleheadRecord>> {
    const dbInstance = this.getDbInstance(context);

    if (ids.length === 0) {
      return [];
    }

    return dbInstance
      .update(bobbleheads)
      .set({ isFeatured })
      .where(this.combineFilters(inArray(bobbleheads.id, ids), eq(bobbleheads.userId, context.userId)))
      .returning();
  }

  /**
   * batch update photo sortOrder and isPrimary values in a transaction
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

    // update each photo's sortOrder and optionally isPrimary
    const updatePromises = data.photoOrder.map((photoUpdate) => {
      const updateData: { isPrimary?: boolean; sortOrder: number } = {
        sortOrder: photoUpdate.sortOrder,
      };

      // only include isPrimary if it's explicitly provided
      if (photoUpdate.isPrimary !== undefined) {
        updateData.isPrimary = photoUpdate.isPrimary;
      }

      return dbInstance
        .update(bobbleheadPhotos)
        .set(updateData)
        .where(
          and(eq(bobbleheadPhotos.id, photoUpdate.id), eq(bobbleheadPhotos.bobbleheadId, data.bobbleheadId)),
        )
        .returning();
    });

    const results = await Promise.all(updatePromises);

    return results
      .map((result) => result[0])
      .filter((photo): photo is typeof bobbleheadPhotos.$inferSelect => photo !== undefined);
  }

  /**
   * count total bobbleheads across all users excluding deleted records
   */
  static async countTotalBobbleheadsAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(bobbleheads)
      .where(isNull(bobbleheads.deletedAt));

    return result[0]?.count || 0;
  }

  /**
   * create a new bobblehead
   */
  static async createAsync(
    data: InsertBobblehead & { slug: string },
    context: UserQueryContext,
  ): Promise<BobbleheadRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(bobbleheads)
      .values({ ...data, userId: context.userId })
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
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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

    // get the bobblehead with collection info and owner username
    const result = await dbInstance
      .select({
        bobblehead: bobbleheads,
        collection: collections,
        ownerUsername: users.username,
      })
      .from(bobbleheads)
      .leftJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(users, eq(bobbleheads.userId, users.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.id, id),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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
      ownerUsername: result[0].ownerUsername || null,
      photos,
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
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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

    // get the bobblehead with collection info and owner username
    const result = await dbInstance
      .select({
        bobblehead: bobbleheads,
        collection: collections,
        ownerUsername: users.username,
      })
      .from(bobbleheads)
      .leftJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(users, eq(bobbleheads.userId, users.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.slug, slug),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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
      ownerUsername: result[0].ownerUsername || null,
      photos,
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
            bobbleheads.deletedAt,
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
   * get adjacent bobbleheads (previous and next) within a collection context
   * uses createdAt DESC ordering where "previous" = newer item, "next" = older item
   */
  static async getAdjacentBobbleheadsInCollectionAsync(
    bobbleheadId: string,
    collectionId: string,
    context: QueryContext,
  ): Promise<AdjacentBobbleheadsResult> {
    const dbInstance = this.getDbInstance(context);

    // first, get the current bobblehead to find its createdAt timestamp
    const currentBobblehead = await dbInstance
      .select({ createdAt: bobbleheads.createdAt })
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.id, bobbleheadId),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .limit(1);

    if (!currentBobblehead[0]) {
      return { nextBobblehead: null, previousBobblehead: null };
    }

    const currentCreatedAt = currentBobblehead[0].createdAt;

    // build base filter conditions for collection context
    const baseConditions = [
      eq(bobbleheads.collectionId, collectionId),
      this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
    ];

    // find previous bobblehead (newer = createdAt > current, order by createdAt ASC to get closest)
    // explicitly exclude current bobblehead to prevent self-reference
    // LEFT JOIN with bobbleheadPhotos to get primary photo URL
    const previousResult = await dbInstance
      .select({
        bobblehead: bobbleheads,
        photoUrl: bobbleheadPhotos.url,
      })
      .from(bobbleheads)
      .leftJoin(bobbleheadPhotos, this._primaryPhotoJoinCondition(bobbleheads.id))
      .where(
        this.combineFilters(
          ne(bobbleheads.id, bobbleheadId),
          gt(bobbleheads.createdAt, currentCreatedAt),
          ...baseConditions,
        ),
      )
      .orderBy(asc(bobbleheads.createdAt))
      .limit(1);

    // find next bobblehead (older = createdAt < current, order by createdAt DESC to get closest)
    // explicitly exclude current bobblehead to prevent self-reference
    // LEFT JOIN with bobbleheadPhotos to get primary photo URL
    const nextResult = await dbInstance
      .select({
        bobblehead: bobbleheads,
        photoUrl: bobbleheadPhotos.url,
      })
      .from(bobbleheads)
      .leftJoin(bobbleheadPhotos, this._primaryPhotoJoinCondition(bobbleheads.id))
      .where(
        this.combineFilters(
          ne(bobbleheads.id, bobbleheadId),
          lt(bobbleheads.createdAt, currentCreatedAt),
          ...baseConditions,
        ),
      )
      .orderBy(desc(bobbleheads.createdAt))
      .limit(1);

    // transform results to include photoUrl in the bobblehead record
    const previousBobblehead =
      previousResult[0] ? { ...previousResult[0].bobblehead, photoUrl: previousResult[0].photoUrl } : null;

    const nextBobblehead =
      nextResult[0] ? { ...nextResult[0].bobblehead, photoUrl: nextResult[0].photoUrl } : null;

    return {
      nextBobblehead,
      previousBobblehead,
    };
  }

  /**
   * Get total bobblehead count excluding deleted records
   * Returns 0 if no bobbleheads exist
   */
  static async getBobbleheadCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    return await dbInstance
      .select({ count: count() })
      .from(bobbleheads)
      .where(buildSoftDeleteFilter(bobbleheads.deletedAt, context))
      .then((result) => result[0]?.count || 0);
  }

  /**
   * Get bobblehead metadata for SEO and social sharing
   * Returns minimal fields needed for metadata generation with owner info,
   * or null if the bobblehead is not found or not accessible
   */
  static async getBobbleheadMetadataAsync(
    slug: string,
    context: QueryContext,
  ): Promise<null | {
    category: null | string;
    createdAt: Date;
    description: null | string;
    name: string;
    owner: {
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
        ownerUsername: users.username,
        primaryImage: bobbleheadPhotos.url,
        slug: bobbleheads.slug,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .leftJoin(bobbleheadPhotos, this._primaryPhotoJoinCondition(bobbleheads.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.slug, slug),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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
        username: row.ownerUsername,
      },
      primaryImage: row.primaryImage,
      slug: row.slug,
    };
  }

  /**
   * get the position of a bobblehead within a collection context
   *
   * position calculation:
   * - uses createdAt DESC ordering where position 1 = newest bobblehead
   * - position is calculated by counting bobbleheads with createdAt >= current bobblehead's createdAt
   * - this ensures consistent ordering with the list view and adjacent navigation
   *
   * @param bobbleheadId - the ID of the bobblehead to find position for
   * @param collectionId - the collection to scope the position calculation
   * @param context - query context for permissions and database instance
   * @returns position result with currentPosition (1-indexed) and totalCount, or null if bobblehead not found
   */
  static async getBobbleheadPositionInCollectionAsync(
    bobbleheadId: string,
    collectionId: string,
    context: QueryContext,
  ): Promise<BobbleheadPositionResult | null> {
    const dbInstance = this.getDbInstance(context);

    // first, get the current bobblehead to find its createdAt timestamp
    const currentBobblehead = await dbInstance
      .select({ createdAt: bobbleheads.createdAt })
      .from(bobbleheads)
      .where(
        this.combineFilters(
          eq(bobbleheads.id, bobbleheadId),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .limit(1);

    if (!currentBobblehead[0]) {
      return null;
    }

    const currentCreatedAt = currentBobblehead[0].createdAt;

    // build base filter conditions for collection context
    const baseConditions = [
      eq(bobbleheads.collectionId, collectionId),
      this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
    ];

    // count total bobbleheads in the collection context
    const totalResult = await dbInstance
      .select({ count: count() })
      .from(bobbleheads)
      .where(this.combineFilters(...baseConditions));

    const totalCount = totalResult[0]?.count || 0;

    // calculate position: count bobbleheads with createdAt >= current (including current)
    // this gives us the 1-indexed position in DESC order (position 1 = newest)
    const positionResult = await dbInstance
      .select({ count: count() })
      .from(bobbleheads)
      .where(this.combineFilters(gte(bobbleheads.createdAt, currentCreatedAt), ...baseConditions));

    const currentPosition = positionResult[0]?.count || 0;

    return {
      currentPosition,
      totalCount,
    };
  }

  /**
   * Get the first (newest) bobblehead in a collection for loop-around navigation
   * Used when at the last bobblehead and navigating to "next"
   * Returns null if collection is empty or not accessible
   */
  static async getFirstBobbleheadInCollectionAsync(
    collectionId: string,
    context: QueryContext,
  ): Promise<AdjacentBobblehead | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        bobblehead: bobbleheads,
        photoUrl: bobbleheadPhotos.url,
      })
      .from(bobbleheads)
      .leftJoin(bobbleheadPhotos, this._primaryPhotoJoinCondition(bobbleheads.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .orderBy(desc(bobbleheads.createdAt))
      .limit(1);

    return result[0] ? { ...result[0].bobblehead, photoUrl: result[0].photoUrl } : null;
  }

  /**
   * Get the last (oldest) bobblehead in a collection for loop-around navigation
   * Used when at the first bobblehead and navigating to "previous"
   * Returns null if collection is empty or not accessible
   */
  static async getLastBobbleheadInCollectionAsync(
    collectionId: string,
    context: QueryContext,
  ): Promise<AdjacentBobblehead | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        bobblehead: bobbleheads,
        photoUrl: bobbleheadPhotos.url,
      })
      .from(bobbleheads)
      .leftJoin(bobbleheadPhotos, this._primaryPhotoJoinCondition(bobbleheads.id))
      .where(
        this.combineFilters(
          eq(bobbleheads.collectionId, collectionId),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .orderBy(asc(bobbleheads.createdAt))
      .limit(1);

    return result[0] ? { ...result[0].bobblehead, photoUrl: result[0].photoUrl } : null;
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
   * Get photos for a bobblehead ordered by sortOrder and uploadedAt
   * Note: Caller must verify bobblehead access before calling this method
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
   * Get all bobblehead slugs for the current user
   * Returns an array of slug strings, or empty array if none exist
   * Excludes soft-deleted bobbleheads
   */
  static async getSlugsAsync(context: UserQueryContext): Promise<Array<string>> {
    const dbInstance = this.getDbInstance(context);
    return await dbInstance
      .select({ slug: bobbleheads.slug })
      .from(bobbleheads)
      .where(and(eq(bobbleheads.userId, context.userId), isNull(bobbleheads.deletedAt)))
      .then((results) => results.map((r) => r.slug));
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
      this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
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
   * update isFeatured status for a single bobblehead with ownership verification
   * Returns the bobblehead record with collection slug for cache invalidation
   */
  static async updateFeaturedAsync(
    id: string,
    isFeatured: boolean,
    context: UserQueryContext,
  ): Promise<(BobbleheadRecord & { collectionSlug: string | null }) | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(bobbleheads)
      .set({ isFeatured })
      .where(and(eq(bobbleheads.id, id), eq(bobbleheads.userId, context.userId)))
      .returning();

    const bobblehead = result?.[0];
    if (!bobblehead) return null;

    // Fetch collection slug for cache invalidation
    const collection = await dbInstance
      .select({ slug: collections.slug })
      .from(collections)
      .where(eq(collections.id, bobblehead.collectionId))
      .limit(1);

    return {
      ...bobblehead,
      collectionSlug: collection[0]?.slug ?? null,
    };
  }

  /**
   * update photo metadata (altText and caption) with ownership validation
   */
  static async updatePhotoMetadataAsync(
    data: UpdateBobbleheadPhotoMetadata,
    userId: string,
    context: QueryContext,
  ): Promise<null | typeof bobbleheadPhotos.$inferSelect> {
    const dbInstance = this.getDbInstance(context);

    // verify ownership via join with bobbleheads table
    const result = await dbInstance
      .update(bobbleheadPhotos)
      .set({
        altText: data.altText,
        caption: data.caption,
      })
      .from(bobbleheads)
      .where(
        and(
          eq(bobbleheadPhotos.id, data.photoId),
          eq(bobbleheadPhotos.bobbleheadId, data.bobbleheadId),
          eq(bobbleheads.id, data.bobbleheadId),
          eq(bobbleheads.userId, userId),
        ),
      )
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

  /**
   * Build the join condition for primary bobblehead photos
   * Used for LEFT JOIN with bobbleheadPhotos table to get only primary photos
   */
  private static _primaryPhotoJoinCondition(bobbleheadIdColumn: AnyColumn) {
    return and(eq(bobbleheadIdColumn, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true));
  }
}
