import { and, count, eq, gte, ilike, inArray, isNull, lte, not, or, type SQL } from 'drizzle-orm';

import type { QueryContext } from '@/lib/queries/base/query-context';
import type { TagRecord } from '@/lib/queries/tags/tags-query';

import { DEFAULTS } from '@/lib/constants';
import { bobbleheadPhotos, bobbleheads, bobbleheadTags, collections, tags, users } from '@/lib/db/schema';
import { BaseQuery } from '@/lib/queries/base/base-query';

export type BobbleheadPhoto = {
  altText: null | string;
  bobbleheadId: string;
  isPrimary: boolean;
  sortOrder: number;
  url: string;
};

export type BobbleheadSearchResult = {
  category: null | string;
  characterName: null | string;
  collectionName: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  manufacturer: null | string;
  name: null | string;
  ownerName: null | string;
  ownerUsername: null | string;
  primaryPhotoUrl: null | string;
  series: null | string;
  slug: string;
  tags?: Array<TagRecord>;
  year: null | number;
};

/**
 * type definitions for search results
 */
export type CollectionSearchResult = {
  coverImageUrl: null | string;
  description: null | string;
  id: string;
  isPublic: boolean;
  name: string;
  ownerName: null | string;
  ownerUsername: null | string;
  slug: string;
  tags?: Array<TagRecord>;
  totalItems: null | number;
};

export type ConsolidatedSearchResults = {
  bobbleheads: Array<BobbleheadSearchResult>;
  collections: Array<CollectionSearchResult>;
};

export type PublicSearchCounts = {
  bobbleheads: number;
  collections: number;
  total: number;
};

/**
 * Additional filter options for public search queries
 * Supports date range and category filtering
 */
export type PublicSearchFilterOptions = {
  /** Filter by category (case-insensitive partial match) */
  category?: string;
  /** Filter results created on or after this date */
  dateFrom?: string;
  /** Filter results created on or before this date */
  dateTo?: string;
};

export type UserSearchResult = {
  avatarUrl: null | string;
  bio: null | string;
  id: string;
  location: null | string;
  username: null | string;
};

/**
 * content search domain query service
 * handles all database operations for searching content to feature
 */
