/**
 * cloudinary folder path patterns and utilities
 */
export const CLOUDINARY_PATHS = {
  FOLDERS: {
    BOBBLEHEADS: 'bobbleheads',
    COLLECTIONS: 'collections',
    PROFILE: 'profile',
    TEMP: 'temp',
    UPLOADS: 'uploads',
    USERS: 'users',
  },
  PATTERNS: {
    BOBBLEHEAD_ROOT: 'users/{userId}/collections/{collectionId}/bobbleheads/{bobbleheadId}',
    COLLECTION_COVER_PHOTOS: 'users/{userId}/collections/{collectionId}/cover',
    COLLECTION_ROOT: 'users/{userId}/collections/{collectionId}',
    PROFILE_PHOTOS: 'users/{userId}/profile',
    SUBCOLLECTION_COVER_PHOTOS: 'users/{userId}/collections/{collectionId}/subcollections/{subcollectionId}/cover',
    TEMP_UPLOADS: 'temp/uploads/{userId}',
    USER_ROOT: 'users/{userId}',
  },
  PLACEHOLDERS: {
    COLLECTION_COVER: '/images/placeholders/collection-cover-placeholder.png',
    SUBCOLLECTION_COVER: '/images/placeholders/subcollection-cover-placeholder.png',
  },
} as const;

/**
 * helper functions to build Cloudinary paths with proper formatting
 */
export const CloudinaryPathBuilder = {
  /**
   * build a path for bobblehead photos
   */
  bobbleheadPath: (userId: string, collectionId: string, bobbleheadId: string): string => {
    return `users/${userId}/collections/${collectionId}/bobbleheads/${bobbleheadId}`;
  },

  /**
   * build a path for collection cover photos
   */
  collectionCoverPath: (userId: string, collectionId: string): string => {
    return `users/${userId}/collections/${collectionId}/cover`;
  },

  /**
   * build a path for collection photos
   */
  collectionPath: (userId: string, collectionId: string): string => {
    return `users/${userId}/collections/${collectionId}`;
  },

  /**
   * build a path for user profile photos
   */
  profilePath: (userId: string): string => {
    return `users/${userId}/profile`;
  },

  /**
   * build a path for subcollection cover photos
   */
  subcollectionCoverPath: (userId: string, collectionId: string, subcollectionId: string): string => {
    return `users/${userId}/collections/${collectionId}/subcollections/${subcollectionId}/cover`;
  },

  /**
   * build a path for temporary uploads
   */
  tempPath: (userId: string): string => {
    return `temp/uploads/${userId}`;
  },

  /**
   * build a user root path
   */
  userRootPath: (userId: string): string => {
    return `users/${userId}`;
  },
};

export type CloudinaryPath = ReturnType<(typeof CloudinaryPathBuilder)[keyof typeof CloudinaryPathBuilder]>;
