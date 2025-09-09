import { eq, sql } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { featuredContent } from '@/lib/db/schema';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import {
  FeaturedContentQuery,
  type FeaturedContentRecord,
} from '@/lib/queries/featured-content/featured-content-query';

// cache statistics for monitoring
const cacheStats = {
  nextjs: { hits: 0, misses: 0 },
  react: { hits: 0, misses: 0 },
};

/**
 * unified Featured Content Facade
 * combines query operations with a sophisticated caching strategy
 * provides a clean API for all featured content operations
 */
export class FeaturedContentFacade {
  /**
   * get active featured content with React cache (request-level deduplication)
   */
  private static getActiveFeaturedContentBase = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache miss: React cache - getActiveFeaturedContentBase');
      cacheStats.react.misses++;

      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.findActiveFeaturedContent(context);
    },
  );

  /**
   * get active featured content with Next.js unstable_cache (persistent caching)
   */
  static getActiveFeaturedContent = unstable_cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache miss: Next.js cache - getActiveFeaturedContent');
      cacheStats.nextjs.misses++;
      return await FeaturedContentFacade.getActiveFeaturedContentBase(dbInstance);
    },
    ['featured-content-active'],
    {
      revalidate: 300, // 5 minutes
      tags: ['featured-content'],
    },
  );

  /**
   * get the collection of the weeks
   */
  static getCollectionOfWeek = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getCollectionOfWeek');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return allContent.filter((content) => content.featureType === 'collection_of_week').slice(0, 1);
    },
  );

  /**
   * get editor picks
   */
  static getEditorPicks = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getEditorPicks');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return allContent.filter((content) => content.featureType === 'editor_pick').slice(0, 6);
    },
  );

  /**
   * get homepage banner content
   */
  static getHomepageBanner = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getHomepageBanner');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return allContent.filter((content) => content.featureType === 'homepage_banner').slice(0, 3);
    },
  );

  /**
   * get trending content sorted by view count
   */
  static getTrendingContent = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getTrendingContent');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return allContent
        .filter((content) => content.featureType === 'trending')
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 8);
    },
  );

  /**
   * get cache statistics for monitoring
   */
  static async getCacheStats() {
    return new Promise((resolve) => {
      resolve(cacheStats);
    });
  }

  /**
   * increment view count for featured content
   */
  static async incrementViewCount(contentId: string, dbInstance: DatabaseExecutor = db): Promise<void> {
    try {
      // increment in the database using SQL
      await dbInstance
        .update(featuredContent)
        .set({
          updatedAt: new Date(),
          viewCount: sql`${featuredContent.viewCount} + 1`,
        })
        .where(eq(featuredContent.id, contentId));

      // Log success for debugging
      console.log(`View count incremented for content: ${contentId}`);
    } catch (error) {
      console.error(`Failed to increment view count for content ${contentId}:`, error);
    }
  }

  /**
   * reset cache statistics
   */
  static async resetCacheStats() {
    return new Promise((resolve) => {
      resolve(() => {
        cacheStats.nextjs.hits = 0;
        cacheStats.nextjs.misses = 0;
        cacheStats.react.hits = 0;
        cacheStats.react.misses = 0;
      });
    });
  }
}
