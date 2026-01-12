import { count, desc, eq, gte, inArray, isNotNull, lte, sql } from 'drizzle-orm';

import type { ENUMS } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { InsertContentView, SelectContentView } from '@/lib/validations/analytics.validation';

import { contentViews } from '@/lib/db/schema';
import { ViewBaseQuery } from '@/lib/queries/analytics/view-base.query';

export type RecentViewsRecord = {
  id: string;
  isAnonymous: boolean;
  targetId: string;
  targetType: string;
  viewDuration: null | number;
  viewedAt: Date;
  viewerId: null | string;
};

export type ViewRecord = SelectContentView;

export type ViewStats = {
  anonymousViews: number;
  authenticatedViews: number;
  averageViewDuration: null | number;
  totalViews: number;
  uniqueViewers: number;
};

/**
 * View tracking query class for database operations related to content views.
 * Provides methods for recording, retrieving, and analyzing view data
 * with deduplication and privacy compliance features.
 */
export class ViewTrackingQuery extends ViewBaseQuery {
  /**
   * Record multiple views in a batch operation
   */
  static async batchRecordViewsAsync(
    views: Array<InsertContentView>,
    context: QueryContext,
  ): Promise<Array<ViewRecord>> {
    if (views.length === 0) return [];

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const viewsWithTimestamp = views.map((view) => ({
        ...view,
        viewedAt: new Date(),
      }));

      const result = await dbInstance.insert(contentViews).values(viewsWithTimestamp).returning();

      return result;
    }, 'batchRecordViews');
  }

  /**
   * Delete views (for privacy compliance)
   */
  static async deleteViewsAsync(
    filters: {
      targetId?: string;
      targetType?: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];
      userId?: string;
      viewIds?: Array<string>;
    },
    context: QueryContext,
  ): Promise<number> {
    const { targetId, targetType, userId, viewIds } = filters;

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const whereConditions = [];

      if (targetType) {
        whereConditions.push(eq(contentViews.targetType, targetType));
      }
      if (targetId) {
        whereConditions.push(eq(contentViews.targetId, targetId));
      }
      if (userId) {
        whereConditions.push(eq(contentViews.viewerId, userId));
      }
      if (viewIds && viewIds.length > 0) {
        whereConditions.push(inArray(contentViews.id, viewIds));
      }

      if (whereConditions.length === 0) {
        throw new Error('At least one filter must be provided for view deletion');
      }

      const result = await dbInstance
        .delete(contentViews)
        .where(this.combineFilters(...whereConditions))
        .returning({ id: contentViews.id });

      return result.length;
    }, 'deleteViews');
  }

  /**
   * Get recent views for a target with privacy filtering
   */
  static async getRecentViewsAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string,
    options: FindOptions & {
      isIncludingAnonymous?: boolean;
      startDate?: Date;
    } = {},
    context: QueryContext,
  ): Promise<Array<RecentViewsRecord>> {
    const { isIncludingAnonymous = true, startDate, ...findOptions } = options;
    const pagination = this.applyPagination(findOptions);

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const filters = [eq(contentViews.targetType, targetType), eq(contentViews.targetId, targetId)];

      // Add an anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
      }

      // Add the start date filter
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }

      const query = dbInstance
        .select({
          id: contentViews.id,
          isAnonymous: sql<boolean>`CASE WHEN ${contentViews.viewerId} IS NULL THEN true ELSE false END`.as(
            'is_anonymous',
          ),
          targetId: contentViews.targetId,
          targetType: contentViews.targetType,
          viewDuration: contentViews.viewDuration,
          viewedAt: contentViews.viewedAt,
          viewerId: contentViews.viewerId,
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .orderBy(desc(contentViews.viewedAt));

      if (pagination.limit) {
        query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query.offset(pagination.offset);
      }

      return query;
    }, 'getRecentViews');
  }

  /**
   * Get views by a specific user
   */
  static async getUserViewsAsync(
    userId: string,
    options: FindOptions & {
      endDate?: Date;
      startDate?: Date;
      targetType?: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];
    } = {},
    context: QueryContext,
  ): Promise<Array<ViewRecord>> {
    const { endDate, startDate, targetType, ...findOptions } = options;
    const pagination = this.applyPagination(findOptions);

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const filters = [eq(contentViews.viewerId, userId)];

      // Add the target type filter if specified
      if (targetType) {
        filters.push(eq(contentViews.targetType, targetType));
      }

      // Add date range filters
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }
      if (endDate) {
        filters.push(lte(contentViews.viewedAt, endDate));
      }

      const query = dbInstance
        .select()
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .orderBy(desc(contentViews.viewedAt));

      if (pagination.limit) {
        query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query.offset(pagination.offset);
      }

      return query;
    }, 'getUserViews');
  }

  /**
   * Get the total view count for a target
   */
  static async getViewCountAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string,
    options: {
      endDate?: Date;
      isIncludingAnonymous?: boolean;
      startDate?: Date;
    } = {},
    context: QueryContext,
  ): Promise<number> {
    const { endDate, isIncludingAnonymous = true, startDate } = options;

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const filters = [eq(contentViews.targetType, targetType), eq(contentViews.targetId, targetId)];

      // Add the anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
      }

      // Add date range filters
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }
      if (endDate) {
        filters.push(lte(contentViews.viewedAt, endDate));
      }

      const result = await dbInstance
        .select({ count: count() })
        .from(contentViews)
        .where(this.combineFilters(...filters));

      return result[0]?.count || 0;
    }, 'getViewCount');
  }

  /**
   * Get detailed view statistics for a target
   */
  static async getViewStatsAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string,
    options: {
      endDate?: Date;
      startDate?: Date;
    } = {},
    context: QueryContext,
  ): Promise<ViewStats> {
    const { endDate, startDate } = options;

    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const filters = [eq(contentViews.targetType, targetType), eq(contentViews.targetId, targetId)];

      // Add date range filters
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }
      if (endDate) {
        filters.push(lte(contentViews.viewedAt, endDate));
      }

      const result = await dbInstance
        .select({
          anonymousViews: sql<number>`COUNT(CASE WHEN ${contentViews.viewerId} IS NULL THEN 1 END)`.as(
            'anonymous_views',
          ),
          authenticatedViews:
            sql<number>`COUNT(CASE WHEN ${contentViews.viewerId} IS NOT NULL THEN 1 END)`.as(
              'authenticated_views',
            ),
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          totalViews: count(),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters));

      const stats = result[0];
      return {
        anonymousViews: stats?.anonymousViews || 0,
        authenticatedViews: stats?.authenticatedViews || 0,
        averageViewDuration: stats?.averageViewDuration || null,
        totalViews: stats?.totalViews || 0,
        uniqueViewers: stats?.uniqueViewers || 0,
      };
    }, 'getViewStats');
  }

  /**
   * Check if a user has already viewed a target (for deduplication)
   */
  static async hasUserViewedAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string,
    identifier: {
      ipAddress?: string;
      userId?: string;
    },
    timeWindow:
      | undefined
      | {
          endDate: Date;
          startDate: Date;
        },
    context: QueryContext,
  ): Promise<boolean> {
    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);

      // Use the base query helper for building deduplication filters
      const deduplicationFilter = this.buildViewDeduplicationFilter(
        targetType,
        targetId,
        identifier,
        timeWindow,
      );

      // No identification provided
      if (!deduplicationFilter) {
        return false;
      }

      const result = await dbInstance
        .select({ id: contentViews.id })
        .from(contentViews)
        .where(deduplicationFilter)
        .limit(1);

      return result.length > 0;
    }, 'hasUserViewed');
  }

  /**
   * Record a single view with deduplication
   */
  static async recordViewAsync(data: InsertContentView, context: QueryContext): Promise<null | ViewRecord> {
    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const result = await dbInstance
        .insert(contentViews)
        .values({
          ...data,
          viewedAt: new Date(),
        })
        .returning();

      return result?.[0] || null;
    }, 'recordView');
  }

  /**
   * Update view duration for an existing view
   */
  static async updateViewDurationAsync(
    viewId: string,
    duration: number,
    context: QueryContext,
  ): Promise<null | ViewRecord> {
    return this.executeWithRetryAsync(async () => {
      const dbInstance = this.getDbInstance(context);
      const result = await dbInstance
        .update(contentViews)
        .set({ viewDuration: duration })
        .where(eq(contentViews.id, viewId))
        .returning();

      return result?.[0] || null;
    }, 'updateViewDuration');
  }
}
