import { and, desc, eq, gte, isNull, lte, or } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * featured content record with related data
 */
export interface FeaturedContentRecord {
  comments?: number;
  contentId: string;
  contentType: 'bobblehead' | 'collection' | 'user';
  createdAt: Date;
  curatorNotes: null | string;
  description: null | string;
  endDate: Date | null;
  featureType: 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';
  id: string;
  imageUrl: null | string;
  isActive: boolean;
  likes?: number;
  // joined content data
  owner?: null | string;
  ownerDisplayName?: null | string;
  priority: number;
  startDate: Date | null;
  title: null | string;
  updatedAt: Date;
  viewCount: number;
}

/**
 * featured content domain query service
 * handles all database operations for featured content with consistent patterns
 */
export class FeaturedContentQuery extends BaseQuery {
  /**
   * get active featured content with related data
   */
  static async findActiveFeaturedContent(context: QueryContext): Promise<Array<FeaturedContentRecord>> {
    const dbInstance = this.getDbInstance(context);
    const now = new Date();

    const results = await dbInstance
      .select({
        bobbleheadLikes: bobbleheads.likeCount,
        bobbleheadOwner: bobbleheads.userId,
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
          eq(featuredContent.isActive, true),
          or(isNull(featuredContent.startDate), lte(featuredContent.startDate, now)),
          or(isNull(featuredContent.endDate), gte(featuredContent.endDate, now)),
        ),
      )
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

    return results.map((row) => ({
      comments: 0, // TODO: implement comments count
      contentId: row.contentId,
      contentType: row.contentType,
      createdAt: row.createdAt,
      curatorNotes: row.curatorNotes,
      description: row.description,
      endDate: row.endDate,
      featureType: row.featureType,
      id: row.id,
      imageUrl: row.imageUrl,
      isActive: row.isActive,
      likes: row.bobbleheadLikes || 0,
      owner: row.bobbleheadOwner || row.collectionOwner || row.userId,
      ownerDisplayName: row.userDisplayName,
      priority: row.priority,
      startDate: row.startDate,
      title: row.title,
      updatedAt: row.updatedAt,
      viewCount: row.viewCount,
    }));
  }
}