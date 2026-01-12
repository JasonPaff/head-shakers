import type { SQL } from 'drizzle-orm';

import { count, desc, eq, gte, inArray, isNotNull, lte, sql } from 'drizzle-orm';

import type { ENUMS } from '@/lib/constants';
import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';

import { contentViews } from '@/lib/db/schema';
import { ViewBaseQuery } from '@/lib/queries/analytics/view-base.query';

/**
 * Comprehensive performance metrics for content items.
 * Includes view counts, unique viewer tracking, and temporal analysis.
 */
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

/** Type representing a content view record from the database */
export type ContentViewRecord = typeof contentViews.$inferSelect;

/**
 * User engagement metrics for content items.
 * Measures viewer behavior patterns and content effectiveness.
 */
export type EngagementMetric = {
  averageSessionDuration: null | number;
  engagementScore: number;
  retentionRate: number;
  targetId: string;
  targetType: string;
  viewVelocity: number;
};

/**
 * Trending content metrics with scoring algorithm results.
 * Combines view velocity with unique viewer counts for trend detection.
 */
export type TrendingContentRecord = {
  averageViewDuration: null | number;
  recentViewsCount: number;
  targetId: string;
  targetType: string;
  trendingScore: number;
  uniqueViewers: number;
  viewCount: number;
};

/**
 * Complete analytics dashboard data structure.
 * Aggregates multiple metric types for comprehensive overview display.
 */
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

/**
 * Query class for view analytics operations.
 * Provides methods for performance metrics, trending content, and engagement analysis.
 *
 * @extends ViewBaseQuery - Inherits view-specific filtering and time window helpers
 */
