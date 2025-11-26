/**
 * SEO-specific cache utilities for metadata operations
 *
 * This module provides specialized caching helpers for metadata generation,
 * reducing database load and improving performance for frequently accessed metadata.
 *
 * Features:
 * - Cache metadata with customizable TTL
 * - Entity-specific cache key generators
 * - Automatic cache invalidation by content type
 * - Cache warming for featured/trending content
 * - Cache hit rate monitoring
 * - Graceful fallback on cache failures
 *
 * @module seo/cache.utils
 */

import { CACHE_CONFIG } from '@/lib/constants/cache';
import { CacheService } from '@/lib/services/cache.service';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';

/**
 * Cache statistics for metadata operations
 */
export interface MetadataCacheStats {
  errors: number;
  hitRate: number;
  hits: number;
  misses: number;
  totalOperations: number;
}

/**
 * Content types that can have metadata cached
 */
export type MetadataContentType = 'bobblehead' | 'collection' | 'user';

/**
 * Statistics tracking for metadata cache operations
 */
class MetadataCacheMonitor {
  private stats: MetadataCacheStats = {
    errors: 0,
    hitRate: 0,
    hits: 0,
    misses: 0,
    totalOperations: 0,
  };

  getStats(): MetadataCacheStats {
    return { ...this.stats };
  }

  recordError(): void {
    this.stats.errors++;
    this.stats.totalOperations++;
    this.updateHitRate();
  }

  recordHit(): void {
    this.stats.hits++;
    this.stats.totalOperations++;
    this.updateHitRate();
  }

  recordMiss(): void {
    this.stats.misses++;
    this.stats.totalOperations++;
    this.updateHitRate();
  }

  resetStats(): void {
    this.stats = {
      errors: 0,
      hitRate: 0,
      hits: 0,
      misses: 0,
      totalOperations: 0,
    };
  }

  private updateHitRate(): void {
    this.stats.hitRate =
      this.stats.totalOperations > 0 ? (this.stats.hits / this.stats.totalOperations) * 100 : 0;
  }
}

/**
 * Global metadata cache monitor instance
 */
const metadataMonitor = new MetadataCacheMonitor();

/**
 * Batch cache metadata for multiple items
 *
 * Efficiently caches metadata for multiple items of the same type.
 * Processes items in parallel for better performance.
 *
 * @template T - Return type of the metadata generator function
 * @param contentType - Type of content to cache
 * @param items - Array of items with their IDs
 * @param metadataGenerator - Function that generates metadata for a single item
 * @param ttl - Time-to-live in seconds (defaults to LONG - 1 hour)
 * @returns Promise that resolves when all items are cached
 *
 * @example
 * ```typescript
 * await batchCacheMetadata(
 *   'bobblehead',
 *   [{ id: 'bh_1' }, { id: 'bh_2' }],
 *   async (item) => generateBobbleheadMetadata(item.id),
 *   CACHE_CONFIG.TTL.LONG
 * );
 * ```
 */
export async function batchCacheMetadata<T, TItem extends { id: string }>(
  contentType: MetadataContentType,
  items: Array<TItem>,
  metadataGenerator: (item: TItem) => Promise<T>,
  ttl: number = CACHE_CONFIG.TTL.LONG,
): Promise<void> {
  const cachingPromises = items.map(async (item) => {
    try {
      let key: string;
      let tags: Array<string>;

      switch (contentType) {
        case 'bobblehead':
          key = getBobbleheadMetadataKey(item.id);
          tags = CacheTagGenerators.bobblehead.read(item.id);
          break;
        case 'collection':
          key = getCollectionMetadataKey(item.id);
          tags = CacheTagGenerators.collection.read(item.id);
          break;
        case 'user':
          key = getUserMetadataKey(item.id);
          tags = CacheTagGenerators.user.profile(item.id);
          break;
      }

      await cacheMetadata(key, () => metadataGenerator(item), ttl, tags);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(`[SEO Cache] Failed to cache metadata for ${contentType}:${item.id}:`, error);
      }
    }
  });

  await Promise.allSettled(cachingPromises);
}

