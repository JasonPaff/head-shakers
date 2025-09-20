import type { ENUMS } from '@/lib/constants';
import type { QueryContext } from '@/lib/queries/base/query-context';
import type { ViewBatchResult } from '@/lib/services/view-tracking.service';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { ViewTrackingQuery } from '@/lib/queries/analytics/view-tracking.query';
import { ViewTrackingService } from '@/lib/services/view-tracking.service';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

export interface ViewAggregationPayload {
  batchIds?: Array<string>;
  targetIds?: Array<string>;
  targetType?: string;
  timeframe?: 'day' | 'hour' | 'month' | 'week';
}

export interface ViewAggregationResult {
  aggregatedTargets: number;
  batchesProcessed: number;
  errors: Array<string>;
  processedViews: number;
  skippedViews: number;
}

/**
 * Background job for processing view aggregation
 * Handles batch processing of queued views and cache updates
 */
export class ViewAggregationJob {
  /**
   * Process batch view aggregation from Redis queues
   */
  static async processBatchAggregation(batchIds: Array<string>): Promise<ViewBatchResult[]> {
    const results: Array<ViewBatchResult> = [];
    const errors: Array<string> = [];

    for (const batchId of batchIds) {
      try {
        const batchResult = await ViewTrackingService.processBatch(batchId);
        results.push(batchResult);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process batch ${batchId}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      console.warn('Batch processing completed with errors:', errors);
    }

    return results;
  }

  /**
   * Main view aggregation processing method
   */
  static async processViewAggregation(payload: unknown): Promise<ViewAggregationResult> {
    const context: ServiceErrorContext = {
      endpoint: 'processViewAggregation',
      isRetryable: true,
      method: 'processViewAggregation',
      operation: 'view-aggregation',
      service: 'background-job',
    };

    try {
      const { batchIds, targetIds, targetType, timeframe } = payload as ViewAggregationPayload;

      const result: ViewAggregationResult = {
        aggregatedTargets: 0,
        batchesProcessed: 0,
        errors: [],
        processedViews: 0,
        skippedViews: 0,
      };

      // process batch queues if provided
      if (batchIds && batchIds.length > 0) {
        const batchResults = await this.processBatchAggregation(batchIds);

        for (const batchResult of batchResults) {
          result.batchesProcessed++;
          result.processedViews += batchResult.processedCount;
          result.skippedViews += batchResult.skippedCount;
          result.errors.push(...batchResult.errors);
        }
      }

      // update aggregates for specific targets if provided
      if (targetIds && targetIds.length > 0 && targetType) {
        const aggregateResult = await this.updateTargetAggregates(targetIds, targetType, timeframe || 'day');
        result.aggregatedTargets = aggregateResult.updatedTargets;
        result.errors.push(...aggregateResult.errors);
      }

      // perform periodic cleanup of stale caches
      this.performPeriodicCleanup();

      return result;
    } catch (error) {
      throw createServiceError(context, error);
    }
  }

  /**
   * Update aggregates for specific targets
   */
  static async updateTargetAggregates(
    targetIds: Array<string>,
    targetType: string,
    timeframe: 'day' | 'hour' | 'month' | 'week',
  ): Promise<{
    errors: Array<string>;
    updatedTargets: number;
  }> {
    const errors: Array<string> = [];
    let updatedTargets = 0;

    const queryContext: QueryContext = {
      userId: undefined,
    };

    for (const targetId of targetIds) {
      try {
        await withServiceRetry(
          async () => {
            // get current view stats from the database
            const viewStats = await ViewTrackingQuery.getViewStatsAsync(
              targetType as (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
              targetId,
              {
                startDate: this.getTimeframeStartDate(timeframe),
              },
              queryContext,
            );

            // update Redis aggregates based on database stats
            await ViewTrackingService.updateViewAggregates(
              targetType,
              targetId,
              timeframe,
              1, // increment by 1 (or could be calculated from diff)
              false, // assuming authenticated for this aggregation
            );

            // update view count cache
            await ViewTrackingService.setViewCount(targetType, targetId, viewStats.totalViews);

            updatedTargets++;
          },
          'redis',
          {
            maxAttempts: 3,
            operationName: `update-aggregates-${targetType}-${targetId}`,
          },
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to update aggregates for ${targetType}:${targetId}: ${errorMessage}`);
      }
    }

    return { errors, updatedTargets };
  }

  /**
   * Helper to get the start date for timeframe
   */
  private static getTimeframeStartDate(timeframe: 'day' | 'hour' | 'month' | 'week'): Date {
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

  /**
   * Perform periodic cleanup of stale caches and data
   */
  private static performPeriodicCleanup(): void {
    try {
      // this could include cleanup of:
      // - Expired batch queues
      // - Old session data
      // - Stale aggregation caches

      console.log('Performing periodic cleanup of view tracking caches');

      // implement cleanup logic as needed
      // for now, just log that cleanup would happen
    } catch (error) {
      console.warn('Periodic cleanup failed:', error);
      // don't throw as this is non-critical
    }
  }
}
