import type { SQL } from 'drizzle-orm';

import { count, desc, eq, gte, lte, sql } from 'drizzle-orm';

import type { ENUMS } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';

import { contentViews } from '@/lib/db/schema';
import { ViewBaseQuery } from '@/lib/queries/analytics/view-base-query';

export type ContentPerformanceRecord = {
  anonymousViews: number;
  authenticatedViews: number;
  averageViewDuration: null | number;
  firstViewedAt: Date | null;
  lastViewedAt: Date | null;
  targetId: string;
  targetType: string;
  totalViews: number;
  uniqueViewers: number;
  viewsThisMonth: number;
  viewsThisWeek: number;
};

export type EngagementMetric = {
  averageSessionDuration: null | number;
  engagementScore: number;
  retentionRate: number;
  targetId: string;
  targetType: string;
  viewVelocity: number;
};

export type TrendingContentRecord = {
  averageViewDuration: null | number;
  recentViewsCount: number;
  targetId: string;
  targetType: string;
  trendingScore: number;
  uniqueViewers: number;
  viewCount: number;
};

export type ViewAnalyticsDashboard = {
  averageViewDuration: null | number;
  contentTypeBreakdown: Array<{
    percentage: number;
    targetType: string;
    viewCount: number;
  }>;
  topPerformingContent: Array<TrendingContentRecord>;
  totalViews: number;
  uniqueViewers: number;
  viewsTrend: Array<{
    date: string;
    uniqueViewers: number;
    views: number;
  }>;
};

