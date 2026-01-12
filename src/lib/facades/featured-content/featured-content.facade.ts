import type { FeaturedContentData } from '@/lib/queries/featured-content/featured-content-transformer';
import type {
  FeaturedBobblehead,
  FeaturedCollectionData,
  FeaturedContentRecord,
  FooterFeaturedContentData,
  TrendingBobblehead,
} from '@/lib/queries/featured-content/featured-content.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertFeaturedContent,
  SelectFeaturedContent,
  UpdateFeaturedContent,
} from '@/lib/validations/system.validation';

import { CACHE_ENTITY_TYPE, CACHE_KEYS, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { FeaturedContentTransformer } from '@/lib/queries/featured-content/featured-content-transformer';
import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';
import { captureFacadeWarning } from '@/lib/utils/sentry-server/breadcrumbs.server';

const facadeName = 'FEATURED_CONTENT_FACADE';

/**
 * Unified Featured Content Facade
 *
 * Combines query operations with a sophisticated caching strategy
 * and provides a clean API for all featured content operations.
 *
 * Cache behavior:
 * - Read operations use CacheService.featured with LONG TTL (1 hour)
 * - Write operations invalidate cache via CacheRevalidationService.featured.onContentChange()
 */
export class FeaturedContentFacade extends BaseFacade {
  /**
   * Create a new featured content entry.
   *
   * Cache behavior: Invalidates all featured content caches after creation.
   *
   * @param data - The featured content data to create
   * @param curatorId - The ID of the curator creating the content
   * @param dbInstance - Optional database executor for transactions
   * @returns The created featured content record, or null if creation failed
   */
  static async createAsync(
    data: InsertFeaturedContent,
    curatorId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectFeaturedContent> {
    return executeFacadeOperation(
      {
        data: { contentId: data.contentId, contentType: data.contentType },
        facade: facadeName,
        method: 'createAsync',
        operation: OPERATIONS.FEATURED_CONTENT.CREATE,
        userId: curatorId,
      },
      async () => {
        const context = this.getUserContext(curatorId, dbInstance);
        const result = await FeaturedContentQuery.createAsync(data, curatorId, context);

        // Invalidate featured content cache after creation
        CacheRevalidationService.featured.onContentChange(data.contentType);

        return result;
      },
      {
        includeResultSummary: (result) => ({
          contentId: result?.contentId,
          contentType: result?.contentType,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Delete a featured content entry.
   *
   * Cache behavior: Invalidates all featured content caches after deletion.
   *
   * @param id - The ID of the featured content to delete
   * @param dbInstance - Optional database executor for transactions
   * @returns The deleted featured content record, or null if not found
   */
  static async deleteAsync(
    id: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectFeaturedContent> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'deleteAsync',
        operation: OPERATIONS.FEATURED_CONTENT.DELETE,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        const result = await FeaturedContentQuery.deleteAsync(id, context);

        // Invalidate featured content cache after deletion
        CacheRevalidationService.featured.onContentChange();

        return result;
      },
      {
        includeResultSummary: (result) => ({
          deleted: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get active featured content.
   *
   * Cache behavior: Uses CacheService.featured.content with LONG TTL (1 hour).
   * Invalidated by: featured content changes (create, update, delete, toggle).
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of transformed active featured content data
   */
  static async getActiveFeaturedContentAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getActiveFeaturedContentAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        return await CacheService.featured.content(
          async () => {
            const context = this.getPublicContext(dbInstance);
            const rawData = await FeaturedContentQuery.getActiveFeaturedContentAsync(context);

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
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get all featured content for admin management.
   *
   * Cache behavior: No caching (admin operations should always be fresh).
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of all featured content records for admin view
   */
  static async getAllFeaturedContentForAdminAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentRecord>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getAllFeaturedContentForAdminAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        return FeaturedContentQuery.findAllFeaturedContentForAdminAsync(context);
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get the collection of the week.
   *
   * Cache behavior: Uses cached active content and filters by type.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of collection of week featured content data
   */
  static async getCollectionOfWeekAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getCollectionOfWeekAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
        return FeaturedContentTransformer.filterByType(allContent, 'collection_of_week');
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get editor picks.
   *
   * Cache behavior: Uses cached active content and filters by type.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of editor pick featured content data
   */
  static async getEditorPicksAsync(dbInstance: DatabaseExecutor = db): Promise<Array<FeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getEditorPicksAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
        return FeaturedContentTransformer.filterByType(allContent, 'editor_pick');
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get the featured bobblehead for homepage display.
   *
   * Returns the single highest-priority featured bobblehead with only the fields
   * needed for the featured bobblehead section. Uses Redis caching for fast access.
   *
   * Cache behavior: Uses CacheService.featured.featuredBobblehead with LONG TTL (1 hour).
   * Invalidated by: featured content changes.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns The featured bobblehead data or null if none exists
   */
  static async getFeaturedBobbleheadAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<FeaturedBobblehead | null> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getFeaturedBobbleheadAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_FEATURED_BOBBLEHEAD,
      },
      async () => {
        return await CacheService.featured.featuredBobblehead(
          async () => {
            const context = this.getPublicContext(dbInstance);
            return await FeaturedContentQuery.getFeaturedBobbleheadAsync(context);
          },
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.FEATURED,
              facade: facadeName,
              operation: OPERATIONS.FEATURED_CONTENT.GET_FEATURED_BOBBLEHEAD,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          contentId: result?.contentId,
          found: result !== null,
        }),
      },
    );
  }

  /**
   * Get featured collections for homepage display.
   *
   * Returns up to 6 active featured collections with engagement metrics.
   * Includes collection metadata, owner information, and user-specific like status
   * when userId is provided. Uses Redis caching for fast access with user-specific
   * cache keys to cache like data separately per user.
   *
   * Cache behavior: Uses CacheService.featured.collections with LONG TTL (1 hour).
   * Invalidated by: featured content changes, collection updates.
   *
   * @param userId - Optional user ID for like status (null for public access)
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of featured collection data (limit 6, ordered by priority)
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
            const context = this.getPublicContext(dbInstance);
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
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get featured content by ID.
   *
   * Cache behavior: No caching (specific lookups should be fresh).
   *
   * @param id - The ID of the featured content to retrieve
   * @param dbInstance - Optional database executor for transactions
   * @returns The featured content record, or null if not found
   */
  static async getFeaturedContentByIdAsync(
    id: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectFeaturedContent> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getFeaturedContentByIdAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_BY_ID,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        return FeaturedContentQuery.findByIdAsync(id, context);
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get featured content by ID for admin management.
   *
   * Cache behavior: No caching (admin operations should always be fresh).
   *
   * @param id - The ID of the featured content to retrieve
   * @param dbInstance - Optional database executor for transactions
   * @returns The featured content record for admin view, or null if not found
   */
  static async getFeaturedContentByIdForAdminAsync(
    id: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<FeaturedContentRecord | null> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'getFeaturedContentByIdForAdminAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_BY_ID,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        return FeaturedContentQuery.findFeaturedContentByIdForAdminAsync(id, context);
      },
      {
        includeResultSummary: (result) => ({
          found: result !== null,
          id: result?.id,
        }),
      },
    );
  }

  /**
   * Get featured content for the footer section.
   *
   * Cache behavior: Uses CacheService.featured.content with LONG TTL (1 hour).
   * Invalidated by: featured content changes.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of footer featured content data
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
            const context = this.getPublicContext(dbInstance);
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
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get homepage banner content.
   *
   * Cache behavior: Uses cached active content and filters by type.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of homepage banner featured content data
   */
  static async getHomepageBannerAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getHomepageBannerAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
        return FeaturedContentTransformer.filterByType(allContent, 'homepage_banner');
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get trending bobbleheads for homepage display.
   *
   * Returns up to 12 active featured bobbleheads with feature_type 'trending' or 'editor_pick'.
   * Includes bobblehead-specific fields (category, year) from the bobbleheads table.
   * Uses Redis caching for fast access.
   *
   * Cache behavior: Uses CacheService.featured.trendingBobbleheads with LONG TTL (1 hour).
   * Invalidated by: featured content changes.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of trending bobblehead data (limit 12, ordered by priority)
   */
  static async getTrendingBobbleheadsAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<TrendingBobblehead>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getTrendingBobbleheadsAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_TRENDING_BOBBLEHEADS,
      },
      async () => {
        return await CacheService.featured.trendingBobbleheads(
          async () => {
            const context = this.getPublicContext(dbInstance);
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
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Get trending content sorted by view count.
   *
   * Cache behavior: Uses cached active content and filters by type.
   *
   * @param dbInstance - Optional database executor for transactions
   * @returns Array of trending featured content data
   */
  static async getTrendingContentAsync(
    dbInstance: DatabaseExecutor = db,
  ): Promise<Array<FeaturedContentData>> {
    return executeFacadeOperation(
      {
        facade: facadeName,
        method: 'getTrendingContentAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const allContent = await FeaturedContentFacade.getActiveFeaturedContentAsync(dbInstance);
        return FeaturedContentTransformer.filterByType(allContent, 'trending');
      },
      {
        includeResultSummary: (result) => ({
          count: result.length,
        }),
      },
    );
  }

  /**
   * Increment view count for featured content.
   *
   * Non-blocking operation: Failures are logged as warnings and don't fail the caller.
   * Cache behavior: Invalidates featured content cache after increment.
   *
   * @param contentId - The ID of the content to increment views for
   * @param dbInstance - Optional database executor for transactions
   */
  static async incrementViewCountAsync(contentId: string, dbInstance: DatabaseExecutor = db): Promise<void> {
    return executeFacadeOperation(
      {
        data: { contentId },
        facade: facadeName,
        method: 'incrementViewCountAsync',
        operation: OPERATIONS.FEATURED_CONTENT.GET_ACTIVE,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);

        try {
          await FeaturedContentQuery.incrementViewCountAsync(contentId, context);
          CacheRevalidationService.featured.onContentChange();
        } catch (error) {
          // Non-critical operation - log warning but don't fail
          captureFacadeWarning(error, facadeName, 'incrementViewCountAsync', {
            contentId,
          });
        }
      },
    );
  }

  /**
   * Toggle active status of featured content.
   *
   * Cache behavior: Invalidates all featured content caches after toggle.
   *
   * @param id - The ID of the featured content to toggle
   * @param isActive - The new active status
   * @param dbInstance - Optional database executor for transactions
   * @returns The updated featured content record, or null if not found
   */
  static async toggleActiveAsync(
    id: string,
    isActive: boolean,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectFeaturedContent> {
    return executeFacadeOperation(
      {
        data: { id, isActive },
        facade: facadeName,
        method: 'toggleActiveAsync',
        operation: OPERATIONS.FEATURED_CONTENT.TOGGLE_ACTIVE,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        const result = await FeaturedContentQuery.toggleActiveAsync(id, isActive, context);

        // Invalidate featured content cache after toggle
        CacheRevalidationService.featured.onContentChange();

        return result;
      },
      {
        includeResultSummary: (result) => ({
          id: result?.id,
          isActive: result?.isActive,
          toggled: result !== null,
        }),
      },
    );
  }

  /**
   * Update a featured content entry.
   *
   * Cache behavior: Invalidates all featured content caches after update.
   *
   * @param id - The ID of the featured content to update
   * @param data - The updated featured content data
   * @param dbInstance - Optional database executor for transactions
   * @returns The updated featured content record, or null if not found
   */
  static async updateAsync(
    id: string,
    data: UpdateFeaturedContent,
    dbInstance: DatabaseExecutor = db,
  ): Promise<null | SelectFeaturedContent> {
    return executeFacadeOperation(
      {
        data: { id },
        facade: facadeName,
        method: 'updateAsync',
        operation: OPERATIONS.FEATURED_CONTENT.UPDATE,
      },
      async () => {
        const context = this.getPublicContext(dbInstance);
        const result = await FeaturedContentQuery.updateAsync(id, data, context);

        // Invalidate featured content cache after update
        CacheRevalidationService.featured.onContentChange();

        return result;
      },
      {
        includeResultSummary: (result) => ({
          id: result?.id,
          updated: result !== null,
        }),
      },
    );
  }
}
