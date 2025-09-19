/**
 * Sentry tags, contexts, and configuration constants
 * Centralized for consistent error tracking and monitoring
 */
export const SENTRY_TAGS = {
  ACTION: 'action',
  BOBBLEHEAD_ID: 'bobblehead_id',
  COLLECTION_ID: 'collection_id',
  COMPONENT: 'component',
  ERROR_TYPE: 'error_type',
  FEATURE: 'feature',
  OPERATION: 'operation',
  USER_ID: 'user_id',
} as const;

export const SENTRY_CONTEXTS = {
  ACTION_METADATA: 'action_metadata',
  AGGREGATE_DATA: 'aggregate_data',
  BATCH_VIEW_DATA: 'batch_view_data',
  BOBBLEHEAD_DATA: 'bobblehead_data',
  COLLECTION_DATA: 'collection_data',
  DATABASE: 'database',
  DATABASE_ERROR: 'database_error',
  ERROR_DETAILS: 'error_details',
  EXTERNAL_SERVICE: 'external_service',
  FEATURED_CONTENT_DATA: 'featured_content_data',
  INPUT_INFO: 'input_info',
  LIKE_DATA: 'like_data',
  PERFORMANCE: 'performance',
  SEARCH_DATA: 'search_data',
  SUBCOLLECTION_DATA: 'subcollection_data',
  TAG_DATA: 'tag_data',
  USER_DATA: 'user_data',
  VIEW_DATA: 'view_data',
} as const;

export const SENTRY_OPERATIONS = {
  CACHE_OPERATION: 'cache.operation',
  DATABASE_ACTION: 'db.action',
  DATABASE_QUERY: 'db.query',
  EMAIL_SEND: 'email.send',
  EXTERNAL_API: 'external.api',
  FILE_UPLOAD: 'file.upload',
  SERVER_ACTION: 'server_action',
} as const;

export const SENTRY_LEVELS = {
  DEBUG: 'debug',
  ERROR: 'error',
  FATAL: 'fatal',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const SENTRY_BREADCRUMB_CATEGORIES = {
  ACTION: 'action',
  AUTH: 'auth',
  BUSINESS_LOGIC: 'business_logic',
  DATABASE: 'database',
  EXTERNAL_SERVICE: 'external_service',
  NAVIGATION: 'navigation',
  USER_INTERACTION: 'user_interaction',
  VALIDATION: 'validation',
} as const;
