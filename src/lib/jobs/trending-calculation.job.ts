import type { TrendingContentRecord } from '@/lib/queries/analytics/view-analytics.query';
import type { QueryContext } from '@/lib/queries/base/query-context';
import type { TrendingCacheData } from '@/lib/services/view-tracking.service';
import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { ENUMS } from '@/lib/constants';
import { ViewAnalyticsQuery } from '@/lib/queries/analytics/view-analytics.query';
import { ViewTrackingService } from '@/lib/services/view-tracking.service';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

export interface TrendingCalculationPayload {
  minViews?: number;
  targetTypes?: Array<string>;
  timeframes?: Array<'day' | 'hour' | 'month' | 'week'>;
}

export interface TrendingCalculationResult {
  cacheUpdates: number;
  errors: Array<string>;
  targetTypesProcessed: Array<string>;
  timeframesProcessed: Array<string>;
  totalTrendingItems: number;
}

/**
 * Background job for calculating and caching trending content
 * Processes trending algorithms and updates Redis cache
 */
export class TrendingCalculationJob {
  /**
   * Calculate cross-platform trending (trending across all content types)
   */
  static async calculateCrossPlatformTrending(
    timeframes: Array<'day' | 'hour' | 'month' | 'week'>,
    result: TrendingCalculationResult,
  ): Promise<void> {
    const queryContext: QueryContext = {
      userId: undefined,
    };

    for (const timeframe of timeframes) {
      try {
        // get trending content across all types
        const allTargetTypes = ENUMS.CONTENT_VIEWS.TARGET_TYPE;
        const allTrendingContent: Array<TrendingContentRecord> = [];

        for (const targetType of allTargetTypes) {
          const trending = await ViewAnalyticsQuery.getTrendingContentAsync(
            targetType,
            {
              limit: 50,
              minViews: 1,
              timeframe,
            },
            queryContext,
          );
          allTrendingContent.push(...trending);
        }

        // sort by trending score across all types
        const sortedTrending = allTrendingContent
          .sort((a, b) => b.trendingScore - a.trendingScore)
          .slice(0, 100); // top 100 across all types

        // cache as 'all' target type
        const cacheData: TrendingCacheData = {
          lastUpdated: Date.now(),
          targets: sortedTrending.map((item) => ({
            score: item.trendingScore,
            targetId: item.targetId,
            targetType: item.targetType,
            totalViews: item.viewCount,
          })),
          timeframe,
        };

        await ViewTrackingService.setTrendingContent('all', timeframe, cacheData);

        result.cacheUpdates++;
        result.totalTrendingItems += sortedTrending.length;

        if (!result.targetTypesProcessed.includes('all')) {
          result.targetTypesProcessed.push('all');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to calculate cross-platform trending for ${timeframe}: ${errorMessage}`);
      }
    }
  }

  /**
   * Calculate engagement-based trending (trending based on user engagement metrics)
   */
  static async calculateEngagementTrending(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    timeframe: 'day' | 'month' | 'week',
  ): Promise<{
    error?: string;
    isSuccessful: boolean;
    itemCount: number;
  }> {
    const queryContext: QueryContext = {
      userId: undefined,
    };

    try {
      const engagementMetrics = await withServiceRetry(
        async () => {
          return ViewAnalyticsQuery.getUserEngagementAsync(
            targetType,
            {
              limit: 50,
              minViews: 5,
              timeframe,
            },
            queryContext,
          );
        },
        'database',
        {
          maxAttempts: 3,
          operationName: `get-engagement-${targetType}-${timeframe}`,
        },
      );

      // transform engagement metrics to trending format
      const cacheData: TrendingCacheData = {
        lastUpdated: Date.now(),
        targets: engagementMetrics.result.map((item) => ({
          score: item.engagementScore,
          targetId: item.targetId,
          targetType: item.targetType,
          totalViews: 0, // could be enhanced to include actual view count
        })),
        timeframe,
      };

      // cache as engagement-based trending
      await ViewTrackingService.setTrendingContent(`${targetType}_engagement`, timeframe, cacheData);

      return {
        isSuccessful: true,
        itemCount: engagementMetrics.result.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: errorMessage,
        isSuccessful: false,
        itemCount: 0,
      };
    }
  }

  /**
   * Calculate personalized trending for a specific user
   * This could be enhanced to include user preferences and viewing history
   */
  static async calculatePersonalizedTrending(
    _userId: string,
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    timeframe: 'day' | 'month' | 'week',
  ): Promise<{
    error?: string;
    isSuccessful: boolean;
    itemCount: number;
  }> {
    // this is a placeholder for future personalized trending implementation
    // could include user's viewing history, preferences, followed users, etc.

    try {
      // for now, just return regular trending but cached with user context
      const regularTrending = await this.calculateTrendingForType(targetType, timeframe, 1);

      if (regularTrending.isSuccessful) {
        // could enhance this to apply personalization filters
        // await ViewTrackingService.setTrendingContent(
        //   `${targetType}_user_${userId}`,
        //   timeframe,
        //   personalizedData
        // );
      }

      return regularTrending;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: errorMessage,
        isSuccessful: false,
        itemCount: 0,
      };
    }
  }

  /**
   * Calculate trending content for multiple target types and timeframes
   */
  static async calculateTrending(payload: unknown): Promise<TrendingCalculationResult> {
    const context: ServiceErrorContext = {
      endpoint: 'calculateTrending',
      isRetryable: true,
      method: 'calculateTrending',
      operation: 'trending-calculation',
      service: 'background-job',
    };

    try {
      const {
        minViews = 1,
        targetTypes = ENUMS.CONTENT_VIEWS.TARGET_TYPE,
        timeframes = ['hour', 'day', 'week', 'month'],
      } = payload as TrendingCalculationPayload;

      const result: TrendingCalculationResult = {
        cacheUpdates: 0,
        errors: [],
        targetTypesProcessed: [],
        timeframesProcessed: [],
        totalTrendingItems: 0,
      };

      // process each target type and timeframe combination
      for (const targetType of targetTypes) {
        for (const timeframe of timeframes) {
          try {
            const trendingResult = await this.calculateTrendingForType(
              targetType as (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
              timeframe,
              minViews,
            );

            if (trendingResult.isSuccessful) {
              result.cacheUpdates++;
              result.totalTrendingItems += trendingResult.itemCount;

              if (!result.targetTypesProcessed.includes(targetType)) {
                result.targetTypesProcessed.push(targetType);
              }
              if (!result.timeframesProcessed.includes(timeframe)) {
                result.timeframesProcessed.push(timeframe);
              }
            } else {
              result.errors.push(trendingResult.error || 'Unknown error');
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            result.errors.push(
              `Failed to calculate trending for ${targetType}:${timeframe}: ${errorMessage}`,
            );
          }
        }
      }

      // perform additional trending calculations
      await this.calculateCrossPlatformTrending(timeframes, result);

      return result;
    } catch (error) {
      throw createServiceError(context, error);
    }
  }

  /**
   * Calculate trending content for a specific target type and timeframe
   */
  static async calculateTrendingForType(
    targetType: (typeof ENUMS.CONTENT_VIEWS.TARGET_TYPE)[number],
    timeframe: 'day' | 'hour' | 'month' | 'week',
    minViews: number,
  ): Promise<{
    error?: string;
    isSuccessful: boolean;
    itemCount: number;
  }> {
    const queryContext: QueryContext = {
      userId: undefined,
    };

    try {
      const trendingContent = await withServiceRetry(
        async () => {
          return ViewAnalyticsQuery.getTrendingContentAsync(
            targetType,
            {
              limit: 100, // get top 100 trending items
              minViews,
              timeframe,
            },
            queryContext,
          );
        },
        'database',
        {
          maxAttempts: 3,
          operationName: `get-trending-${targetType}-${timeframe}`,
        },
      );

      // transform to cache format
      const cacheData: TrendingCacheData = {
        lastUpdated: Date.now(),
        targets: trendingContent.result.map((item) => ({
          score: item.trendingScore,
          targetId: item.targetId,
          targetType: item.targetType,
          totalViews: item.viewCount,
        })),
        timeframe,
      };

      // cache the trending data
      await ViewTrackingService.setTrendingContent(targetType, timeframe, cacheData);

      return {
        isSuccessful: true,
        itemCount: trendingContent.result.length,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        error: errorMessage,
        isSuccessful: false,
        itemCount: 0,
      };
    }
  }
}
