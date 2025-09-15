import type {
  BobbleheadPhoto,
  BobbleheadSearchResult,
  CollectionSearchResult,
  UserSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { ERROR_MESSAGES } from '@/lib/constants';
import { createAdminQueryContext } from '@/lib/queries/base/query-context';
import { ContentSearchQuery } from '@/lib/queries/content-search/content-search.query';

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
  }

  /**
   * get a specific collection by ID for featuring (admin/moderator only)
   */
  static async getCollectionForFeaturing(
    id: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ collection: CollectionSearchResult }> {
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
  }

  /**
   * get a specific user by ID for featuring (admin/moderator only)
   */
  static async getUserForFeaturing(
    id: string,
    adminUserId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{ user: UserSearchResult }> {
    const context = createAdminQueryContext(adminUserId, { dbInstance });
    const user = await ContentSearchQuery.findUserByIdAsync(id, context);

    if (!user) {
      throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    return { user };
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
    const enrichedResults = results.map((result) => ({
      ...result,
      photos: photosByBobblehead.get(result.id) || [],
      tags: allTags.get(result.id) || [],
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
    const enrichedResults = results.map((result) => ({
      ...result,
      tags: allTags.get(result.id) || [],
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
    const context = createAdminQueryContext(adminUserId, { dbInstance });
    const results = await ContentSearchQuery.searchUsersAsync(query, limit, context);

    return {
      message: `Found ${results.length} users matching "${query}"`,
      users: results,
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
