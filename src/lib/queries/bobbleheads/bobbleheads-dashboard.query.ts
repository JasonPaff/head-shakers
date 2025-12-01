import { and, asc, desc, eq, ilike, or } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';

import { bobbleheadPhotos, bobbleheads, collections } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export class BobbleheadsDashboardQuery extends BaseQuery {
  static async getListAsync(
    collectionSlug: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        featurePhoto?: null | string;
      }
    >
  > {
    const dbInstance = this.getDbInstance(context);

    // build permission filters for both collection and bobbleheads
    const collectionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    const bobbleheadFilter = this.buildBaseFilters(
      bobbleheads.isPublic,
      bobbleheads.userId,
      bobbleheads.deletedAt,
      context,
    );

    const searchCondition = this._getSearchCondition(options?.searchTerm);
    const sortOrder = this._getSortOrder(options?.sortBy);

    return dbInstance
      .select(this._selectBobbleheadWithPhoto())
      .from(bobbleheads)
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(collections.slug, collectionSlug),
          eq(bobbleheads.userId, context.userId!),
          collectionFilter,
          bobbleheadFilter,
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
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

  private static _selectBobbleheadWithPhoto() {
    return {
      acquisitionDate: bobbleheads.acquisitionDate,
      acquisitionMethod: bobbleheads.acquisitionMethod,
      category: bobbleheads.category,
      characterName: bobbleheads.characterName,
      collectionId: bobbleheads.collectionId,
      collectionSlug: collections.slug,
      condition: bobbleheads.currentCondition,
      customFields: bobbleheads.customFields,
      description: bobbleheads.description,
      featurePhoto: bobbleheadPhotos.url,
      height: bobbleheads.height,
      id: bobbleheads.id,
      isFeatured: bobbleheads.isFeatured,
      isPublic: bobbleheads.isPublic,
      manufacturer: bobbleheads.manufacturer,
      material: bobbleheads.material,
      name: bobbleheads.name,
      purchaseLocation: bobbleheads.purchaseLocation,
      purchasePrice: bobbleheads.purchasePrice,
      series: bobbleheads.series,
      slug: bobbleheads.slug,
      status: bobbleheads.status,
      weight: bobbleheads.weight,
      year: bobbleheads.year,
    };
  }
}
