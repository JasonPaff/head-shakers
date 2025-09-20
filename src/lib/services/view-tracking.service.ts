import { Redis } from '@upstash/redis/node';

import type { ServiceErrorContext } from '@/lib/utils/error-types';

import { REDIS_KEYS, REDIS_TTL } from '@/lib/constants';
import { circuitBreakers } from '@/lib/utils/circuit-breaker-registry';
import { createServiceError } from '@/lib/utils/error-builders';
import { withServiceRetry } from '@/lib/utils/retry';

const redis = new Redis({
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  url: process.env.UPSTASH_REDIS_REST_URL,
});

export interface TrendingCacheData {
  lastUpdated: number;
  targets: Array<{
    score: number;
    targetId: string;
    targetType: string;
    totalViews: number;
  }>;
  timeframe: string;
}

export interface ViewAggregateData {
  anonymous: number;
  authenticated: number;
  hourly: Record<string, number>;
  lastUpdated: number;
  period: string;
  targetId: string;
  targetType: string;
  total: number;
}

export interface ViewBatchItem {
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  sessionId: string;
  targetId: string;
  targetType: string;
  timestamp: number;
  userId?: string;
}

export interface ViewBatchResult {
  batchId: string;
  errors: Array<string>;
  processedCount: number;
  queuedCount: number;
  skippedCount: number;
}

export interface ViewSessionData {
  duration?: number;
  ipAddress?: string;
  lastActivity: number;
  referrer?: string;
  sessionId: string;
  startTime: number;
  targetId: string;
  targetType: string;
  userId?: string;
  viewCount: number;
}

/**
 * Redis-based service for view tracking caching and batch processing
 * Provides efficient view aggregation, deduplication, and trending calculations
 */
export class ViewTrackingService {
  /**
   * Add view to batch queue for background processing
   */
  static async addViewToBatch(viewData: ViewBatchItem): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-view-batch');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const batchId = this.generateBatchId();
            const batchKey = REDIS_KEYS.VIEW_TRACKING.BATCH_QUEUE(batchId);

            // Use pipeline for atomic operations
            const pipeline = redis.pipeline();

            // Add view to batch queue
            pipeline.lpush(batchKey, JSON.stringify(viewData));

            // Set expiration for batch queue
            pipeline.expire(batchKey, REDIS_TTL.VIEW_TRACKING.BATCH_QUEUE);

            // Add to pending views for session tracking
            if (viewData.sessionId) {
              const pendingKey = REDIS_KEYS.VIEW_TRACKING.PENDING_VIEWS(viewData.sessionId);
              pipeline.sadd(pendingKey, `${viewData.targetType}:${viewData.targetId}`);
              pipeline.expire(pendingKey, REDIS_TTL.VIEW_TRACKING.PENDING_VIEWS);
            }

