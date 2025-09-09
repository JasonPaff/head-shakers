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

// Simplified featured content cache invalidation using Next.js cache only
export async function invalidateFeaturedContentCaches(contentId?: string): Promise<void> {
  try {
    console.log(`Invalidating featured content caches${contentId ? ` for content: ${contentId}` : ''}`);
    
    // Next.js cache invalidation
    revalidateTag('featured-content');
    
    // Specific path revalidation
    revalidatePath($path({ route: '/browse/featured' }));
    revalidatePath($path({ route: '/admin/featured-content' }));
    revalidatePath($path({ route: '/' }));
    
    console.log('Featured content caches invalidated successfully');
  } catch (error) {
    console.error('Featured content cache invalidation failed:', error);
  }
}

// Legacy function for backward compatibility with other parts of the system
export async function invalidateFeaturedContentCachesLegacy(contentId?: string): Promise<void> {
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
