import type { AnyColumn, SQL } from 'drizzle-orm';

import { and, eq, gte, isNotNull, isNull, lte, or } from 'drizzle-orm';

import type { ENUMS } from '@/lib/constants';
import type { QueryContext } from '@/lib/queries/base/query-context';

import { contentViews } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/**
 * Base class for view tracking related queries.
 * Extends BaseQuery with view-specific helper methods for time range filtering,
 * analytics aggregation, and deduplication.
 */
export abstract class ViewBaseQuery extends BaseQuery {
  /**
   * Apply time range filtering for view tracking queries.
   *
   * Supports either a predefined timeframe window (hour, day, week, month, year)
   * or a custom date range. When a custom range is provided, it takes precedence
   * over the timeframe window.
   *
   * @param dateColumn - The date column to filter on (typically viewedAt)
   * @param timeframe - Predefined time window: 'hour', 'day', 'week', 'month', or 'year'
   * @param customRange - Optional custom date range that overrides the timeframe
   * @param customRange.startDate - Start of the custom date range
   * @param customRange.endDate - End of the custom date range
   * @returns SQL filter expression, or undefined if no valid timeframe could be determined
   */
  protected static applyViewTimeframe(
    dateColumn: AnyColumn,
    timeframe: 'day' | 'hour' | 'month' | 'week' | 'year',
    customRange?: { endDate?: Date; startDate?: Date },
  ): SQL | undefined {
    const filters: Array<SQL | undefined> = [];

    // Apply the custom date range if provided
    if (customRange?.startDate) {
      filters.push(gte(dateColumn, customRange.startDate));
    }
    if (customRange?.endDate) {
      filters.push(lte(dateColumn, customRange.endDate));
    }

    // If a custom range is provided, don't apply the timeframe window
    if (customRange?.startDate || customRange?.endDate) {
      return this.combineFilters(...filters);
    }

    // Apply the timeframe window
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
    return this.combineFilters(...filters);
  }

  /**
   * Build view analytics filters combining content permissions and view constraints.
   *
   * Constructs a comprehensive filter for analytics queries that considers:
   * - Content type and optional specific content ID
   * - Anonymous vs authenticated view filtering
   * - Time range constraints (predefined or custom)
   * - Permission-based access to content analytics
   *
   * @param targetType - Type of content being analyzed (bobblehead, collection, etc.)
   * @param targetId - Optional specific content ID to filter to
   * @param isPublicColumn - Column indicating content visibility (or undefined if not applicable)
   * @param userIdColumn - Column containing the content owner's user ID
   * @param context - Query context with user information for permission filtering
   * @param options - Additional filter options
   * @param options.customTimeRange - Custom date range to filter views
   * @param options.isIncludingAnonymous - Whether to include anonymous views (default: true)
   * @param options.timeframe - Predefined time window for filtering views
   * @returns Combined SQL filter expression, or undefined if no filters are applicable
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

    // Content type filter
    filters.push(eq(contentViews.targetType, targetType));

    // Specific content filter
    if (targetId) {
      filters.push(eq(contentViews.targetId, targetId));
    }

    // Anonymous views filter
    if (!isIncludingAnonymous) {
      filters.push(isNotNull(contentViews.viewerId));
    }

    // Time range filter
    if (timeframe) {
      filters.push(this.applyViewTimeframe(contentViews.viewedAt, timeframe, customTimeRange));
    }

    // Permission filter for the content being viewed
    if (isPublicColumn) {
      filters.push(this.buildViewPermissionFilter(isPublicColumn, userIdColumn, context));
    }

    return this.combineFilters(...filters);
  }

  /**
   * Build deduplication filter for view tracking.
   *
   * Creates a filter to detect duplicate views from the same user or IP address
   * within a specified time window. Used to prevent counting the same view multiple times.
   *
   * For authenticated users, deduplication is based on userId.
   * For anonymous users, deduplication is based on IP address with null viewerId.
   *
   * @param targetType - Type of content being viewed (bobblehead, collection, etc.)
   * @param targetId - Specific content ID to check for duplicates
   * @param identifier - User or IP identification for deduplication
   * @param identifier.userId - Authenticated user's ID (takes precedence over IP)
   * @param identifier.ipAddress - IP address for anonymous view deduplication
   * @param timeWindow - Optional time window to constrain duplicate detection
   * @param timeWindow.startDate - Start of the deduplication window
   * @param timeWindow.endDate - End of the deduplication window
   * @returns SQL filter expression for finding duplicates, or undefined if no identifier provided
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

    // Target filters
    filters.push(eq(contentViews.targetType, targetType));
    filters.push(eq(contentViews.targetId, targetId));

    // User or IP identification
    if (userId) {
      filters.push(eq(contentViews.viewerId, userId));
    } else if (ipAddress) {
      filters.push(eq(contentViews.ipAddress, ipAddress));
      filters.push(isNull(contentViews.viewerId));
    } else {
      // No identification provided
      return undefined;
    }

    // Time window for deduplication
    if (timeWindow) {
      filters.push(gte(contentViews.viewedAt, timeWindow.startDate));
      filters.push(lte(contentViews.viewedAt, timeWindow.endDate));
    }

    return this.combineFilters(...filters);
  }

  /**
   * Build permission filter for view tracking based on content privacy settings.
   *
   * Considers both content privacy and user permissions for viewing analytics.
   * Controls who can access analytics data for different types of content.
   *
   * Permission logic:
   * - Public content analytics are visible to anyone (if isAllowingAnalyticsForPublic)
   * - Private content analytics are visible only to the owner (if isAllowingOwnerViewPrivate)
   * - Falls back to public-only access when no filters are applicable
   *
   * @param isPublicColumn - Column indicating content visibility (or undefined if not applicable)
   * @param userIdColumn - Column containing the content owner's user ID
   * @param context - Query context with authenticated user information
   * @param options - Permission control options
   * @param options.isAllowingAnalyticsForPublic - Allow viewing analytics for public content (default: true)
   * @param options.isAllowingOwnerViewPrivate - Allow owners to view analytics for their private content (default: true)
   * @returns SQL filter expression for permission-based access, or undefined if no column provided and conditions not met
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

    // If no public column, apply basic owner filtering
    if (!isPublicColumn) {
      return isAllowingOwnerViewPrivate && userId ? eq(userIdColumn, userId) : undefined;
    }

    const filters: Array<SQL | undefined> = [];

    // Public content analytics (if allowed)
    if (isAllowingAnalyticsForPublic) {
      filters.push(eq(isPublicColumn, true));
    }

    // Owner can view their private content analytics (if allowed and authenticated)
    if (isAllowingOwnerViewPrivate && userId) {
      filters.push(and(eq(isPublicColumn, false), eq(userIdColumn, userId)));
    }

    // Default to public only
    return filters.length > 0 ? or(...filters.filter(Boolean)) : eq(isPublicColumn, true);
  }
}
