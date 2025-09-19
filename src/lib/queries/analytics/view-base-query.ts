import type { AnyColumn, SQL } from 'drizzle-orm';

import { and, eq, gte, lte, or, sql } from 'drizzle-orm';

import type { ENUMS } from '@/lib/constants';
import type { QueryContext } from '@/lib/queries/base/query-context';

import { contentViews } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { combineFilters } from '@/lib/queries/base/permission-filters';

/**
 * Base class for view tracking related queries
 * Extends BaseQuery with view-specific helper methods
 */
export abstract class ViewBaseQuery extends BaseQuery {
  /**
   * apply time range filtering for view tracking queries
   */
  protected static applyViewTimeframe(
    dateColumn: AnyColumn,
    timeframe: 'day' | 'hour' | 'month' | 'week' | 'year',
    customRange?: { endDate?: Date; startDate?: Date },
  ): SQL | undefined {
    const filters: Array<SQL | undefined> = [];

    // apply the custom date range if provided
    if (customRange?.startDate) {
      filters.push(gte(dateColumn, customRange.startDate));
    }
    if (customRange?.endDate) {
      filters.push(lte(dateColumn, customRange.endDate));
    }

    // if a custom range is provided, don't apply the timeframe window
    if (customRange?.startDate || customRange?.endDate) {
      return combineFilters(...filters);
    }

    // apply the timeframe window
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return undefined;
    }

    filters.push(gte(dateColumn, startDate));
    return combineFilters(...filters);
  }

  /**
   * build view analytics filters combining content permissions and view constraints
   */
  protected static buildViewAnalyticsFilters(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string | undefined,
    isPublicColumn: AnyColumn | undefined,
    userIdColumn: AnyColumn,
    context: QueryContext,
    options: {
      customTimeRange?: { endDate?: Date; startDate?: Date };
      isIncludingAnonymous?: boolean;
      timeframe?: 'day' | 'hour' | 'month' | 'week' | 'year';
    } = {},
  ): SQL | undefined {
    const { customTimeRange, isIncludingAnonymous = true, timeframe } = options;
    const filters: Array<SQL | undefined> = [];

    // content type filter
    filters.push(eq(contentViews.targetType, targetType));

    // specific content filter
    if (targetId) {
      filters.push(eq(contentViews.targetId, targetId));
    }

    // anonymous views filter
    if (!isIncludingAnonymous) {
      filters.push(sql`${contentViews.viewerId} IS NOT NULL`);
    }

    // time range filter
    if (timeframe) {
      filters.push(this.applyViewTimeframe(contentViews.viewedAt, timeframe, customTimeRange));
    }

    // permission filter for the content being viewed
    if (isPublicColumn) {
      filters.push(this.buildViewPermissionFilter(isPublicColumn, userIdColumn, context));
    }

    return combineFilters(...filters);
  }

  /**
   * build deduplication filter for view tracking
   */
  protected static buildViewDeduplicationFilter(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    targetId: string,
    identifier: {
      ipAddress?: string;
      userId?: string;
    },
    timeWindow?: {
      endDate: Date;
      startDate: Date;
    },
  ): SQL | undefined {
    const { ipAddress, userId } = identifier;
    const filters: Array<SQL | undefined> = [];

    // target filters
    filters.push(eq(contentViews.targetType, targetType));
    filters.push(eq(contentViews.targetId, targetId));

    // user or IP identification
    if (userId) {
      filters.push(eq(contentViews.viewerId, userId));
    } else if (ipAddress) {
      filters.push(eq(contentViews.ipAddress, ipAddress));
      filters.push(sql`${contentViews.viewerId} IS NULL`);
    } else {
      return undefined; // No identification provided
    }

    // time window for deduplication
    if (timeWindow) {
      filters.push(gte(contentViews.viewedAt, timeWindow.startDate));
      filters.push(lte(contentViews.viewedAt, timeWindow.endDate));
    }

    return combineFilters(...filters);
  }

  /**
   * build permission filter for view tracking based on content privacy settings
   * considers both content privacy and user permissions for viewing analytics
   */
  protected static buildViewPermissionFilter(
    isPublicColumn: AnyColumn | undefined,
    userIdColumn: AnyColumn,
    context: QueryContext,
    options: {
      isAllowingAnalyticsForPublic?: boolean;
      isAllowingOwnerViewPrivate?: boolean;
    } = {},
  ): SQL | undefined {
    const { isAllowingAnalyticsForPublic = true, isAllowingOwnerViewPrivate = true } = options;
    const { userId } = context;

    // if no public column, apply basic owner filtering
    if (!isPublicColumn) {
      return isAllowingOwnerViewPrivate && userId ? eq(userIdColumn, userId) : undefined;
    }

    const filters: Array<SQL | undefined> = [];

    // public content analytics (if allowed)
    if (isAllowingAnalyticsForPublic) {
      filters.push(eq(isPublicColumn, true));
    }

    // owner can view their private content analytics (if allowed and authenticated)
    if (isAllowingOwnerViewPrivate && userId) {
      filters.push(and(eq(isPublicColumn, false), eq(userIdColumn, userId)));
    }

    // default to public only
    return filters.length > 0 ? or(...filters.filter(Boolean)) : eq(isPublicColumn, true);
  }
}