/**
 * Cache metadata with automatic key generation and error handling
 *
 * Wraps metadata generation functions with caching layer. Automatically generates
 * appropriate cache keys and tags based on content type and ID. Falls back to
 * direct generation on cache failures.
 *
 * @template T - Return type of the metadata generator function
 * @param key - Cache key for this metadata (use key generators above)
 * @param generator - Async function that generates the metadata
 * @param ttl - Time-to-live in seconds (defaults to LONG - 1 hour)
 * @param tags - Additional cache tags for invalidation
 * @returns Promise resolving to the cached or fresh metadata
 *
 * @example
 * ```typescript
 * const metadata = await cacheMetadata(
 *   getBobbleheadMetadataKey(bobbleheadId),
 *   async () => generateBobbleheadMetadata(bobbleheadId),
 *   CACHE_CONFIG.TTL.LONG,
 *   ['bobblehead', `bobblehead:${bobbleheadId}`]
 * );
 * ```
 *
 * @remarks
 * - Automatically tracks cache hits/misses for monitoring
 * - Gracefully falls back to direct generation on cache failures
 * - Uses existing CacheService for consistent caching behavior
 * - Logs cache operations for debugging in development
 */
export async function cacheMetadata<T>(
  key: string,
  generator: () => Promise<T>,
  ttl: number = CACHE_CONFIG.TTL.LONG,
  tags: Array<string> = [],
): Promise<T> {
  try {
    const result = await CacheService.cached(generator, key, {
      context: {
        entityType: 'metadata',
        operation: 'seo:cache-metadata',
      },
      tags: ['seo', 'metadata', ...tags],
      ttl,
    });

    metadataMonitor.recordHit();
    return result;
  } catch {
    metadataMonitor.recordError();

    // graceful fallback to direct generation
    try {
      return await generator();
    } catch (generatorError) {
      metadataMonitor.recordMiss();
      throw generatorError;
    }
  }
}

/**
 * Generate cache key for bobblehead metadata
 *
 * @param bobbleheadId - Bobblehead ID to generate key for
 * @returns Cache key following the pattern: `seo:metadata:bobblehead:{bobbleheadId}`
 *
 * @example
 * ```typescript
 * const key = getBobbleheadMetadataKey('bobblehead_123');
 * // Returns: 'seo:metadata:bobblehead:bobblehead_123'
 * ```
 */
export function getBobbleheadMetadataKey(bobbleheadId: string): string {
  return `seo:metadata:bobblehead:${bobbleheadId}`;
}

/**
 * Generate cache key for collection metadata
 *
 * @param collectionId - Collection ID to generate key for
 * @returns Cache key following the pattern: `seo:metadata:collection:{collectionId}`
 *
 * @example
 * ```typescript
 * const key = getCollectionMetadataKey('collection_123');
 * // Returns: 'seo:metadata:collection:collection_123'
 * ```
 */
export function getCollectionMetadataKey(collectionId: string): string {
  return `seo:metadata:collection:${collectionId}`;
}

/**
 * Get metadata cache statistics
 *
 * Returns current cache hit rate, total operations, and error counts
 * for monitoring and optimization purposes.
 *
 * @returns Current metadata cache statistics
 *
 * @example
 * ```typescript
 * const stats = getMetadataCacheStats();
 * console.log(`Cache hit rate: ${stats.hitRate.toFixed(2)}%`);
 * console.log(`Total operations: ${stats.totalOperations}`);
 * ```
 *
 * @remarks
 * - Statistics are cumulative since app start or last reset
 * - Useful for monitoring cache effectiveness
 * - Can help identify opportunities for cache optimization
 */
export function getMetadataCacheStats(): MetadataCacheStats {
  return metadataMonitor.getStats();
}

/**
 * Generate cache key for user metadata
 *
 * @param userId - User ID to generate key for
 * @returns Cache key following the pattern: `seo:metadata:user:{userId}`
 *
 * @example
 * ```typescript
 * const key = getUserMetadataKey('user_123');
 * // Returns: 'seo:metadata:user:user_123'
 * ```
 */
export function getUserMetadataKey(userId: string): string {
  return `seo:metadata:user:${userId}`;
}

