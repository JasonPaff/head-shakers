import { count, eq, sql, sum } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type {
  CollectionDashboardListRecord,
  CollectionRecord,
} from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { bobbleheads, collections, comments, contentViews, likes } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type CollectionDashboardHeaderRecord = Pick<
  CollectionRecord,
  'coverImageUrl' | 'description' | 'id' | 'isPublic' | 'name' | 'slug'
> & {
  bobbleheadCount: number;
  commentCount: number;
  featuredCount: number;
  likeCount: number;
  totalValue: number;
  viewCount: number;
};

/**
 * Minimal collection data for selector/dropdown components
 */
export type CollectionSelectorRecord = Pick<CollectionRecord, 'id' | 'name' | 'slug'>;

export class CollectionsDashboardQuery extends BaseQuery {
  static async getHeaderByCollectionSlugAsync(
    collectionSlug: string,
    context: QueryContext,
  ): Promise<CollectionDashboardHeaderRecord> {
    const dbInstance = this.getDbInstance(context);

    const bobbleheadStats = this._buildBobbleheadStatsSubquery(dbInstance);
    const commentStats = this._buildCommentStatsSubquery(dbInstance);
    const likeStats = this._buildLikeStatsSubquery(dbInstance);
    const viewStats = this._buildViewStatsSubquery(dbInstance);

    const result = await dbInstance
      .select({
        bobbleheadCount: sql<number>`COALESCE("bobblehead_stats"."bobblehead_count", 0)`,
        commentCount: sql<number>`COALESCE("comment_stats"."comment_count", 0)`,
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        featuredCount: sql<number>`COALESCE("bobblehead_stats"."featured_count", 0)`,
        id: collections.id,
        isPublic: collections.isPublic,
        likeCount: sql<number>`COALESCE("like_stats"."like_count", 0)`,
        name: collections.name,
        slug: collections.slug,
        totalValue: sql<number>`COALESCE("bobblehead_stats"."total_value", 0)`,
        viewCount: sql<number>`COALESCE("view_stats"."view_count", 0)`,
      })
      .from(collections)
      .leftJoin(bobbleheadStats, eq(bobbleheadStats.collectionId, collections.id))
      .leftJoin(commentStats, eq(commentStats.targetId, collections.id))
      .leftJoin(likeStats, eq(likeStats.targetId, collections.id))
      .leftJoin(viewStats, eq(viewStats.targetId, collections.id))
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          eq(collections.userId, context.userId!),
          this.buildBaseFilters(collections.isPublic, collections.userId, collections.deletedAt, context),
        ),
      );

    return result[0]!;
  }

  static async getListByUserIdAsync(context: QueryContext): Promise<Array<CollectionDashboardListRecord>> {
    const dbInstance = this.getDbInstance(context);

    const bobbleheadStats = this._buildBobbleheadStatsSubquery(dbInstance);
    const commentStats = this._buildCommentStatsSubquery(dbInstance);
    const likeStats = this._buildLikeStatsSubquery(dbInstance);
    const viewStats = this._buildViewStatsSubquery(dbInstance);

    const result = await dbInstance
      .select({
        bobbleheadCount: sql<number>`COALESCE("bobblehead_stats"."bobblehead_count", 0)`,
        commentCount: sql<number>`COALESCE("comment_stats"."comment_count", 0)`,
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        featuredCount: sql<number>`COALESCE("bobblehead_stats"."featured_count", 0)`,
        id: collections.id,
        isPublic: collections.isPublic,
        likeCount: sql<number>`COALESCE("like_stats"."like_count", 0)`,
        name: collections.name,
        slug: collections.slug,
        totalValue: sql<number>`COALESCE("bobblehead_stats"."total_value", 0)`,
        viewCount: sql<number>`COALESCE("view_stats"."view_count", 0)`,
      })
      .from(collections)
      .leftJoin(bobbleheadStats, eq(bobbleheadStats.collectionId, collections.id))
      .leftJoin(commentStats, eq(commentStats.targetId, collections.id))
      .leftJoin(likeStats, eq(likeStats.targetId, collections.id))
      .leftJoin(viewStats, eq(viewStats.targetId, collections.id))
      .where(
        this.combineFilters(
          eq(collections.userId, context.userId!),
          this.buildBaseFilters(undefined, collections.userId, collections.deletedAt, context),
        ),
      );

    return result || [];
  }

  /**
   * Get minimal collection data for selector/dropdown components.
   * Returns only id, name, and slug - optimized for combobox usage.
   *
   * @param context - Query context with userId for permission filtering
   * @returns Array of collection selectors ordered by name (case-insensitive)
   */
  static async getSelectorsByUserIdAsync(context: QueryContext): Promise<Array<CollectionSelectorRecord>> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        id: collections.id,
        name: collections.name,
        slug: collections.slug,
      })
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.userId, context.userId!),
          this.buildBaseFilters(undefined, collections.userId, collections.deletedAt, context),
        ),
      )
      .orderBy(sql`lower(${collections.name}) asc`);

    return result || [];
  }

  private static _buildBobbleheadStatsSubquery(dbInstance: DatabaseExecutor) {
    return dbInstance
      .select({
        bobbleheadCount: count(bobbleheads.id).as('bobblehead_count'),
        collectionId: bobbleheads.collectionId,
        featuredCount: count(sql`CASE WHEN ${bobbleheads.isFeatured} THEN 1 END`).as('featured_count'),
        totalValue: sum(bobbleheads.purchasePrice).as('total_value'),
      })
      .from(bobbleheads)
      .groupBy(bobbleheads.collectionId)
      .as('bobblehead_stats');
  }

  private static _buildCommentStatsSubquery(dbInstance: DatabaseExecutor) {
    return dbInstance
      .select({
        commentCount: count(comments.id).as('comment_count'),
        targetId: comments.targetId,
      })
      .from(comments)
      .where(eq(comments.targetType, 'collection'))
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
      .where(eq(likes.targetType, 'collection'))
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
      .where(eq(contentViews.targetType, 'collection'))
      .groupBy(contentViews.targetId)
      .as('view_stats');
  }
}
