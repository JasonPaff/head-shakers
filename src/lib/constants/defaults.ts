import { ENUMS } from '@/lib/constants/enums';

/**
 * Default values used throughout the application
 * Centralized to ensure consistency
 */
export const DEFAULTS = {
  BOBBLEHEAD: {
    COMMENT_COUNT: 0,
    CONDITION: 'excellent',
    IS_DELETED: false,
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
    IS_PUBLIC: true,
    TOTAL_ITEMS: 0,
    TOTAL_VALUE: '0.00',
  },
  COMMENT: {
    IS_DELETED: false,
    IS_EDITED: false,
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
  FOLLOW: {
    TYPE: 'user',
  },
  LOGIN_HISTORY: {
    LOGIN_METHOD: 'email',
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
  PLATFORM_SETTING: {
    IS_PUBLIC: false,
    VALUE_TYPE: 'string',
  },
  SUB_COLLECTION: {
    IS_PUBLIC: true,
    ITEM_COUNT: 0,
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
    CURRENCY: 'USD',
    DEFAULT_ITEM_PRIVACY: 'public',
    FAILED_LOGIN_ATTEMPTS: 0,
    IS_DELETED: false,
    IS_VERIFIED: false,
    LANGUAGE: 'en',
    ROLE: 'user',
    THEME: 'light',
    TIMEZONE: 'UTC',
  },
  USER_SESSION: {
    IS_ACTIVE: true,
  },
  USER_SETTINGS: {
    ALLOW_COMMENTS: 'anyone',
    ALLOW_DIRECT_MESSAGES: 'followers',
    IS_MODERATE_COMMENTS: false,
    IS_SHOW_COLLECTION_STATS: true,
    IS_SHOW_COLLECTION_VALUE: false,
    IS_SHOW_JOIN_DATE: true,
    IS_SHOW_LAST_ACTIVE: false,
    IS_SHOW_LOCATION: false,
    IS_SHOW_REAL_NAME: false,
    PROFILE_VISIBILITY: 'public',
  },
} as const;

// helper function to get the default value with type safety
export const getDefault = <T extends keyof typeof DEFAULTS>(entity: T, field: keyof (typeof DEFAULTS)[T]) => {
  return DEFAULTS[entity][field];
};
