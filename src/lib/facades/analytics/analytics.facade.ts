import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { RecordViewInput } from '@/lib/validations/analytics.validation';

import { db } from '@/lib/db';
import { ViewTrackingFacade } from '@/lib/facades/analytics/view-tracking.facade';
import { ViewAggregationJob } from '@/lib/jobs/view-aggregation.job';
import { ViewAnalyticsQuery } from '@/lib/queries/analytics/view-analytics.query';

export interface AnalyticsFacadeInterface {
  aggregateViews: (
    targetIds: Array<string>,
    targetType: string,
    dbInstance?: DatabaseExecutor,
    options?: { batchSize?: number; isForced?: boolean },
  ) => Promise<ViewAggregationResult>;
  batchRecordViews: (
    views: Array<RecordViewInput>,
    dbInstance?: DatabaseExecutor,
    options?: { batchId?: string; deduplicationWindow?: number; shouldRespectPrivacySettings?: boolean },
  ) => Promise<BatchViewRecordResult>;
  getTrendingContent: (
    targetType: 'bobblehead' | 'collection' | 'profile' | 'subcollection',
    options?: {
      isIncludingAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    },
    dbInstance?: DatabaseExecutor,
  ) => Promise<Array<TrendingContentResult>>;
  getViewStats: (
    targetId: string,
    targetType: string,
    options?: { shouldIncludeAnonymous?: boolean; timeframe?: string },
    dbInstance?: DatabaseExecutor,
  ) => Promise<ViewStatsResult>;
  recordView: (
    viewData: RecordViewInput,
    dbInstance?: DatabaseExecutor,
    options?: { deduplicationWindow?: number; shouldRespectPrivacySettings?: boolean },
  ) => Promise<ViewRecordResult>;
}

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

export const AnalyticsFacade = {
  /**
   * Aggregate views for multiple targets with batch processing
   */
  async aggregateViews(
    targetIds: Array<string>,
    targetType: string,
    options: { batchSize?: number; isForced?: boolean } = {},
  ): Promise<ViewAggregationResult> {
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

  /**
   * Record multiple views in a batch operation
   */
  async batchRecordViews(
    views: Array<RecordViewInput>,
    dbInstance?: DatabaseExecutor,
    options: {
      batchId?: string;
      deduplicationWindow?: number;
      shouldRespectPrivacySettings?: boolean;
    } = {},
  ): Promise<BatchViewRecordResult> {
    const result = await ViewTrackingFacade.batchRecordViewsAsync(
      views,
      undefined, // viewerUserId - will be determined from individual view data
      {
        deduplicationWindow: options.deduplicationWindow || 600,
        shouldRespectPrivacySettings: options.shouldRespectPrivacySettings || true,
      },
      dbInstance || db,
    );

    return {
      batchId: options.batchId || result.batchId,
      duplicateViews: result.duplicateViews,
      isSuccessful: result.errors.length === 0,
      recordedViews: result.recordedViews,
    };
  },

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardData(
    options: {
      isIncludingAnonymous?: boolean;
      targetType?: 'bobblehead' | 'collection' | 'profile' | 'subcollection';
      timeframe?: 'day' | 'month' | 'week';
    } = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<DashboardData> {
    const context = { dbInstance: dbInstance || db };

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

  /**
   * Get trending content
   */
  async getTrendingContent(
    targetType: 'bobblehead' | 'collection' | 'profile' | 'subcollection',
    options: {
      isIncludingAnonymous?: boolean;
      limit?: number;
      timeframe?: 'day' | 'hour' | 'month' | 'week';
    } = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<TrendingContentResult[]> {
    const context = { dbInstance: dbInstance || db };
    const { isIncludingAnonymous = true, limit = 10, timeframe = 'week' } = options;

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

  /**
   * Get detailed view statistics for a target
   */
  async getViewStats(
    targetId: string,
    targetType: string,
    options: { shouldIncludeAnonymous?: boolean; timeframe?: string } = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<ViewStatsResult> {
    const { shouldIncludeAnonymous = true, timeframe = 'week' } = options;

    const stats = await ViewTrackingFacade.getViewStatsAsync(
      targetType as 'bobblehead' | 'collection' | 'profile' | 'subcollection',
      targetId,
      {
        shouldIncludeAnonymous,
        timeframe: timeframe as 'day' | 'hour' | 'month' | 'week' | 'year',
      },
      undefined,
      dbInstance || db,
    );

    return {
      averageViewDuration: stats.averageViewDuration || undefined,
      totalViews: stats.totalViews,
      uniqueViewers: stats.uniqueViewers,
    };
  },

  /**
   * Get view trends over time
   */
  async getViewTrends(
    options: {
      endDate?: Date;
      groupBy?: 'day' | 'hour' | 'month' | 'week';
      isIncludingAnonymous?: boolean;
      startDate?: Date;
      targetType?: 'bobblehead' | 'collection' | 'profile' | 'subcollection';
    } = {},
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<{
      averageViewDuration: null | number;
      period: string;
      uniqueViewers: number;
      viewCount: number;
    }>
  > {
    const context = { dbInstance: dbInstance || db };

    return await ViewAnalyticsQuery.getViewTrendsAsync(options, context);
  },

  /**
   * Record a single view with deduplication and privacy enforcement
   */
  async recordView(
    viewData: RecordViewInput,
    dbInstance?: DatabaseExecutor,
    options: { deduplicationWindow?: number; shouldRespectPrivacySettings?: boolean } = {},
  ): Promise<ViewRecordResult> {
    const result = await ViewTrackingFacade.recordViewAsync(
      viewData,
      viewData.viewerId || undefined,
      {
        deduplicationWindow: options.deduplicationWindow || 600,
        shouldRespectPrivacySettings: options.shouldRespectPrivacySettings || true,
      },
      dbInstance || db,
    );

    if (!result) {
      return {
        isDuplicate: true,
        isSuccessful: true,
        totalViews: 0,
        viewId: '',
      };
    }

    const viewCount = await ViewTrackingFacade.getViewCountAsync(
      result.targetType,
      result.targetId,
      true,
      viewData.viewerId || undefined,
      dbInstance || db,
    );

    return {
      isDuplicate: false,
      isSuccessful: true,
      totalViews: viewCount,
      viewId: result.id,
    };
  },
};
