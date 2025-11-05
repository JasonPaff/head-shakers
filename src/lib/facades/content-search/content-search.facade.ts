import type {
  BobbleheadPhoto,
  BobbleheadSearchResult,
  CollectionSearchResult,
  ConsolidatedSearchResults,
  PublicSearchCounts,
  SubcollectionSearchResult,
  UserSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { TagRecord } from '@/lib/queries/tags/tags-query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { PublicSearchInput } from '@/lib/validations/public-search.validation';

import { CACHE_CONFIG, ERROR_MESSAGES } from '@/lib/constants';
import { createAdminQueryContext, createPublicQueryContext } from '@/lib/queries/base/query-context';
import { ContentSearchQuery } from '@/lib/queries/content-search/content-search.query';
import { CacheService } from '@/lib/services/cache.service';
import { createHashFromObject } from '@/lib/utils/cache.utils';

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
  subcollections: Array<SubcollectionSearchResult>;
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
  subcollections: Array<SubcollectionSearchResult>;
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
export class ContentSearchFacade {
  /**
   * get specific bobblehead by ID for featuring (admin/moderator only)
   */
  static async getBobbleheadForFeaturing(
    id: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ bobblehead: BobbleheadSearchResultWithPhotos }> {
    return CacheService.bobbleheads.byId(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });
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
          entityType: 'bobblehead',
          facade: 'ContentSearchFacade',
          operation: 'getBobbleheadForFeaturing',
        },
      },
    );
  }

  /**
   * get a specific collection by ID for featuring (admin/moderator only)
   */
  static async getCollectionForFeaturing(
    id: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ collection: CollectionSearchResult }> {
    return CacheService.collections.byId(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });
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
          entityType: 'collection',
          facade: 'ContentSearchFacade',
          operation: 'getCollectionForFeaturing',
        },
      },
    );
  }

  /**
   * Search across all public entity types for dropdown (unauthenticated access)
   * Returns top 5 consolidated results across collections, subcollections, and bobbleheads
   * Implements Redis caching with 10-minute TTL for performance optimization
   *
   * @param query - Search text to match across entity types
   * @param dbInstance - Optional database instance for transactions
   * @returns Consolidated search results with up to 5 total items
   */
  static async getPublicSearchDropdownResults(
    query: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<PublicSearchDropdownResponse> {
    // Generate cache key hash from query only (no filters for dropdown)
    const queryHash = createHashFromObject({ query });

    return CacheService.redisSearch.publicDropdown(
      async () => {
        const context = createPublicQueryContext({ dbInstance });

        // Get top 2 results per entity type (total max 6, but we'll limit to 5)
        const limitPerType = 2;
        const consolidated = await ContentSearchQuery.searchPublicConsolidated(query, limitPerType, context);

        // Enrich results with tags
        const enrichedResults = await this.enrichPublicSearchResults(consolidated, context);

        // Calculate total results
        const totalResults =
          enrichedResults.collections.length +
          enrichedResults.subcollections.length +
          enrichedResults.bobbleheads.length;

        // Limit to maximum 5 total results if needed
        let collections = enrichedResults.collections;
        let subcollections = enrichedResults.subcollections;
        let bobbleheads = enrichedResults.bobbleheads;

        if (totalResults > 5) {
          // Distribute the 5 slots proportionally
          const collectionsCount = Math.min(collections.length, 2);
          const subcollectionsCount = Math.min(subcollections.length, 2);
          const bobbleheadsCount = Math.min(bobbleheads.length, 5 - collectionsCount - subcollectionsCount);

          collections = collections.slice(0, collectionsCount);
          subcollections = subcollections.slice(0, subcollectionsCount);
          bobbleheads = bobbleheads.slice(0, bobbleheadsCount);
        }

        const resultCount = collections.length + subcollections.length + bobbleheads.length;

        return {
          bobbleheads,
          collections,
          message:
            resultCount > 0 ?
              `Found ${resultCount} result${resultCount !== 1 ? 's' : ''} for "${query}"`
            : `No results found for "${query}"`,
          subcollections,
          totalResults: resultCount,
        };
      },
      queryHash,
      {
        context: {
          entityType: 'search',
          facade: 'ContentSearchFacade',
          operation: 'getPublicSearchDropdownResults',
        },
        ttl: CACHE_CONFIG.TTL.PUBLIC_SEARCH, // 10 minutes
      },
    );
  }

  /**
   * Search public content with full pagination and filtering (unauthenticated access)
   * Returns paginated results with complete filtering options
   * Implements Redis caching with 10-minute TTL for frequently searched terms
   *
   * @param input - Search input with query, filters, and pagination
   * @param dbInstance - Optional database instance for transactions
   * @returns Paginated search results with counts and metadata
   */
  static async getPublicSearchPageResults(
    input: PublicSearchInput,
    dbInstance?: DatabaseExecutor,
  ): Promise<PublicSearchPageResponse> {
    const { filters, pagination, query } = input;
    const page = pagination?.page || 1;
    const pageSize = pagination?.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Generate cache key hashes from query and filter parameters
    const queryHash = createHashFromObject({ query });
    const filtersHash = createHashFromObject({ filters, pagination });

    return CacheService.redisSearch.publicPage(
      async () => {
        const context = createPublicQueryContext({ dbInstance });

        // Get total counts for all entity types
        const counts = await ContentSearchQuery.getSearchResultCounts(
          query,
          context,
          filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
        );

        // Determine which entity types to search based on filters
        const entityTypes = filters?.entityTypes || ['collection', 'subcollection', 'bobblehead'];

        // Execute searches for requested entity types with pagination
        const [collections, subcollections, bobbleheads] = await Promise.all([
          entityTypes.includes('collection') ?
            ContentSearchQuery.searchPublicCollections(
              query,
              pageSize,
              context,
              filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
              offset,
            )
          : Promise.resolve([]),
          entityTypes.includes('subcollection') ?
            ContentSearchQuery.searchPublicSubcollections(
              query,
              pageSize,
              context,
              filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
              offset,
            )
          : Promise.resolve([]),
          entityTypes.includes('bobblehead') ?
            ContentSearchQuery.searchPublicBobbleheads(
              query,
              pageSize,
              context,
              filters?.tagIds && filters.tagIds.length > 0 ? filters.tagIds : undefined,
              offset,
            )
          : Promise.resolve([]),
        ]);

        // Enrich results with tags
        const enrichedResults = await this.enrichPublicSearchResults(
          { bobbleheads, collections, subcollections },
          context,
        );

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
          subcollections: enrichedResults.subcollections,
        };
      },
      queryHash,
      filtersHash,
      {
        context: {
          entityType: 'search',
          facade: 'ContentSearchFacade',
          operation: 'getPublicSearchPageResults',
        },
        ttl: CACHE_CONFIG.TTL.PUBLIC_SEARCH, // 10 minutes
      },
    );
  }

  /**
   * get a specific user by ID for featuring (admin/moderator only)
   */
  static async getUserForFeaturing(
    id: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ user: UserSearchResult }> {
    return CacheService.users.profile(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });
        const user = await ContentSearchQuery.findUserByIdAsync(id, context);
        if (!user) {
          throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
        }
        return { user };
      },
      id,
      {
        context: {
          entityType: 'user',
          facade: 'ContentSearchFacade',
          operation: 'getUserForFeaturing',
          userId: id,
        },
      },
    );
  }

  /**
   * search bobbleheads for featuring (admin/moderator only)
   */
  static async searchBobbleheadsForFeaturing(
    query: string | undefined,
    limit: number,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<BobbleheadSearchResponse> {
    const filtersHash = createHashFromObject({ excludeTags, includeTags, limit, query });
    return CacheService.search.results(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });

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
          entityType: 'search',
          facade: 'ContentSearchFacade',
          operation: 'searchBobbleheadsForFeaturing',
        },
      },
    );
  }

  /**
   * search collections for featuring (admin/moderator only)
   */
  static async searchCollectionsForFeaturing(
    query: string | undefined,
    limit: number,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
    includeTags?: Array<string>,
    excludeTags?: Array<string>,
  ): Promise<CollectionSearchResponse> {
    const filtersHash = createHashFromObject({ excludeTags, includeTags, limit, query });
    return CacheService.search.results(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });
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
          entityType: 'search',
          facade: 'ContentSearchFacade',
          operation: 'searchCollectionsForFeaturing',
        },
      },
    );
  }

  /**
   * search users for featuring (admin/moderator only)
   */
  static async searchUsersForFeaturing(
    query: string,
    limit: number,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<UserSearchResponse> {
    const filtersHash = createHashFromObject({ limit, query });
    return CacheService.search.results(
      async () => {
        const context = createAdminQueryContext(adminUserId, { dbInstance });
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
          entityType: 'search',
          facade: 'ContentSearchFacade',
          operation: 'searchUsersForFeaturing',
        },
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
  private static async enrichPublicSearchResults(
    results: ConsolidatedSearchResults,
    context: ReturnType<typeof createPublicQueryContext>,
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
      subcollections: results.subcollections,
    };
  }

  /**
   * group photos by bobblehead ID for efficient lookup
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
