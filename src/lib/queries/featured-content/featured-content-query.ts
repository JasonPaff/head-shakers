import { and, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { RawFeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

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
   * get active featured content with related data (raw data for service layer transformation)
   */
  static async findActiveFeaturedContentAsync(context: QueryContext): Promise<Array<RawFeaturedContentData>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    const results = await dbInstance
      .select({
        bobbleheadLikes: bobbleheads.likeCount,
        bobbleheadOwner: bobbleheads.userId,
        collectionCoverImageUrl: collections.coverImageUrl,
        collectionOwner: collections.userId,
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
        userDisplayName: users.displayName,
        userId: users.id,
        viewCount: featuredContent.viewCount,
      })
      .from(featuredContent)
      .leftJoin(bobbleheads, eq(featuredContent.contentId, bobbleheads.id))
      .leftJoin(collections, eq(featuredContent.contentId, collections.id))
      .leftJoin(users, eq(featuredContent.contentId, users.id))
      .where(
        and(
          eq(featuredContent.isActive, DEFAULTS.FEATURED_CONTENT.IS_ACTIVE),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

    return results;
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
        curatorName: users.displayName,
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
        curatorName: users.displayName,
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