            await pipeline.exec();
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-add-view-batch',
          },
        );
      });
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'addViewToBatch',
        isRetryable: true,
        method: 'addViewToBatch',
        operation: 'queue-view',
        service: 'redis',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Check deduplication cache
   */
  static async checkDeduplication(
    targetType: string,
    targetId: string,
    identifier: string,
    isAnonymous = false,
  ): Promise<boolean> {
    const circuitBreaker = circuitBreakers.fast('redis-dedup-check');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            const cacheKey = isAnonymous ?
              REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, identifier)
            : REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, identifier);

            const exists = await redis.exists(cacheKey);
            return exists === 1;
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-check-deduplication',
          },
        );

        return retryResult.result;
      });

      return result.result;
    } catch (error) {
      // On error, allow the view to prevent false negatives
      console.warn(`Failed to check deduplication for ${targetType}:${targetId}:`, error);
      return false;
    }
  }

  /**
   * Get trending content from cache
   */
  static async getTrendingContent(
    targetType: string,
    timeframe: string,
  ): Promise<null | TrendingCacheData> {
    const circuitBreaker = circuitBreakers.fast('redis-trending-get');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            const cacheKey = REDIS_KEYS.VIEW_TRACKING.TRENDING_CACHE(targetType, timeframe);
            const cached = await redis.get(cacheKey);

            if (!cached) return null;

            return typeof cached === 'string' ? JSON.parse(cached) as TrendingCacheData : cached as TrendingCacheData;
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-get-trending',
          },
        );

        return retryResult.result;
      });

      return result.result;
    } catch (error) {
      console.warn(`Failed to get trending content for ${targetType}:${timeframe}:`, error);
      return null;
    }
  }

  /**
   * Get view aggregates for a target
   */
  static async getViewAggregates(
    targetType: string,
    targetId: string,
    period: string,
  ): Promise<null | ViewAggregateData> {
    const circuitBreaker = circuitBreakers.fast('redis-aggregate-get');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            const aggregateKey = REDIS_KEYS.VIEW_TRACKING.VIEW_AGGREGATES(targetType, targetId, period);
            const aggregateData = await redis.hgetall(aggregateKey);

            if (!aggregateData || Object.keys(aggregateData).length === 0) {
              return null;
            }

            // Parse hourly data
            const hourly: Record<string, number> = {};
            for (const [key, value] of Object.entries(aggregateData)) {
              if (key.startsWith('hourly:')) {
                const hour = key.split(':')[1];
                if (hour) {
                  hourly[hour] = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
                }
              }
            }

            return {
              anonymous: typeof aggregateData.anonymous === 'number' ? aggregateData.anonymous : parseInt(String(aggregateData.anonymous), 10) || 0,
              authenticated: typeof aggregateData.authenticated === 'number' ? aggregateData.authenticated : parseInt(String(aggregateData.authenticated), 10) || 0,
              hourly,
              lastUpdated: typeof aggregateData.lastUpdated === 'number' ? aggregateData.lastUpdated : parseInt(String(aggregateData.lastUpdated), 10) || 0,
              period,
              targetId,
              targetType,
              total: typeof aggregateData.total === 'number' ? aggregateData.total : parseInt(String(aggregateData.total), 10) || 0,
            };
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-get-aggregates',
          },
        );

        return retryResult.result;
      });

      return result.result;
    } catch (error) {
      console.warn(`Failed to get aggregates for ${targetType}:${targetId}:`, error);
      return null;
    }
  }

  /**
   * Get cached view count for a target
   */
  static async getViewCount(targetType: string, targetId: string): Promise<number> {
    const circuitBreaker = circuitBreakers.fast('redis-view-count');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            const countKey = REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId);
            const count = await redis.get(countKey);
            return typeof count === 'number' ? count : 0;
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-get-view-count',
          },
        );

        return retryResult.result;
      });

      return result.result;
    } catch (error) {
      // Return 0 on error to avoid breaking UI
      console.warn(`Failed to get view count for ${targetType}:${targetId}:`, error);
      return 0;
    }
  }

  /**
   * Invalidate all caches for a target
   */
  static async invalidateTargetCaches(targetType: string, targetId: string): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-cache-invalidate');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const keysToDelete = [
              REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId),
              REDIS_KEYS.VIEW_TRACKING.RECENT_VIEWS(targetType, targetId),
              REDIS_KEYS.VIEW_TRACKING.VIEW_STATS(targetType, targetId, 'day'),
              REDIS_KEYS.VIEW_TRACKING.VIEW_STATS(targetType, targetId, 'week'),
              REDIS_KEYS.VIEW_TRACKING.VIEW_STATS(targetType, targetId, 'month'),
            ];

            if (keysToDelete.length > 0) {
              await redis.del(...keysToDelete);
            }
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-invalidate-caches',
          },
        );
      });
    } catch (error) {
      console.warn(`Failed to invalidate caches for ${targetType}:${targetId}:`, error);
    }
  }

  /**
   * Process a batch of queued views
   */
  static async processBatch(batchId: string): Promise<ViewBatchResult> {
    const circuitBreaker = circuitBreakers.fast('redis-view-batch-process');

    try {
      const result = await circuitBreaker.execute(async () => {
        const retryResult = await withServiceRetry(
          async () => {
            const batchKey = REDIS_KEYS.VIEW_TRACKING.BATCH_QUEUE(batchId);

            // Get all views from batch queue
            const batchItems = await redis.lrange(batchKey, 0, -1);

            if (batchItems.length === 0) {
              return {
                batchId,
                errors: [],
                processedCount: 0,
                queuedCount: 0,
                skippedCount: 0,
              };
            }

            const pipeline = redis.pipeline();
            const errors: Array<string> = [];
            let processedCount = 0;
            let skippedCount = 0;

            // Process each view in the batch
            for (const item of batchItems) {
              try {
                const viewData = JSON.parse(item) as ViewBatchItem;

                // Update view counts
                const countKey = REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(
                  viewData.targetType,
                  viewData.targetId,
                );
                pipeline.incr(countKey);
                pipeline.expire(countKey, REDIS_TTL.VIEW_TRACKING.COUNTS);

                // Update session tracking
                if (viewData.sessionId) {
                  const sessionKey = REDIS_KEYS.VIEW_TRACKING.SESSION_VIEWS(viewData.sessionId);
                  const sessionData: Record<string, unknown> = {
                    ipAddress: viewData.ipAddress,
                    lastActivity: viewData.timestamp,
                    sessionId: viewData.sessionId,
                    startTime: viewData.timestamp,
                    targetId: viewData.targetId,
                    targetType: viewData.targetType,
                    userId: viewData.userId,
                    viewCount: 1,
                  };

                  pipeline.hset(sessionKey, sessionData);
                  pipeline.expire(sessionKey, REDIS_TTL.VIEW_TRACKING.SESSION_VIEWS);
                }

                // Update aggregates for different time periods
                const now = new Date(viewData.timestamp);
                const hourKey = this.getTimeBasedKey(viewData.targetType, viewData.targetId, 'hour', now);
                const dayKey = this.getTimeBasedKey(viewData.targetType, viewData.targetId, 'day', now);

                pipeline.incr(hourKey);
                pipeline.expire(hourKey, REDIS_TTL.VIEW_TRACKING.AGGREGATES);
                pipeline.incr(dayKey);
                pipeline.expire(dayKey, REDIS_TTL.VIEW_TRACKING.AGGREGATES);

                processedCount++;
              } catch (parseError) {
                errors.push(`Failed to parse batch item: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
                skippedCount++;
              }
            }

            // Remove processed items from queue
            pipeline.del(batchKey);

            await pipeline.exec();

            return {
              batchId,
              errors,
              processedCount,
              queuedCount: batchItems.length,
              skippedCount,
            };
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-process-view-batch',
          },
        );

        return retryResult.result;
      });

      return result.result;
    } catch (error) {
      const context: ServiceErrorContext = {
        endpoint: 'processBatch',
        isRetryable: true,
        method: 'processBatch',
        operation: 'process-batch',
        service: 'redis',
      };
      throw createServiceError(context, error);
    }
  }

  /**
   * Set deduplication cache
   */
  static async setDeduplication(
    targetType: string,
    targetId: string,
    identifier: string,
    ttl = REDIS_TTL.VIEW_TRACKING.DEDUPLICATION,
    isAnonymous = false,
  ): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-dedup-set');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const cacheKey = isAnonymous ?
              REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, identifier)
            : REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, identifier);

            await redis.set(cacheKey, Date.now(), { ex: ttl });
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-set-deduplication',
          },
        );
      });
    } catch (error) {
      // Non-blocking cache operation
      console.warn(`Failed to set deduplication for ${targetType}:${targetId}:`, error);
    }
  }

  /**
   * Set trending content cache
   */
  static async setTrendingContent(
    targetType: string,
    timeframe: string,
    data: TrendingCacheData,
  ): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-trending-set');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const cacheKey = REDIS_KEYS.VIEW_TRACKING.TRENDING_CACHE(targetType, timeframe);
            await redis.set(cacheKey, JSON.stringify(data), {
              ex: REDIS_TTL.VIEW_TRACKING.TRENDING,
            });
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-set-trending',
          },
        );
      });
    } catch (error) {
      console.warn(`Failed to set trending content for ${targetType}:${timeframe}:`, error);
    }
  }

  /**
   * Set view count cache
   */
  static async setViewCount(targetType: string, targetId: string, count: number): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-view-count-set');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const countKey = REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId);
            await redis.set(countKey, count, {
              ex: REDIS_TTL.VIEW_TRACKING.COUNTS,
            });
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-set-view-count',
          },
        );
      });
    } catch (error) {
      // Non-blocking cache operation
      console.warn(`Failed to set view count for ${targetType}:${targetId}:`, error);
    }
  }

  /**
   * Update view aggregates for a target
   */
  static async updateViewAggregates(
    targetType: string,
    targetId: string,
    period: string,
    increment = 1,
    isAnonymous = false,
  ): Promise<void> {
    const circuitBreaker = circuitBreakers.fast('redis-aggregate-update');

    try {
      await circuitBreaker.execute(async () => {
        await withServiceRetry(
          async () => {
            const aggregateKey = REDIS_KEYS.VIEW_TRACKING.VIEW_AGGREGATES(targetType, targetId, period);

            const pipeline = redis.pipeline();

            // Increment total count
            pipeline.hincrby(aggregateKey, 'total', increment);

            // Increment anonymous or authenticated count
            if (isAnonymous) {
              pipeline.hincrby(aggregateKey, 'anonymous', increment);
            } else {
              pipeline.hincrby(aggregateKey, 'authenticated', increment);
            }

            // Update hourly tracking
            const currentHour = new Date().getHours();
            pipeline.hincrby(aggregateKey, `hourly:${currentHour}`, increment);

            // Update last updated timestamp
            pipeline.hset(aggregateKey, { lastUpdated: Date.now() });

            // Set expiration
            pipeline.expire(aggregateKey, REDIS_TTL.VIEW_TRACKING.AGGREGATES);

            await pipeline.exec();
          },
          'redis',
          {
            maxAttempts: 2,
            operationName: 'redis-update-aggregates',
          },
        );
      });
    } catch (error) {
      console.warn(`Failed to update aggregates for ${targetType}:${targetId}:`, error);
    }
  }

  /**
   * Private helper methods
   */

  private static generateBatchId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `batch_${timestamp}_${random}`;
  }

  private static getTimeBasedKey(
    targetType: string,
    targetId: string,
    period: 'day' | 'hour',
    date: Date,
  ): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (period === 'hour') {
      const hour = date.getHours();
      return REDIS_KEYS.VIEW_TRACKING.VIEW_AGGREGATES(
        targetType,
        targetId,
        `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}-${hour.toString().padStart(2, '0')}`,
      );
    }

    return REDIS_KEYS.VIEW_TRACKING.VIEW_AGGREGATES(
      targetType,
      targetId,
      `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    );
  }
}