/**
 * Invalidate metadata cache for a specific content type and ID
 *
 * Clears cached metadata for a specific entity, forcing fresh generation
 * on the next request. Useful when content is updated and metadata needs
 * to reflect the changes.
 *
 * @param contentType - Type of content to invalidate
 * @param contentId - ID of the specific content
 *
 * @example
 * ```typescript
 * // After updating a bobblehead
 * invalidateMetadataCache('bobblehead', 'bobblehead_123');
 *
 * // After updating a collection
 * invalidateMetadataCache('collection', 'collection_456');
 * ```
 *
 * @remarks
 * - Invalidates by cache tag for efficient bulk invalidation
 * - Invalidates both entity-specific and related caches
 * - Safe to call even if cache doesn't exist
 */
export function invalidateMetadataCache(contentType: MetadataContentType, contentId: string): void {
  try {
    switch (contentType) {
      case 'bobblehead':
        CacheService.invalidateByTag(CACHE_CONFIG.TAGS.BOBBLEHEAD(contentId));
        break;
      case 'collection':
        CacheService.invalidateByTag(CACHE_CONFIG.TAGS.COLLECTION(contentId));
        break;
      case 'user':
        CacheService.invalidateByTag(CACHE_CONFIG.TAGS.USER(contentId));
        break;
    }
  } catch (error) {
    // log error but don't throw - cache invalidation failures shouldn't break the app
    if (process.env.NODE_ENV === 'development') {
      console.error('[SEO Cache] Failed to invalidate metadata cache:', error);
    }
  }
}

/**
 * Reset metadata cache statistics
 *
 * Clears all accumulated statistics, resetting counters to zero.
 * Useful for testing or periodic monitoring resets.
 *
 * @example
 * ```typescript
 * // Reset stats at the start of a monitoring period
 * resetMetadataCacheStats();
 * ```
 */
export function resetMetadataCacheStats(): void {
  metadataMonitor.resetStats();
}

/**
 * Warm metadata cache for featured and trending content
 *
 * Pre-populates cache for content that is likely to be accessed frequently,
 * such as featured bobbleheads, trending collections, or popular user profiles.
 * This reduces database load and improves performance for high-traffic content.
 *
 * @param contentType - Type of content to warm cache for
 * @param contentIds - Array of content IDs to pre-cache
 * @param metadataGenerator - Function that generates metadata for a single item
 *
 * @example
 * ```typescript
 * // Warm cache for featured bobbleheads
 * await warmMetadataCache(
 *   'bobblehead',
 *   ['bobblehead_1', 'bobblehead_2', 'bobblehead_3'],
 *   async (id) => generateBobbleheadMetadata(id)
 * );
 *
 * // Warm cache for trending collections
 * await warmMetadataCache(
 *   'collection',
 *   trendingCollectionIds,
 *   async (id) => generateCollectionMetadata(id)
 * );
 * ```
 *
 * @remarks
 * - Runs in background (non-blocking)
 * - Processes items in parallel for faster warming
 * - Gracefully handles individual failures without stopping the entire process
 * - Useful for warming cache after deployments or cache clears
 * - Should be called sparingly to avoid unnecessary database load
 */
export async function warmMetadataCache<T>(
  contentType: MetadataContentType,
  contentIds: Array<string>,
  metadataGenerator: (id: string) => Promise<T>,
): Promise<void> {
  // process all items in parallel for faster warming
  const warmingPromises = contentIds.map(async (id) => {
    try {
      let key: string;
      let tags: Array<string>;

      switch (contentType) {
        case 'bobblehead':
          key = getBobbleheadMetadataKey(id);
          tags = CacheTagGenerators.bobblehead.read(id);
          break;
        case 'collection':
          key = getCollectionMetadataKey(id);
          tags = CacheTagGenerators.collection.read(id);
          break;
        case 'user':
          key = getUserMetadataKey(id);
          tags = CacheTagGenerators.user.profile(id);
          break;
      }

      await cacheMetadata(key, () => metadataGenerator(id), CACHE_CONFIG.TTL.EXTENDED, tags);
    } catch (error) {
      // log individual failures but continue warming other items
      if (process.env.NODE_ENV === 'development') {
        console.error(`[SEO Cache] Failed to warm cache for ${contentType}:${id}:`, error);
      }
    }
  });

  // wait for all warming operations to complete (or fail)
  await Promise.allSettled(warmingPromises);
}
