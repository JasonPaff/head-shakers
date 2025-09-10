import { cache } from 'react';

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
  static getBobbleheadForFeaturing = cache(
    async (
      id: string,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<{ bobblehead: BobbleheadSearchResultWithPhotos }> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const bobblehead = await ContentSearchQuery.findBobbleheadById(id, context);

      if (!bobblehead) {
        throw new Error(ERROR_MESSAGES.BOBBLEHEAD.NOT_FOUND_OR_NOT_PUBLIC);
      }

      // get all photos for this bobblehead
      const photos = await ContentSearchQuery.getBobbleheadPhotosById(id, context);

      return {
        bobblehead: {
          ...bobblehead,
          photos,
        },
      };
    },
  );

  /**
   * get a specific collection by ID for featuring (admin/moderator only)
   */
  static getCollectionForFeaturing = cache(
    async (
      id: string,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<{ collection: CollectionSearchResult }> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const collection = await ContentSearchQuery.findCollectionById(id, context);

      if (!collection) {
        throw new Error(ERROR_MESSAGES.COLLECTION.NOT_FOUND_OR_NOT_PUBLIC);
      }

      return { collection };
    },
  );

  /**
   * get a specific user by ID for featuring (admin/moderator only)
   */
  static getUserForFeaturing = cache(
    async (
      id: string,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<{ user: UserSearchResult }> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const user = await ContentSearchQuery.findUserById(id, context);

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER.NOT_FOUND);
      }

      return { user };
    },
  );

  /**
   * search bobbleheads for featuring (admin/moderator only)
   */
  static searchBobbleheadsForFeaturing = cache(
    async (
      query: string,
      limit: number,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<BobbleheadSearchResponse> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const results = await ContentSearchQuery.searchBobbleheads(query, limit, context);

      // get all photos for each bobblehead in a single query
      const bobbleheadIds = results.map((result) => result.id);
      const allPhotos = await ContentSearchQuery.getBobbleheadPhotos(bobbleheadIds, context);

      // group photos by bobblehead ID for efficient lookup
      const photosByBobblehead = this.groupPhotosByBobblehead(allPhotos);

      // enrich results with photos
      const enrichedResults = results.map((result) => ({
        ...result,
        photos: photosByBobblehead.get(result.id) || [],
      }));

      return {
        bobbleheads: enrichedResults,
        message: `Found ${enrichedResults.length} bobbleheads matching "${query}"`,
      };
    },
  );

  /**
   * search collections for featuring (admin/moderator only)
   */
  static searchCollectionsForFeaturing = cache(
    async (
      query: string,
      limit: number,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<CollectionSearchResponse> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const results = await ContentSearchQuery.searchCollections(query, limit, context);

      return {
        collections: results,
        message: `Found ${results.length} collections matching "${query}"`,
      };
    },
  );

  /**
   * search users for featuring (admin/moderator only)
   */
  static searchUsersForFeaturing = cache(
    async (
      query: string,
      limit: number,
      adminUserId: string,
      dbInstance?: DatabaseExecutor,
    ): Promise<UserSearchResponse> => {
      const context = createAdminQueryContext(adminUserId, { dbInstance });
      const results = await ContentSearchQuery.searchUsers(query, limit, context);

      return {
        message: `Found ${results.length} users matching "${query}"`,
        users: results,
      };
    },
  );

  /**
   * group photos by bobblehead ID for efficient lookup
   */
  private static groupPhotosByBobblehead(photos: Array<BobbleheadPhoto>): Map<string, Array<BobbleheadPhoto>> {
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