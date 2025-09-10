import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content-query';
import {
  type FeaturedContentRecord,
  FeaturedContentTransformer,
} from '@/lib/queries/featured-content/featured-content-transformer';
import { createFacadeError } from '@/lib/utils/error-builders';

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
      const rawData = await FeaturedContentQuery.findActiveFeaturedContent(context);
      return FeaturedContentTransformer.transformFeaturedContent(rawData);
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
   * get all featured content for admin management
   */
  static getAllFeaturedContentForAdmin = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<SelectFeaturedContent>> => {
      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.findAllForAdmin(context);
    },
  );

  /**
   * get the collection of the weeks
   */
  static getCollectionOfWeek = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getCollectionOfWeek');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return FeaturedContentTransformer.filterByType(allContent, 'collection_of_week');
    },
  );

  /**
   * get editor picks
   */
  static getEditorPicks = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getEditorPicks');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return FeaturedContentTransformer.filterByType(allContent, 'editor_pick');
    },
  );

  /**
   * get featured content by ID
   */
  static getFeaturedContentById = cache(
    async (id: string, dbInstance?: DatabaseExecutor): Promise<null | SelectFeaturedContent> => {
      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.findById(id, context);
    },
  );

  /**
   * get homepage banner content
   */
  static getHomepageBanner = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getHomepageBanner');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return FeaturedContentTransformer.filterByType(allContent, 'homepage_banner');
    },
  );

  /**
   * get trending content sorted by view count
   */
  static getTrendingContent = cache(
    async (dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> => {
      console.log('Cache access: getTrendingContent');
      const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
      return FeaturedContentTransformer.filterByType(allContent, 'trending');
    },
  );

  /**
   * create a new featured content entry
   */
  static async createAsync(
    data: InsertFeaturedContent,
    curatorId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | SelectFeaturedContent> {
    try {
      const context = createUserQueryContext(curatorId, { dbInstance });
      return FeaturedContentQuery.create(data, curatorId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { contentId: data.contentId, contentType: data.contentType },
        facade: 'FeaturedContentFacade',
        method: 'createAsync',
        operation: 'create',
        userId: curatorId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * delete a featured content entry
   */
  static async deleteAsync(id: string, dbInstance?: DatabaseExecutor): Promise<null | SelectFeaturedContent> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.delete(id, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id },
        facade: 'FeaturedContentFacade',
        method: 'deleteAsync',
        operation: 'delete',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get cache statistics for monitoring
   */
  static async getCacheStats() {
    return Promise.resolve(cacheStats);
  }

  /**
   * increment view count for featured content
   */
  static async incrementViewCount(contentId: string, dbInstance?: DatabaseExecutor): Promise<void> {
    const context = createPublicQueryContext({ dbInstance });

    try {
      await FeaturedContentQuery.incrementViewCount(contentId, context);
      console.log(`View count incremented for content: ${contentId}`);
    } catch (error) {
      console.error(`Failed to increment view count for content ${contentId}:`, error);
    }
  }

  /**
   * reset cache statistics
   */
  static async resetCacheStats() {
    cacheStats.nextjs.hits = 0;
    cacheStats.nextjs.misses = 0;
    cacheStats.react.hits = 0;
    cacheStats.react.misses = 0;
    return Promise.resolve();
  }

  /**
   * toggle active status of featured content
   */
  static async toggleActiveAsync(
    id: string,
    isActive: boolean,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | SelectFeaturedContent> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.toggleActive(id, isActive, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id, isActive },
        facade: 'FeaturedContentFacade',
        method: 'toggleActiveAsync',
        operation: 'toggle',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * update a featured content entry
   */
  static async updateAsync(
    id: string,
    data: UpdateFeaturedContent,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | SelectFeaturedContent> {
    try {
      const context = createPublicQueryContext({ dbInstance });
      return FeaturedContentQuery.update(id, data, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id },
        facade: 'FeaturedContentFacade',
        method: 'updateAsync',
        operation: 'update',
      };
      throw createFacadeError(context, error);
    }
  }
}
