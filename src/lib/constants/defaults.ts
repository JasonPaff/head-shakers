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
    IS_PUBLIC: true,
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
  PAGINATION: {
    LIMIT: 20,
    MAX_LIMIT: 100,
    OFFSET: 0,
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
