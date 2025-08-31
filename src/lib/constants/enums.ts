/**
 * Enum definitions used throughout the application
 * Centralized for consistency and type safety
 */
export const ENUMS = {
  BOBBLEHEAD: {
    CONDITION: ['mint', 'excellent', 'good', 'fair', 'poor'] as const,
    STATUS: ['owned', 'sold', 'wishlist'] as const,
  },
  COMMENT: {
    TARGET_TYPE: ['bobblehead', 'collection'] as const,
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
  FOLLOW: {
    TYPE: ['user', 'collection'] as const,
  },
  LIKE: {
    TARGET_TYPE: ['bobblehead', 'collection', 'comment'] as const,
  },
  LOGIN: {
    METHOD: ['email', 'facebook', 'github', 'gmail', 'google'] as const,
  },
  NOTIFICATION: {
    RELATED_TYPE: ['bobblehead', 'collection', 'comment', 'user'] as const,
    TYPE: ['comment', 'like', 'follow', 'mention', 'system'] as const,
  },
  PLATFORM_SETTING: {
    VALUE_TYPE: ['string', 'number', 'boolean', 'json'] as const,
  },
  SEARCH: {
    RESULT_TYPE: ['bobblehead', 'collection', 'user'] as const,
    SORT_BY: ['relevance', 'date', 'price', 'popularity'] as const,
    SORT_ORDER: ['asc', 'desc'] as const,
  },
  USER_ACTIVITY: {
    ACTION_TYPE: ['create', 'update', 'delete', 'like', 'comment', 'follow', 'unfollow', 'view'] as const,
    TARGET_TYPE: ['bobblehead', 'collection', 'user', 'comment'] as const,
  },
  USER_SETTINGS: {
    COMMENT_PERMISSION: ['anyone', 'followers', 'none'] as const,
    DIGEST_FREQUENCY: ['daily', 'weekly', 'monthly', 'never'] as const,
    DM_PERMISSION: ['anyone', 'followers', 'mutual', 'none'] as const,
    PRIVACY_LEVEL: ['public', 'followers', 'private'] as const,
    THEME: ['light', 'dark', 'auto'] as const,
  },
} as const;

// type helpers for enum values
export type BobbleheadCondition = (typeof ENUMS.BOBBLEHEAD.CONDITION)[number];
export type BobbleheadStatus = (typeof ENUMS.BOBBLEHEAD.STATUS)[number];
export type CommentTargetType = (typeof ENUMS.COMMENT.TARGET_TYPE)[number];
export type ContentReportReason = (typeof ENUMS.CONTENT_REPORT.REASON)[number];
export type ContentReportStatus = (typeof ENUMS.CONTENT_REPORT.STATUS)[number];
export type FollowType = (typeof ENUMS.FOLLOW.TYPE)[number];
export type LikeTargetType = (typeof ENUMS.LIKE.TARGET_TYPE)[number];
export type NotificationType = (typeof ENUMS.NOTIFICATION.TYPE)[number];
export type PrivacyLevel = (typeof ENUMS.USER_SETTINGS.PRIVACY_LEVEL)[number];
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
