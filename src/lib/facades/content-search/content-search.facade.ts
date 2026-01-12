import type { QueryContext } from '@/lib/queries/base/query-context';
import type {
  BobbleheadPhoto,
  BobbleheadSearchResult,
  CollectionSearchResult,
  ConsolidatedSearchResults,
  PublicSearchCounts,
  PublicSearchFilterOptions,
  UserSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { TagRecord } from '@/lib/queries/tags/tags-query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { PublicSearchInput } from '@/lib/validations/public-search.validation';

import { CACHE_CONFIG, CACHE_ENTITY_TYPE, ERROR_MESSAGES, OPERATIONS } from '@/lib/constants';
import { db } from '@/lib/db';
import { BaseFacade } from '@/lib/facades/base/base-facade';
import { ContentSearchQuery } from '@/lib/queries/content-search/content-search.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

const facadeName = 'CONTENT_SEARCH_FACADE';

/**
 * search results response for bobbleheads
 */
export interface BobbleheadSearchResponse {
  bobbleheads: Array<BobbleheadSearchResultWithPhotos>;
  message: string;
}

/**
 * bobblehead search result with photos
 */
export interface BobbleheadSearchResultWithPhotos extends BobbleheadSearchResult {
  photos: Array<BobbleheadPhoto>;
}

/**
 * search results response for collections
 */
export interface CollectionSearchResponse {
  collections: Array<CollectionSearchResult>;
  message: string;
}

/**
 * Consolidated public search results for dropdown (top 5 total)
 */
export interface PublicSearchDropdownResponse {
  bobbleheads: Array<BobbleheadSearchResult>;
  collections: Array<CollectionSearchResult>;
  message: string;
  totalResults: number;
}

/**
 * Full public search results for search page with pagination
 */
export interface PublicSearchPageResponse {
  bobbleheads: Array<BobbleheadSearchResult>;
  collections: Array<CollectionSearchResult>;
  counts: PublicSearchCounts;
  message: string;
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * search results response for users
 */
export interface UserSearchResponse {
  message: string;
  users: Array<UserSearchResult>;
}

/**
 * handles all business logic and orchestration for content searching
 */
export class ContentSearchFacade extends BaseFacade {
  /**
   * Get specific bobblehead by ID for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by bobblehead ID with standard TTL.
   * Returns bobblehead with all photos and tags.
   *
   * @param id - Bobblehead ID to retrieve
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Bobblehead with photos and tags, or throws if not found
   */
  static async getBobbleheadForFeaturingAsync(
    id: string,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ bobblehead: BobbleheadSearchResultWithPhotos }> {
    return executeFacadeOperation(
      {
        data: { bobbleheadId: id },
        facade: facadeName,
        method: 'getBobbleheadForFeaturingAsync',
        operation: OPERATIONS.SEARCH.GET_BOBBLEHEAD_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        return CacheService.bobbleheads.byId(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);
            const bobblehead = await ContentSearchQuery.findBobbleheadByIdAsync(id, context);

            if (!bobblehead) {
              throw new Error(ERROR_MESSAGES.BOBBLEHEAD.NOT_FOUND_OR_NOT_PUBLIC);
            }

            // get all photos for this bobblehead
            const photos = await ContentSearchQuery.getBobbleheadPhotosByIdAsync(id, context);

            // get all tags for this bobblehead
            const tagsMap = await ContentSearchQuery.getBobbleheadTagsAsync([id], context);
            const tags = tagsMap.get(id) || [];

            return {
              bobblehead: {
                ...bobblehead,
                photos,
                tags,
              },
            };
          },
          id,
          {
            context: {
              entityId: id,
              entityType: CACHE_ENTITY_TYPE.BOBBLEHEAD,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.GET_BOBBLEHEAD_FOR_FEATURING,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadId: result.bobblehead.id,
          photosCount: result.bobblehead.photos.length,
          tagsCount: result.bobblehead.tags.length,
        }),
      },
    );
  }

  /**
   * Get a specific collection by ID for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by collection ID with standard TTL.
   * Returns collection with all tags.
   *
   * @param id - Collection ID to retrieve
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Collection with tags, or throws if not found
   */
  static async getCollectionForFeaturingAsync(
    id: string,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ collection: CollectionSearchResult }> {
    return executeFacadeOperation(
      {
        data: { collectionId: id },
        facade: facadeName,
        method: 'getCollectionForFeaturingAsync',
        operation: OPERATIONS.SEARCH.GET_COLLECTION_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        return CacheService.collections.byId(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);
            const collection = await ContentSearchQuery.findCollectionByIdAsync(id, context);

            if (!collection) {
              throw new Error(ERROR_MESSAGES.COLLECTION.NOT_FOUND_OR_NOT_PUBLIC);
            }

            // get all tags for this collection
            const tagsMap = await ContentSearchQuery.getCollectionTagsAsync([id], context);
            const tags = tagsMap.get(id) || [];

            return {
              collection: {
                ...collection,
                tags,
              },
            };
          },
          id,
          {
            context: {
              entityId: id,
              entityType: CACHE_ENTITY_TYPE.COLLECTION,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.GET_COLLECTION_FOR_FEATURING,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          collectionId: result.collection.id,
          tagsCount: result.collection.tags.length,
        }),
      },
    );
  }

  /**
   * Search across all public entity types for dropdown (unauthenticated access)
   * Returns top 5 consolidated results across collections and bobbleheads
   * Implements Redis caching with 10-minute TTL for performance optimization
   *
   * Cache behavior: Cached for 10 minutes (PUBLIC_SEARCH TTL).
   * Cache key based on query hash.
   *
   * @param query - Search text to match across entity types
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Consolidated search results with up to 5 total items
   */
  static async getPublicSearchDropdownResultsAsync(
    query: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<PublicSearchDropdownResponse> {
    return executeFacadeOperation(
      {
        data: { query },
        facade: facadeName,
        method: 'getPublicSearchDropdownResultsAsync',
        operation: OPERATIONS.SEARCH.PUBLIC_DROPDOWN,
      },
      async () => {
        // Generate cache key hash from query only (no filters for dropdown)
        const queryHash = createHashFromObject({ query });

        return CacheService.redisSearch.publicDropdown(
          async () => {
            const context = this.getPublicContext(dbInstance);

            // Get top 3 results per entity type (total max 6, but we'll limit to 5)
            const limitPerType = 3;
            const consolidated = await ContentSearchQuery.searchPublicConsolidated(
              query,
              limitPerType,
              context,
            );

            // Enrich results with tags
            const enrichedResults = await this.enrichPublicSearchResultsAsync(consolidated, context);

            // Calculate total results
            const totalResults = enrichedResults.collections.length + enrichedResults.bobbleheads.length;

            // Limit to maximum 5 total results if needed
            let collections = enrichedResults.collections;
            let bobbleheads = enrichedResults.bobbleheads;

            if (totalResults > 5) {
              // Distribute the 5 slots proportionally
              const collectionsCount = Math.min(collections.length, 3);
              const bobbleheadsCount = Math.min(bobbleheads.length, 5 - collectionsCount);

              collections = collections.slice(0, collectionsCount);
              bobbleheads = bobbleheads.slice(0, bobbleheadsCount);
            }

            const resultCount = collections.length + bobbleheads.length;

            return {
              bobbleheads,
              collections,
              message:
                resultCount > 0 ?
                  `Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}"`
                : `No results found for "${query}"`,
              totalResults: resultCount,
            };
          },
          queryHash,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.SEARCH,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.PUBLIC_DROPDOWN,
            },
            ttl: CACHE_CONFIG.TTL.PUBLIC_SEARCH, // 10 minutes
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadsCount: result.bobbleheads.length,
          collectionsCount: result.collections.length,
          totalResults: result.totalResults,
        }),
      },
    );
  }

  /**
   * Search public content with full pagination and filtering (unauthenticated access)
   * Returns paginated results with complete filtering options
   * Implements Redis caching with 10-minute TTL for frequently searched terms
   *
   * Cache behavior: Cached for 10 minutes (PUBLIC_SEARCH TTL).
   * Cache key based on query hash and filters hash.
   *
   * @param input - Search input with query, filters, and pagination
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Paginated search results with counts and metadata
   */
  static async getPublicSearchPageResultsAsync(
    input: PublicSearchInput,
    dbInstance: DatabaseExecutor = db,
  ): Promise<PublicSearchPageResponse> {
    return executeFacadeOperation(
      {
        data: { query: input.query },
        facade: facadeName,
        method: 'getPublicSearchPageResultsAsync',
        operation: OPERATIONS.SEARCH.PUBLIC_PAGE,
      },
      async () => {
        const { filters, pagination, query } = input;
        const page = pagination?.page || 1;
        const pageSize = pagination?.pageSize || 20;

        // Generate cache key hashes
        const queryHash = createHashFromObject({ query });
        const filtersHash = createHashFromObject({
          category: filters?.category,
          dateFrom: filters?.dateFrom,
          dateTo: filters?.dateTo,
          entityTypes: filters?.entityTypes,
          pagination,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
          tagIds: filters?.tagIds,
        });

        return CacheService.redisSearch.publicPage(
          async () => {
            const context = this.getPublicContext(dbInstance);
            return this.executePublicSearchAsync(query, filters, page, pageSize, context);
          },
          queryHash,
          filtersHash,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.SEARCH,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.PUBLIC_PAGE,
            },
            ttl: CACHE_CONFIG.TTL.PUBLIC_SEARCH, // 10 minutes
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          bobbleheadsCount: result.bobbleheads.length,
          collectionsCount: result.collections.length,
          page: result.pagination.page,
          totalResults: result.counts.total,
        }),
      },
    );
  }

  /**
   * Get a specific user by ID for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by user profile with standard TTL.
   *
   * @param id - User ID to retrieve
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns User data, or throws if not found
   */
  static async getUserForFeaturingAsync(
    id: string,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<{ user: UserSearchResult }> {
    return executeFacadeOperation(
      {
        data: { targetUserId: id },
        facade: facadeName,
        method: 'getUserForFeaturingAsync',
        operation: OPERATIONS.SEARCH.GET_USER_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        return CacheService.users.profile(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);
            const user = await ContentSearchQuery.findUserByIdAsync(id, context);
            if (!user) {
              throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
            }
            return { user };
          },
          id,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.USER,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.GET_USER_FOR_FEATURING,
              userId: id,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          userId: result.user.id,
          username: result.user.username,
        }),
      },
    );
  }

  /**
   * Search bobbleheads for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by search query and filters with standard TTL.
   * Returns bobbleheads with photos and tags.
   *
   * @param query - Search query text (optional)
   * @param limit - Maximum number of results
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @param includeTags - Tags that must be present (optional)
   * @param excludeTags - Tags that must not be present (optional)
   * @returns Bobbleheads with photos and tags
   */
  static async searchBobbleheadsForFeaturingAsync(
    query: string | undefined,
    limit: number,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<BobbleheadSearchResponse> {
    return executeFacadeOperation(
      {
        data: { excludeTags, includeTags, limit, query },
        facade: facadeName,
        method: 'searchBobbleheadsForFeaturingAsync',
        operation: OPERATIONS.SEARCH.BOBBLEHEADS_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        const filtersHash = createHashFromObject({ excludeTags, includeTags, limit, query });
        return CacheService.search.results(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);

            const results = await ContentSearchQuery.searchBobbleheadsAsync(
              query,
              limit,
              context,
              includeTags,
              excludeTags,
            );

            // get all photos for each bobblehead in a single query
            const bobbleheadIds = results.map((result) => result.id);
            const allPhotos = await ContentSearchQuery.getBobbleheadPhotosAsync(bobbleheadIds, context);

            // get all tags for each bobblehead in a single query
            const allTags = await ContentSearchQuery.getBobbleheadTagsAsync(bobbleheadIds, context);

            // group photos by bobblehead ID for efficient lookup
            const photosByBobblehead = this.groupPhotosByBobblehead(allPhotos);

            // enrich results with photos and tags
            const enrichedResults = results.map((result_1) => ({
              ...result_1,
              photos: photosByBobblehead.get(result_1.id) || [],
              tags: allTags.get(result_1.id) || [],
            }));

            const searchTerms = [
              query,
              ...(includeTags ? [`with tags: ${includeTags.join(', ')}`] : []),
              ...(excludeTags ? [`excluding tags: ${excludeTags.join(', ')}`] : []),
            ].filter(Boolean);

            return {
              bobbleheads: enrichedResults,
              message: `Found ${enrichedResults.length} bobbleheads matching ${searchTerms.join(' ')}`,
            };
          },
          query || '',
          'bobbleheads',
          filtersHash,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.SEARCH,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.BOBBLEHEADS_FOR_FEATURING,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultsCount: result.bobbleheads.length,
        }),
      },
    );
  }

  /**
   * Search collections for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by search query and filters with standard TTL.
   * Returns collections with tags.
   *
   * @param query - Search query text (optional)
   * @param limit - Maximum number of results
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @param includeTags - Tags that must be present (optional)
   * @param excludeTags - Tags that must not be present (optional)
   * @returns Collections with tags
   */
  static async searchCollectionsForFeaturingAsync(
    query: string | undefined,
    limit: number,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<CollectionSearchResponse> {
    return executeFacadeOperation(
      {
        data: { excludeTags, includeTags, limit, query },
        facade: facadeName,
        method: 'searchCollectionsForFeaturingAsync',
        operation: OPERATIONS.SEARCH.COLLECTIONS_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        const filtersHash = createHashFromObject({ excludeTags, includeTags, limit, query });
        return CacheService.search.results(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);
            const results = await ContentSearchQuery.searchCollectionsAsync(
              query,
              limit,
              context,
              includeTags,
              excludeTags,
            );
            // get all tags for each collection in a single query
            const collectionIds = results.map((result) => result.id);
            const allTags = await ContentSearchQuery.getCollectionTagsAsync(collectionIds, context);

            // enrich results with tags
            const enrichedResults = results.map((result_1) => ({
              ...result_1,
              tags: allTags.get(result_1.id) || [],
            }));

            const searchTerms = [
              query,
              ...(includeTags ? [`with tags: ${includeTags.join(', ')}`] : []),
              ...(excludeTags ? [`excluding tags: ${excludeTags.join(', ')}`] : []),
            ].filter(Boolean);

            return {
              collections: enrichedResults,
              message: `Found ${enrichedResults.length} collections matching ${searchTerms.join(' ')}`,
            };
          },
          query || '',
          'collections',
          filtersHash,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.SEARCH,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.COLLECTIONS_FOR_FEATURING,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultsCount: result.collections.length,
        }),
      },
    );
  }

  /**
   * Search users for featuring (admin/moderator only)
   *
   * Cache behavior: Cached by search query and filters with standard TTL.
   *
   * @param query - Search query text
   * @param limit - Maximum number of results
   * @param adminUserId - Admin user ID performing the operation
   * @param dbInstance - Database instance for transactions (defaults to db)
   * @returns Users matching the query
   */
  static async searchUsersForFeaturingAsync(
    query: string,
    limit: number,
    adminUserId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<UserSearchResponse> {
    return executeFacadeOperation(
      {
        data: { limit, query },
        facade: facadeName,
        method: 'searchUsersForFeaturingAsync',
        operation: OPERATIONS.SEARCH.USERS_FOR_FEATURING,
        userId: adminUserId,
      },
      async () => {
        const filtersHash = createHashFromObject({ limit, query });
        return CacheService.search.results(
          async () => {
            const context = this.adminContext(adminUserId, dbInstance);
            const results = await ContentSearchQuery.searchUsersAsync(query, limit, context);

            return {
              message: `Found ${results.length} users matching "${query}"`,
              users: results,
            };
          },
          query || '',
          'users',
          filtersHash,
          {
            context: {
              entityType: CACHE_ENTITY_TYPE.SEARCH,
              facade: facadeName,
              operation: OPERATIONS.SEARCH.USERS_FOR_FEATURING,
            },
          },
        );
      },
      {
        includeResultSummary: (result) => ({
          resultsCount: result.users.length,
        }),
      },
    );
  }

  /**
   * Enrich public search results with tags
   * Fetches and attaches tags to collections and bobbleheads
   *
   * @param results - Consolidated search results to enrich
   * @param context - Query context with database instance
   * @returns Enriched results with tags attached
   */
  private static async enrichPublicSearchResultsAsync(
    results: ConsolidatedSearchResults,
    context: QueryContext,
  ): Promise<ConsolidatedSearchResults> {
    // Get all IDs for tag enrichment
    const collectionIds = results.collections.map((c) => c.id);
    const bobbleheadIds = results.bobbleheads.map((b) => b.id);

    // Fetch tags for collections and bobbleheads in parallel
    const [collectionTags, bobbleheadTags] = await Promise.all([
      collectionIds.length > 0 ?
        ContentSearchQuery.getCollectionTagsAsync(collectionIds, context)
      : Promise.resolve(new Map()),
      bobbleheadIds.length > 0 ?
        ContentSearchQuery.getBobbleheadTagsAsync(bobbleheadIds, context)
      : Promise.resolve(new Map()),
    ]);

    // Attach tags to results
    const enrichedCollections: Array<CollectionSearchResult> = results.collections.map(
      (collection): CollectionSearchResult => {
        const collectionTagsList: Array<TagRecord> =
          (collectionTags.get(collection.id) as Array<TagRecord> | undefined) ?? [];
        return {
          ...collection,
          tags: collectionTagsList,
        };
      },
    );

    const enrichedBobbleheads: Array<BobbleheadSearchResult> = results.bobbleheads.map(
      (bobblehead): BobbleheadSearchResult => {
        const bobbleheadTagsList: Array<TagRecord> =
          (bobbleheadTags.get(bobblehead.id) as Array<TagRecord> | undefined) ?? [];
        return {
          ...bobblehead,
          tags: bobbleheadTagsList,
        };
      },
    );

    return {
      bobbleheads: enrichedBobbleheads,
      collections: enrichedCollections,
    };
  }

  /**
   * Execute the public search with pagination and filtering
   * Extracted helper to keep main method under 60 lines
   *
   * @param query - Search query text
   * @param filters - Optional filter parameters
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of results per page
   * @param context - Query context with database instance
   * @returns Paginated search results with counts
   */
  private static async executePublicSearchAsync(
    query: string,
    filters: PublicSearchInput['filters'],
    page: number,
    pageSize: number,
    context: QueryContext,
  ): Promise<PublicSearchPageResponse> {
    const offset = (page - 1) * pageSize;

    // Build additional filter options from filters
    const filterOptions: PublicSearchFilterOptions | undefined =
      filters?.dateFrom || filters?.dateTo || filters?.category ?
        {
          category: filters?.category,
          dateFrom: filters?.dateFrom,
          dateTo: filters?.dateTo,
        }
      : undefined;

    // Get total counts for all entity types
    const counts = await ContentSearchQuery.getSearchResultCounts(
      query,
      context,
      filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
      filterOptions,
    );

    // Determine which entity types to search based on filters
    const entityTypes = filters?.entityTypes || ['collection', 'bobblehead'];

    // Execute searches for requested entity types with pagination
    const [collections, bobbleheads] = await Promise.all([
      entityTypes.includes('collection') ?
        ContentSearchQuery.searchPublicCollections(
          query,
          pageSize,
          context,
          filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
          offset,
          filterOptions,
        )
      : Promise.resolve([]),
      entityTypes.includes('bobblehead') ?
        ContentSearchQuery.searchPublicBobbleheads(
          query,
          pageSize,
          context,
          filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
          offset,
          filterOptions,
        )
      : Promise.resolve([]),
    ]);

    // Enrich results with tags
    const enrichedResults = await this.enrichPublicSearchResultsAsync({ bobbleheads, collections }, context);

    // Calculate pagination metadata
    const totalPages = Math.ceil(counts.total / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      bobbleheads: enrichedResults.bobbleheads,
      collections: enrichedResults.collections,
      counts,
      message:
        counts.total > 0 ?
          `Found ${counts.total} result${counts.total !== 1 ? 's' : ''} for "${query}"`
        : `No results found for "${query}"`,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        page,
        pageSize,
        totalPages,
      },
    };
  }

  /**
   * Group photos by bobblehead ID for efficient lookup
   *
   * @param photos - Array of bobblehead photos
   * @returns Map of bobblehead ID to array of photos
   */
  private static groupPhotosByBobblehead(
    photos: Array<BobbleheadPhoto>,
  ): Map<string, Array<BobbleheadPhoto>> {
    const photosByBobblehead = new Map<string, Array<BobbleheadPhoto>>();

    photos.forEach((photo) => {
      if (!photosByBobblehead.has(photo.bobbleheadId)) {
        photosByBobblehead.set(photo.bobbleheadId, []);
      }
      photosByBobblehead.get(photo.bobbleheadId)?.push(photo);
    });

    return photosByBobblehead;
  }
}
