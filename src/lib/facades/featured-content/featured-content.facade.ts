import * as Sentry from '@sentry/nextjs';

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

import { CACHE_ENTITY_TYPE, OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { db } from '@/lib/db';
import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content-query';
import { FeaturedContentTransformer } from '@/lib/queries/featured-content/featured-content-transformer';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';

const facadeName = 'FeaturedContentFacade';

/**
 * unified Featured Content Facade
 * combines query operations with a sophisticated caching strategy
 * provides a clean API for all featured content operations
 */
export class FeaturedContentFacade {
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
      const context = createPublicQueryContext({ dbInstance });
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
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching active featured content',
    });

    try {
      return await CacheService.featured.content(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          const rawData = await FeaturedContentQuery.getActiveFeaturedContentAsync(context);

          // Add breadcrumb for successful fetch
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: {},
            level: SENTRY_LEVELS.INFO,
            message: 'Active featured content fetched successfully',
          });

          return FeaturedContentTransformer.transformFeaturedContent(rawData);
        },
        // TODO: move to constants
        'active',
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
    const context = createPublicQueryContext({ dbInstance });
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
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching featured bobblehead',
    });

    try {
      return await CacheService.featured.featuredBobblehead(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          const data = await FeaturedContentQuery.getFeaturedBobbleheadAsync(context);

          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { found: data !== null },
            level: SENTRY_LEVELS.INFO,
            message: 'Featured bobblehead fetched successfully',
          });

          return data;
        },
        {
          context: {
            entityType: CACHE_ENTITY_TYPE.FEATURED,
            facade: facadeName,
            operation: OPERATIONS.FEATURED_CONTENT.GET_HERO_BOBBLEHEAD,
          },
        },
      );
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getHeroFeaturedBobbleheadAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_HERO_BOBBLEHEAD,
      };
      throw createFacadeError(errorContext, error);
    }
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
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching featured collections',
    });

    try {
      return await CacheService.featured.collections(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          const data = await FeaturedContentQuery.getFeaturedCollectionsAsync(context, userId);

          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { count: data.length, userId: userId || 'public' },
            level: SENTRY_LEVELS.INFO,
            message: 'Featured collections fetched successfully',
          });

          return data;
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
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: { userId },
        facade: facadeName,
        method: 'getFeaturedCollectionsAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_FEATURED_COLLECTIONS,
        userId: userId || undefined,
      };
      throw createFacadeError(errorContext, error);
    }
  }

  /**
   * get featured content by ID
   */
  static async getFeaturedContentById(
    id: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | SelectFeaturedContent> {
    const context = createPublicQueryContext({ dbInstance });
    return FeaturedContentQuery.findByIdAsync(id, context);
  }

  /**
   * get featured content by ID for admin management
   */
  static async getFeaturedContentByIdForAdmin(
    id: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<FeaturedContentRecord | null> {
    const context = createPublicQueryContext({ dbInstance });
    return FeaturedContentQuery.findFeaturedContentByIdForAdminAsync(id, context);
  }

  /**
   * get featured content for the footer section
   */
  static async getFooterFeaturedContentAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FooterFeaturedContentData>> {
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching footer featured content',
    });

    try {
      return await CacheService.featured.content(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
          const data = await FeaturedContentQuery.getFooterFeaturedContentAsync(context);

          // Add breadcrumb for successful fetch
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { ...data },
            level: SENTRY_LEVELS.INFO,
            message: 'Footer featured content fetched successfully',
          });

          return data;
        },
        // TODO: move to constants
        'footer',
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
        method: 'getFooterFeaturedContentAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      };
      throw createFacadeError(errorContext, error);
    }
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
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      level: SENTRY_LEVELS.INFO,
      message: 'Fetching trending bobbleheads',
    });

    try {
      return await CacheService.featured.trendingBobbleheads(
        async () => {
          const context = createPublicQueryContext({ dbInstance });
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
    } catch (error) {
      const errorContext: FacadeErrorContext = {
        data: {},
        facade: facadeName,
        method: 'getTrendingBobbleheadsAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_TRENDING_BOBBLEHEADS,
      };
      throw createFacadeError(errorContext, error);
    }
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
    const context = createPublicQueryContext({ dbInstance });

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
      const context = createPublicQueryContext({ dbInstance });
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
      const context = createPublicQueryContext({ dbInstance });
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
