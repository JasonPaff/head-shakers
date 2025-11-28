import { and, asc, count, desc, eq, gte, ilike, isNull, lte, or, sql } from 'drizzle-orm';

import type { FindOptions, QueryContext } from '@/lib/queries/base/query-context';
import type { BrowseCategoriesInput } from '@/lib/validations/browse-categories.validation';
import type { BrowseCollectionsInput } from '@/lib/validations/browse-collections.validation';
import type {
  DeleteCollection,
  InsertCollection,
  UpdateCollection,
} from '@/lib/validations/collections.validation';

import {
  bobbleheadCollections,
  bobbleheadPhotos,
  bobbleheads,
  collections,
  users,
} from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';
import { buildSoftDeleteFilter } from '@/lib/queries/base/permission-filters';

export type BobbleheadListRecord = {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  condition: null | string;
  customFields: Array<Record<string, string>> | null;
  description: null | string;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  manufacturer: null | string;
  material: null | string;
  name: null | string;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  slug: string;
  status: null | string;
  weight: null | number;
  year: null | number;
};

export type BrowseCategoriesResult = {
  collections: Array<BrowseCollectionRecord>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export type BrowseCollectionRecord = {
  collection: CollectionRecord & {
    slug: string;
  };
  firstBobbleheadPhoto: null | string;
  owner: {
    avatarUrl: null | string;
    id: string;
    username: string;
  };
};

export type BrowseCollectionsResult = {
  collections: Array<BrowseCollectionRecord>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
};

export type CategoryRecord = {
  bobbleheadCount: number;
  collectionCount: number;
  name: string;
};

export type CollectionRecord = typeof collections.$inferSelect;

export type CollectionWithRelations = CollectionRecord & {
  bobbleheads: Array<{
    id: string;
    isFeatured: boolean;
    updatedAt: Date;
  }>;
};

export class CollectionsQuery extends BaseQuery {
  /**
   * count total collections across all users
   */
  static async countTotalCollectionsAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance.select({ count: count() }).from(collections);

    return result[0]?.count || 0;
  }

  static async createAsync(data: InsertCollection & { slug: string }, userId: string, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .insert(collections)
      .values({ ...data, userId })
      .returning();

    return result?.[0] || null;
  }

  static async deleteAsync(data: DeleteCollection, userId: string, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .delete(collections)
      .where(and(eq(collections.id, data.collectionId), eq(collections.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  static async findByIdAsync(id: string, context: QueryContext): Promise<CollectionRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.id, id),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  static async findByIdWithRelationsAsync(
    id: string,
    context: QueryContext,
  ): Promise<CollectionWithRelations | null> {
    const dbInstance = this.getDbInstance(context);

    // build permission filter
    const permissionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    // first get the collection with bobbleheads through junction table
    const collection = await dbInstance.query.collections.findFirst({
      where: this.combineFilters(eq(collections.id, id), permissionFilter),
      with: {
        bobbleheadCollections: {
          columns: {},
          with: {
            bobblehead: {
              columns: {
                deletedAt: true,
                id: true,
                isFeatured: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!collection) return null;

    // transform junction table results to match expected structure and filter out deleted bobbleheads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bobbleheadCollections = collection.bobbleheadCollections as Array<any>;
    const bobbleheads = bobbleheadCollections
      .map(
        (bc: {
          bobblehead: null | { deletedAt: Date | null; id: string; isFeatured: boolean; updatedAt: Date };
        }) => bc.bobblehead,
      )
      .filter(
        (b): b is NonNullable<typeof b> => b !== null && b.deletedAt === null,
      );

    const transformedCollection: CollectionWithRelations = {
      ...collection,
      bobbleheads,
    };

    return transformedCollection;
  }

  static async findBySlugAsync(
    slug: string,
    userId: string,
    context: QueryContext,
  ): Promise<CollectionRecord | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.slug, slug),
          eq(collections.userId, userId),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  static async findBySlugWithRelationsAsync(
    slug: string,
    userId: string,
    context: QueryContext,
  ): Promise<CollectionWithRelations | null> {
    const dbInstance = this.getDbInstance(context);

    // build permission filter
    const permissionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    // get the collection by slug and userId with bobbleheads through junction table
    const collection = await dbInstance.query.collections.findFirst({
      where: this.combineFilters(
        eq(collections.slug, slug),
        eq(collections.userId, userId),
        permissionFilter,
      ),
      with: {
        bobbleheadCollections: {
          columns: {},
          with: {
            bobblehead: {
              columns: {
                deletedAt: true,
                id: true,
                isFeatured: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!collection) return null;

    // transform junction table results to match expected structure and filter out deleted bobbleheads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bobbleheadCollections = collection.bobbleheadCollections as Array<any>;
    const bobbleheads = bobbleheadCollections
      .map(
        (bc: {
          bobblehead: null | { deletedAt: Date | null; id: string; isFeatured: boolean; updatedAt: Date };
        }) => bc.bobblehead,
      )
      .filter(
        (b): b is NonNullable<typeof b> => b !== null && b.deletedAt === null,
      );

    const transformedCollection: CollectionWithRelations = {
      ...collection,
      bobbleheads,
    };

    return transformedCollection;
  }

  static async findByUserAsync(
    userId: string,
    options: FindOptions = {},
    context: QueryContext,
  ): Promise<Array<CollectionRecord>> {
    const dbInstance = this.getDbInstance(context);
    const pagination = this.applyPagination(options);

    const query = dbInstance
      .select()
      .from(collections)
      .where(
        this.combineFilters(
          eq(collections.userId, userId),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .orderBy(sql`lower(${collections.name}) asc`);

    if (pagination.limit) {
      query.limit(pagination.limit);
    }

    if (pagination.offset) {
      query.offset(pagination.offset);
    }

    return query;
  }

  static async getAllCollectionBobbleheadsWithPhotosAsync(
    collectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
        featurePhoto?: null | string;
      }
    >
  > {
    const dbInstance = this.getDbInstance(context);

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
      .innerJoin(bobbleheadCollections, eq(bobbleheads.id, bobbleheadCollections.bobbleheadId))
      .innerJoin(collections, eq(bobbleheadCollections.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(bobbleheadCollections.collectionId, collectionId),
          collectionFilter,
          bobbleheadFilter,
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
  }

  static async getBobbleheadsInCollectionAsync(
    collectionId: string,
    context: QueryContext,
  ): Promise<Array<BobbleheadListRecord>> {
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

    return dbInstance
      .select(this._selectBobbleheadBase())
      .from(bobbleheads)
      .innerJoin(bobbleheadCollections, eq(bobbleheads.id, bobbleheadCollections.bobbleheadId))
      .innerJoin(collections, eq(bobbleheadCollections.collectionId, collections.id))
      .where(
        this.combineFilters(
          eq(bobbleheadCollections.collectionId, collectionId),
          collectionFilter,
          bobbleheadFilter,
        ),
      )
      .orderBy(bobbleheads.createdAt);
  }

  static async getBrowseCategoriesAsync(
    input: BrowseCategoriesInput,
    context: QueryContext,
  ): Promise<BrowseCategoriesResult> {
    const dbInstance = this.getDbInstance(context);

    // extract input parameters with defaults
    const filters = input.filters;
    const sort = input.sort;
    const pagination = input.pagination;

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 12;
    const sortBy = sort?.sortBy ?? 'createdAt';
    const sortOrder = sort?.sortOrder ?? 'desc';

    // build permission filter - only public collections OR collections owned by current user
    const permissionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    // build search filter for collection name and description
    const searchFilter =
      filters?.query ?
        or(
          ilike(collections.name, `%${filters.query}%`),
          ilike(collections.description, `%${filters.query}%`),
        )
      : undefined;

    // build category filter - filter collections that have bobbleheads in the specified category
    const categoryFilter = filters?.category ? eq(bobbleheads.category, filters.category) : undefined;

    // build owner filter
    const ownerFilter = filters?.ownerId ? eq(collections.userId, filters.ownerId) : undefined;

    // build date range filters
    const dateFromFilter = filters?.dateFrom ? gte(collections.createdAt, filters.dateFrom) : undefined;
    const dateToFilter = filters?.dateTo ? lte(collections.createdAt, filters.dateTo) : undefined;

    const isNotDeleted = isNull(collections.deletedAt);

    // combine all filters for collections
    const collectionFilters = this.combineFilters(
      permissionFilter,
      searchFilter,
      ownerFilter,
      dateFromFilter,
      dateToFilter,
      isNotDeleted,
    );

    // build sort order
    const orderByClause = this._getBrowseSortOrder(sortBy, sortOrder);

    // calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // if category filter is present, we need to filter collections that have bobbleheads in that category
    if (categoryFilter) {
      // get distinct collection IDs that have bobbleheads in the specified category through junction table
      const collectionsWithCategory = dbInstance
        .selectDistinct({
          collectionId: bobbleheadCollections.collectionId,
        })
        .from(bobbleheads)
        .innerJoin(bobbleheadCollections, eq(bobbleheads.id, bobbleheadCollections.bobbleheadId))
        .where(this.combineFilters(categoryFilter, isNull(bobbleheads.deletedAt)))
        .as('collections_with_category');

      // get total count for pagination metadata
      const countQuery = dbInstance
        .select({ count: sql<number>`count(*)::int` })
        .from(collections)
        .innerJoin(collectionsWithCategory, eq(collections.id, collectionsWithCategory.collectionId))
        .where(collectionFilters);

      const countResult = await countQuery;
      const totalCount = countResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      // main query with joins for owner info, first bobblehead photo, and follower count
      const results = await dbInstance
        .select({
          avatarUrl: users.avatarUrl,
          commentCount: collections.commentCount,
          coverImageUrl: collections.coverImageUrl,
          createdAt: collections.createdAt,
          deletedAt: collections.deletedAt,
          description: collections.description,
          firstBobbleheadPhoto: sql<null | string>`(
            SELECT ${bobbleheadPhotos.url}
            FROM ${bobbleheadCollections}
            INNER JOIN ${bobbleheads} ON ${bobbleheadCollections.bobbleheadId} = ${bobbleheads.id}
            LEFT JOIN ${bobbleheadPhotos} ON ${bobbleheads.id} = ${bobbleheadPhotos.bobbleheadId}
              AND ${bobbleheadPhotos.isPrimary} = true
            WHERE ${bobbleheadCollections.collectionId} = ${collections.id}
              AND ${bobbleheads.deletedAt} IS NULL
            ORDER BY ${bobbleheadCollections.createdAt} ASC
            LIMIT 1
          )`,
          id: collections.id,
          isPublic: collections.isPublic,
          lastItemAddedAt: collections.lastItemAddedAt,
          likeCount: collections.likeCount,
          name: collections.name,
          ownerId: users.id,
          ownerUsername: users.username,
          slug: collections.slug,
          totalItems: collections.totalItems,
          totalValue: collections.totalValue,
          updatedAt: collections.updatedAt,
          userId: collections.userId,
          username: users.username,
        })
        .from(collections)
        .innerJoin(collectionsWithCategory, eq(collections.id, collectionsWithCategory.collectionId))
        .innerJoin(users, eq(collections.userId, users.id))
        .where(collectionFilters)
        .orderBy(orderByClause)
        .limit(pageSize)
        .offset(offset);

      // transform results to match BrowseCollectionRecord type
      const transformedResults: Array<BrowseCollectionRecord> = results.map((row) => ({
        collection: {
          commentCount: row.commentCount,
          coverImageUrl: row.coverImageUrl,
          createdAt: row.createdAt,
          deletedAt: row.deletedAt,
          description: row.description,
          id: row.id,
          isPublic: row.isPublic,
          lastItemAddedAt: row.lastItemAddedAt,
          likeCount: row.likeCount,
          name: row.name,
          slug: row.slug,
          totalItems: row.totalItems,
          totalValue: row.totalValue,
          updatedAt: row.updatedAt,
          userId: row.userId,
        },
        firstBobbleheadPhoto: row.firstBobbleheadPhoto,
        owner: {
          avatarUrl: row.avatarUrl,
          id: row.ownerId,
          username: row.ownerUsername,
        },
      }));

      return {
        collections: transformedResults,
        pagination: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages,
        },
      };
    }

    // if no category filter, just return all collections (same as browse collections)
    const countQuery = dbInstance
      .select({ count: sql<number>`count(*)::int` })
      .from(collections)
      .where(collectionFilters);

    const countResult = await countQuery;
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // main query with joins for owner info, first bobblehead photo, and follower count
    const results = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        commentCount: collections.commentCount,
        coverImageUrl: collections.coverImageUrl,
        createdAt: collections.createdAt,
        description: collections.description,
        firstBobbleheadPhoto: sql<null | string>`(
          SELECT ${bobbleheadPhotos.url}
          FROM ${bobbleheadCollections}
          INNER JOIN ${bobbleheads} ON ${bobbleheadCollections.bobbleheadId} = ${bobbleheads.id}
          LEFT JOIN ${bobbleheadPhotos} ON ${bobbleheads.id} = ${bobbleheadPhotos.bobbleheadId}
            AND ${bobbleheadPhotos.isPrimary} = true
          WHERE ${bobbleheadCollections.collectionId} = ${collections.id}
            AND ${bobbleheads.deletedAt} IS NULL
          ORDER BY ${bobbleheadCollections.createdAt} ASC
          LIMIT 1
        )`,
        id: collections.id,
        isPublic: collections.isPublic,
        lastItemAddedAt: collections.lastItemAddedAt,
        likeCount: collections.likeCount,
        name: collections.name,
        ownerId: users.id,
        ownerUsername: users.username,
        slug: collections.slug,
        totalItems: collections.totalItems,
        totalValue: collections.totalValue,
        updatedAt: collections.updatedAt,
        userId: collections.userId,
        username: users.username,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id))
      .where(collectionFilters)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // transform results to match BrowseCollectionRecord type
    const transformedResults: Array<BrowseCollectionRecord> = results.map((row) => ({
      collection: {
        commentCount: row.commentCount,
        coverImageUrl: row.coverImageUrl,
        createdAt: row.createdAt,
        deletedAt: null,
        description: row.description,
        id: row.id,
        isPublic: row.isPublic,
        lastItemAddedAt: row.lastItemAddedAt,
        likeCount: row.likeCount,
        name: row.name,
        slug: row.slug,
        totalItems: row.totalItems,
        totalValue: row.totalValue,
        updatedAt: row.updatedAt,
        userId: row.userId,
      },
      firstBobbleheadPhoto: row.firstBobbleheadPhoto,
      owner: {
        avatarUrl: row.avatarUrl,
        id: row.ownerId,
        username: row.ownerUsername,
      },
    }));

    return {
      collections: transformedResults,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  static async getBrowseCollectionsAsync(
    input: BrowseCollectionsInput,
    context: QueryContext,
  ): Promise<BrowseCollectionsResult> {
    const dbInstance = this.getDbInstance(context);

    // extract input parameters with defaults
    const filters = input.filters;
    const sort = input.sort;
    const pagination = input.pagination;

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 12;
    const sortBy = sort?.sortBy ?? 'createdAt';
    const sortOrder = sort?.sortOrder ?? 'desc';

    // build permission filter - only public collections OR collections owned by current user
    const permissionFilter = this.buildBaseFilters(
      collections.isPublic,
      collections.userId,
      undefined,
      context,
    );

    // build search filter for collection name and description
    const searchFilter =
      filters?.query ?
        or(
          ilike(collections.name, `%${filters.query}%`),
          ilike(collections.description, `%${filters.query}%`),
        )
      : undefined;

    // build category filter
    const categoryFilter = filters?.categoryId ? eq(collections.id, filters.categoryId) : undefined;

    // build owner filter
    const ownerFilter = filters?.ownerId ? eq(collections.userId, filters.ownerId) : undefined;

    // build date range filters
    const dateFromFilter = filters?.dateFrom ? gte(collections.createdAt, filters.dateFrom) : undefined;
    const dateToFilter = filters?.dateTo ? lte(collections.createdAt, filters.dateTo) : undefined;

    // combine all filters
    const whereConditions = this.combineFilters(
      permissionFilter,
      searchFilter,
      categoryFilter,
      ownerFilter,
      dateFromFilter,
      dateToFilter,
    );

    // build sort order
    const orderByClause = this._getBrowseSortOrder(sortBy, sortOrder);

    // calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // get total count for pagination metadata
    const countQuery = dbInstance
      .select({ count: sql<number>`count(*)::int` })
      .from(collections)
      .where(whereConditions);

    const countResult = await countQuery;
    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // main query with joins for owner info, first bobblehead photo, and follower count
    const results = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        commentCount: collections.commentCount,
        coverImageUrl: collections.coverImageUrl,
        createdAt: collections.createdAt,
        description: collections.description,
        firstBobbleheadPhoto: sql<null | string>`(
          SELECT ${bobbleheadPhotos.url}
          FROM ${bobbleheadCollections}
          INNER JOIN ${bobbleheads} ON ${bobbleheadCollections.bobbleheadId} = ${bobbleheads.id}
          LEFT JOIN ${bobbleheadPhotos} ON ${bobbleheads.id} = ${bobbleheadPhotos.bobbleheadId}
            AND ${bobbleheadPhotos.isPrimary} = true
          WHERE ${bobbleheadCollections.collectionId} = ${collections.id}
            AND ${bobbleheads.deletedAt} IS NULL
          ORDER BY ${bobbleheadCollections.createdAt} ASC
          LIMIT 1
        )`,
        id: collections.id,
        isPublic: collections.isPublic,
        lastItemAddedAt: collections.lastItemAddedAt,
        likeCount: collections.likeCount,
        name: collections.name,
        ownerId: users.id,
        ownerUsername: users.username,
        slug: collections.slug,
        totalItems: collections.totalItems,
        totalValue: collections.totalValue,
        updatedAt: collections.updatedAt,
        userId: collections.userId,
        username: users.username,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id))
      .where(whereConditions)
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // transform results to match BrowseCollectionRecord type
    const transformedResults: Array<BrowseCollectionRecord> = results.map((row) => ({
      collection: {
        commentCount: row.commentCount,
        coverImageUrl: row.coverImageUrl,
        createdAt: row.createdAt,
        deletedAt: null,
        description: row.description,
        id: row.id,
        isPublic: row.isPublic,
        lastItemAddedAt: row.lastItemAddedAt,
        likeCount: row.likeCount,
        name: row.name,
        slug: row.slug,
        totalItems: row.totalItems,
        totalValue: row.totalValue,
        updatedAt: row.updatedAt,
        userId: row.userId,
      },
      firstBobbleheadPhoto: row.firstBobbleheadPhoto,
      owner: {
        avatarUrl: row.avatarUrl,
        id: row.ownerId,
        username: row.ownerUsername,
      },
    }));

    return {
      collections: transformedResults,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
      },
    };
  }

  static async getCollectionBobbleheadsWithPhotosAsync(
    collectionId: string,
    context: QueryContext,
    options?: { searchTerm?: string; sortBy?: string },
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: string;
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
      .innerJoin(bobbleheadCollections, eq(bobbleheads.id, bobbleheadCollections.bobbleheadId))
      .innerJoin(collections, eq(bobbleheadCollections.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        this.combineFilters(
          eq(bobbleheadCollections.collectionId, collectionId),
          collectionFilter,
          bobbleheadFilter,
          searchCondition,
        ),
      )
      .orderBy(sortOrder);
  }

  static async getCollectionCountAsync(context: QueryContext): Promise<number> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({ count: count() })
      .from(collections)
      .where(buildSoftDeleteFilter(collections.deletedAt, context))
      .then((result) => result[0]?.count || 0);

    return result;
  }

  /**
   * get collection metadata for SEO and social sharing
   * returns minimal fields needed for metadata generation with owner info
   */
  static async getCollectionMetadata(
    slug: string,
    userId: string,
    context: QueryContext,
  ): Promise<null | {
    coverImage: null | string;
    description: null | string;
    isPublic: boolean;
    itemCount: number;
    name: string;
    owner: {
      username: string;
    };
    slug: string;
  }> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        coverImage: collections.coverImageUrl,
        description: collections.description,
        isPublic: collections.isPublic,
        itemCount: collections.totalItems,
        name: collections.name,
        ownerUsername: users.username,
        slug: collections.slug,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id))
      .where(
        this.combineFilters(
          eq(collections.slug, slug),
          eq(collections.userId, userId),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .limit(1);

    if (!result[0]) {
      return null;
    }

    const row = result[0];

    return {
      coverImage: row.coverImage,
      description: row.description,
      isPublic: row.isPublic,
      itemCount: row.itemCount,
      name: row.name,
      owner: {
        username: row.ownerUsername,
      },
      slug: row.slug,
    };
  }

  static async getDashboardDataAsync(
    userId: string,
    context: QueryContext,
  ): Promise<Array<CollectionWithRelations>> {
    const dbInstance = this.getDbInstance(context);

    // get user's collections with all relations for dashboard through junction table
    const collectionsResult = await dbInstance.query.collections.findMany({
      orderBy: [sql`lower(${collections.name}) asc`],
      where: eq(collections.userId, userId),
      with: {
        bobbleheadCollections: {
          columns: {},
          with: {
            bobblehead: {
              columns: {
                deletedAt: true,
                id: true,
                isFeatured: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    // transform junction table results to match expected structure and filter out deleted bobbleheads
    return collectionsResult.map((collection) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bobbleheadCollections = collection.bobbleheadCollections as Array<any>;
      const bobbleheads = bobbleheadCollections
        .map(
          (bc: {
            bobblehead: null | { deletedAt: Date | null; id: string; isFeatured: boolean; updatedAt: Date };
          }) => bc.bobblehead,
        )
        .filter(
          (b): b is NonNullable<typeof b> => b !== null && b.deletedAt === null,
        );

      const transformedCollection: CollectionWithRelations = {
        ...collection,
        bobbleheads,
      };
      return transformedCollection;
    });
  }

  static async getDistinctCategoriesAsync(context: QueryContext): Promise<Array<CategoryRecord>> {
    const dbInstance = this.getDbInstance(context);

    // get distinct categories with counts from bobbleheads that belong to public collections through junction table
    const results = await dbInstance
      .selectDistinct({
        bobbleheadCount: sql<number>`COUNT(DISTINCT ${bobbleheads.id})::int`,
        category: bobbleheads.category,
        collectionCount: sql<number>`COUNT(DISTINCT ${bobbleheadCollections.collectionId})::int`,
      })
      .from(bobbleheads)
      .innerJoin(bobbleheadCollections, eq(bobbleheads.id, bobbleheadCollections.bobbleheadId))
      .innerJoin(collections, eq(bobbleheadCollections.collectionId, collections.id))
      .where(
        this.combineFilters(
          sql`${bobbleheads.category} IS NOT NULL`,
          isNull(bobbleheads.deletedAt),
          this.buildBaseFilters(collections.isPublic, collections.userId, undefined, context),
        ),
      )
      .groupBy(bobbleheads.category)
      .orderBy(sql`lower(${bobbleheads.category}) asc`);

    return results.map((row) => ({
      bobbleheadCount: row.bobbleheadCount,
      collectionCount: row.collectionCount,
      name: row.category || '',
    }));
  }

  static async updateAsync(data: UpdateCollection, userId: string, context: QueryContext) {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .update(collections)
      .set({ ...data, userId })
      .where(and(eq(collections.id, data.collectionId), eq(collections.userId, userId)))
      .returning();

    return result?.[0] || null;
  }

  private static _getBrowseSortOrder(sortBy: string, sortOrder: string) {
    const column = (() => {
      switch (sortBy) {
        case 'likeCount':
          return collections.likeCount;
        case 'name':
          return sql`lower(${collections.name})`;
        case 'createdAt':
        default:
          return collections.createdAt;
      }
    })();

    return sortOrder === 'asc' ? asc(column) : desc(column);
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

  private static _selectBobbleheadBase() {
    return {
      acquisitionDate: bobbleheads.acquisitionDate,
      acquisitionMethod: bobbleheads.acquisitionMethod,
      category: bobbleheads.category,
      characterName: bobbleheads.characterName,
      condition: bobbleheads.currentCondition,
      customFields: bobbleheads.customFields,
      description: bobbleheads.description,
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

  private static _selectBobbleheadWithPhoto() {
    return {
      ...this._selectBobbleheadBase(),
      collectionId: bobbleheadCollections.collectionId,
      collectionSlug: collections.slug,
      featurePhoto: bobbleheadPhotos.url,
    };
  }
}
