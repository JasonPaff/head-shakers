import type { SQL } from 'drizzle-orm';

import { and, asc, count, desc, eq, ilike, isNotNull, or, sql } from 'drizzle-orm';

import type { UserQueryContext } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { bobbleheadPhotos, bobbleheads, collections, comments, contentViews, likes } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

/** Default page size for dashboard bobblehead list */
const DEFAULT_PAGE_SIZE = 24;

export type BobbleheadDashboardListRecord = BobbleheadListRecord & {
  collectionId: string;
  collectionSlug: string;
  commentCount: number;
  featurePhoto?: null | string;
  likeCount: number;
  viewCount: number;
};

export type BobbleheadDashboardQueryOptions = {
  category?: string;
  condition?: string;
  featured?: 'all' | 'featured' | 'not-featured';
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
};

export class BobbleheadsDashboardQuery extends BaseQuery {
  /**
   * Get all distinct categories for a collection.
   * Returns only categories from bobbleheads that the current user has permission to view.
   *
   * @param collectionSlug - The slug of the collection to get categories for
   * @param context - User query context with authenticated userId
   * @returns Array of distinct category names, sorted alphabetically
   */
  static async getCategoriesByCollectionSlugAsync(
    collectionSlug: string,
    context: UserQueryContext,
  ): Promise<Array<string>> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .selectDistinct({ category: bobbleheads.category })
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          isNotNull(bobbleheads.category),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .orderBy(asc(bobbleheads.category));

    return result.map((r) => r.category).filter(Boolean) as Array<string>;
  }

  /**
   * Get total count of bobbleheads matching filters (without pagination).
   * Used for calculating pagination metadata.
   *
   * @param collectionSlug - The slug of the collection to count bobbleheads for
   * @param context - User query context with authenticated userId
   * @param options - Optional filter options (category, condition, featured status, search term)
   * @returns Total count of matching bobbleheads
   */
  static async getCountAsync(
    collectionSlug: string,
    context: UserQueryContext,
    options?: Omit<BobbleheadDashboardQueryOptions, 'page' | 'pageSize'>,
  ): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const countResult = await dbInstance
      .select({ count: count() })
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          this._getSearchCondition(options?.searchTerm),
          this._getCategoryCondition(options?.category),
          this._getConditionFilter(options?.condition),
          this._getFeaturedCondition(options?.featured),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      );

    return countResult[0]?.count || 0;
  }

  /**
   * Get paginated list of bobbleheads for dashboard display.
   * Includes aggregate stats for comments, likes, and views.
   *
   * @param collectionSlug - The slug of the collection to get bobbleheads for
   * @param context - User query context with authenticated userId
   * @param options - Optional pagination and filter options
   * @returns Array of bobblehead records with stats, ordered by specified sort
   */
  static async getListAsync(
    collectionSlug: string,
    context: UserQueryContext,
    options?: BobbleheadDashboardQueryOptions,
  ): Promise<Array<BobbleheadDashboardListRecord>> {
    const dbInstance = this.getDbInstance(context);

    // extract pagination parameters with defaults
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
    const offset = (page - 1) * pageSize;

    // Build subqueries for aggregate stats
    const commentStats = this._buildCommentStatsSubquery(dbInstance);
    const likeStats = this._buildLikeStatsSubquery(dbInstance);
    const viewStats = this._buildViewStatsSubquery(dbInstance);

    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionId: bobbleheads.collectionId,
        collectionSlug: collections.slug,
        commentCount: sql<number>`COALESCE("comment_stats"."comment_count", 0)`,
        condition: bobbleheads.currentCondition,
        customFields: bobbleheads.customFields,
        description: bobbleheads.description,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        likeCount: sql<number>`COALESCE("like_stats"."like_count", 0)`,
        manufacturer: bobbleheads.manufacturer,
        material: bobbleheads.material,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        status: bobbleheads.status,
        viewCount: sql<number>`COALESCE("view_stats"."view_count", 0)`,
        weight: bobbleheads.weight,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .leftJoin(commentStats, eq(commentStats.targetId, bobbleheads.id))
      .leftJoin(likeStats, eq(likeStats.targetId, bobbleheads.id))
      .leftJoin(viewStats, eq(viewStats.targetId, bobbleheads.id))
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          this._getSearchCondition(options?.searchTerm),
          this._getCategoryCondition(options?.category),
          this._getConditionFilter(options?.condition),
          this._getFeaturedCondition(options?.featured),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .orderBy(this._getSortOrder(options?.sortBy))
      .limit(pageSize)
      .offset(offset);
  }

  private static _buildCommentStatsSubquery(dbInstance: DatabaseExecutor) {
    return dbInstance
      .select({
        commentCount: count(comments.id).as('comment_count'),
        targetId: comments.targetId,
      })
      .from(comments)
      .where(eq(comments.targetType, 'bobblehead'))
      .groupBy(comments.targetId)
      .as('comment_stats');
  }

  private static _buildLikeStatsSubquery(dbInstance: DatabaseExecutor) {
    return dbInstance
      .select({
        likeCount: count(likes.id).as('like_count'),
        targetId: likes.targetId,
      })
      .from(likes)
      .where(eq(likes.targetType, 'bobblehead'))
      .groupBy(likes.targetId)
      .as('like_stats');
  }

  private static _buildViewStatsSubquery(dbInstance: DatabaseExecutor) {
    return dbInstance
      .select({
        targetId: contentViews.targetId,
        viewCount: count(contentViews.id).as('view_count'),
      })
      .from(contentViews)
      .where(eq(contentViews.targetType, 'bobblehead'))
      .groupBy(contentViews.targetId)
      .as('view_stats');
  }

  private static _getCategoryCondition(category?: string): SQL | undefined {
    if (!category || category === 'all') return undefined;
    return eq(bobbleheads.category, category);
  }

  private static _getConditionFilter(condition?: string): SQL | undefined {
    if (!condition || condition === 'all') return undefined;
    return eq(bobbleheads.currentCondition, condition);
  }

  private static _getFeaturedCondition(
    featured?: BobbleheadDashboardQueryOptions['featured'],
  ): SQL | undefined {
    if (!featured || featured === 'all') return undefined;
    return eq(bobbleheads.isFeatured, featured === 'featured');
  }

  private static _getSearchCondition(searchTerm?: string): SQL | undefined {
    if (!searchTerm) return undefined;
    return or(
      ilike(bobbleheads.name, `%${searchTerm}%`),
      ilike(bobbleheads.description, `%${searchTerm}%`),
      ilike(bobbleheads.characterName, `%${searchTerm}%`),
      ilike(bobbleheads.manufacturer, `%${searchTerm}%`),
    );
  }

  private static _getSortOrder(sortBy?: string) {
    switch (sortBy) {
      case 'name-asc':
        return asc(bobbleheads.name);
      case 'name-desc':
        return desc(bobbleheads.name);
      case 'oldest':
        return asc(bobbleheads.createdAt);
      case 'value-high':
        return sql`${bobbleheads.purchasePrice} DESC NULLS LAST`;
      case 'value-low':
        return sql`${bobbleheads.purchasePrice} ASC NULLS LAST`;
      case 'newest':
      default:
        return desc(bobbleheads.createdAt);
    }
  }
}
