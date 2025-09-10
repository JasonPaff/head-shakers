import { and, eq, ilike, inArray, or } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, collections, users } from '@/lib/db/schema';
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
   * search bobbleheads for featuring
   */
  static async searchBobbleheads(
    query: string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<BobbleheadSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
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
          eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          eq(bobbleheads.isDeleted, DEFAULTS.BOBBLEHEAD.IS_DELETED),
          eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          or(
            ilike(bobbleheads.name, `%${query}%`),
            ilike(bobbleheads.description, `%${query}%`),
            ilike(bobbleheads.characterName, `%${query}%`),
            ilike(bobbleheads.manufacturer, `%${query}%`),
            ilike(bobbleheads.series, `%${query}%`),
            ilike(users.displayName, `%${query}%`),
            ilike(users.username, `%${query}%`),
            ilike(collections.name, `%${query}%`),
          ),
        ),
      )
      .limit(limit);
  }

  /**
   * search collections for featuring
   */
  static async searchCollections(
    query: string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<CollectionSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
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
          eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
          eq(users.isDeleted, DEFAULTS.USER.IS_DELETED),
          or(
            ilike(collections.name, `%${query}%`),
            ilike(collections.description, `%${query}%`),
            ilike(users.displayName, `%${query}%`),
            ilike(users.username, `%${query}%`),
          ),
        ),
      )
      .limit(limit);
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
