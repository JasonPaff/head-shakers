import { $path } from 'next-typesafe-url';
import { revalidatePath, revalidateTag } from 'next/cache';

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
