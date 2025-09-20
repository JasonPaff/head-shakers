import type { ENUMS } from '@/lib/constants';
import type {
  ContentPerformanceRecord,
  EngagementMetric,
  TrendingContentRecord,
} from '@/lib/queries/analytics/view-analytics.query';
import type { RecentViewsRecord, ViewRecord, ViewStats } from '@/lib/queries/analytics/view-tracking.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertContentView } from '@/lib/validations/analytics.validation';

import { REDIS_KEYS, REDIS_TTL } from '@/lib/constants';
import { db } from '@/lib/db';
import { ViewAnalyticsQuery } from '@/lib/queries/analytics/view-analytics.query';
import { ViewTrackingQuery } from '@/lib/queries/analytics/view-tracking.query';
import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';
import { RedisOperations } from '@/lib/utils/redis-client';

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
 * Business logic facade for view tracking functionality
 * Provides clean API and business rule enforcement for view operations
 */
export class ViewTrackingFacade {
  /**
   * Record multiple views in a batch operation
   */
  static async batchRecordViewsAsync(
    views: Array<InsertContentView>,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<BatchViewResult> {
    try {
      if (views.length === 0) {
        return {
          batchId: crypto.randomUUID(),
          duplicateViews: 0,
          errors: [],
          recordedViews: 0,
          skippedViews: 0,
        };
      }

      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const batchId = crypto.randomUUID();
      const errors: Array<string> = [];
      let duplicateViews = 0;
      let skippedViews = 0;
      const validViews: Array<InsertContentView> = [];

      // process each view for deduplication and privacy
      for (const viewData of views) {
        try {
          // check deduplication
          const deduplicationResult = await this.checkViewDeduplication(
            viewData.targetType,
            viewData.targetId,
            viewerUserId,
            viewData.ipAddress || undefined,
            options.deduplicationWindow || 600,
          );

          if (deduplicationResult.isDuplicate) {
            duplicateViews++;
            continue;
          }

          // check privacy settings
          if (options.shouldRespectPrivacySettings && viewerUserId) {
            const canTrack = this.checkUserPrivacySettings(viewerUserId, dbInstance);
            if (!canTrack) {
              skippedViews++;
              continue;
            }
          }

          // skip anonymous tracking if requested
          if (options.shouldSkipAnonymousTracking && !viewerUserId) {
            skippedViews++;
            continue;
          }

          validViews.push(viewData);
        } catch (error) {
          errors.push(`View validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // record valid views
      let recordedViews = 0;
      if (validViews.length > 0) {
        try {
          await ViewTrackingQuery.batchRecordViewsAsync(validViews, context);
          recordedViews = validViews.length;

          // set deduplication caches and invalidate view count caches
          await Promise.allSettled([
            ...validViews.map((view) =>
              viewerUserId ?
                this.setDeduplicationCache(
                  view.targetType,
                  view.targetId,
                  viewerUserId,
                  options.deduplicationWindow || 600,
                )
              : view.ipAddress ?
                this.setAnonymousDeduplicationCache(
                  view.targetType,
                  view.targetId,
                  view.ipAddress,
                  options.deduplicationWindow || 600,
                )
              : Promise.resolve(),
            ),
            ...validViews.map((view) => this.invalidateViewCountCache(view.targetType, view.targetId)),
          ]);
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
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { viewCount: views.length },
        facade: facadeName,
        method: 'batchRecordViewsAsync',
        operation: 'batchRecordViews',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get content performance metrics
   */
  static async getContentPerformanceAsync(
    targetIds: Array<string>,
    targetType: ContentViewTargetType,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<ContentPerformanceRecord>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return await ViewAnalyticsQuery.getContentPerformanceAsync(
        targetIds,
        targetType,
        {
          isIncludingAnonymous: true, // Default to including anonymous views
        },
        context,
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetIds, targetType },
        facade: facadeName,
        method: 'getContentPerformanceAsync',
        operation: 'getContentPerformance',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get engagement metrics for multiple targets
   */
  static async getEngagementMetricsAsync(
    targetIds: Array<string>,
    targetType: ContentViewTargetType,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<EngagementMetric>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      // get engagement metrics for all targets
      const results = await ViewAnalyticsQuery.getUserEngagementAsync(
        targetType,
        {
          minViews: 1, // minimum views to include in engagement metrics
          timeframe: 'week', // default timeframe
        },
        context,
      );

      // filter results to only include the requested target IDs
      return results.filter((result) => targetIds.includes(result.targetId));
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetIds, targetType },
        facade: facadeName,
        method: 'getEngagementMetricsAsync',
        operation: 'getEngagementMetrics',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get recent views for a target
   */
  static async getRecentViewsAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    limit = 10,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<RecentViewsRecord>> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.RECENT_VIEWS(targetType, targetId);

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          return ViewTrackingQuery.getRecentViewsAsync(targetType, targetId, { limit }, context);
        },
        cacheKey,
        {
          context: {
            entityId: targetId,
            entityType: targetType,
            facade: facadeName,
            operation: 'getRecentViews',
            userId: viewerUserId,
          },
          ttl: REDIS_TTL.VIEW_TRACKING.STATS,
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { limit, targetId, targetType },
        facade: facadeName,
        method: 'getRecentViewsAsync',
        operation: 'getRecentViews',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get trending content with caching
   */
  static async getTrendingContentAsync(
    targetType: ContentViewTargetType,
    options: TrendingContentOptions = {},
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TrendingContentRecord>> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.TRENDING_CACHE(targetType, options.timeframe || 'day');

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          return ViewAnalyticsQuery.getTrendingContentAsync(
            targetType,
            {
              isIncludingAnonymous: options.shouldIncludeAnonymous ?? true,
              limit: options.limit || 10,
              timeframe: options.timeframe || 'day',
            },
            context,
          );
        },
        cacheKey,
        {
          context: {
            entityType: targetType,
            facade: facadeName,
            operation: 'getTrendingContent',
            userId: viewerUserId,
          },
          ttl: REDIS_TTL.VIEW_TRACKING.TRENDING,
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { options, targetType },
        facade: facadeName,
        method: 'getTrendingContentAsync',
        operation: 'getTrendingContent',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view count for a specific target with caching
   */
  static async getViewCountAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    shouldIncludeAnonymous = true,
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<number> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId);

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          const stats = await ViewTrackingQuery.getViewStatsAsync(
            targetType,
            targetId,
            {}, // empty options for all-time stats
            context,
          );

          // shouldIncludeAnonymous parameter is reserved for future use
          void shouldIncludeAnonymous;
          return stats.totalViews;
        },
        cacheKey,
        {
          context: {
            entityId: targetId,
            entityType: targetType,
            facade: facadeName,
            operation: 'getViewCount',
            userId: viewerUserId,
          },
          ttl: REDIS_TTL.VIEW_TRACKING.COUNTS,
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getViewCountAsync',
        operation: 'getViewCount',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Get view statistics for a specific target with caching
   */
  static async getViewStatsAsync(
    targetType: ContentViewTargetType,
    targetId: string,
    options: ViewStatsOptions = {},
    viewerUserId?: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<ViewStats> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.VIEW_STATS(targetType, targetId, options.timeframe || 'day');

      return CacheService.cached(
        async () => {
          const context =
            viewerUserId ?
              createUserQueryContext(viewerUserId, { dbInstance })
            : createPublicQueryContext({ dbInstance });

          return ViewTrackingQuery.getViewStatsAsync(
            targetType,
            targetId,
            {}, // use empty options for now
            context,
          );
        },
        cacheKey,
        {
          context: {
            entityId: targetId,
            entityType: targetType,
            facade: facadeName,
            operation: 'getViewStats',
            userId: viewerUserId,
          },
          ttl: REDIS_TTL.VIEW_TRACKING.STATS,
        },
      );
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId, targetType },
        facade: facadeName,
        method: 'getViewStatsAsync',
        operation: 'getViewStats',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Record a single view with deduplication and privacy enforcement
   */
  static async recordViewAsync(
    viewData: InsertContentView,
    viewerUserId?: string,
    options: ViewRecordOptions = {},
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | ViewRecord> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      // check for deduplication
      const deduplicationResult = await this.checkViewDeduplication(
        viewData.targetType,
        viewData.targetId,
        viewerUserId,
        viewData.ipAddress || undefined,
        options.deduplicationWindow || 600, // 10-minute default
      );

      if (deduplicationResult.isDuplicate) {
        return null;
      }

      // check privacy settings if requested
      if (options.shouldRespectPrivacySettings && viewerUserId) {
        const canTrack = this.checkUserPrivacySettings(viewerUserId, dbInstance);
        if (!canTrack) {
          return null;
        }
      }

      // skip anonymous tracking if requested
      if (options.shouldSkipAnonymousTracking && !viewerUserId) {
        return null;
      }

      // record the view
      const result = await ViewTrackingQuery.recordViewAsync(viewData, context);

      // set deduplication cache
      if (viewerUserId) {
        await this.setDeduplicationCache(
          viewData.targetType,
          viewData.targetId,
          viewerUserId,
          options.deduplicationWindow || 300,
        );
      } else if (viewData.ipAddress) {
        await this.setAnonymousDeduplicationCache(
          viewData.targetType,
          viewData.targetId,
          viewData.ipAddress,
          options.deduplicationWindow || 300,
        );
      }

      // invalidate view count caches
      await this.invalidateViewCountCache(viewData.targetType, viewData.targetId);

      return result;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { targetId: viewData.targetId, targetType: viewData.targetType },
        facade: facadeName,
        method: 'recordViewAsync',
        operation: 'recordView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * Private helper methods
   */

  /**
   * Check user privacy settings for view tracking
   */
  private static checkUserPrivacySettings(userId: string, dbInstance: DatabaseExecutor): boolean {
    // for now, assume tracking is allowed unless specifically opted out
    // this should be implemented based on the user settings schema
    // TODO: Implement actual privacy settings check from database
    // Reserved parameters for future implementation
    void userId;
    void dbInstance;
    return true;
  }

  /**
   * Check if a view is a duplicate within the deduplication window
   */
  private static async checkViewDeduplication(
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

      // check if the cache key exists
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
      // on cache error, allow the view to be recorded
      return {
        isDuplicate: false,
        isSuccessful: false,
        reason: `Deduplication check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private static async deleteCacheValue(key: string): Promise<void> {
    try {
      await RedisOperations.del(key);
    } catch (error) {
      console.warn(`Failed to delete cache key ${key}:`, error);
    }
  }

  /**
   * Invalidate view count cache
   */
  private static async invalidateViewCountCache(
    targetType: ContentViewTargetType,
    targetId: string,
  ): Promise<void> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId);
      await this.deleteCacheValue(cacheKey);

      // also invalidate view stats cache
      const statsKey = REDIS_KEYS.VIEW_TRACKING.VIEW_STATS(targetType, targetId, 'day');
      await this.deleteCacheValue(statsKey);
    } catch (error) {
      // non-blocking cache operation
      console.warn('Failed to invalidate view count cache:', error);
    }
  }

  /**
   * Set deduplication cache for anonymous users
   */
  private static async setAnonymousDeduplicationCache(
    targetType: ContentViewTargetType,
    targetId: string,
    ipAddress: string,
    ttl = 300,
  ): Promise<void> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, ipAddress);
      await RedisOperations.set(cacheKey, Date.now().toString(), ttl);
    } catch (error) {
      // non-blocking cache operation
      console.warn('Failed to set anonymous deduplication cache:', error);
    }
  }

  /**
   * Set deduplication cache for authenticated users
   */
  private static async setDeduplicationCache(
    targetType: ContentViewTargetType,
    targetId: string,
    viewerUserId: string,
    ttl = 300,
  ): Promise<void> {
    try {
      const cacheKey = REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, viewerUserId);
      await RedisOperations.set(cacheKey, Date.now().toString(), ttl);
    } catch (error) {
      // non-blocking cache operation
      console.warn('Failed to set deduplication cache:', error);
    }
  }
}