export class ViewAnalyticsQuery extends ViewBaseQuery {
  /**
   * Get comprehensive performance metrics for multiple content items.
   *
   * Aggregates view data including total views, unique viewers, anonymous vs authenticated
   * breakdown, view duration averages, and temporal metrics (weekly/monthly views).
   *
   * @param targetIds - Array of content IDs to analyze
   * @param targetType - Type of content (bobblehead, collection, etc.)
   * @param options - Filter options
   * @param options.isIncludingAnonymous - Whether to include anonymous views (default: true)
   * @param context - Query context with database instance
   * @returns Array of performance records, one per content item. Returns empty array if no targetIds provided.
   */
  static async getContentPerformanceAsync(
    targetIds: Array<string>,
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    options: {
      isIncludingAnonymous?: boolean;
    } = {},
    context: QueryContext,
  ): Promise<Array<ContentPerformanceRecord>> {
    // Guard clause: return early for empty input
    if (targetIds.length === 0) return [];

    const dbInstance = this.getDbInstance(context);
    const { isIncludingAnonymous = true } = options;

    return this.executeWithRetryAsync(async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const filters: Array<SQL | undefined> = [
        eq(contentViews.targetType, targetType),
        inArray(contentViews.targetId, targetIds),
      ];

      // Add anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
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
   * Get popular content sorted by view count within a timeframe.
   *
   * Identifies top-performing content based on total views and unique viewer counts.
   * Supports filtering by minimum view threshold and pagination.
   *
   * @param targetType - Type of content to analyze
   * @param options - Query options
   * @param options.isIncludingAnonymous - Include anonymous views (default: true)
   * @param options.minViews - Minimum view count threshold (default: 1)
   * @param options.timeframe - Time window for analysis: 'all', 'day', 'week', 'month' (default: 'week')
   * @param options.limit - Maximum results to return
   * @param options.offset - Number of results to skip for pagination
   * @param context - Query context with database instance
   * @returns Array of popular content with view counts and unique viewers
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

    return this.executeWithRetryAsync(async () => {
      const filters: Array<SQL | undefined> = [eq(contentViews.targetType, targetType)];

      // Add time filter using parent class helper if not 'all'
      if (timeframe !== 'all') {
        filters.push(this.applyViewTimeframe(contentViews.viewedAt, timeframe));
      }

      // Add anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
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
   * Get trending content based on weighted view metrics.
   *
   * Calculates a trending score using:
   * - Total view count (40% weight)
   * - Unique viewer count (30% weight)
   * - Recent activity within the last hour (30% weight)
   *
   * @param targetType - Type of content to analyze
   * @param options - Query options
   * @param options.isIncludingAnonymous - Include anonymous views (default: true)
   * @param options.minViews - Minimum view count threshold (default: 1)
   * @param options.timeframe - Time window: 'hour', 'day', 'week', 'month' (default: 'day')
   * @param options.limit - Maximum results to return
   * @param options.offset - Number of results to skip for pagination
   * @param context - Query context with database instance
   * @returns Array of trending content with scores and metrics, sorted by trending score descending
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

    return this.executeWithRetryAsync(async () => {
      // Calculate time window using parent class helper
      const timeFilter = this.applyViewTimeframe(contentViews.viewedAt, timeframe);

      // Get the hour-ago date for recent activity calculation in trending score
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const filters: Array<SQL | undefined> = [eq(contentViews.targetType, targetType), timeFilter];

      // Add anonymous filter if specified
      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
      }

      const query = dbInstance
        .select({
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          recentViewsCount:
            sql<number>`COUNT(CASE WHEN ${contentViews.viewedAt} >= ${hourAgo} THEN 1 END)`.as(
              'recent_views_count',
            ),
          targetId: contentViews.targetId,
          targetType: contentViews.targetType,
          trendingScore: sql<number>`
            (COUNT(*) * 0.4) +
            (COUNT(DISTINCT ${contentViews.viewerId}) * 0.3) +
            (COUNT(CASE WHEN ${contentViews.viewedAt} >= ${hourAgo} THEN 1 END) * 0.3)
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
   * Get user engagement metrics for content items.
   *
   * Calculates engagement indicators including:
   * - Average session duration
   * - Engagement score (weighted formula)
   * - Retention rate (percentage of views over 30 seconds)
   * - View velocity (views per hour)
   *
   * Only includes authenticated user views for accurate engagement tracking.
   *
   * @param targetType - Type of content to analyze
   * @param options - Query options
   * @param options.minViews - Minimum views required for inclusion (default: 5)
   * @param options.timeframe - Time window: 'day', 'week', 'month' (default: 'week')
   * @param options.limit - Maximum results to return
   * @param options.offset - Number of results to skip for pagination
   * @param context - Query context with database instance
   * @returns Array of engagement metrics sorted by engagement score descending
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

    return this.executeWithRetryAsync(async () => {
      // Use parent class helper for time filtering
      const timeFilter = this.applyViewTimeframe(contentViews.viewedAt, timeframe);

      const filters: Array<SQL | undefined> = [
        eq(contentViews.targetType, targetType),
        timeFilter,
        isNotNull(contentViews.viewerId), // Only authenticated users for engagement
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
   * Get comprehensive analytics dashboard data.
   *
   * Aggregates multiple metrics for dashboard display:
   * - Overall view statistics (total views, unique viewers, avg duration)
   * - Top performing content (via trending algorithm)
   * - Daily view trends over the timeframe
   * - Content type breakdown with percentages
   *
   * @param options - Dashboard options
   * @param options.isIncludingAnonymous - Include anonymous views (default: true)
   * @param options.targetType - Filter to specific content type (optional)
   * @param options.timeframe - Time window: 'day', 'week', 'month' (default: 'week')
   * @param context - Query context with database instance
   * @returns Complete dashboard data structure with aggregated metrics
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

    return this.executeWithRetryAsync(async () => {
      // Use parent class helper for time filtering
      const timeFilter = this.applyViewTimeframe(contentViews.viewedAt, timeframe);
      const filters: Array<SQL | undefined> = [timeFilter];

      if (targetType) {
        filters.push(eq(contentViews.targetType, targetType));
      }

      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
      }

      // Get overall stats
      const overallStats = await dbInstance
        .select({
          averageViewDuration: sql<number>`AVG(${contentViews.viewDuration})`.as('average_view_duration'),
          totalViews: count(),
          uniqueViewers: sql<number>`COUNT(DISTINCT ${contentViews.viewerId})`.as('unique_viewers'),
        })
        .from(contentViews)
        .where(this.combineFilters(...filters));

      // Get top performing content
      const topContent = await this.getTrendingContentAsync(
        targetType || 'bobblehead',
        { limit: 5, timeframe },
        context,
      );

      // Get daily trend data
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

      // Get content type breakdown
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
   * Get view trends over time with configurable aggregation periods.
   *
   * Provides time-series data for charting and trend analysis.
   * Supports grouping by hour, day, week, or month.
   *
   * @param options - Trend query options
   * @param options.endDate - End of date range (optional)
   * @param options.groupBy - Aggregation period: 'hour', 'day', 'week', 'month' (default: 'day')
   * @param options.isIncludingAnonymous - Include anonymous views (default: true)
   * @param options.startDate - Start of date range (optional)
   * @param options.targetId - Filter to specific content item (optional)
   * @param options.targetType - Filter to specific content type (optional)
   * @param context - Query context with database instance
   * @returns Array of time periods with view counts and metrics, sorted chronologically
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

    return this.executeWithRetryAsync(async () => {
      const filters: Array<SQL | undefined> = [];

      if (targetType) {
        filters.push(eq(contentViews.targetType, targetType));
      }
      if (targetId) {
        filters.push(eq(contentViews.targetId, targetId));
      }

      // Apply date range filters directly for partial ranges
      if (startDate) {
        filters.push(gte(contentViews.viewedAt, startDate));
      }
      if (endDate) {
        filters.push(lte(contentViews.viewedAt, endDate));
      }

      if (!isIncludingAnonymous) {
        filters.push(isNotNull(contentViews.viewerId));
      }

      // Generate grouping expression based on the groupBy parameter
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
   * Generate SQL grouping expression for time-based aggregation.
   *
   * Uses PostgreSQL DATE_TRUNC for consistent period boundaries.
   * This method is kept as a private helper since the parent class
   * does not provide equivalent functionality.
   *
   * @param groupBy - Time period for grouping: 'hour', 'day', 'week', 'month'
   * @returns SQL expression for DATE_TRUNC with the specified period
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
}
