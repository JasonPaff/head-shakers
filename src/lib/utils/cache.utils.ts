/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { $path } from 'next-typesafe-url';
import { revalidatePath, revalidateTag } from 'next/cache';

import { CACHE_KEYS, CACHE_TAGS } from '@/lib/constants/cache';
import { cacheService } from '@/lib/services/cache.service';

export interface CacheInvalidationOptions {
  invalidateCacheKeys?: Array<string>;
  invalidateCacheTags?: Array<string>;
  revalidatePaths?: Array<string>;
  revalidateTags?: Array<string>;
}

// cache health check utilities
export async function checkCacheHealth(): Promise<{
  errors: Array<string>;
  isFeaturedContent: boolean;
  isRedis: boolean;
}> {
  const errors: Array<string> = [];
  let isRedis = false;
  let isFeaturedContent = false;

  try {
    // check Redis connection
    await cacheService.set('health-check', 'ok', { ttl: 60 });
    const result = await cacheService.get('health-check');
    isRedis = result === 'ok';
    await cacheService.del('health-check');
  } catch (error) {
    errors.push(`Redis check failed: ${error}`);
  }

  try {
    // check the featured content cache
    const exists = await cacheService.exists(CACHE_KEYS.FEATURED_CONTENT.ALL, 'featured');
    isFeaturedContent = exists;
  } catch (error) {
    errors.push(`Featured content cache check failed: ${error}`);
  }

  return {
    errors,
    isFeaturedContent,
    isRedis,
  };
}

// cache cleanup utilities
export async function cleanupExpiredCaches(): Promise<void> {
  try {
    // clean up old analytics data
    await cacheService.clear('analytics:');
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// development utilities
export async function clearAllCaches(): Promise<void> {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Clear all caches is only available in development');
  }

  try {
    await cacheService.clear();

    // also revalidate all Next.js caches
    revalidateTag('featured-content');
    revalidateTag('analytics');
    revalidateTag('user-content');

    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Failed to clear all caches:', error);
  }
}

export async function invalidateAnalyticsCaches(): Promise<void> {
  const options: CacheInvalidationOptions = {
    invalidateCacheTags: [CACHE_TAGS.ANALYTICS, CACHE_TAGS.CONTENT_METRICS],
    revalidatePaths: [$path({ route: '/admin/featured-content' })],
    revalidateTags: [CACHE_TAGS.ANALYTICS],
  };

  await invalidateCache(options);
}

export async function invalidateCache(options: CacheInvalidationOptions): Promise<void> {
  try {
    // revalidate Next.js paths
    if (options.revalidatePaths?.length) {
      options.revalidatePaths.forEach((path) => {
        return revalidatePath(path);
      });
    }

    // revalidate Next.js tags
    if (options.revalidateTags?.length) {
      options.revalidateTags.forEach((tag) => {
        return revalidateTag(tag);
      });
    }

    // invalidate Redis cache keys
    if (options.invalidateCacheKeys?.length) {
      await Promise.all(
        options.invalidateCacheKeys.map((key) => {
          return cacheService.del(key);
        }),
      );
    }

    // invalidate Redis cache tags
    if (options.invalidateCacheTags?.length) {
      await cacheService.invalidateByTags(options.invalidateCacheTags);
    }
  } catch (error) {
    console.error('Cache invalidation failed:', error);
  }
}

// specific invalidation functions for different operations
export async function invalidateFeaturedContentCaches(contentId?: string): Promise<void> {
  const options: CacheInvalidationOptions = {
    invalidateCacheTags: [CACHE_TAGS.FEATURED_CONTENT, CACHE_TAGS.ANALYTICS],
    revalidatePaths: [
      $path({ route: '/browse/featured' }),
      $path({ route: '/admin/featured-content' }),
      $path({ route: '/' }),
    ],
    revalidateTags: ['featured-content'],
  };

  if (contentId) {
    // invalidate specific content cache
    const keysToInvalidate = [
      CACHE_KEYS.FEATURED_CONTENT.ALL,
      CACHE_KEYS.FEATURED_CONTENT.ACTIVE,
      CACHE_KEYS.FEATURED_CONTENT.TRENDING,
      CACHE_KEYS.CONTENT_METRICS.BY_CONTENT(contentId),
    ];

    await Promise.all(keysToInvalidate.map((key) => cacheService.del(key, 'featured')));
  } else {
    // invalidate all featured content caches
    await cacheService.invalidateByTag(CACHE_TAGS.FEATURED_CONTENT);
  }

  await invalidateCache(options);
}

export async function invalidateUserContentCaches(userId: string): Promise<void> {
  const options: CacheInvalidationOptions = {
    invalidateCacheKeys: [
      CACHE_KEYS.USER_CONTENT.COLLECTIONS(userId),
      CACHE_KEYS.USER_CONTENT.BOBBLEHEADS(userId),
      CACHE_KEYS.USER_CONTENT.FEATURED(userId),
    ],
    invalidateCacheTags: [CACHE_TAGS.USER_CONTENT],
    revalidatePaths: [
      $path({ route: '/dashboard' }),
      $path({ route: '/browse' }),
      $path({ route: '/users/[userId]', routeParams: { userId } }),
      `/users/${userId}`,
      '/browse',
      '/dashboard',
    ],
  };

  await invalidateCache(options);
}

// cache warming utilities
export async function warmCriticalCaches(): Promise<void> {
  try {
    // import and execute cache warming functions
    const { warmFeaturedContentCache } = await import('@/lib/queries/cached/featured-content.cached-queries');

    await Promise.allSettled([warmFeaturedContentCache()]);

    console.log('Critical caches warmed successfully');
  } catch (error) {
    console.error('Failed to warm critical caches:', error);
  }
}

// Cache key helpers
export const getCacheKey = {
  contentMetrics: {
    analyticsSummary: () => CACHE_KEYS.CONTENT_METRICS.ANALYTICS_SUMMARY,
    byContent: (contentId: string) => CACHE_KEYS.CONTENT_METRICS.BY_CONTENT(contentId),
    topPerformers: () => CACHE_KEYS.CONTENT_METRICS.TOP_PERFORMERS,
  },
  featuredContent: {
    active: () => CACHE_KEYS.FEATURED_CONTENT.ACTIVE,
    all: () => CACHE_KEYS.FEATURED_CONTENT.ALL,
    byCategory: (category: string) => CACHE_KEYS.FEATURED_CONTENT.BY_CATEGORY(category),
    byType: (type: string) => CACHE_KEYS.FEATURED_CONTENT.BY_TYPE(type),
    collectionOfWeek: () => CACHE_KEYS.FEATURED_CONTENT.COLLECTION_OF_WEEK,
    editorPicks: () => CACHE_KEYS.FEATURED_CONTENT.EDITOR_PICKS,
    homepageBanner: () => CACHE_KEYS.FEATURED_CONTENT.HOMEPAGE_BANNER,
    trending: () => CACHE_KEYS.FEATURED_CONTENT.TRENDING,
  },
  userContent: {
    bobbleheads: (userId: string) => CACHE_KEYS.USER_CONTENT.BOBBLEHEADS(userId),
    collections: (userId: string) => CACHE_KEYS.USER_CONTENT.COLLECTIONS(userId),
    featured: (userId: string) => CACHE_KEYS.USER_CONTENT.FEATURED(userId),
  },
} as const;
