import type { AnyColumn } from 'drizzle-orm';

import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

import type { UserQueryContext } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';

import { bobbleheadPhotos, bobbleheads, collections, comments, contentViews, likes } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadDashboardListRecord = BobbleheadListRecord & {
  collectionId: string;
  commentCount: number;
  featurePhoto?: null | string;
  likeCount: number;
  viewCount: number;
};

export class BobbleheadsDashboardQuery extends BaseQuery {
  static async getListAsync(
    collectionSlug: string,
    context: UserQueryContext,
    // TODO: fix search/filter/sort options
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<Array<BobbleheadDashboardListRecord>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionId: bobbleheads.collectionId,
        collectionSlug: collections.slug,
        commentCount: this._buildCountSubquery(comments, comments.targetId, 'bobblehead'),
        condition: bobbleheads.currentCondition,
        customFields: bobbleheads.customFields,
        description: bobbleheads.description,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        likeCount: this._buildCountSubquery(likes, likes.targetId, 'bobblehead'),
        manufacturer: bobbleheads.manufacturer,
        material: bobbleheads.material,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        status: bobbleheads.status,
        viewCount: this._buildCountSubquery(contentViews, contentViews.targetId, 'bobblehead'),
        weight: bobbleheads.weight,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        this.combineFilters(
          eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId),
          eq(bobbleheadPhotos.isPrimary, true),
        ),
      )
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          this._getSearchCondition(options?.searchTerm),
          this.buildBaseFilters(bobbleheads.isPublic, bobbleheads.userId, bobbleheads.deletedAt, context),
        ),
      )
      .orderBy(this._getSortOrder(options?.sortBy));
  }

  /**
   * build a subquery for counting the number of items matching a targetId and targetType
   * e.g., for counting comments on a post, use: buildCountSubquery(comments, post.id, 'post')
   * @param table
   * @param targetIdColumn
   * @param targetType
   * @protected
   */
  private static _buildCountSubquery(
    table: typeof comments | typeof contentViews | typeof likes,
    targetIdColumn: AnyColumn,
    targetType: string,
  ) {
    return sql<number>`(
      SELECT COUNT(*) FROM ${table}
      WHERE ${table}.target_id = ${targetIdColumn}
      AND ${table}.target_type = ${targetType}
    )`;
  }

  private static _getSearchCondition(searchTerm?: string) {
    if (!searchTerm) return undefined;
    return or(
      ilike(bobbleheads.name, `%${searchTerm}%`),
      ilike(bobbleheads.description, `%${searchTerm}%`),
      ilike(bobbleheads.characterName, `%${searchTerm}%`),
    );
  }

  private static _getSortOrder(sortBy?: string) {
    switch (sortBy) {
      case 'name_asc':
        return asc(bobbleheads.name);
      case 'name_desc':
        return desc(bobbleheads.name);
      case 'oldest':
        return asc(bobbleheads.createdAt);
      case 'newest':
      default:
        return desc(bobbleheads.createdAt);
    }
  }
}
