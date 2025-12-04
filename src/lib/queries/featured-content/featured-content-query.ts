import { and, asc, desc, eq, gte, inArray, isNull, lte, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { RawFeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { CONFIG, DEFAULTS } from '@/lib/constants';
import {
  bobbleheadPhotos,
  bobbleheads,
  collections,
  comments,
  featuredContent,
  likes,
  users,
} from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * data needed for featured collections display
 */
export type FeaturedCollectionData = {
  comments: number;
  contentId: string;
  contentSlug: string;
  description: null | string;
  id: string;
  imageUrl: null | string;
  isLiked: boolean;
  isTrending: boolean;
  likeId: null | string;
  likes: number;
  ownerAvatarUrl: null | string;
  ownerDisplayName: null | string;
  title: null | string;
  totalItems: number;
  totalValue: null | string;
  viewCount: number;
};

export interface FeaturedContentRecord {
  contentId: string;
  contentTitle?: null | string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorId: null | string;
  curatorName: null | string;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  priority: number;
  sortOrder: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

/**
 * minimal data needed for footer featured collections display
 */
export interface FooterFeaturedContentData {
  collectionName: null | string;
  collectionSlug: null | string;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  id: string;
  title: null | string;
}

/**
 * minimal data needed for hero featured bobblehead display
 */
export interface HeroFeaturedBobbleheadData {
  contentId: string;
  contentName: null | string;
  contentSlug: null | string;
  description: null | string;
  imageUrl: null | string;
  likes: number;
  owner: null | string;
  viewCount: number;
}

/**
 * data needed for trending bobbleheads display on homepage
 */
export interface TrendingBobbleheadData {
  category: null | string;
  contentId: string;
  contentSlug: null | string;
  featureType: 'editor_pick' | 'trending';
  id: string;
  imageUrl: null | string;
  likeCount: number;
  name: null | string;
  title: null | string;
  viewCount: number;
  year: null | number;
}

export class FeaturedContentQuery extends BaseQuery {
  /**
   * create a new featured content entry
   */
  static async createAsync(
    data: InsertFeaturedContent,
    curatorId: string,
    context: QueryContext,
  ): Promise<null | SelectFeaturedContent> {
    const dbInstance = this.getDbInstance(context);

    // ensure required fields have default values if not provided
    const insertData = {
      ...data,
      curatorId,
      priority: data.priority ?? 0,
      sortOrder: data.sortOrder ?? 0,
      viewCount: data.viewCount ?? 0,
    };

    const result = await dbInstance.insert(featuredContent).values(insertData).returning();

    return result?.[0] || null;
  }

  /**
   * delete a featured content entry
   */
  static async deleteAsync(id: string, context: QueryContext): Promise<null | SelectFeaturedContent> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.delete(featuredContent).where(eq(featuredContent.id, id)).returning();

    return result?.[0] || null;
  }

  /**
   * get all featured content for admin management
   */
  static async findAllFeaturedContentForAdminAsync(
    context: QueryContext,
  ): Promise<Array<FeaturedContentRecord>> {
    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        bobbleheadTitle: bobbleheads.name,
        collectionTitle: collections.name,
        contentId: featuredContent.contentId,
        contentType: featuredContent.contentType,
        createdAt: featuredContent.createdAt,
        curatorId: featuredContent.curatorId,
        curatorName: users.username,
        curatorNotes: featuredContent.curatorNotes,
        description: featuredContent.description,
        endDate: featuredContent.endDate,
        featureType: featuredContent.featureType,
        id: featuredContent.id,
        imageUrl: featuredContent.imageUrl,
        isActive: featuredContent.isActive,
        priority: featuredContent.priority,
        sortOrder: featuredContent.sortOrder,
        startDate: featuredContent.startDate,
        title: featuredContent.title,
        updatedAt: featuredContent.updatedAt,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .leftJoin(users, eq(featuredContent.curatorId, users.id))
      .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(collections, eq(featuredContent.contentId, collections.id))
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt), desc(featuredContent.title));

    return results.map((row) => ({
      contentId: row.contentId,
      contentTitle: row.bobbleheadTitle || row.collectionTitle,
      contentType: row.contentType,
      createdAt: row.createdAt,
      curatorId: row.curatorId,
      curatorName: row.curatorName,
      curatorNotes: row.curatorNotes,
      description: row.description,
      endDate: row.endDate,
      featureType: row.featureType,
      id: row.id,
      imageUrl: row.imageUrl,
      isActive: row.isActive,
      priority: row.priority,
      sortOrder: row.sortOrder,
      startDate: row.startDate,
      title: row.title,
      updatedAt: row.updatedAt,
      viewCount: row.viewCount,
    }));
  }

  /**
   * find featured content by ID
   */
  static async findByIdAsync(id: string, context: QueryContext): Promise<null | SelectFeaturedContent> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select().from(featuredContent).where(eq(featuredContent.id, id)).limit(1);

    return result[0] || null;
  }

  /**
   * get featured content by ID for admin management
   */
  static async findFeaturedContentByIdForAdminAsync(
    id: string,
    context: QueryContext,
  ): Promise<FeaturedContentRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        bobbleheadTitle: bobbleheads.name,
        collectionTitle: collections.name,
        contentId: featuredContent.contentId,
        contentType: featuredContent.contentType,
        createdAt: featuredContent.createdAt,
        curatorId: featuredContent.curatorId,
        curatorName: users.username,
        curatorNotes: featuredContent.curatorNotes,
        description: featuredContent.description,
        endDate: featuredContent.endDate,
        featureType: featuredContent.featureType,
        id: featuredContent.id,
        imageUrl: featuredContent.imageUrl,
        isActive: featuredContent.isActive,
        priority: featuredContent.priority,
        sortOrder: featuredContent.sortOrder,
        startDate: featuredContent.startDate,
        title: featuredContent.title,
        updatedAt: featuredContent.updatedAt,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .leftJoin(users, eq(featuredContent.curatorId, users.id))
      .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(collections, eq(featuredContent.contentId, collections.id))
      .where(eq(featuredContent.id, id))
      .limit(1);

    if (!results[0]) return null;

    const row = results[0];
    return {
      contentId: row.contentId,
      contentTitle: row.bobbleheadTitle || row.collectionTitle,
      contentType: row.contentType,
      createdAt: row.createdAt,
      curatorId: row.curatorId,
      curatorName: row.curatorName,
      curatorNotes: row.curatorNotes,
      description: row.description,
      endDate: row.endDate,
      featureType: row.featureType,
      id: row.id,
      imageUrl: row.imageUrl,
      isActive: row.isActive,
      priority: row.priority,
      sortOrder: row.sortOrder,
      startDate: row.startDate,
      title: row.title,
      updatedAt: row.updatedAt,
      viewCount: row.viewCount,
    };
  }

  /**
   * get active featured content with related data (raw data for service layer transformation)
   *
   * joins with bobbleheads, collections, users (for user content type),
   * bobbleheadPhotos (for primary image), and owner users (for owner display names)
   */
  static async getActiveFeaturedContentAsync(context: QueryContext): Promise<Array<RawFeaturedContentData>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    // create aliases for users table to get owner display names
    const bobbleheadOwnerUsers = alias(users, 'bobbleheadOwnerUsers');
    const collectionOwnerUsers = alias(users, 'collectionOwnerUsers');

    return dbInstance
      .select({
        bobbleheadLikes: bobbleheads.likeCount,
        bobbleheadName: bobbleheads.name,
        bobbleheadOwner: bobbleheads.userId,
        bobbleheadOwnerUsername: bobbleheadOwnerUsers.username,
        bobbleheadPrimaryPhotoUrl: bobbleheadPhotos.url,
        bobbleheadSlug: bobbleheads.slug,
        collectionCoverImageUrl: collections.coverImageUrl,
        collectionOwner: collections.userId,
        collectionOwnerUsername: collectionOwnerUsers.username,
        collectionSlug: collections.slug,
        contentId: featuredContent.contentId,
        contentType: featuredContent.contentType,
        createdAt: featuredContent.createdAt,
        curatorNotes: featuredContent.curatorNotes,
        description: featuredContent.description,
        endDate: featuredContent.endDate,
        featureType: featuredContent.featureType,
        id: featuredContent.id,
        imageUrl: featuredContent.imageUrl,
        isActive: featuredContent.isActive,
        priority: featuredContent.priority,
        startDate: featuredContent.startDate,
        title: featuredContent.title,
        updatedAt: featuredContent.updatedAt,
        userId: users.id,
        userUsername: users.username,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheadPhotos.bobbleheadId, bobbleheads.id), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .leftJoin(bobbleheadOwnerUsers, eq(bobbleheads.userId, bobbleheadOwnerUsers.id))
      .leftJoin(collections, eq(featuredContent.contentId, collections.id))
      .leftJoin(collectionOwnerUsers, eq(collections.userId, collectionOwnerUsers.id))
      .leftJoin(users, eq(featuredContent.contentId, users.id))
      .where(
        and(
          eq(featuredContent.isActive, DEFAULTS.FEATURED_CONTENT.IS_ACTIVE),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));
  }

  /**
   * get featured bobblehead data
   *
   * returns the single highest-priority active featured bobblehead with only the fields
   * needed for the hero display component. uses innerJoin to ensure bobblehead exists.
   */
  static async getFeaturedBobbleheadAsync(context: QueryContext): Promise<HeroFeaturedBobbleheadData | null> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    const results = await dbInstance
      .select({
        contentId: featuredContent.contentId,
        contentName: bobbleheads.name,
        contentSlug: bobbleheads.slug,
        description: featuredContent.description,
        imageUrl: bobbleheadPhotos.url,
        likes: bobbleheads.likeCount,
        owner: bobbleheads.userId,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .innerJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheadPhotos.bobbleheadId, bobbleheads.id), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(featuredContent.contentType, 'bobblehead'),
          eq(featuredContent.isActive, true),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt))
      .limit(1);

    return results[0] ?? null;
  }

  /**
   * get featured collections data
   *
   * returns up to 6 active featured collections with all fields needed for the
   * FeaturedCollectionsDisplay component. uses innerJoin to ensure collection exists.
   * optionally includes like status for authenticated users.
   */
  static async getFeaturedCollectionsAsync(
    context: QueryContext,
    userId?: null | string,
  ): Promise<Array<FeaturedCollectionData>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    return dbInstance
      .select({
        comments: sql<number>`(
          SELECT COUNT(*)::integer
          FROM ${comments}
          WHERE ${comments.targetId} = ${collections.id}
          AND ${comments.targetType} = 'collection'
          AND ${comments.deletedAt} IS NULL
        )`.as('comments'),
        contentId: featuredContent.contentId,
        contentSlug: collections.slug,
        description: featuredContent.description,
        id: featuredContent.id,
        imageUrl: sql<null | string>`COALESCE
          (${featuredContent.imageUrl}, ${collections.coverImageUrl})`,
        isLiked: sql<boolean>`${likes.id} IS NOT NULL`,
        isTrending: sql<boolean>`${featuredContent.featureType} = 'trending'`,
        likeId: likes.id,
        likes: sql<number>`(
          SELECT COUNT(*)::integer
          FROM likes
          WHERE target_id = ${collections.id}
          AND like_target_type = 'collection'
        )`.as('likes'),
        ownerAvatarUrl: users.avatarUrl,
        ownerDisplayName: users.username,
        title: featuredContent.title,
        totalItems: sql<number>`(SELECT COUNT(*)::integer
                                 FROM ${bobbleheads}
                                 WHERE ${bobbleheads.collectionId} = ${collections.id}
                                   AND ${bobbleheads.deletedAt} IS NULL)`.as('total_items'),
        totalValue: sql<null | string>`(SELECT COALESCE(SUM(${bobbleheads.purchasePrice}), 0)
                                        FROM ${bobbleheads}
                                        WHERE ${bobbleheads.collectionId} = ${collections.id}
                                          AND ${bobbleheads.deletedAt} IS NULL)`,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .innerJoin(collections, eq(featuredContent.contentId, collections.id))
      .innerJoin(users, eq(collections.userId, users.id))
      .leftJoin(
        likes,
        userId ?
          and(
            eq(likes.targetId, collections.id),
            eq(likes.targetType, 'collection'),
            eq(likes.userId, userId),
          )
        : sql`false`,
      )
      .where(
        and(
          eq(featuredContent.contentType, 'collection'),
          eq(featuredContent.isActive, true),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt))
      .limit(6);
  }

  /**
   * get minimal featured content data for footer display
   *
   * only joins with the collection's table and selects minimal fields
   * filters for active content within the date range
   *
   * Permission Filtering: This query returns public featured content only. No user-specific
   * permission filtering is required as featured content is curated by admins and intended
   * for public display. The query filters by isActive status and date range to ensure only
   * currently active featured content is returned.
   *
   * Note on NULL handling: collectionName and collectionSlug can be null when:
   * - The featured content references a non-collection entity (user or bobblehead)
   * - The collection has been soft-deleted (deletedAt is not null)
   * In these cases, the title field from featured_content provides fallback display text.
   */
  static async getFooterFeaturedContentAsync(
    context: QueryContext,
  ): Promise<Array<FooterFeaturedContentData>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    return dbInstance
      .select({
        collectionName: collections.name,
        collectionSlug: collections.slug,
        contentId: featuredContent.contentId,
        contentType: featuredContent.contentType,
        id: featuredContent.id,
        title: featuredContent.title,
      })
      .from(featuredContent)
      .leftJoin(
        collections,
        and(eq(featuredContent.contentId, collections.id), isNull(collections.deletedAt)),
      )
      .where(
        and(
          eq(featuredContent.isActive, true),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt))
      .limit(CONFIG.CONTENT.MAX_FEATURED_FOOTER_ITEMS + 1);
  }

  /**
   * get trending bobbleheads data for homepage display
   *
   * returns active featured bobbleheads with feature_type 'trending' or 'editor_pick',
   * ordered by priority (ascending) and limited to 12 items. uses innerJoin to ensure bobblehead exists.
   * returns only the fields needed for the TrendingBobbleheadsDisplay component.
   *
   * @param context - query context with database instance
   * @returns array of trending bobblehead data (limit 12, ordered by priority asc)
   */
  static async getTrendingBobbleheadsAsync(context: QueryContext): Promise<Array<TrendingBobbleheadData>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    return dbInstance
      .select({
        category: bobbleheads.category,
        contentId: featuredContent.contentId,
        contentSlug: bobbleheads.slug,
        featureType: sql<'editor_pick' | 'trending'>`${featuredContent.featureType}`,
        id: featuredContent.id,
        imageUrl: sql<null | string>`COALESCE(${featuredContent.imageUrl}, ${bobbleheadPhotos.url})`,
        likeCount: bobbleheads.likeCount,
        name: bobbleheads.name,
        title: featuredContent.title,
        viewCount: featuredContent.viewCount,
        year: bobbleheads.year,
      })
      .from(featuredContent)
      .innerJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheadPhotos.bobbleheadId, bobbleheads.id), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        and(
          eq(featuredContent.contentType, 'bobblehead'),
          eq(featuredContent.isActive, true),
          inArray(featuredContent.featureType, ['trending', 'editor_pick']),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(asc(featuredContent.priority), desc(featuredContent.createdAt))
      .limit(12);
  }

  /**
   * increment view count for featured content
   */
  static async incrementViewCountAsync(contentId: string, context: QueryContext): Promise<void> {
    const dbInstance = this.getDbInstance(context);

    await dbInstance
      .update(featuredContent)
      .set({
        updatedAt: new Date(),
        viewCount: sql`${featuredContent.viewCount} + 1`,
      })
      .where(eq(featuredContent.id, contentId));
  }

  /**
   * toggle active status of featured content
   */
  static async toggleActiveAsync(
    id: string,
    isActive: boolean,
    context: QueryContext,
  ): Promise<null | SelectFeaturedContent> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(featuredContent)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(featuredContent.id, id))
      .returning();

    return result?.[0] || null;
  }

  /**
   * update a featured content entry
   */
  static async updateAsync(
    id: string,
    data: UpdateFeaturedContent,
    context: QueryContext,
  ): Promise<null | SelectFeaturedContent> {
    const dbInstance = this.getDbInstance(context);

    // filter out null values to avoid type issues
    const updateData = Object.fromEntries(
      Object.entries({ ...data, updatedAt: new Date() }).filter(([, value]) => value !== null),
    );

    const result = await dbInstance
      .update(featuredContent)
      .set(updateData)
      .where(eq(featuredContent.id, id))
      .returning();

    return result?.[0] || null;
  }
}
