import { and, eq, ilike, inArray, not, or, type SQL } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { TagRecord } from '@/lib/queries/tags/tags-query';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags, collections, tags, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadPhoto = {
  altText: null | string;
  bobbleheadId: string;
  isPrimary: boolean;
  sortOrder: number;
  url: string;
};

export type BobbleheadSearchResult = {
  category: null | string;
  characterName: null | string;
  collectionName: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  manufacturer: null | string;
  name: null | string;
  ownerName: null | string;
  ownerUsername: null | string;
  primaryPhotoUrl: null | string;
  series: null | string;
  tags?: Array<TagRecord>;
  year: null | number;
};

/**
 * type definitions for search results
 */
export type CollectionSearchResult = {
  coverImageUrl: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
  ownerName: null | string;
  ownerUsername: null | string;
  tags?: Array<TagRecord>;
  totalItems: null | number;
};

export type UserSearchResult = {
  avatarUrl: null | string;
  bio: null | string;
  displayName: null | string;
  id: string;
  isVerified: boolean;
  location: null | string;
  memberSince: Date;
  username: null | string;
};

/**
 * content search domain query service
 * handles all database operations for searching content to feature
 */
export class ContentSearchQuery extends BaseQuery {
  /**
   * find bobblehead by ID for featuring
   */
  static async findBobbleheadById(id: string, context: QueryContext): Promise<BobbleheadSearchResult | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionName: collections.name,
        description: bobbleheads.description,
        id: bobbleheads.id,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        ownerName: users.displayName,
        ownerUsername: users.username,
        primaryPhotoUrl: bobbleheadPhotos.url,
        series: bobbleheads.series,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        and(
          eq(bobbleheads.id, id),
          eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
          eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find a collection by ID for featuring
   */
  static async findCollectionById(id: string, context: QueryContext): Promise<CollectionSearchResult | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        ownerName: users.displayName,
        ownerUsername: users.username,
        totalItems: collections.totalItems,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id))
      .where(
        and(
          eq(collections.id, id),
          eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
          eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find a user by ID for featuring
   */
  static async findUserById(id: string, context: QueryContext): Promise<null | UserSearchResult> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        displayName: users.displayName,
        id: users.id,
        isVerified: users.isVerified,
        location: users.location,
        memberSince: users.memberSince,
        username: users.username,
      })
      .from(users)
      .where(and(eq(users.id, id), eq(users.isDeleted, DEFAULTS.USER.IS_DELETED)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * get photos for multiple bobbleheads
   */
  static async getBobbleheadPhotos(
    bobbleheadIds: Array<string>,
    context: QueryContext,
  ): Promise<Array<BobbleheadPhoto>> {
    if (bobbleheadIds.length === 0) {
      return [];
    }

    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        altText: bobbleheadPhotos.altText,
        bobbleheadId: bobbleheadPhotos.bobbleheadId,
        isPrimary: bobbleheadPhotos.isPrimary,
        sortOrder: bobbleheadPhotos.sortOrder,
        url: bobbleheadPhotos.url,
      })
      .from(bobbleheadPhotos)
      .where(inArray(bobbleheadPhotos.bobbleheadId, bobbleheadIds))
      .orderBy(bobbleheadPhotos.sortOrder);
  }

  /**
   * get photos for a single bobblehead
   */
  static async getBobbleheadPhotosById(id: string, context: QueryContext): Promise<Array<BobbleheadPhoto>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        altText: bobbleheadPhotos.altText,
        bobbleheadId: bobbleheadPhotos.bobbleheadId,
        isPrimary: bobbleheadPhotos.isPrimary,
        sortOrder: bobbleheadPhotos.sortOrder,
        url: bobbleheadPhotos.url,
      })
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, id))
      .orderBy(bobbleheadPhotos.sortOrder);
  }

  /**
   * get tags for multiple bobbleheads
   */
  static async getBobbleheadTags(
    bobbleheadIds: Array<string>,
    context: QueryContext,
  ): Promise<Map<string, Array<TagRecord>>> {
    if (bobbleheadIds.length === 0) {
      return new Map();
    }

    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        bobbleheadId: bobbleheadTags.bobbleheadId,
        color: tags.color,
        createdAt: tags.createdAt,
        id: tags.id,
        name: tags.name,
        updatedAt: tags.updatedAt,
        usageCount: tags.usageCount,
        userId: tags.userId,
      })
      .from(bobbleheadTags)
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(inArray(bobbleheadTags.bobbleheadId, bobbleheadIds))
      .orderBy(tags.name);

    // group by bobblehead ID
    const tagsByBobblehead = new Map<string, Array<TagRecord>>();
    results.forEach((result) => {
      const { bobbleheadId, ...tag } = result;
      if (!tagsByBobblehead.has(bobbleheadId)) {
        tagsByBobblehead.set(bobbleheadId, []);
      }
      tagsByBobblehead.get(bobbleheadId)?.push(tag);
    });

    return tagsByBobblehead;
  }

  /**
   * get tags for collections based on their bobbleheads
   */
  static async getCollectionTags(
    collectionIds: Array<string>,
    context: QueryContext,
  ): Promise<Map<string, Array<TagRecord>>> {
    if (collectionIds.length === 0) {
      return new Map();
    }

    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        collectionId: bobbleheads.collectionId,
        color: tags.color,
        createdAt: tags.createdAt,
        id: tags.id,
        name: tags.name,
        updatedAt: tags.updatedAt,
        usageCount: tags.usageCount,
        userId: tags.userId,
      })
      .from(bobbleheads)
      .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(
        and(
          inArray(bobbleheads.collectionId, collectionIds),
          eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
        ),
      )
      .orderBy(tags.name);

    // group by collection ID and deduplicate tags
    const tagsByCollection = new Map<string, Array<TagRecord>>();
    const seenTags = new Map<string, Set<string>>(); // collectionId -> set of tag IDs

    results.forEach((result) => {
      const { collectionId, ...tag } = result;

      if (!tagsByCollection.has(collectionId)) {
        tagsByCollection.set(collectionId, []);
        seenTags.set(collectionId, new Set());
      }

      const tagSet = seenTags.get(collectionId)!;
      if (!tagSet.has(tag.id)) {
        tagSet.add(tag.id);
        tagsByCollection.get(collectionId)?.push(tag);
      }
    });

    return tagsByCollection;
  }

  /**
   * search bobbleheads for featuring
   */
  static async searchBobbleheads(
    query: string | undefined,
    limit: number,
    context: QueryContext,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<Array<BobbleheadSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions
    const conditions: Array<SQL> = [
      eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
      eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
      eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
    ];

    // Add text search conditions if query is provided
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(bobbleheads.name, `%${query}%`),
        ilike(bobbleheads.description, `%${query}%`),
        ilike(bobbleheads.characterName, `%${query}%`),
        ilike(bobbleheads.manufacturer, `%${query}%`),
        ilike(bobbleheads.series, `%${query}%`),
        ilike(users.displayName, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(collections.name, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    const queryBuilder = dbInstance
      .select({
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionName: collections.name,
        description: bobbleheads.description,
        id: bobbleheads.id,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        ownerName: users.displayName,
        ownerUsername: users.username,
        primaryPhotoUrl: bobbleheadPhotos.url,
        series: bobbleheads.series,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      );

    // Add tag filtering if includeTags or excludeTags are provided
    if (includeTags && includeTags.length > 0) {
      // For include tags, we need bobbleheads that have ALL the specified tags
      for (const tagId of includeTags) {
        conditions.push(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(eq(bobbleheadTags.tagId, tagId)),
          ),
        );
      }
    }

    if (excludeTags && excludeTags.length > 0) {
      // For exclude tags, we need bobbleheads that DON'T have ANY of the specified tags
      conditions.push(
        not(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(inArray(bobbleheadTags.tagId, excludeTags)),
          ),
        ),
      );
    }

    return queryBuilder.where(and(...conditions)).limit(limit);
  }

  /**
   * search collections for featuring
   */
  static async searchCollections(
    query: string | undefined,
    limit: number,
    context: QueryContext,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<Array<CollectionSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions
    const conditions: Array<SQL> = [
      eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
      eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
    ];

    // Add text search conditions if query is provided
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(collections.name, `%${query}%`),
        ilike(collections.description, `%${query}%`),
        ilike(users.displayName, `%${query}%`),
        ilike(users.username, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    const queryBuilder = dbInstance
      .select({
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        ownerName: users.displayName,
        ownerUsername: users.username,
        totalItems: collections.totalItems,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id));

    // For collections, we search based on tags of bobbleheads within the collection
    if (includeTags && includeTags.length > 0) {
      // Find collections that contain bobbleheads with ALL the specified tags
      for (const tagId of includeTags) {
        conditions.push(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  eq(bobbleheadTags.tagId, tagId),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
                ),
              ),
          ),
        );
      }
    }

    if (excludeTags && excludeTags.length > 0) {
      // Find collections that DON'T contain bobbleheads with ANY of the specified tags
      conditions.push(
        not(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  inArray(bobbleheadTags.tagId, excludeTags),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
                ),
              ),
          ),
        ),
      );
    }

    return queryBuilder.where(and(...conditions)).limit(limit);
  }

  /**
   * search users for featuring
   */
  static async searchUsers(
    query: string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<UserSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        displayName: users.displayName,
        id: users.id,
        isVerified: users.isVerified,
        location: users.location,
        memberSince: users.memberSince,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          or(
            ilike(users.displayName, `%${query}%`),
            ilike(users.username, `%${query}%`),
            ilike(users.bio, `%${query}%`),
            ilike(users.location, `%${query}%`),
          ),
        ),
      )
      .limit(limit);
  }
}
