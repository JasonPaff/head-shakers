import * as Sentry from '@sentry/nextjs';

import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content-query';
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
   * get featured bobbleheads with their primary photos, specs, and engagement metrics
   *
   * returns bobbleheads that have been marked as featured content, filtered by the
   * 'bobblehead' content type. includes:
   * - bobblehead name and slug
   * - primary photo URL
   * - like count and view count
   * - owner information
   *
   * results are cached using the featured content cache with EXTENDED TTL
   *
   * @param limit - optional limit on number of results (default: 8)
   * @param dbInstance - optional database executor for transactions
   * @returns array of featured bobblehead content data
   */
  static async getFeaturedBobbleheadsAsync(
    limit?: number,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<FeaturedContentData>> {
    try {
      const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);

      // filter to only bobblehead content type
      const bobbleheadContent = allContent.filter((content) => content.contentType === 'bobblehead');

      // apply limit (default 8 for homepage display)
      const limitedContent = bobbleheadContent.slice(0, limit ?? 8);

      // add breadcrumb for monitoring
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          limit: limit ?? 8,
          requestedCount: bobbleheadContent.length,
          returnedCount: limitedContent.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: 'Fetched featured bobbleheads',
      });

      return limitedContent;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { limit },
        facade: facadeName,
        method: 'getFeaturedBobbleheads',
        operation: 'getFeaturedBobbleheads',
      };
      throw createFacadeError(context, error);
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
          // TODO: replace with footer-specific query that only returns exactly the data needed
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
        // TODO: move to a constant
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
   * get homepage banner content
   */
  static async getHomepageBanner(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'homepage_banner');
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
