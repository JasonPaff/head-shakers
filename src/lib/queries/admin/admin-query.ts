import { desc, eq } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { bobbleheads, collections, featuredContent, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * admin featured content record with extended data for management
 */
export interface AdminFeaturedContentRecord {
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
 * admin domain query service
 * handles all admin database operations with extended permissions and data
 */
export class AdminQuery extends BaseQuery {
  /**
   * get all featured content for admin management
   */
  static async findAllFeaturedContentForAdmin(context: QueryContext): Promise<Array<AdminFeaturedContentRecord>> {
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
      .orderBy(desc(featuredContent.priority), desc(featuredContent.createdAt));

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
   * get featured content by ID for admin management
   */
  static async findFeaturedContentByIdForAdmin(
    id: string,
    context: QueryContext,
  ): Promise<AdminFeaturedContentRecord | null> {
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
}