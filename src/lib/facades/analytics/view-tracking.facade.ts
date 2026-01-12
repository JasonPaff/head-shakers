import type { ENUMS } from '@/lib/constants';
import type {
  ContentPerformanceRecord,
  EngagementMetric,
  TrendingContentRecord,
} from '@/lib/queries/analytics/view-analytics.query';
import type { RecentViewsRecord, ViewRecord, ViewStats } from '@/lib/queries/analytics/view-tracking.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertContentView } from '@/lib/validations/analytics.validation';

import { OPERATIONS, REDIS_KEYS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { ViewAnalyticsQuery } from '@/lib/queries/analytics/view-analytics.query';
import { ViewTrackingQuery } from '@/lib/queries/analytics/view-tracking.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { executeFacadeOperation, includeFullResult } from '@/lib/utils/facade-helpers';
import { RedisOperations } from '@/lib/utils/redis-client';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'ViewTrackingFacade';

export interface BatchViewResult {
  batchId: string;
  duplicateViews: number;
  errors: Array<string>;
  recordedViews: number;
  skippedViews: number;
}

export type ContentViewTargetType = (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number];

export interface TrendingContentOptions {
  limit?: number;
  shouldIncludeAnonymous?: boolean;
  timeframe?: 'day' | 'hour' | 'month' | 'week';
}

export interface ViewDeduplicationResult {
  isDuplicate: boolean;
  isSuccessful: boolean;
  reason?: string;
}

export interface ViewRecordOptions {
  deduplicationWindow?: number;
  shouldRespectPrivacySettings?: boolean;
  shouldSkipAnonymousTracking?: boolean;
}

export interface ViewStatsOptions {
  shouldIncludeAnonymous?: boolean;
  timeframe?: 'day' | 'hour' | 'month' | 'week' | 'year';
}

/**
 * Business logic facade for view tracking functionality.
 * Provides clean API and business rule enforcement for view operations.
 *
 * Extends BaseFacade for consistent context creation and error handling patterns.
 */
export class ViewTrackingFacade extends BaseFacade {
  /**
   * Record multiple views in a batch operation.
   * Handles deduplication, privacy settings, and cache invalidation for each view.
   *
   * Caching: Uses Redis-based deduplication with configurable TTL (default 10 min).
   * Invalidates view count cache for each recorded view via CacheRevalidationService.
   *
   * @param views - Array of view data to record
   * @param viewerUserId - Optional authenticated user ID
   * @param options - Configuration for deduplication and privacy
   * @param dbInstance - Optional database executor for transactions
   * @returns BatchViewResult with counts of recorded, duplicate, and skipped views
   */
  static async batchRecordViewsAsync(
    views: Array<InsertContentView>,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<BatchViewResult> {
    return executeFacadeOperation(
      {
        data: { viewCount: views.length },
        facade: facadeName,
        method: 'batchRecordViewsAsync',
        operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS,
        userId: viewerUserId,
      },
      async () => {
        if (views.length === 0) {
          return {
            batchId: crypto.randomUUID(),
            duplicateViews: 0,
            errors: [],
            recordedViews: 0,
            skippedViews: 0,
          };
        }

        const context = this.getViewerContext(viewerUserId, dbInstance);

        const batchId = crypto.randomUUID();
        const errors: Array<string> = [];
        let duplicateViews = 0;
        let skippedViews = 0;
        const validViews: Array<InsertContentView> = [];

        // Process each view for deduplication and privacy
        for (const viewData of views) {
          const result = await this.validateSingleViewAsync(viewData, viewerUserId, options, dbInstance);

          if (result.isDuplicate) {
            duplicateViews++;
          } else if (result.isSkipped) {
            skippedViews++;
          } else if (result.error) {
            errors.push(result.error);
          } else {
            validViews.push(viewData);
          }
        }

        // Record valid views
        let recordedViews = 0;
        if (validViews.length > 0) {
          try {
            await ViewTrackingQuery.batchRecordViewsAsync(validViews, context);
            recordedViews = validViews.length;

            // Set deduplication caches and invalidate view count caches
            await this.handleBatchPostRecordAsync(validViews, viewerUserId, options);
          } catch (error) {
            errors.push(`Batch record error: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        return {
          batchId,
          duplicateViews,
          errors,
          recordedViews,
          skippedViews,
        };
      },
      {
        includeResultSummary: (result) => ({
          duplicateViews: result.duplicateViews,
          errorCount: result.errors.length,
          recordedViews: result.recordedViews,
          skippedViews: result.skippedViews,
        }),
      },
    );
  }

  /**
   * Get content performance metrics for multiple targets.
   * Returns performance data including view counts and engagement metrics.
   *
   * Caching: Uses CacheService.analytics.performance with MEDIUM TTL (30 min).
   * Invalidated by: View recording, analytics aggregation.
   *
   * @param targetIds - Array of target entity IDs
   * @param targetType - Type of content being analyzed
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns Array of ContentPerformanceRecord for requested targets
   */
  static async getContentPerformanceAsync(
    targetIds: Array<string>,
    targetType: ContentViewTargetType,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<ContentPerformanceRecord>> {
    return executeFacadeOperation(
      {
        data: { targetIds, targetType },
        facade: facadeName,
        method: 'getContentPerformanceAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.analytics.performance(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            return ViewAnalyticsQuery.getContentPerformanceAsync(
              targetIds,
              targetType,
              {
                isIncludingAnonymous: true,
              },
              context,
            );
          },
          targetType,
          targetIds,
          {
            context: {
              entityType: targetType,
              facade: facadeName,
              operation: 'getContentPerformance',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get engagement metrics for multiple targets.
   * Returns engagement data filtered to requested target IDs.
   *
   * Caching: Uses CacheService.analytics.engagement with MEDIUM TTL (30 min).
   * Invalidated by: View recording, analytics aggregation.
   *
   * @param targetIds - Array of target entity IDs to get metrics for
   * @param targetType - Type of content being analyzed
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns Array of EngagementMetric filtered to requested targets
   */
  static async getEngagementMetricsAsync(
    targetIds: Array<string>,
    targetType: ContentViewTargetType,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<EngagementMetric>> {
    return executeFacadeOperation(
      {
        data: { targetIds, targetType },
        facade: facadeName,
        method: 'getEngagementMetricsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.analytics.engagement(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            // Get engagement metrics for all targets
            const results = await ViewAnalyticsQuery.getUserEngagementAsync(
              targetType,
              {
                minViews: 1,
                timeframe: 'week',
              },
              context,
            );

            // Filter results to only include the requested target IDs
            return results.filter((result) => targetIds.includes(result.targetId));
          },
          targetType,
          targetIds,
          undefined,
          {
            context: {
              entityType: targetType,
              facade: facadeName,
              operation: 'getEngagementMetrics',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get recent views for a specific target.
   * Returns list of recent view records with viewer information.
   *
   * Caching: Uses CacheService.analytics.recentViews with SHORT TTL (5 min).
   * Invalidated by: View recording for this target.
   *
   * @param targetType - Type of content being viewed
   * @param targetId - ID of the target entity
   * @param limit - Maximum number of recent views to return (default 10)
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns Array of RecentViewsRecord, empty array if none found
   */
  static async getRecentViewsAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    limit = 10,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<RecentViewsRecord>> {
    return executeFacadeOperation(
      {
        data: { limit, targetId, targetType },
        facade: facadeName,
        method: 'getRecentViewsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.analytics.recentViews(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            return ViewTrackingQuery.getRecentViewsAsync(targetType, targetId, { limit }, context);
          },
          targetType,
          targetId,
          limit,
          {
            context: {
              entityId: targetId,
              entityType: targetType,
              facade: facadeName,
              operation: 'getRecentViews',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get trending content for a specific type and timeframe.
   * Returns content ranked by view activity within the timeframe.
   *
   * Caching: Uses CacheService.analytics.trending with SHORT TTL (5 min).
   * Invalidated by: Trending update events.
   *
   * @param targetType - Type of content to get trending data for
   * @param options - Configuration for timeframe, limit, and anonymous inclusion
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns Array of TrendingContentRecord sorted by popularity
   */
  static async getTrendingContentAsync(
    targetType: ContentViewTargetType,
    options: TrendingContentOptions = {},
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TrendingContentRecord>> {
    return executeFacadeOperation(
      {
        data: { options, targetType },
        facade: facadeName,
        method: 'getTrendingContentAsync',
        operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
        userId: viewerUserId,
      },
      async () => {
        const timeframe = options.timeframe || 'day';

        return CacheService.analytics.trending(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            return ViewAnalyticsQuery.getTrendingContentAsync(
              targetType,
              {
                isIncludingAnonymous: options.shouldIncludeAnonymous ?? true,
                limit: options.limit || 10,
                timeframe,
              },
              context,
            );
          },
          targetType,
          timeframe,
          {
            context: {
              entityType: targetType,
              facade: facadeName,
              operation: 'getTrendingContent',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get view count for a specific target.
   * Returns total view count with optional anonymous view inclusion.
   *
   * Caching: Uses CacheService.analytics.viewCounts with MEDIUM TTL (30 min).
   * Invalidated by: View recording for this target.
   *
   * @param targetType - Type of content being counted
   * @param targetId - ID of the target entity
   * @param shouldIncludeAnonymous - Whether to include anonymous views (reserved for future use)
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns Total view count as number
   */
  static async getViewCountAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<number> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getViewCountAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        return CacheService.analytics.viewCounts(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            const stats = await ViewTrackingQuery.getViewStatsAsync(targetType, targetId, {}, context);

            // shouldIncludeAnonymous parameter is reserved for future use
            void shouldIncludeAnonymous;
            return stats.totalViews;
          },
          targetType,
          targetId,
          {
            context: {
              entityId: targetId,
              entityType: targetType,
              facade: facadeName,
              operation: 'getViewCount',
              userId: viewerUserId,
            },
          },
        );
      },
      { includeResultSummary: includeFullResult },
    );
  }

  /**
   * Get view statistics for a specific target.
   * Returns comprehensive view stats including totals and time-based breakdowns.
   *
   * Caching: Uses CacheService.analytics.viewStats with MEDIUM TTL (30 min).
   * Invalidated by: View recording for this target.
   *
   * @param targetType - Type of content being analyzed
   * @param targetId - ID of the target entity
   * @param options - Configuration for timeframe and anonymous inclusion
   * @param viewerUserId - Optional viewer for context
   * @param dbInstance - Optional database executor
   * @returns ViewStats object with total views and breakdowns
   */
  static async getViewStatsAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    options: ViewStatsOptions = {},
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<ViewStats> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getViewStatsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
        userId: viewerUserId,
      },
      async () => {
        const timeframe = options.timeframe || 'day';

        return CacheService.analytics.viewStats(
          async () => {
            const context = this.getViewerContext(viewerUserId, dbInstance);

            return ViewTrackingQuery.getViewStatsAsync(targetType, targetId, {}, context);
          },
          targetType,
          targetId,
          timeframe,
          {
            context: {
              entityId: targetId,
              entityType: targetType,
              facade: facadeName,
              operation: 'getViewStats',
              userId: viewerUserId,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          totalViews: result.totalViews,
          uniqueViewers: result.uniqueViewers,
        }),
      },
    );
  }

  /**
   * Record a single view with deduplication and privacy enforcement.
   * Checks for duplicate views within the deduplication window and respects privacy settings.
   *
   * Caching: Uses Redis-based deduplication with configurable TTL (default 5 min).
   * Invalidates view count cache via CacheRevalidationService.analytics.onViewRecord.
   *
   * @param viewData - View data to record
   * @param viewerUserId - Optional authenticated user ID
   * @param options - Configuration for deduplication and privacy
   * @param dbInstance - Optional database executor
   * @returns ViewRecord if recorded, null if deduplicated or skipped
   */
  static async recordViewAsync(
    viewData: InsertContentView,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | ViewRecord> {
    return executeFacadeOperation(
      {
        data: { targetId: viewData.targetId, targetType: viewData.targetType },
        facade: facadeName,
        method: 'recordViewAsync',
        operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
        userId: viewerUserId,
      },
      async () => {
        const context = this.getViewerContext(viewerUserId, dbInstance);

        // Validate view (deduplication and privacy)
        const validation = await this.validateSingleViewAsync(viewData, viewerUserId, options, dbInstance);
        if (validation.isDuplicate || validation.isSkipped) {
          return null;
        }

        // Record the view
        const result = await ViewTrackingQuery.recordViewAsync(viewData, context);

        // Set deduplication cache
        await this.setDeduplicationCacheAsync(
          viewData.targetType,
          viewData.targetId,
          viewerUserId,
          viewData.ipAddress || undefined,
          options.deduplicationWindow || 300,
        );

        // Invalidate view count caches using CacheRevalidationService
        CacheRevalidationService.analytics.onViewRecord(
          viewData.targetType as 'bobblehead' | 'collection' | 'user',
          viewData.targetId,
          viewerUserId,
        );

        return result;
      },
      {
        includeResultSummary: (result) => ({
          recorded: result !== null,
          targetId: viewData.targetId,
          targetType: viewData.targetType,
        }),
      },
    );
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Check user privacy settings for view tracking.
   * Currently assumes tracking is allowed - placeholder for future implementation.
   */
  private static checkUserPrivacySettings(userId: string, dbInstance: DatabaseExecutor): boolean {
    // Reserved parameters for future implementation
    void userId;
    void dbInstance;
    return true;
  }

  /**
   * Check if a view is a duplicate within the deduplication window.
   * Uses Redis to track recent views by user or IP address.
   */
  private static async checkViewDeduplicationAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    viewerUserId?: string,
    ipAddress?: string,
    deduplicationWindow = 600,
  ): Promise<ViewDeduplicationResult> {
    try {
      let cacheKey: string;

      if (viewerUserId) {
        cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, viewerUserId);
      } else if (ipAddress) {
        cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, ipAddress);
      } else {
        return { isDuplicate: false, isSuccessful: true };
      }

      const exists = await RedisOperations.exists(cacheKey);

      if (exists) {
        return {
          isDuplicate: true,
          isSuccessful: true,
          reason: `View recorded within deduplication window (${deduplicationWindow}s)`,
        };
      }

      return { isDuplicate: false, isSuccessful: true };
    } catch (error) {
      // On cache error, allow the view to be recorded
      captureFacadeWarning(error, facadeName, 'checkViewDeduplication', {
        ipAddress: ipAddress ? '[redacted]' : undefined,
        targetId,
        targetType,
        viewerUserId,
      });
      return {
        isDuplicate: false,
        isSuccessful: false,
        reason: `Deduplication check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Handle post-record operations for batch views.
   * Sets deduplication caches and invalidates view count caches.
   */
  private static async handleBatchPostRecordAsync(
    views: Array<InsertContentView>,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
  ): Promise<void> {
    const deduplicationWindow = options.deduplicationWindow || 600;

    // Set deduplication caches (async operations)
    await Promise.allSettled(
      views.map((view) =>
        this.setDeduplicationCacheAsync(
          view.targetType,
          view.targetId,
          viewerUserId,
          view.ipAddress || undefined,
          deduplicationWindow,
        ),
      ),
    );

    // Invalidate view count caches using CacheRevalidationService (synchronous)
    for (const view of views) {
      CacheRevalidationService.analytics.onViewRecord(
        view.targetType as 'bobblehead' | 'collection' | 'user',
        view.targetId,
        viewerUserId,
      );
    }
  }

  /**
   * Set deduplication cache for a view (authenticated or anonymous).
   */
  private static async setDeduplicationCacheAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    viewerUserId?: string,
    ipAddress?: string,
    ttl = 300,
  ): Promise<void> {
    try {
      let cacheKey: string;

      if (viewerUserId) {
        cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, viewerUserId);
      } else if (ipAddress) {
        cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, ipAddress);
      } else {
        return;
      }

      await RedisOperations.set(cacheKey, Date.now().toString(), ttl);
    } catch (error) {
      // Non-blocking cache operation
      captureFacadeWarning(error, facadeName, 'setDeduplicationCache', {
        targetId,
        targetType,
        viewerUserId,
      });
    }
  }

  /**
   * Validate a single view for deduplication and privacy.
   * Returns validation result with status flags.
   */
  private static async validateSingleViewAsync(
    viewData: InsertContentView,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ error?: string; isDuplicate: boolean; isSkipped: boolean }> {
    try {
      // Check deduplication
      const deduplicationResult = await this.checkViewDeduplicationAsync(
        viewData.targetType,
        viewData.targetId,
        viewerUserId,
        viewData.ipAddress || undefined,
        options.deduplicationWindow || 600,
      );

      if (deduplicationResult.isDuplicate) {
        return { isDuplicate: true, isSkipped: false };
      }

      // Check privacy settings
      if (options.shouldRespectPrivacySettings && viewerUserId) {
        const canTrack = this.checkUserPrivacySettings(viewerUserId, dbInstance);
        if (!canTrack) {
          return { isDuplicate: false, isSkipped: true };
        }
      }

      // Skip anonymous tracking if requested
      if (options.shouldSkipAnonymousTracking && !viewerUserId) {
        return { isDuplicate: false, isSkipped: true };
      }

      return { isDuplicate: false, isSkipped: false };
    } catch (error) {
      return {
        error: `View validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isDuplicate: false,
        isSkipped: false,
      };
    }
  }
}
