/**
 * Centralized server action names for type safety and maintainability
 */
export const ACTION_NAMES = {
  ANALYTICS: {
    TRACK_SEARCH: 'trackSearchQuery',
    TRACK_VIEW: 'trackContentView',
  },
  BOBBLEHEADS: {
    CREATE: 'createBobblehead',
    DELETE: 'deleteBobblehead',
    DELETE_PHOTO: 'deleteBobbleheadPhoto',
    UPDATE: 'updateBobblehead',
    UPLOAD_PHOTO: 'uploadBobbleheadPhoto',
  },
  COLLECTIONS: {
    CREATE: 'createCollection',
    CREATE_SUB: 'createSubCollection',
    DELETE: 'deleteCollection',
    DELETE_SUB: 'deleteSubCollection',
    UPDATE: 'updateCollection',
    UPDATE_SUB: 'updateSubCollection',
  },
  MODERATION: {
    CREATE_REPORT: 'createContentReport',
    RESOLVE_REPORT: 'resolveContentReport',
    UPDATE_REPORT: 'updateContentReport',
  },
  SOCIAL: {
    BLOCK_USER: 'blockUser',
    CREATE_COMMENT: 'createComment',
    DELETE_COMMENT: 'deleteComment',
    FOLLOW: 'followUser',
    LIKE: 'likeContent',
    UNBLOCK_USER: 'unblockUser',
    UNFOLLOW: 'unfollowUser',
    UNLIKE: 'unlikeContent',
    UPDATE_COMMENT: 'updateComment',
  },
  SYSTEM: {
    CREATE_FEATURED_CONTENT: 'createFeaturedContent',
    CREATE_NOTIFICATION: 'createNotification',
    MARK_NOTIFICATION_READ: 'markNotificationRead',
    UPDATE_FEATURED_CONTENT: 'updateFeaturedContent',
    UPDATE_PLATFORM_SETTING: 'updatePlatformSetting',
  },
  TAGS: {
    ASSIGN: 'assignTag',
    CREATE: 'createTag',
    DELETE: 'deleteTag',
    UNASSIGN: 'unassignTag',
    UPDATE: 'updateTag',
  },
  USERS: {
    DELETE_ACCOUNT: 'deleteUserAccount',
    UPDATE_NOTIFICATIONS: 'updateNotificationSettings',
    UPDATE_PROFILE: 'updateUserProfile',
    UPDATE_SETTINGS: 'updateUserSettings',
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
