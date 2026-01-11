/**
 * Centralized server action names for type safety and maintainability
 */
export const ACTION_NAMES = {
  ADMIN: {
    BULK_UPDATE_REPORTS: 'bulkUpdateReports',
    CREATE_FEATURED_CONTENT: 'createFeaturedContent',
    DELETE_FEATURED_CONTENT: 'deleteFeaturedContent',
    GET_ADMIN_REPORTS: 'getAdminReports',
    GET_BOBBLEHEAD_FOR_FEATURING: 'getBobbleheadForFeaturing',
    GET_COLLECTION_FOR_FEATURING: 'getCollectionForFeaturing',
    GET_FEATURED_CONTENT_BY_ID: 'getFeaturedContentById',
    GET_LAUNCH_NOTIFICATION_STATS: 'getLaunchNotificationStats',
    GET_LAUNCH_NOTIFICATIONS: 'getLaunchNotifications',
    GET_REPORTS_STATS: 'getReportsStats',
    GET_USER_FOR_FEATURING: 'getUserForFeaturing',
    SEARCH_BOBBLEHEADS_FOR_FEATURING: 'searchBobbleheadsForFeaturing',
    SEARCH_COLLECTIONS_FOR_FEATURING: 'searchCollectionsForFeaturing',
    SEARCH_USERS_FOR_FEATURING: 'searchUsersForFeaturing',
    SEND_LAUNCH_NOTIFICATIONS: 'sendLaunchNotifications',
    TOGGLE_FEATURED_CONTENT: 'toggleFeaturedContent',
    TOGGLE_FEATURED_CONTENT_STATUS: 'toggleFeaturedContentStatus',
    UPDATE_FEATURED_CONTENT: 'updateFeaturedContent',
    UPDATE_REPORT_STATUS: 'updateReportStatus',
  },
  ADMIN_USERS: {
    GET_USER_DETAILS: 'getAdminUserDetails',
    GET_USER_STATS: 'getAdminUserStats',
    GET_USERS: 'getAdminUsers',
    LOCK_USER: 'lockUser',
    UNLOCK_USER: 'unlockUser',
    UPDATE_USER_ROLE: 'updateUserRole',
    VERIFY_USER_EMAIL: 'verifyUserEmail',
  },
  ANALYTICS: {
    AGGREGATE_VIEWS: 'aggregateViews',
    BATCH_RECORD_VIEWS: 'batchRecordViews',
    GET_TRENDING_CONTENT: 'getTrendingContent',
    GET_VIEW_STATS: 'getViewStats',
    TRACK_SEARCH: 'trackSearchQuery',
    TRACK_VIEW: 'trackContentView',
  },
  BOBBLEHEADS: {
    ADD_TAG: 'addTagToBobblehead',
    BATCH_UPDATE_FEATURE: 'batchUpdateBobbleheadFeature',
    CREATE: 'createBobblehead',
    DELETE: 'deleteBobblehead',
    DELETE_BULK: 'deleteBobbleheads',
    DELETE_PHOTO: 'deleteBobbleheadPhoto',
    GET_BY_COLLECTION: 'getBobbleheadsByCollection',
    GET_BY_ID: 'getBobbleheadById',
    GET_BY_USER: 'getBobbleheadsByUser',
    GET_PHOTOS_BY_BOBBLEHEAD: 'getBobbleheadPhotos',
    REMOVE_TAG: 'removeTagFromBobblehead',
    REORDER_PHOTOS: 'reorderBobbleheadPhotos',
    SEARCH: 'searchBobbleheads',
    UPDATE: 'updateBobblehead',
    UPDATE_FEATURE: 'updateBobbleheadFeature',
    UPDATE_PHOTO: 'updateBobbleheadPhoto',
    UPDATE_PHOTO_METADATA: 'updateBobbleheadPhotoMetadata',
    UPLOAD_PHOTO: 'uploadBobbleheadPhoto',
    UPLOAD_PHOTOS: 'uploadBobbleheadPhotos',
  },
  COLLECTIONS: {
    BROWSE: 'browseCollections',
    BROWSE_CATEGORIES: 'browseCategories',
    CREATE: 'createCollection',
    DELETE: 'deleteCollection',
    GET_CATEGORIES: 'getCategories',
    GET_COLLECTIONS_BY_USER: 'getCollectionsByUser',
    UPDATE: 'updateCollection',
  },
  COMMENTS: {
    CREATE: 'createComment',
    DELETE: 'deleteComment',
    GET_BY_ID: 'getCommentById',
    GET_LIST: 'getComments',
    UPDATE: 'updateComment',
  },
  MODERATION: {
    CHECK_REPORT_STATUS: 'checkContentReportStatus',
    CREATE_REPORT: 'createContentReport',
    RESOLVE_REPORT: 'resolveContentReport',
    UPDATE_REPORT: 'updateContentReport',
  },
  NEWSLETTER: {
    SUBSCRIBE: 'subscribeToNewsletter',
    UNSUBSCRIBE: 'unsubscribeFromNewsletter',
  },
  PHOTO: {
    GENERATE_UPLOAD_SIGNATURE: 'generatePhotoUploadSignature',
  },
  PUBLIC: {
    ADD_TO_LAUNCH_WAITLIST: 'addToLaunchWaitlist',
    GET_SEARCH_DROPDOWN_RESULTS: 'getPublicSearchDropdownResults',
    INCREMENT_FEATURED_VIEW_COUNT: 'incrementFeaturedViewCount',
    SEARCH_CONTENT: 'searchPublicContent',
  },
  SOCIAL: {
    BLOCK_USER: 'blockUser',
    CREATE_COMMENT: 'createComment',
    DELETE_COMMENT: 'deleteComment',
    LIKE: 'likeContent',
    UNBLOCK_USER: 'unblockUser',
    UNLIKE: 'unlikeContent',
    UPDATE_COMMENT: 'updateComment',
  },
  SYSTEM: {
    CREATE_FEATURED_CONTENT: 'createFeaturedContent',
    CREATE_NOTIFICATION: 'createNotification',
    DELETE_FEATURED_CONTENT: 'deleteFeaturedContent',
    GET_FEATURED_CONTENT: 'getFeaturedContent',
    MARK_NOTIFICATION_READ: 'markNotificationRead',
    TOGGLE_FEATURED_CONTENT_STATUS: 'toggleFeaturedContentStatus',
    UPDATE_FEATURED_CONTENT: 'updateFeaturedContent',
  },
  TAGS: {
    ASSIGN: 'assignTag',
    ATTACH_TO_BOBBLEHEAD: 'attachTagsToBobblehead',
    BULK_DELETE: 'bulkDeleteTags',
    CREATE: 'createTag',
    DELETE: 'deleteTag',
    DETACH_FROM_BOBBLEHEAD: 'detachTagsFromBobblehead',
    GET_SUGGESTIONS: 'getTagSuggestions',
    UNASSIGN: 'unassignTag',
    UPDATE: 'updateTag',
  },
  USERS: {
    CHECK_USERNAME_AVAILABILITY: 'checkUsernameAvailability',
    DELETE_ACCOUNT: 'deleteUserAccount',
    UPDATE_NOTIFICATIONS: 'updateNotificationSettings',
    UPDATE_PROFILE: 'updateUserProfile',
    UPDATE_SETTINGS: 'updateUserSettings',
    UPDATE_USERNAME: 'updateUsername',
  },
} as const;

// type helper for action names
export type ActionName =
  (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES][keyof (typeof ACTION_NAMES)[keyof typeof ACTION_NAMES]];

// helper function to get action name with type safety
export const getActionName = <T extends keyof typeof ACTION_NAMES>(
  category: T,
  action: keyof (typeof ACTION_NAMES)[T],
): string => {
  return ACTION_NAMES[category][action] as string;
};
