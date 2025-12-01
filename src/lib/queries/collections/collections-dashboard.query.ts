import { count, eq, sql, sum } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { CollectionRecord } from '@/lib/queries/collections/collections.query';

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

export class CollectionsDashboardQuery extends BaseQuery {
  static async getCollectionHeaderForUserBySlugAsync(
    slug: string,
    context: QueryContext,
  ): Promise<CollectionDashboardHeaderRecord> {
    const dbInstance = this.getDbInstance(context);

    const bobbleheadStats = dbInstance
      .select({
        bobbleheadCount: count(bobbleheads.id).as('bobblehead_count'),
        collectionId: bobbleheads.collectionId,
        featuredCount: count(sql`CASE WHEN ${bobbleheads.isFeatured} THEN 1 END`).as('featured_count'),
        totalValue: sum(bobbleheads.purchasePrice).as('total_value'),
      })
      .from(bobbleheads)
      .groupBy(bobbleheads.collectionId)
      .as('bobblehead_stats');

    const commentStats = dbInstance
      .select({
        commentCount: count(comments.id).as('comment_count'),
        targetId: comments.targetId,
      })
      .from(comments)
      .where(eq(comments.targetType, 'collection'))
      .groupBy(comments.targetId)
      .as('comment_stats');

    const likeStats = dbInstance
      .select({
        likeCount: count(likes.id).as('like_count'),
        targetId: likes.targetId,
      })
      .from(likes)
      .where(eq(likes.targetType, 'collection'))
      .groupBy(likes.targetId)
      .as('like_stats');

    const viewStats = dbInstance
      .select({
        targetId: contentViews.targetId,
        viewCount: count(contentViews.id).as('view_count'),
      })
      .from(contentViews)
      .where(eq(contentViews.targetType, 'collection'))
      .groupBy(contentViews.targetId)
      .as('view_stats');

    const result = await dbInstance
      .select({
        bobbleheadCount: sql<number>`COALESCE(${bobbleheadStats.bobbleheadCount}, 0)`,
        commentCount: sql<number>`COALESCE(${commentStats.commentCount}, 0)`,
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        featuredCount: sql<number>`COALESCE(${bobbleheadStats.featuredCount}, 0)`,
        id: collections.id,
        isPublic: collections.isPublic,
        likeCount: sql<number>`COALESCE(${likeStats.likeCount}, 0)`,
        name: collections.name,
        slug: collections.slug,
        totalValue: sql<number>`COALESCE(${bobbleheadStats.totalValue}, 0)`,
        viewCount: sql<number>`COALESCE(${viewStats.viewCount}, 0)`,
      })
      .from(collections)
      .leftJoin(bobbleheadStats, eq(bobbleheadStats.collectionId, collections.id))
      .leftJoin(commentStats, eq(commentStats.targetId, collections.id))
      .leftJoin(likeStats, eq(likeStats.targetId, collections.id))
      .leftJoin(viewStats, eq(viewStats.targetId, collections.id))
      .where(
        this.combineFilters(
          eq(collections.slug, slug),
          eq(collections.userId, context.userId!),
          this.buildBaseFilters(collections.isPublic, collections.userId, collections.deletedAt, context),
        ),
      );

    return result[0]!;
  }
}
