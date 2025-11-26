import { ENUMS } from '@/lib/constants/enums';

/**
 * Default values used throughout the application
 * Centralized to ensure consistency
 */
export const DEFAULTS = {
  BOBBLEHEAD: {
    COMMENT_COUNT: 0,
    CONDITION: 'excellent',
    IS_FEATURED: false,
    IS_PUBLIC: true,
    LIKE_COUNT: 0,
    SORT_ORDER: 0,
    STATUS: 'owned',
    VIEW_COUNT: 0,
  },
  BOBBLEHEAD_PHOTO: {
    IS_PRIMARY: false,
    SORT_ORDER: 0,
  },
  COLLECTION: {
    COMMENT_COUNT: 0,
    IS_PUBLIC: true,
    LIKE_COUNT: 0,
    TOTAL_ITEMS: 0,
    TOTAL_VALUE: '0.00',
  },
  COMMENT: {
    LIKE_COUNT: 0,
  },
  CONTENT_REPORT: {
    STATUS: 'pending',
  },
  FEATURED_CONTENT: {
    CONTENT_TYPE: ENUMS.FEATURED_CONTENT.TYPE[1],
    IS_ACTIVE: true,
    PRIORITY: 0,
    SORT_ORDER: 0,
  },
  NOTIFICATION: {
    IS_EMAIL_SENT: false,
    IS_READ: false,
  },
  NOTIFICATION_SETTINGS: {
    DIGEST_FREQUENCY: 'weekly',
    IS_EMAIL_NEW_COMMENTS: true,
    IS_EMAIL_NEW_FOLLOWERS: true,
    IS_EMAIL_NEW_LIKES: true,
    IS_EMAIL_PLATFORM_UPDATES: true,
    IS_EMAIL_WEEKLY_DIGEST: true,
    IS_IN_APP_FOLLOWING_UPDATES: true,
    IS_IN_APP_NEW_COMMENTS: true,
    IS_IN_APP_NEW_FOLLOWERS: true,
    IS_IN_APP_NEW_LIKES: true,
    IS_PUSH_NEW_COMMENTS: true,
    IS_PUSH_NEW_FOLLOWERS: true,
    IS_PUSH_NEW_LIKES: false,
  },
  PAGINATION: {
    LIMIT: 20,
    MAX_LIMIT: 100,
    OFFSET: 0,
  },
  SUB_COLLECTION: {
    COMMENT_COUNT: 0,
    IS_PUBLIC: true,
    ITEM_COUNT: 0,
    LIKE_COUNT: 0,
    SORT_ORDER: 0,
  },
  SYSTEM: {
    CONTENT_METRIC_PRIORITY: 0,
    CONTENT_METRIC_VIEW_COUNT: 0,
  },
  TAG: {
    COLOR: '#3B82F6',
    USAGE_COUNT: 0,
  },
  USER: {
    FAILED_LOGIN_ATTEMPTS: 0,
    IS_VERIFIED: false,
    LANGUAGE: 'en',
    ROLE: 'user',
    THEME: 'light',
  },
  USER_SETTINGS: {
    ALLOW_COMMENTS: 'anyone',
    IS_SHOW_LOCATION: false,
    PROFILE_VISIBILITY: 'public',
  },
} as const;

// helper function to get the default value with type safety
export const getDefault = <T extends keyof typeof DEFAULTS>(entity: T, field: keyof (typeof DEFAULTS)[T]) => {
  return DEFAULTS[entity][field];
};