export class ViewAnalyticsQuery extends ViewBaseQuery {
  /**
   * Get comprehensive performance metrics for content
   */
  static async getContentPerformanceAsync(
    targetIds: Array<string>,
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    options: {
      isIncludingAnonymous?: boolean;
    } = {},
    context: QueryContext,
  ): Promise<Array<ContentPerformanceRecord>> {
    if (targetIds.length === 0) return [];

    const dbInstance = this.getDbInstance(context);
    const { isIncludingAnonymous = true } = options;

    return this.executeWithRetry(async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const filters = [
        eq(contentViews.targetType, targetType),
        sql`${contentViews.targetId} = ANY(${targetIds})`,
      ];

      // add an anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
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
          firstViewedAt: sql<Date>`MIN(${contentViews.viewedAt})`.as('first_viewed_at'),
          lastViewedAt: sql<Date>`MAX(${contentViews.viewedAt})`.as('last_viewed_at'),
          targetId: contentViews.targetId,
          targetType: contentViews.targetType,
          totalViews: count(),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
          viewsThisMonth: sql<number>`COUNT(CASE WHEN ${contentViews.viewedAt} >= ${monthAgo} THEN 1 END)`.as(
            'views_this_month',
          ),
          viewsThisWeek: sql<number>`COUNT(CASE WHEN ${contentViews.viewedAt} >= ${weekAgo} THEN 1 END)`.as(
            'views_this_week',
          ),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(contentViews.targetId, contentViews.targetType);

      return result;
    }, 'getContentPerformance');
  }

  /**
   * Get popular content by view count
   */
  static async getPopularContentAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    options: FindOptions & {
      isIncludingAnonymous?: boolean;
      minViews?: number;
      timeframe?: 'all' | 'day' | 'month' | 'week';
    } = {},
    context: QueryContext,
  ): Promise<Array<{ targetId: string; uniqueViewers: number; viewCount: number }>> {
    const dbInstance = this.getDbInstance(context);
    const { isIncludingAnonymous = true, minViews = 1, timeframe = 'week', ...findOptions } = options;
    const pagination = this.applyPagination(findOptions);

    return this.executeWithRetry(async () => {
      const filters = [eq(contentViews.targetType, targetType)];

      // add time filter if not 'all'
      if (timeframe !== 'all') {
        const timeWindow = this._getTimeWindow(timeframe);
        filters.push(gte(contentViews.viewedAt, timeWindow));
      }

      // add an anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
      }

      const query = dbInstance
        .select({
          targetId: contentViews.targetId,
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
          viewCount: count(),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(contentViews.targetId)
        .having(sql`COUNT(*) >= ${minViews}`)
        .orderBy(desc(count()));

      if (pagination.limit) {
        query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query.offset(pagination.offset);
      }

      return query;
    }, 'getPopularContent');
  }

  /**
   * Get trending content based on view metrics
   */
  static async getTrendingContentAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    options: FindOptions & {
      isIncludingAnonymous?: boolean;
      minViews?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    } = {},
    context: QueryContext,
  ): Promise<Array<TrendingContentRecord>> {
    const dbInstance = this.getDbInstance(context);
    const { isIncludingAnonymous = true, minViews = 1, timeframe = 'day', ...findOptions } = options;
    const pagination = this.applyPagination(findOptions);

    return this.executeWithRetry(async () => {
      // calculate the time window
      const timeWindow = this._getTimeWindow(timeframe);
      const recentWindow = this._getTimeWindow('hour'); // Recent activity window

      const filters = [eq(contentViews.targetType, targetType), gte(contentViews.viewedAt, timeWindow)];

      // add the anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
      }

      const query = dbInstance
        .select({
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          recentViewsCount:
            sql<number>`COUNT(CASE WHEN ${contentViews.viewedAt} >= ${recentWindow} THEN 1 END)`.as(
              'recent_views_count',
            ),
          targetId: contentViews.targetId,
          targetType: contentViews.targetType,
          trendingScore: sql<number>`
            (COUNT(*) * 0.4) +
            (COUNT(DISTINCT ${contentViews.viewerId}) * 0.3) +
            (COUNT(CASE WHEN ${contentViews.viewedAt} >= ${recentWindow} THEN 1 END) * 0.3)
          `.as('trending_score'),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
          viewCount: count(),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(contentViews.targetId, contentViews.targetType)
        .having(sql`COUNT(*) >= ${minViews}`)
        .orderBy(desc(sql`trending_score`));

      if (pagination.limit) {
        query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query.offset(pagination.offset);
      }

      return query;
    }, 'getTrendingContent');
  }

  /**
   * Get user engagement metrics
   */
  static async getUserEngagementAsync(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    options: FindOptions & {
      minViews?: number;
      timeframe?: 'day' | 'month' | 'week';
    } = {},
    context: QueryContext,
  ): Promise<Array<EngagementMetric>> {
    const dbInstance = this.getDbInstance(context);
    const { minViews = 5, timeframe = 'week', ...findOptions } = options;
    const pagination = this.applyPagination(findOptions);

    return this.executeWithRetry(async () => {
      const timeWindow = this._getTimeWindow(timeframe);

      const filters = [
        eq(contentViews.targetType, targetType),
        gte(contentViews.viewedAt, timeWindow),
        sql`${contentViews.viewerId} IS NOT NULL`, // only authenticated users for engagement
      ];

      const query = dbInstance
        .select({
          averageSessionDuration: sql<number>`AVG(${contentViews.viewDuration})`.as(
            'average_session_duration',
          ),
          engagementScore: sql<number>`
            (COUNT(DISTINCT ${contentViews.viewerId}) * 2) +
            (AVG(${contentViews.viewDuration}) / 60 * 0.5) +
            (COUNT(*) / COUNT(DISTINCT ${contentViews.viewerId}))
          `.as('engagement_score'),
          retentionRate: sql<number>`
            COUNT(CASE WHEN ${contentViews.viewDuration} > 30 THEN 1 END) * 100.0 / COUNT(*)
          `.as('retention_rate'),
          targetId: contentViews.targetId,
          targetType: contentViews.targetType,
          viewVelocity:
            sql<number>`COUNT(*) / EXTRACT(EPOCH FROM (MAX(${contentViews.viewedAt}) - MIN(${contentViews.viewedAt}))) * 3600`.as(
              'view_velocity',
            ),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(contentViews.targetId, contentViews.targetType)
        .having(sql`COUNT(*) >= ${minViews}`)
        .orderBy(desc(sql`engagement_score`));

      if (pagination.limit) {
        query.limit(pagination.limit);
      }

      if (pagination.offset) {
        query.offset(pagination.offset);
      }

      return query;
    }, 'getUserEngagement');
  }

  /**
   * Get comprehensive analytics dashboard data
   */
  static async getViewAnalyticsDashboardAsync(
    options: {
      isIncludingAnonymous?: boolean;
      targetType?: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];
      timeframe?: 'day' | 'month' | 'week';
    } = {},
    context: QueryContext,
  ): Promise<ViewAnalyticsDashboard> {
    const dbInstance = this.getDbInstance(context);
    const { isIncludingAnonymous = true, targetType, timeframe = 'week' } = options;

    return this.executeWithRetry(async () => {
      const timeWindow = this._getTimeWindow(timeframe);
      const filters = [gte(contentViews.viewedAt, timeWindow)];

      if (targetType) {
        filters.push(eq(contentViews.targetType, targetType));
      }

      if (!isIncludingAnonymous) {
        filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
      }

      // get overall stats
      const overallStats = await dbInstance
        .select({
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          totalViews: count(),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters));

      // get the top performing content
      const topContent = await this.getTrendingContentAsync(
        targetType || 'bobblehead',
        { limit: 5, timeframe },
        context,
      );

      // get daily trend data
      const trendData = await dbInstance
        .select({
          date: sql<string>`DATE(${contentViews.viewedAt})`.as('date'),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
          views: count(),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(sql`DATE(${contentViews.viewedAt})`)
        .orderBy(sql`DATE(${contentViews.viewedAt})`);

      // get content type breakdown
      const typeBreakdown = await dbInstance
        .select({
          targetType: contentViews.targetType,
          viewCount: count(),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(contentViews.targetType);

      const totalViewsForPercentage = typeBreakdown.reduce((sum, item) => sum + Number(item.viewCount), 0);

      const contentTypeBreakdown = typeBreakdown.map((item) => ({
        percentage:
          totalViewsForPercentage > 0 ? (Number(item.viewCount) / totalViewsForPercentage) * 100 : 0,
        targetType: item.targetType,
        viewCount: Number(item.viewCount),
      }));

      return {
        averageViewDuration: overallStats[0]?.averageViewDuration || null,
        contentTypeBreakdown,
        topPerformingContent: topContent,
        totalViews: overallStats[0]?.totalViews || 0,
        uniqueViewers: overallStats[0]?.uniqueViewers || 0,
        viewsTrend: trendData,
      };
    }, 'getViewAnalyticsDashboard');
  }

  /**
   * Get view trends over time with aggregation
   */
  static async getViewTrendsAsync(
    options: {
      endDate?: Date;
      groupBy?: 'day' | 'hour' | 'month' | 'week';
      isIncludingAnonymous?: boolean;
      startDate?: Date;
      targetId?: string;
      targetType?: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];
    } = {},
    context: QueryContext,
  ): Promise<
    Array<{
      averageViewDuration: null | number;
      period: string;
      uniqueViewers: number;
      viewCount: number;
    }>
  > {
    const dbInstance = this.getDbInstance(context);
    const {
      endDate,
      groupBy = 'day',
      isIncludingAnonymous = true,
      startDate,
      targetId,
      targetType,
    } = options;

    return this.executeWithRetry(async () => {
      const filters = [];

      if (targetType) {
        filters.push(eq(contentViews.targetType, targetType));
      }
      if (targetId) {
        filters.push(eq(contentViews.targetId, targetId));
      }
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }
      if (endDate) {
        filters.push(lte(contentViews.viewedAt, endDate));
      }
      if (!isIncludingAnonymous) {
        filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
      }

      // generate grouping expression based on the groupBy parameter
      const groupingExpression: SQL = this._getGroupingExpression(groupBy);

      const result = await dbInstance
        .select({
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          period: sql<string>`${groupingExpression}`.as('period'),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
          viewCount: count(),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters))
        .groupBy(sql`${groupingExpression}`)
        .orderBy(sql`${groupingExpression}`);

      return result;
    }, 'getViewTrends');
  }

  /**
   * Helper method to get SQL grouping expression
   */
  private static _getGroupingExpression(groupBy: 'day' | 'hour' | 'month' | 'week'): SQL {
    switch (groupBy) {
      case 'day':
        return sql`DATE_TRUNC('day', ${contentViews.viewedAt})`;
      case 'hour':
        return sql`DATE_TRUNC('hour', ${contentViews.viewedAt})`;
      case 'month':
        return sql`DATE_TRUNC('month', ${contentViews.viewedAt})`;
      case 'week':
        return sql`DATE_TRUNC('week', ${contentViews.viewedAt})`;
      default:
        return sql`DATE_TRUNC('day', ${contentViews.viewedAt})`;
    }
  }

  /**
   * Helper method to get the time window based on timeframe
   */
  private static _getTimeWindow(timeframe: 'day' | 'hour' | 'month' | 'week'): Date {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }
}
