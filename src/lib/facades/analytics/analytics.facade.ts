import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { RecordViewInput } from '@/lib/validations/analytics.validation';

import { OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { ViewAggregationJob } from '@/lib/jobs/view-aggregation.job';
import { ViewAnalyticsQuery } from '@/lib/queries/analytics/view-analytics.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'AnalyticsFacade';

export interface BatchViewRecordResult {
  batchId: string;
  duplicateViews: number;
  isSuccessful: boolean;
  recordedViews: number;
}

export interface DashboardData {
  averageViewDuration: null | number;
  contentTypeBreakdown: Array<{
    percentage: number;
    targetType: string;
    viewCount: number;
  }>;
  topPerformingContent: Array<TrendingContentResult>;
  totalViews: number;
  uniqueViewers: number;
  viewsTrend: Array<{
    date: string;
    uniqueViewers: number;
    views: number;
  }>;
}

export interface TrendingContentResult {
  averageViewDuration?: number;
  rank: number;
  targetId: string;
  targetType: string;
  totalViews: number;
  uniqueViewers: number;
}

export interface ViewAggregationResult {
  duration: number;
  errors: Array<string>;
  isSuccessful: boolean;
  processedTargets: number;
}

export interface ViewRecordResult {
  isDuplicate: boolean;
  isSuccessful: boolean;
  totalViews: number;
  viewId: string;
}

export interface ViewStatsResult {
  averageViewDuration?: number;
  totalViews: number;
  uniqueViewers: number;
}

/**
 * Business logic facade for analytics operations
 * Provides clean API for view tracking, trending content, and analytics dashboard
 */
export class AnalyticsFacade extends BaseFacade {
  /**
   * Aggregate views for multiple targets with batch processing.
   *
   * Cache behavior: Invalidates analytics cache after aggregation via CacheRevalidationService.
   *
   * @param targetIds - Array of target IDs to aggregate views for
   * @param targetType - Type of targets (bobblehead, collection, profile)
   * @param options - Aggregation options including batch size and force flag
   * @returns Aggregation result with duration, errors, and processed count
   */
  static async aggregateViewsAsync(
    targetIds: Array<string>,
    targetType: string,
    options: { batchSize?: number; isForced?: boolean } = {},
  ): Promise<ViewAggregationResult> {
    return executeFacadeOperation(
      {
        data: { targetCount: targetIds.length, targetType },
        facade: facadeName,
        method: 'aggregateViewsAsync',
        operation: OPERATIONS.ANALYTICS.AGGREGATE_VIEWS,
      },
      async () => {
        const { batchSize = 100, isForced = false } = options;

        const startTime = Date.now();
        const errors: Array<string> = [];
        let processedTargets = 0;

        try {
          // process targets in batches to avoid overwhelming the system
          const batches = [];
          for (let i = 0; i < targetIds.length; i += batchSize) {
            batches.push(targetIds.slice(i, i + batchSize));
          }

          for (const batch of batches) {
            try {
              const result = await ViewAggregationJob.updateTargetAggregates(
                batch,
                targetType,
                'day', // default timeframe for aggregation
              );
              processedTargets += result.updatedTargets;
              errors.push(...result.errors);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              errors.push(`Batch processing failed: ${errorMessage}`);
            }
          }

          const duration = Date.now() - startTime;

          // Invalidate analytics cache after successful aggregation
          if (processedTargets > 0) {
            CacheRevalidationService.analytics.onViewAggregation(
              targetType as 'bobblehead' | 'collection',
              processedTargets,
            );
          }

          return {
            duration,
            errors,
            isSuccessful: errors.length === 0 || (errors.length < targetIds.length && !isForced),
            processedTargets,
          };
        } catch (error) {
          const duration = Date.now() - startTime;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          return {
            duration,
            errors: [`Aggregation failed: ${errorMessage}`],
            isSuccessful: false,
            processedTargets,
          };
        }
      },
      {
        includeResultSummary: (result) => ({
          duration: result.duration,
          errorCount: result.errors.length,
          isSuccessful: result.isSuccessful,
          processedTargets: result.processedTargets,
        }),
      },
    );
  }

  /**
   * Record multiple views in a batch operation.
   *
   * Cache behavior: Invalidates view count caches via ViewTrackingFacade.
   *
   * @param views - Array of view data to record
   * @param options - Batch recording options including deduplication window
   * @param dbInstance - Optional database executor for transactions
   * @returns Batch result with counts of recorded, duplicate, and failed views
   */
  static async batchRecordViewsAsync(
    views: Array<RecordViewInput>,
    options: {
      batchId?: string;
      deduplicationWindow?: number;
      shouldRespectPrivacySettings?: boolean;
    } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<BatchViewRecordResult> {
    return executeFacadeOperation(
      {
        data: { viewCount: views.length },
        facade: facadeName,
        method: 'batchRecordViewsAsync',
        operation: OPERATIONS.ANALYTICS.BATCH_RECORD_VIEWS,
      },
      async () => {
        const result = await ViewTrackingFacade.batchRecordViewsAsync(
          views,
          undefined, // viewerUserId - will be determined from individual view data
          {
            deduplicationWindow: options.deduplicationWindow || 600,
            shouldRespectPrivacySettings: options.shouldRespectPrivacySettings ?? true,
          },
          dbInstance,
        );

        return {
          batchId: options.batchId || result.batchId,
          duplicateViews: result.duplicateViews,
          isSuccessful: result.errors.length === 0,
          recordedViews: result.recordedViews,
        };
      },
      {
        includeResultSummary: (result) => ({
          batchId: result.batchId,
          duplicateViews: result.duplicateViews,
          isSuccessful: result.isSuccessful,
          recordedViews: result.recordedViews,
        }),
      },
    );
  }

  /**
   * Get comprehensive analytics dashboard data.
   *
   * Cache behavior: Uses CacheService.analytics.viewStats with MEDIUM TTL (30 min).
   * Invalidated by: view aggregation, trending updates.
   *
   * @param options - Dashboard options including timeframe and target type filter
   * @param dbInstance - Optional database executor for transactions
   * @returns Dashboard data with views, trends, and top performing content
   */
  static async getDashboardDataAsync(
    options: {
      isIncludingAnonymous?: boolean;
      targetType?: 'bobblehead' | 'collection' | 'profile';
      timeframe?: 'day' | 'month' | 'week';
    } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<DashboardData> {
    return executeFacadeOperation(
      {
        data: { targetType: options.targetType, timeframe: options.timeframe },
        facade: facadeName,
        method: 'getDashboardDataAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
      },
      async () => {
        return CacheService.analytics.viewStats(
          async () => {
            const context = this.getPublicContext(dbInstance);
            const result = await ViewAnalyticsQuery.getViewAnalyticsDashboardAsync(options, context);

            // transform topPerformingContent to match the expected interface
            const transformedTopContent = result.topPerformingContent.map((item, index) => ({
              averageViewDuration: item.averageViewDuration || undefined,
              rank: index + 1,
              targetId: item.targetId,
              targetType: item.targetType,
              totalViews: item.viewCount,
              uniqueViewers: item.uniqueViewers,
            }));

            return {
              ...result,
              topPerformingContent: transformedTopContent,
            };
          },
          'dashboard',
          'all',
          options.timeframe || 'week',
          {
            context: {
              entityType: 'analytics',
              facade: facadeName,
              operation: 'getDashboardDataAsync',
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          contentTypeCount: result.contentTypeBreakdown.length,
          topContentCount: result.topPerformingContent.length,
          totalViews: result.totalViews,
          uniqueViewers: result.uniqueViewers,
        }),
      },
    );
  }

  /**
   * Get trending content for a specific target type.
   *
   * Cache behavior: Uses CacheService.analytics.trending with SHORT TTL (5 min).
   * Invalidated by: view recording, trending updates.
   *
   * @param targetType - Type of content to get trending for
   * @param options - Trending options including limit and timeframe
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of trending content with rank and view statistics
   */
  static async getTrendingContentAsync(
    targetType: 'bobblehead' | 'collection' | 'profile',
    options: {
      isIncludingAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TrendingContentResult>> {
    return executeFacadeOperation(
      {
        data: { limit: options.limit, targetType, timeframe: options.timeframe },
        facade: facadeName,
        method: 'getTrendingContentAsync',
        operation: OPERATIONS.ANALYTICS.GET_TRENDING_CONTENT,
      },
      async () => {
        const { isIncludingAnonymous = true, limit = 10, timeframe = 'week' } = options;

        return CacheService.analytics.trending(
          async () => {
            const context = this.getPublicContext(dbInstance);

            const results = await ViewAnalyticsQuery.getTrendingContentAsync(
              targetType,
              { isIncludingAnonymous, limit, timeframe },
              context,
            );

            return results.map((item, index) => ({
              averageViewDuration: item.averageViewDuration || undefined,
              rank: index + 1,
              targetId: item.targetId,
              targetType: item.targetType,
              totalViews: item.viewCount,
              uniqueViewers: item.uniqueViewers,
            }));
          },
          targetType,
          timeframe,
          {
            context: {
              entityType: 'analytics',
              facade: facadeName,
              operation: 'getTrendingContentAsync',
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
   * Get detailed view statistics for a specific target.
   *
   * Cache behavior: Uses CacheService.analytics.viewStats with MEDIUM TTL (30 min).
   * Invalidated by: view recording for this target.
   *
   * @param targetId - ID of the target to get stats for
   * @param targetType - Type of target (bobblehead, collection)
   * @param options - Stats options including anonymous views and timeframe
   * @param dbInstance - Optional database executor for transactions
   * @returns View statistics including total views and unique viewers
   */
  static async getViewStatsAsync(
    targetId: string,
    targetType: string,
    options: { shouldIncludeAnonymous?: boolean; timeframe?: string } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<ViewStatsResult> {
    return executeFacadeOperation(
      {
        data: { targetId, targetType, timeframe: options.timeframe },
        facade: facadeName,
        method: 'getViewStatsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
      },
      async () => {
        const { shouldIncludeAnonymous = true, timeframe = 'week' } = options;

        return CacheService.analytics.viewStats(
          async () => {
            const stats = await ViewTrackingFacade.getViewStatsAsync(
              targetType as 'bobblehead' | 'collection',
              targetId,
              {
                shouldIncludeAnonymous,
                timeframe: timeframe as 'day' | 'hour' | 'month' | 'week' | 'year',
              },
              undefined,
              dbInstance,
            );

            return {
              averageViewDuration: stats.averageViewDuration || undefined,
              totalViews: stats.totalViews,
              uniqueViewers: stats.uniqueViewers,
            };
          },
          targetType,
          targetId,
          timeframe,
          {
            context: {
              entityId: targetId,
              entityType: 'analytics',
              facade: facadeName,
              operation: 'getViewStatsAsync',
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
   * Get view trends over time with aggregation.
   *
   * Cache behavior: Uses CacheService.analytics.aggregates with MEDIUM TTL (30 min).
   * Invalidated by: view recording, aggregation updates.
   *
   * @param options - Trend options including date range, grouping, and filters
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of trend data points with period, views, and unique viewers
   */
  static async getViewTrendsAsync(
    options: {
      endDate?: Date;
      groupBy?: 'day' | 'hour' | 'month' | 'week';
      isIncludingAnonymous?: boolean;
      startDate?: Date;
      targetType?: 'bobblehead' | 'collection' | 'profile';
    } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<
    Array<{
      averageViewDuration: null | number;
      period: string;
      uniqueViewers: number;
      viewCount: number;
    }>
  > {
    return executeFacadeOperation(
      {
        data: { groupBy: options.groupBy, targetType: options.targetType },
        facade: facadeName,
        method: 'getViewTrendsAsync',
        operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS,
      },
      async () => {
        const optionsHash = createHashFromObject(options);

        return CacheService.analytics.aggregates(
          async () => {
            const context = this.getPublicContext(dbInstance);
            return ViewAnalyticsQuery.getViewTrendsAsync(options, context);
          },
          options.targetType || 'all',
          optionsHash,
          options.groupBy || 'day',
          {
            context: {
              entityType: 'analytics',
              facade: facadeName,
              operation: 'getViewTrendsAsync',
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          periodCount: result.length,
        }),
      },
    );
  }

  /**
   * Record a single view with deduplication and privacy enforcement.
   *
   * Cache behavior: Invalidates view count cache via ViewTrackingFacade.
   * Also invalidates analytics cache for the target.
   *
   * @param viewData - View data including target ID, type, and optional metadata
   * @param options - Recording options including deduplication window
   * @param dbInstance - Optional database executor for transactions
   * @returns View result with duplicate status and total views, or duplicate indicator
   */
  static async recordViewAsync(
    viewData: RecordViewInput,
    options: { deduplicationWindow?: number; shouldRespectPrivacySettings?: boolean } = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<ViewRecordResult> {
    return executeFacadeOperation(
      {
        data: { targetId: viewData.targetId, targetType: viewData.targetType },
        facade: facadeName,
        method: 'recordViewAsync',
        operation: OPERATIONS.ANALYTICS.RECORD_VIEW,
        userId: viewData.viewerId || undefined,
      },
      async () => {
        const result = await ViewTrackingFacade.recordViewAsync(
          viewData,
          viewData.viewerId || undefined,
          {
            deduplicationWindow: options.deduplicationWindow || 600,
            shouldRespectPrivacySettings: options.shouldRespectPrivacySettings ?? true,
          },
          dbInstance,
        );

        if (!result) {
          return {
            isDuplicate: true,
            isSuccessful: true,
            totalViews: 0,
            viewId: '',
          };
        }

        // Get updated view count
        let viewCount = 0;
        try {
          viewCount = await ViewTrackingFacade.getViewCountAsync(
            result.targetType,
            result.targetId,
            true,
            viewData.viewerId || undefined,
            dbInstance,
          );
        } catch (error) {
          // Log warning but don't fail the operation
          captureFacadeWarning(error, facadeName, 'recordViewAsync:getViewCount', {
            targetId: result.targetId,
            targetType: result.targetType,
          });
        }

        // Invalidate analytics cache for this target
        CacheRevalidationService.analytics.onViewRecord(
          result.targetType as 'bobblehead' | 'collection',
          result.targetId,
          viewData.viewerId || undefined,
        );

        return {
          isDuplicate: false,
          isSuccessful: true,
          totalViews: viewCount,
          viewId: result.id,
        };
      },
      {
        includeResultSummary: (result) => ({
          isDuplicate: result.isDuplicate,
          isSuccessful: result.isSuccessful,
          totalViews: result.totalViews,
        }),
      },
    );
  }
}
