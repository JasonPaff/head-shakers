/**
 * Database schema field limits and constraints
 * Single source of truth for all field length limits
 */
export const SCHEMA_LIMITS = {
  BOBBLEHEAD: {
    ACQUISITION_METHOD: { MAX: 50 },
    CATEGORY: { MAX: 50 },
    CHARACTER_NAME: { MAX: 100 },
    CURRENT_CONDITION: { MAX: 20 },
    DESCRIPTION: { MAX: 500 },
    HEIGHT: { PRECISION: 5, SCALE: 2 },
    MANUFACTURER: { MAX: 100 },
    MATERIAL: { MAX: 100 },
    NAME: { MAX: 50, MIN: 1 },
    PURCHASE_LOCATION: { MAX: 100 },
    PURCHASE_PRICE: { PRECISION: 10, SCALE: 2 },
    SERIES: { MAX: 100 },
    STATUS: { MAX: 20 },
    WEIGHT: { PRECISION: 6, SCALE: 2 },
  },
  BOBBLEHEAD_PHOTO: {
    ALT_TEXT: { MAX: 255 },
    CAPTION: { MAX: 500 },
    URL: { MAX: 500, MIN: 1 },
  },
  COLLECTION: {
    COVER_IMAGE_URL: { MAX: 500 },
    DESCRIPTION: { MAX: 500 },
    NAME: { MAX: 50, MIN: 1 },
    TOTAL_VALUE: { PRECISION: 15, SCALE: 2 },
  },
  COMMENT: {
    CONTENT: { MAX: 5000, MIN: 1 },
  },
  CONTENT_REPORT: {
    DESCRIPTION: { MAX: 1000 },
    MODERATOR_NOTES: { MAX: 2000 },
    REASON: { MAX: 100 },
  },
  CONTENT_VIEW: {
    IP_ADDRESS: { MAX: 45 },
    REFERRER_URL: { MAX: 500 },
    USER_AGENT: { MAX: 1000, MIN: 1 },
  },
  FEATURE_PLAN: {
    ESTIMATED_DURATION: { MAX: 50 },
    ORIGINAL_REQUEST: { MAX: 5000, MIN: 10 },
    SESSION_ID: { MAX: 255 },
  },
  FEATURED_CONTENT: {
    CURATOR_NOTES: { MAX: 2000 },
    DESCRIPTION: { MAX: 5000, MIN: 10 },
    TITLE: { MAX: 255, MIN: 10 },
  },
  FILE_DISCOVERY: {
    DESCRIPTION: { MAX: 5000 },
    FILE_PATH: { MAX: 500 },
    FILE_TYPE: { MAX: 50 },
    INTEGRATION_POINT: { MAX: 1000 },
    REASONING: { MAX: 5000 },
    ROLE: { MAX: 100 },
  },
  LOGIN_HISTORY: {
    FAILURE_REASON: { MAX: 255 },
    IP_ADDRESS: { MAX: 50 },
    USER_AGENT: { MAX: 1000 },
  },
  NOTIFICATION: {
    TITLE: { MAX: 255, MIN: 1 },
  },
  PLAN_EXECUTION: {
    AGENT_MODEL: { MAX: 50 },
    AGENT_TYPE: { MAX: 100 },
    PARENT_TOOL_USE_ID: { MAX: 255 },
    SESSION_ID: { MAX: 255 },
  },
  PLAN_STEP: {
    CATEGORY: { MAX: 50 },
    CONFIDENCE_LEVEL: { MAX: 20 },
    ESTIMATED_DURATION: { MAX: 50 },
    TITLE: { MAX: 255 },
  },
  PLAN_STEP_TEMPLATE: {
    CATEGORY: { MAX: 50 },
    CONFIDENCE_LEVEL: { MAX: 20 },
    DESCRIPTION: { MAX: 1000 },
    ESTIMATED_DURATION: { MAX: 50 },
    NAME: { MAX: 100 },
    TITLE: { MAX: 255 },
  },
  PLATFORM_SETTING: {
    KEY: { MAX: 100, MIN: 1 },
  },
  REFINEMENT: {
    AGENT_ID: { MAX: 100 },
    AGENT_MODEL: { MAX: 50 },
    MAX_OUTPUT_LENGTH: { MAX: 1000, MIN: 100 },
    MIN_OUTPUT_LENGTH: { MAX: 500, MIN: 50 },
  },
  SEARCH_QUERY: {
    IP_ADDRESS: { MAX: 50 },
    QUERY: { MAX: 500, MIN: 1 },
  },
  SUB_COLLECTION: {
    DESCRIPTION: { MAX: 1000 },
    NAME: { MAX: 100, MIN: 1 },
  },
  TAG: {
    COLOR: { LENGTH: 7 }, // Hex color format
    NAME: { MAX: 50, MIN: 1 },
  },
  USER: {
    AVATAR_URL: { MAX: 100 },
    BIO: { MAX: 500 },
    CLERK_ID: { MAX: 255 },
    DISPLAY_NAME: { MAX: 100, MIN: 1 },
    EMAIL: { MAX: 255 },
    LOCATION: { MAX: 100 },
    USERNAME: { MAX: 50, MIN: 3 },
  },
  USER_ACTIVITY: {
    IP_ADDRESS: { MAX: 45 },
    USER_AGENT: { MAX: 1000 },
  },
  USER_BLOCK: {
    REASON: { MAX: 100 },
  },
  USER_SESSION: {
    IP_ADDRESS: { MAX: 50 },
    SESSION_TOKEN: { MAX: 255 },
    USER_AGENT: { MAX: 1000 },
  },
  USER_SETTINGS: {
    CURRENCY: { LENGTH: 3 },
    DEFAULT_ITEM_PRIVACY: { MAX: 20 },
    LANGUAGE: { MAX: 10, MIN: 2 },
    TIMEZONE: { MAX: 50, MIN: 3 },
  },
} as const;

export type SchemaLimits = typeof SCHEMA_LIMITS;
