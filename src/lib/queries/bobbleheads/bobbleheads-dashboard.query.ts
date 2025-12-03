import type { AnyColumn } from 'drizzle-orm';

import { asc, count, desc, eq, ilike, isNotNull, or, sql } from 'drizzle-orm';

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
   * Get all distinct categories for a collection
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
   * Get total count of bobbleheads matching filters (without pagination)
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

  static async getListAsync(
    collectionSlug: string,
    context: UserQueryContext,
    options?: BobbleheadDashboardQueryOptions,
  ): Promise<Array<BobbleheadDashboardListRecord>> {
    const dbInstance = this.getDbInstance(context);

    // extract pagination parameters with defaults
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 24;
    const offset = (page - 1) * pageSize;

    return dbInstance
      .select({
        acquisitionDate: bobbleheads.acquisitionDate,
        acquisitionMethod: bobbleheads.acquisitionMethod,
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionId: bobbleheads.collectionId,
        collectionSlug: collections.slug,
        commentCount: this._buildCountSubquery(comments, bobbleheads.id, 'bobblehead'),
        condition: bobbleheads.currentCondition,
        customFields: bobbleheads.customFields,
        description: bobbleheads.description,
        featurePhoto: bobbleheadPhotos.url,
        height: bobbleheads.height,
        id: bobbleheads.id,
        isFeatured: bobbleheads.isFeatured,
        isPublic: bobbleheads.isPublic,
        likeCount: this._buildCountSubquery(likes, bobbleheads.id, 'bobblehead'),
        manufacturer: bobbleheads.manufacturer,
        material: bobbleheads.material,
        name: bobbleheads.name,
        purchaseLocation: bobbleheads.purchaseLocation,
        purchasePrice: bobbleheads.purchasePrice,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        status: bobbleheads.status,
        viewCount: this._buildCountSubquery(contentViews, bobbleheads.id, 'bobblehead'),
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
      WHERE ${table.targetId} = ${targetIdColumn}
      AND ${table.targetType} = ${targetType}
    )`;
  }

  private static _getCategoryCondition(category?: string) {
    if (!category || category === 'all') return undefined;
    return eq(bobbleheads.category, category);
  }

  private static _getConditionFilter(condition?: string) {
    if (!condition || condition === 'all') return undefined;
    return eq(bobbleheads.currentCondition, condition);
  }

  private static _getFeaturedCondition(featured?: BobbleheadDashboardQueryOptions['featured']) {
    if (!featured || featured === 'all') return undefined;
    return eq(bobbleheads.isFeatured, featured === 'featured');
  }

  private static _getSearchCondition(searchTerm?: string) {
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
