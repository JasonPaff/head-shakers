/**
 * Enum definitions used throughout the application
 * Centralized for consistency and type safety
 */

/**
 * Maximum allowed depth for nested comments
 * Balances functionality with UI usability - deeper nesting becomes difficult to read on smaller screens
 */
export const MAX_COMMENT_NESTING_DEPTH = 5;

export const ENUMS = {
  BOBBLEHEAD: {
    CONDITION: ['mint', 'excellent', 'good', 'fair', 'poor'] as const,
    STATUS: ['owned', 'sold', 'wishlist'] as const,
  },
  COMMENT: {
    TARGET_TYPE: ['bobblehead', 'collection'] as const,
  },
  CONTENT_METRIC: {
    TYPE: ['view', 'like', 'comment', 'share'] as const,
  },
  CONTENT_REPORT: {
    REASON: [
      'spam',
      'harassment',
      'inappropriate_content',
      'copyright_violation',
      'misinformation',
      'hate_speech',
      'violence',
      'other',
    ] as const,
    STATUS: ['pending', 'reviewed', 'resolved', 'dismissed'] as const,
    TARGET_TYPE: ['bobblehead', 'comment', 'user', 'collection'] as const,
  },
  CONTENT_VIEWS: {
    TARGET_TYPE: ['bobblehead', 'collection', 'profile'] as const,
  },
  FEATURED_CONTENT: {
    FEATURE_TYPE: ['homepage_banner', 'collection_of_week', 'trending', 'editor_pick'] as const,
    TYPE: ['bobblehead', 'collection', 'user'] as const,
  },
  LIKE: {
    TARGET_TYPE: ['bobblehead', 'collection'] as const,
  },
  LOGIN: {
    METHOD: ['email', 'facebook', 'github', 'gmail', 'google'] as const,
  },
  SEARCH: {
    RESULT_TYPE: ['bobblehead', 'collection', 'user'] as const,
    SORT_BY: ['relevance', 'date', 'price', 'popularity'] as const,
    SORT_ORDER: ['asc', 'desc'] as const,
    VIEW_MODE: ['grid', 'list'] as const,
  },
  USER: {
    ROLE: ['user', 'moderator', 'admin'] as const,
  },
  USER_SETTINGS: {
    COMMENT_PERMISSION: ['anyone', 'followers', 'none'] as const,
    PRIVACY_LEVEL: ['public', 'followers', 'private'] as const,
    THEME: ['light', 'dark', 'auto'] as const,
  },
} as const;

// type helpers for enum values
export type BobbleheadCondition = (typeof ENUMS.BOBBLEHEAD.CONDITION)[number];
export type BobbleheadStatus = (typeof ENUMS.BOBBLEHEAD.STATUS)[number];
export type CommentTargetType = (typeof ENUMS.COMMENT.TARGET_TYPE)[number];
export type ContentMetricType = (typeof ENUMS.CONTENT_METRIC.TYPE)[number];
export type ContentReportReason = (typeof ENUMS.CONTENT_REPORT.REASON)[number];
export type ContentReportStatus = (typeof ENUMS.CONTENT_REPORT.STATUS)[number];
export type LikeTargetType = (typeof ENUMS.LIKE.TARGET_TYPE)[number];
export type PrivacyLevel = (typeof ENUMS.USER_SETTINGS.PRIVACY_LEVEL)[number];
export type SearchViewMode = (typeof ENUMS.SEARCH.VIEW_MODE)[number];
export type UserRole = (typeof ENUMS.USER.ROLE)[number];
export type UserTheme = (typeof ENUMS.USER_SETTINGS.THEME)[number];

// helper function to get enum values
export const getEnumValues = <T extends keyof typeof ENUMS>(category: T): (typeof ENUMS)[T] => {
  return ENUMS[category];
};

// helper function to check if value is valid enum
export const isValidEnum = <T extends Readonly<Array<string>>>(
  enumArray: T,
  value: string,
): value is T[number] => {
  return enumArray.includes(value as T[number]);
};
