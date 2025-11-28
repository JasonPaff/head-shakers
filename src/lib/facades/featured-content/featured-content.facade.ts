import type {
  FeaturedCollectionData,
  FeaturedContentRecord,
  FooterFeaturedContentData,
  HeroFeaturedBobbleheadData,
  TrendingBobbleheadData,
} from '@/lib/queries/featured-content/featured-content-query';
import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { CACHE_ENTITY_TYPE, CACHE_KEYS, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content-query';
import { FeaturedContentTransformer } from '@/lib/queries/featured-content/featured-content-transformer';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { trackFacadeEntry, trackFacadeSuccess } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'FeaturedContentFacade';

/**
 * unified Featured Content Facade
 * combines query operations with a sophisticated caching strategy
 * provides a clean API for all featured content operations
 */
export class FeaturedContentFacade extends BaseFacade {
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
      return FeaturedContentQuery.createAsync(data, curatorId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { contentId: data.contentId, contentType: data.contentType },
        facade: facadeName,
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
      const context = this.publicContext(dbInstance);
      return FeaturedContentQuery.deleteAsync(id, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id },
        facade: facadeName,
        method: 'deleteAsync',
        operation: 'delete',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get active featured content
   */
  static async getActiveFeaturedContentAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentData>> {
    trackFacadeEntry(facadeName, 'getActiveFeaturedContentAsync');

    try {
      return await CacheService.featured.content(
        async () => {
          const context = this.publicContext(dbInstance);
          const rawData = await FeaturedContentQuery.getActiveFeaturedContentAsync(context);

          trackFacadeSuccess(facadeName, 'getActiveFeaturedContentAsync');

          return FeaturedContentTransformer.transformFeaturedContent(rawData);
        },
        CACHE_KEYS.FEATURED.CONTENT_TYPES.ACTIVE,
        {
          context: {
            entityType: CACHE_ENTITY_TYPE.FEATURED,
            facade: facadeName,
            operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
          },
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getActiveFeaturedContentAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * get all featured content for admin management
   */
  static async getAllFeaturedContentForAdmin(
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeaturedContentRecord>> {
    const context = this.publicContext(dbInstance);
    return FeaturedContentQuery.findAllFeaturedContentForAdminAsync(context);
  }

  /**
   * get the collection of the weeks
   */
  static async getCollectionOfWeek(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'collection_of_week');
  }

  /**
   * get editor picks
   */
  static async getEditorPicks(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'editor_pick');
  }

  /**
   * get hero featured bobblehead for homepage display
   *
   * returns the single highest-priority featured bobblehead with only the fields
   * needed for the hero section. uses Redis caching for fast access.
   *
   * @param dbInstance - optional database executor for transactions
   * @returns the hero featured bobblehead data or null if none exists
   */
  static async getFeaturedBobbleheadAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<HeroFeaturedBobbleheadData | null> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getFeaturedBobbleheadAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_HERO_BOBBLEHEAD,
      },
      async () => {
        return await CacheService.featured.featuredBobblehead(
          async () => {
            const context = this.publicContext(dbInstance);
            return await FeaturedContentQuery.getFeaturedBobbleheadAsync(context);
          },
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.FEATURED,
              facade: facadeName,
              operation: OPERATIONS.FEATURED_CONTENT.GET_HERO_BOBBLEHEAD,
            },
          },
        );
      },
      {
        includeResultSummary: (data) => ({ ...data }),
      },
    );
  }

  /**
   * get featured collections for homepage display
   *
   * returns up to 6 active featured collections with engagement metrics.
   * includes collection metadata, owner information, and user-specific like status
   * when userId is provided. uses Redis caching for fast access with user-specific
   * cache keys to cache like data separately per user.
   *
   * caching: uses LONG TTL (1 hour) with Redis caching
   * invalidated by: featured content changes, collection updates
   *
   * @param userId - optional user ID for like status (null for public access)
   * @param dbInstance - optional database executor for transactions
   * @returns array of featured collection data (limit 6, ordered by priority)
   */
  static async getFeaturedCollectionsAsync(
    userId?: null | string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedCollectionData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getFeaturedCollectionsAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_FEATURED_COLLECTIONS,
        userId: userId ?? undefined,
      },
      async () => {
        return await CacheService.featured.collections(
          async () => {
            const context = this.publicContext(dbInstance);
            return await FeaturedContentQuery.getFeaturedCollectionsAsync(context, userId);
          },
          userId,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.FEATURED,
              facade: facadeName,
              operation: OPERATIONS.FEATURED_CONTENT.GET_FEATURED_COLLECTIONS,
            },
          },
        );
      },
      { includeResultSummary: (data) => ({ ...data }) },
    );
  }

  /**
   * get featured content by ID
   */
  static async getFeaturedContentById(
    id: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | SelectFeaturedContent> {
    const context = this.publicContext(dbInstance);
    return FeaturedContentQuery.findByIdAsync(id, context);
  }

  /**
   * get featured content by ID for admin management
   */
  static async getFeaturedContentByIdForAdmin(
    id: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturedContentRecord | null> {
    const context = this.publicContext(dbInstance);
    return FeaturedContentQuery.findFeaturedContentByIdForAdminAsync(id, context);
  }

  /**
   * get featured content for the footer section
   */
  static async getFooterFeaturedContentAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FooterFeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getFooterFeaturedContentAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        return await CacheService.featured.content(
          async () => {
            const context = this.publicContext(dbInstance);
            return await FeaturedContentQuery.getFooterFeaturedContentAsync(context);
          },
          CACHE_KEYS.FEATURED.CONTENT_TYPES.FOOTER,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.FEATURED,
              facade: facadeName,
              operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
            },
          },
        );
      },
      { includeResultSummary: (data) => ({ ...data }) },
    );
  }

  /**
   * get homepage banner content
   */
  static async getHomepageBanner(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'homepage_banner');
  }

  /**
   * get trending bobbleheads for homepage display
   *
   * returns up to 12 active featured bobbleheads with feature_type 'trending' or 'editor_pick'.
   * includes bobblehead-specific fields (category, year) from the bobbleheads table.
   * uses Redis caching for fast access.
   *
   * caching: uses LONG TTL (1 hour) with Redis caching
   * invalidated by: featured content changes
   *
   * @param dbInstance - optional database executor for transactions
   * @returns array of trending bobblehead data (limit 12, ordered by priority)
   */
  static async getTrendingBobbleheadsAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TrendingBobbleheadData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getTrendingBobbleheadsAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_TRENDING_BOBBLEHEADS,
      },
      async () => {
        return await CacheService.featured.trendingBobbleheads(
          async () => {
            const context = this.publicContext(dbInstance);
            return await FeaturedContentQuery.getTrendingBobbleheadsAsync(context);
          },
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.FEATURED,
              facade: facadeName,
              operation: OPERATIONS.FEATURED_CONTENT.GET_TRENDING_BOBBLEHEADS,
            },
          },
        );
      },
      {
        includeResultSummary: (data) => ({ ...data }),
      },
    );
  }

  /**
   * get trending content sorted by view count
   */
  static async getTrendingContent(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'trending');
  }

  /**
   * increment view count for featured content
   */
  static async incrementViewCount(contentId: string, dbInstance?: DatabaseExecutor): Promise<void> {
    const context = this.publicContext(dbInstance);

    try {
      await FeaturedContentQuery.incrementViewCountAsync(contentId, context);
      console.log(`View count incremented for content: ${contentId}`);
      CacheRevalidationService.featured.onContentChange();
    } catch (error) {
      console.error(`Failed to increment view count for content ${contentId}:`, error);
    }
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
      const context = this.publicContext(dbInstance);
      return FeaturedContentQuery.toggleActiveAsync(id, isActive, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id, isActive },
        facade: facadeName,
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
      const context = this.publicContext(dbInstance);
      return FeaturedContentQuery.updateAsync(id, data, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { id },
        facade: facadeName,
        method: 'updateAsync',
        operation: 'update',
      };
      throw createFacadeError(context, error);
    }
  }
}
