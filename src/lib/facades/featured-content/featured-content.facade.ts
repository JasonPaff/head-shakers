import type { FeaturedContentRecord } from '@/lib/queries/featured-content/featured-content-query';
import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content-query';
import { FeaturedContentTransformer } from '@/lib/queries/featured-content/featured-content-transformer';
import { createFacadeError } from '@/lib/utils/error-builders';

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
      return FeaturedContentQuery.deleteAsync(id, context);
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
   * get active featured content
   */
  static async getActiveFeaturedContent(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const context = createPublicQueryContext({ dbInstance });
    const rawData = await FeaturedContentQuery.findActiveFeaturedContentAsync(context);
    return FeaturedContentTransformer.transformFeaturedContent(rawData);
  }

  /**
   * get all featured content for admin management
   */
  static async getAllFeaturedContentForAdmin(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentRecord>> {
    const context = createPublicQueryContext({ dbInstance });
    return FeaturedContentQuery.findAllFeaturedContentForAdminAsync(context);
  }

  /**
   * get the collection of the weeks
   */
  static async getCollectionOfWeek(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'collection_of_week');
  }

  /**
   * get editor picks
   */
  static async getEditorPicks(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'editor_pick');
  }

  /**
   * get featured content by ID
   */
  static async getFeaturedContentById(id: string, dbInstance?: DatabaseExecutor): Promise<null | SelectFeaturedContent> {
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
   * get homepage banner content
   */
  static async getHomepageBanner(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
    return FeaturedContentTransformer.filterByType(allContent, 'homepage_banner');
  }

  /**
   * get trending content sorted by view count
   */
  static async getTrendingContent(dbInstance?: DatabaseExecutor): Promise<Array<FeaturedContentData>> {
    const allContent = await FeaturedContentFacade.getActiveFeaturedContent(dbInstance);
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
      return FeaturedContentQuery.updateAsync(id, data, context);
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
