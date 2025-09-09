import { $path } from 'next-typesafe-url';
import { revalidatePath, revalidateTag } from 'next/cache';

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

// simplified featured content cache invalidation using Next.js cache only
export function invalidateFeaturedContentCaches(contentId?: string): void {
  try {
    console.log(`Invalidating featured content caches${contentId ? ` for content: ${contentId}` : ''}`);

    // next.js cache invalidation
    revalidateTag('featured-content');

    // specific path revalidation
    revalidatePath($path({ route: '/browse/featured' }));
    revalidatePath($path({ route: '/admin/featured-content' }));
    revalidatePath($path({ route: '/' }));

    console.log('Featured content caches invalidated successfully');
  } catch (error) {
    console.error('Featured content cache invalidation failed:', error);
  }
}