export class ContentSearchQuery extends BaseQuery {
  /**
   * find bobblehead by ID for featuring
   */
  static async findBobbleheadByIdAsync(
    id: string,
    context: QueryContext,
  ): Promise<BobbleheadSearchResult | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionName: collections.name,
        description: bobbleheads.description,
        id: bobbleheads.id,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        ownerName: users.username,
        ownerUsername: users.username,
        primaryPhotoUrl: bobbleheadPhotos.url,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      )
      .where(
        and(
          eq(bobbleheads.id, id),
          eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          isNull(bobbleheads.deletedAt),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find a collection by ID for featuring
   */
  static async findCollectionByIdAsync(
    id: string,
    context: QueryContext,
  ): Promise<CollectionSearchResult | null> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        ownerName: users.username,
        ownerUsername: users.username,
        slug: collections.slug,
        totalItems: collections.totalItems,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id))
      .where(
        and(
          eq(collections.id, id),
          eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    return result[0] || null;
  }

  /**
   * find a user by ID for featuring
   */
  static async findUserByIdAsync(id: string, context: QueryContext): Promise<null | UserSearchResult> {
    const dbInstance = this.getDbInstance(context);

    const result = await dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        id: users.id,
        location: users.location,
        username: users.username,
      })
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    return result[0] || null;
  }

  /**
   * get photos for multiple bobbleheads
   */
  static async getBobbleheadPhotosAsync(
    bobbleheadIds: Array<string>,
    context: QueryContext,
  ): Promise<Array<BobbleheadPhoto>> {
    if (bobbleheadIds.length === 0) {
      return [];
    }

    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        altText: bobbleheadPhotos.altText,
        bobbleheadId: bobbleheadPhotos.bobbleheadId,
        isPrimary: bobbleheadPhotos.isPrimary,
        sortOrder: bobbleheadPhotos.sortOrder,
        url: bobbleheadPhotos.url,
      })
      .from(bobbleheadPhotos)
      .where(inArray(bobbleheadPhotos.bobbleheadId, bobbleheadIds))
      .orderBy(bobbleheadPhotos.sortOrder);
  }

  /**
   * get photos for a single bobblehead
   */
  static async getBobbleheadPhotosByIdAsync(
    id: string,
    context: QueryContext,
  ): Promise<Array<BobbleheadPhoto>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        altText: bobbleheadPhotos.altText,
        bobbleheadId: bobbleheadPhotos.bobbleheadId,
        isPrimary: bobbleheadPhotos.isPrimary,
        sortOrder: bobbleheadPhotos.sortOrder,
        url: bobbleheadPhotos.url,
      })
      .from(bobbleheadPhotos)
      .where(eq(bobbleheadPhotos.bobbleheadId, id))
      .orderBy(bobbleheadPhotos.sortOrder);
  }

  /**
   * get tags for multiple bobbleheads
   */
  static async getBobbleheadTagsAsync(
    bobbleheadIds: Array<string>,
    context: QueryContext,
  ): Promise<Map<string, Array<TagRecord>>> {
    if (bobbleheadIds.length === 0) {
      return new Map();
    }

    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        bobbleheadId: bobbleheadTags.bobbleheadId,
        color: tags.color,
        createdAt: tags.createdAt,
        id: tags.id,
        name: tags.name,
        updatedAt: tags.updatedAt,
        usageCount: tags.usageCount,
        userId: tags.userId,
      })
      .from(bobbleheadTags)
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(inArray(bobbleheadTags.bobbleheadId, bobbleheadIds))
      .orderBy(tags.name);

    // group by bobblehead ID
    const tagsByBobblehead = new Map<string, Array<TagRecord>>();
    results.forEach((result) => {
      const { bobbleheadId, ...tag } = result;
      if (!tagsByBobblehead.has(bobbleheadId)) {
        tagsByBobblehead.set(bobbleheadId, []);
      }
      tagsByBobblehead.get(bobbleheadId)?.push(tag);
    });

    return tagsByBobblehead;
  }

  /**
   * get tags for collections based on their bobbleheads
   */
  static async getCollectionTagsAsync(
    collectionIds: Array<string>,
    context: QueryContext,
  ): Promise<Map<string, Array<TagRecord>>> {
    if (collectionIds.length === 0) {
      return new Map();
    }

    const dbInstance = this.getDbInstance(context);

    const results = await dbInstance
      .select({
        collectionId: bobbleheads.collectionId,
        color: tags.color,
        createdAt: tags.createdAt,
        id: tags.id,
        name: tags.name,
        updatedAt: tags.updatedAt,
        usageCount: tags.usageCount,
        userId: tags.userId,
      })
      .from(bobbleheads)
      .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
      .innerJoin(tags, eq(bobbleheadTags.tagId, tags.id))
      .where(
        and(
          inArray(bobbleheads.collectionId, collectionIds),
          eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
          isNull(bobbleheads.deletedAt),
        ),
      )
      .orderBy(tags.name);

    // group by collection ID and deduplicate tags
    const tagsByCollection = new Map<string, Array<TagRecord>>();
    const seenTags = new Map<string, Set<string>>(); // collectionId -> set of tag IDs

    results.forEach((result) => {
      const { collectionId, ...tag } = result;

      if (!tagsByCollection.has(collectionId)) {
        tagsByCollection.set(collectionId, []);
        seenTags.set(collectionId, new Set());
      }

      const tagSet = seenTags.get(collectionId)!;
      if (!tagSet.has(tag.id)) {
        tagSet.add(tag.id);
        tagsByCollection.get(collectionId)?.push(tag);
      }
    });

    return tagsByCollection;
  }

  /**
   * Get total result counts for each entity type
   * Used for pagination and displaying total available results
   * Does not return actual results, only counts for performance
   *
   * @param query - Search text to match across all entity types
   * @param context - Query context with database instance
   * @param tagIds - Optional array of tag IDs to filter by
   * @param filterOptions - Optional additional filters (dateFrom, dateTo, category)
   */
  static async getSearchResultCounts(
    query: string,
    context: QueryContext,
    tagIds?: Array<string>,
    filterOptions?: PublicSearchFilterOptions,
  ): Promise<PublicSearchCounts> {
    const dbInstance = this.getDbInstance(context);

    // Build collection count query
    const collectionConditions: Array<SQL> = [
      eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
      isNull(users.deletedAt),
    ];

    if (query && query.trim()) {
      const textSearch = or(
        ilike(collections.name, `%${query}%`),
        ilike(collections.description, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
      );
      if (textSearch) collectionConditions.push(textSearch);
    }

    // Apply date range filters to collections
    if (filterOptions?.dateFrom) {
      collectionConditions.push(gte(collections.createdAt, new Date(filterOptions.dateFrom)));
    }
    if (filterOptions?.dateTo) {
      collectionConditions.push(lte(collections.createdAt, new Date(filterOptions.dateTo)));
    }

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        collectionConditions.push(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  eq(bobbleheadTags.tagId, tagId),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  isNull(bobbleheads.deletedAt),
                ),
              ),
          ),
        );
      }
    }

    // Build bobblehead count query
    const bobbleheadConditions: Array<SQL> = [
      eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
      isNull(bobbleheads.deletedAt),
      isNull(users.deletedAt),
    ];

    if (query && query.trim()) {
      const textSearch = or(
        ilike(bobbleheads.name, `%${query}%`),
        ilike(bobbleheads.description, `%${query}%`),
        ilike(bobbleheads.characterName, `%${query}%`),
        ilike(bobbleheads.manufacturer, `%${query}%`),
        ilike(bobbleheads.series, `%${query}%`),
        ilike(bobbleheads.category, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(collections.name, `%${query}%`),
      );
      if (textSearch) bobbleheadConditions.push(textSearch);
    }

    // Apply date range and category filters to bobbleheads
    if (filterOptions?.dateFrom) {
      bobbleheadConditions.push(gte(bobbleheads.createdAt, new Date(filterOptions.dateFrom)));
    }
    if (filterOptions?.dateTo) {
      bobbleheadConditions.push(lte(bobbleheads.createdAt, new Date(filterOptions.dateTo)));
    }
    if (filterOptions?.category) {
      bobbleheadConditions.push(ilike(bobbleheads.category, `%${filterOptions.category}%`));
    }

    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        bobbleheadConditions.push(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(eq(bobbleheadTags.tagId, tagId)),
          ),
        );
      }
    }

    // Execute count queries in parallel
    const [collectionsCountResult, bobbleheadsCountResult] = await Promise.all([
      dbInstance
        .select({ count: count() })
        .from(collections)
        .innerJoin(users, eq(collections.userId, users.id))
        .where(and(...collectionConditions)),

      dbInstance
        .select({ count: count() })
        .from(bobbleheads)
        .innerJoin(users, eq(bobbleheads.userId, users.id))
        .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
        .where(and(...bobbleheadConditions)),
    ]);

    const collectionsCount = Number(collectionsCountResult[0]?.count) || 0;
    const bobbleheadsCount = Number(bobbleheadsCountResult[0]?.count) || 0;

    return {
      bobbleheads: bobbleheadsCount,
      collections: collectionsCount,
      total: collectionsCount + bobbleheadsCount,
    };
  }

  /**
   * search bobbleheads for featuring
   */
  static async searchBobbleheadsAsync(
    query: string | undefined,
    limit: number,
    context: QueryContext,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<Array<BobbleheadSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions
    const conditions: Array<SQL> = [
      eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
      isNull(bobbleheads.deletedAt),
      isNull(users.deletedAt),
    ];

    // Add text search conditions if query is provided
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(bobbleheads.name, `%${query}%`),
        ilike(bobbleheads.description, `%${query}%`),
        ilike(bobbleheads.characterName, `%${query}%`),
        ilike(bobbleheads.manufacturer, `%${query}%`),
        ilike(bobbleheads.series, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(collections.name, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    const queryBuilder = dbInstance
      .select({
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionName: collections.name,
        description: bobbleheads.description,
        id: bobbleheads.id,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        ownerName: users.username,
        ownerUsername: users.username,
        primaryPhotoUrl: bobbleheadPhotos.url,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      );

    // Add tag filtering if includeTags or excludeTags are provided
    if (includeTags && includeTags.length > 0) {
      // For include tags, we need bobbleheads that have ALL the specified tags
      for (const tagId of includeTags) {
        conditions.push(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(eq(bobbleheadTags.tagId, tagId)),
          ),
        );
      }
    }

    if (excludeTags && excludeTags.length > 0) {
      // For exclude tags, we need bobbleheads that DON'T have ANY of the specified tags
      conditions.push(
        not(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(inArray(bobbleheadTags.tagId, excludeTags)),
          ),
        ),
      );
    }

    return queryBuilder.where(and(...conditions)).limit(limit);
  }

  /**
   * search collections for featuring
   */
  static async searchCollectionsAsync(
    query: string | undefined,
    limit: number,
    context: QueryContext,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<Array<CollectionSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions
    const conditions: Array<SQL> = [
      eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
      isNull(users.deletedAt),
    ];

    // Add text search conditions if query is provided
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(collections.name, `%${query}%`),
        ilike(collections.description, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    const queryBuilder = dbInstance
      .select({
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        ownerName: users.username,
        ownerUsername: users.username,
        slug: collections.slug,
        totalItems: collections.totalItems,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id));

    // For collections, we search based on tags of bobbleheads within the collection
    if (includeTags && includeTags.length > 0) {
      // Find collections that contain bobbleheads with ALL the specified tags
      for (const tagId of includeTags) {
        conditions.push(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  eq(bobbleheadTags.tagId, tagId),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  isNull(bobbleheads.deletedAt),
                ),
              ),
          ),
        );
      }
    }

    if (excludeTags && excludeTags.length > 0) {
      // Find collections that DON'T contain bobbleheads with ANY of the specified tags
      conditions.push(
        not(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  inArray(bobbleheadTags.tagId, excludeTags),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  isNull(bobbleheads.deletedAt),
                ),
              ),
          ),
        ),
      );
    }

    return queryBuilder.where(and(...conditions)).limit(limit);
  }

  /**
   * Search public bobbleheads for unauthenticated users
   * Uses GIN indexes on name/description fields for efficient text search
   * Searches across multiple fields including manufacturer, series, character name
   * Supports tag filtering, date range filtering, and category filtering
   *
   * @param query - Search text to match against multiple bobblehead fields
   * @param limit - Maximum number of results to return
   * @param context - Query context with database instance
   * @param tagIds - Optional array of tag IDs to filter by (include only logic)
   * @param offset - Optional offset for pagination
   * @param filterOptions - Optional additional filters (dateFrom, dateTo, category)
   */
  static async searchPublicBobbleheads(
    query: string,
    limit: number,
    context: QueryContext,
    tagIds?: Array<string>,
    offset?: number,
    filterOptions?: PublicSearchFilterOptions,
  ): Promise<Array<BobbleheadSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions - only public, non-deleted bobbleheads
    const conditions: Array<SQL> = [
      eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
      isNull(bobbleheads.deletedAt),
      isNull(users.deletedAt),
    ];

    // Add text search conditions if query is provided
    // Leverages GIN indexes: bobbleheads_name_search_idx, bobbleheads_description_search_idx
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(bobbleheads.name, `%${query}%`),
        ilike(bobbleheads.description, `%${query}%`),
        ilike(bobbleheads.characterName, `%${query}%`),
        ilike(bobbleheads.manufacturer, `%${query}%`),
        ilike(bobbleheads.series, `%${query}%`),
        ilike(bobbleheads.category, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(collections.name, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    // Apply date range and category filters
    if (filterOptions?.dateFrom) {
      conditions.push(gte(bobbleheads.createdAt, new Date(filterOptions.dateFrom)));
    }
    if (filterOptions?.dateTo) {
      conditions.push(lte(bobbleheads.createdAt, new Date(filterOptions.dateTo)));
    }
    if (filterOptions?.category) {
      conditions.push(ilike(bobbleheads.category, `%${filterOptions.category}%`));
    }

    const queryBuilder = dbInstance
      .select({
        category: bobbleheads.category,
        characterName: bobbleheads.characterName,
        collectionName: collections.name,
        description: bobbleheads.description,
        id: bobbleheads.id,
        isPublic: bobbleheads.isPublic,
        manufacturer: bobbleheads.manufacturer,
        name: bobbleheads.name,
        ownerName: users.username,
        ownerUsername: users.username,
        primaryPhotoUrl: bobbleheadPhotos.url,
        series: bobbleheads.series,
        slug: bobbleheads.slug,
        year: bobbleheads.year,
      })
      .from(bobbleheads)
      .innerJoin(users, eq(bobbleheads.userId, users.id))
      .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
      .leftJoin(
        bobbleheadPhotos,
        and(eq(bobbleheads.id, bobbleheadPhotos.bobbleheadId), eq(bobbleheadPhotos.isPrimary, true)),
      );

    // Tag filtering: find bobbleheads with ALL specified tags
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        conditions.push(
          inArray(
            bobbleheads.id,
            dbInstance
              .select({ bobbleheadId: bobbleheadTags.bobbleheadId })
              .from(bobbleheadTags)
              .where(eq(bobbleheadTags.tagId, tagId)),
          ),
        );
      }
    }

    const baseQuery = queryBuilder.where(and(...conditions)).limit(limit);

    if (offset !== undefined && offset > 0) {
      return baseQuery.offset(offset);
    }

    return baseQuery;
  }

  /**
   * Search public collections for unauthenticated users
   * Uses GIN indexes on name/description fields for efficient text search
   * Supports tag filtering via joins with bobblehead tags and date range filtering
   *
   * @param query - Search text to match against name, description, and owner information
   * @param limit - Maximum number of results to return
   * @param context - Query context with database instance
   * @param tagIds - Optional array of tag IDs to filter by (include only logic)
   * @param offset - Optional offset for pagination
   * @param filterOptions - Optional additional filters (dateFrom, dateTo)
   */
  static async searchPublicCollections(
    query: string,
    limit: number,
    context: QueryContext,
    tagIds?: Array<string>,
    offset?: number,
    filterOptions?: PublicSearchFilterOptions,
  ): Promise<Array<CollectionSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    // Build where conditions - only public collections from non-deleted users
    const conditions: Array<SQL> = [
      eq(collections.isPublic, DEFAULTS.COLLECTION.IS_PUBLIC),
      isNull(users.deletedAt),
    ];

    // Add text search conditions if query is provided
    // Leverages GIN indexes: collections_name_search_idx, collections_description_search_idx
    if (query && query.trim()) {
      const textSearchCondition = or(
        ilike(collections.name, `%${query}%`),
        ilike(collections.description, `%${query}%`),
        ilike(users.username, `%${query}%`),
        ilike(users.username, `%${query}%`),
      );
      if (textSearchCondition) {
        conditions.push(textSearchCondition);
      }
    }

    // Apply date range filters
    if (filterOptions?.dateFrom) {
      conditions.push(gte(collections.createdAt, new Date(filterOptions.dateFrom)));
    }
    if (filterOptions?.dateTo) {
      conditions.push(lte(collections.createdAt, new Date(filterOptions.dateTo)));
    }

    const queryBuilder = dbInstance
      .select({
        coverImageUrl: collections.coverImageUrl,
        description: collections.description,
        id: collections.id,
        isPublic: collections.isPublic,
        name: collections.name,
        ownerName: users.username,
        ownerUsername: users.username,
        slug: collections.slug,
        totalItems: collections.totalItems,
      })
      .from(collections)
      .innerJoin(users, eq(collections.userId, users.id));

    // Tag filtering: find collections containing bobbleheads with ALL specified tags
    if (tagIds && tagIds.length > 0) {
      for (const tagId of tagIds) {
        conditions.push(
          inArray(
            collections.id,
            dbInstance
              .select({ collectionId: bobbleheads.collectionId })
              .from(bobbleheads)
              .innerJoin(bobbleheadTags, eq(bobbleheads.id, bobbleheadTags.bobbleheadId))
              .where(
                and(
                  eq(bobbleheadTags.tagId, tagId),
                  eq(bobbleheads.isPublic, DEFAULTS.BOBBLEHEAD.IS_PUBLIC),
                  isNull(bobbleheads.deletedAt),
                ),
              ),
          ),
        );
      }
    }

    const baseQuery = queryBuilder.where(and(...conditions)).limit(limit);

    if (offset !== undefined && offset > 0) {
      return baseQuery.offset(offset);
    }

    return baseQuery;
  }

  /**
   * Search across all public entity types (collections, bobbleheads)
   * Returns consolidated results with top N from each entity type
   * Used for header dropdown instant search with limited results
   *
   * @param query - Search text to match across all entity types
   * @param limitPerType - Maximum number of results per entity type
   * @param context - Query context with database instance
   */
  static async searchPublicConsolidated(
    query: string,
    limitPerType: number,
    context: QueryContext,
  ): Promise<ConsolidatedSearchResults> {
    // Execute both searches in parallel for optimal performance
    const [collections, bobbleheads] = await Promise.all([
      this.searchPublicCollections(query, limitPerType, context),
      this.searchPublicBobbleheads(query, limitPerType, context),
    ]);

    return {
      bobbleheads,
      collections,
    };
  }

  /**
   * search users for featuring
   */
  static async searchUsersAsync(
    query: string,
    limit: number,
    context: QueryContext,
  ): Promise<Array<UserSearchResult>> {
    const dbInstance = this.getDbInstance(context);

    return dbInstance
      .select({
        avatarUrl: users.avatarUrl,
        bio: users.bio,
        id: users.id,
        location: users.location,
        username: users.username,
      })
      .from(users)
      .where(
        and(
          isNull(users.deletedAt),
          or(
            ilike(users.username, `%${query}%`),
            ilike(users.bio, `%${query}%`),
            ilike(users.location, `%${query}%`),
          ),
        ),
      )
      .limit(limit);
  }
}
