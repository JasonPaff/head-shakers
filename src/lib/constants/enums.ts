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
    TARGET_TYPE: ['bobblehead', 'collection', 'subcollection'] as const,
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
    TARGET_TYPE: ['bobblehead', 'comment', 'user', 'collection', 'subcollection'] as const,
  },
  CONTENT_VIEWS: {
    TARGET_TYPE: ['bobblehead', 'collection', 'subcollection', 'profile'] as const,
  },
  FEATURE_PLAN: {
    COMPLEXITY: ['low', 'medium', 'high'] as const,
    RISK_LEVEL: ['low', 'medium', 'high'] as const,
    STATUS: ['draft', 'refining', 'discovering', 'planning', 'completed', 'failed', 'cancelled'] as const,
  },
  FEATURED_CONTENT: {
    FEATURE_TYPE: ['homepage_banner', 'collection_of_week', 'trending', 'editor_pick'] as const,
    TYPE: ['bobblehead', 'collection', 'user'] as const,
  },
  FILE_DISCOVERY: {
    PRIORITY: ['critical', 'high', 'medium', 'low'] as const,
    STATUS: ['pending', 'processing', 'completed', 'failed'] as const,
  },
  FOLLOW: {
    TYPE: ['user', 'collection'] as const,
  },
  IMPLEMENTATION_PLAN: {
    STATUS: ['pending', 'processing', 'completed', 'failed'] as const,
  },
  LIKE: {
    TARGET_TYPE: ['bobblehead', 'collection', 'subcollection'] as const,
  },
  LOGIN: {
    METHOD: ['email', 'facebook', 'github', 'gmail', 'google'] as const,
  },
  NOTIFICATION: {
    RELATED_TYPE: ['bobblehead', 'collection', 'subcollection', 'comment', 'user'] as const,
    TYPE: ['comment', 'like', 'follow', 'mention', 'system'] as const,
  },
  PLAN_EXECUTION: {
    STEP: ['refinement', 'discovery', 'planning'] as const,
  },
  PLATFORM_SETTING: {
    VALUE_TYPE: ['string', 'number', 'boolean', 'json'] as const,
  },
  REFINEMENT: {
    STATUS: ['pending', 'processing', 'completed', 'failed'] as const,
  },
  SEARCH: {
    RESULT_TYPE: ['bobblehead', 'collection', 'subcollection', 'user'] as const,
    SORT_BY: ['relevance', 'date', 'price', 'popularity'] as const,
    SORT_ORDER: ['asc', 'desc'] as const,
  },
  USER: {
    ROLE: ['user', 'moderator', 'admin'] as const,
  },
  USER_ACTIVITY: {
    ACTION_TYPE: ['create', 'update', 'delete', 'like', 'comment', 'follow', 'unfollow', 'view'] as const,
    TARGET_TYPE: ['bobblehead', 'collection', 'subcollection', 'user', 'comment'] as const,
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
export type ContentMetricType = (typeof ENUMS.CONTENT_METRIC.TYPE)[number];
export type ContentReportReason = (typeof ENUMS.CONTENT_REPORT.REASON)[number];
export type ContentReportStatus = (typeof ENUMS.CONTENT_REPORT.STATUS)[number];
export type FeaturePlanComplexity = (typeof ENUMS.FEATURE_PLAN.COMPLEXITY)[number];
export type FeaturePlanRiskLevel = (typeof ENUMS.FEATURE_PLAN.RISK_LEVEL)[number];
export type FeaturePlanStatus = (typeof ENUMS.FEATURE_PLAN.STATUS)[number];
export type FileDiscoveryPriority = (typeof ENUMS.FILE_DISCOVERY.PRIORITY)[number];
export type FileDiscoveryStatus = (typeof ENUMS.FILE_DISCOVERY.STATUS)[number];
export type FollowType = (typeof ENUMS.FOLLOW.TYPE)[number];
export type ImplementationPlanStatus = (typeof ENUMS.IMPLEMENTATION_PLAN.STATUS)[number];
export type LikeTargetType = (typeof ENUMS.LIKE.TARGET_TYPE)[number];
export type NotificationType = (typeof ENUMS.NOTIFICATION.TYPE)[number];
export type PlanExecutionStep = (typeof ENUMS.PLAN_EXECUTION.STEP)[number];
export type PrivacyLevel = (typeof ENUMS.USER_SETTINGS.PRIVACY_LEVEL)[number];
export type RefinementStatus = (typeof ENUMS.REFINEMENT.STATUS)[number];
export type UserRole = (typeof ENUMS.USER.ROLE)[number];
export type UserTheme = (typeof ENUMS.USER_SETTINGS.THEME)[number];
