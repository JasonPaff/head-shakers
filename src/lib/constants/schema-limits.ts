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
    /**
     * Maximum depth for nested comment replies
     * Rationale: Balances functionality with UI usability
     * - Allows meaningful threaded discussions (2-3 levels typical)
     * - Prevents infinite recursion and performance issues
     * - Maintains readability on smaller screens where deep nesting is difficult to navigate
     * - Aligns with industry standards (Reddit uses 10, Twitter uses 1, HackerNews unbounded but paginated)
     * - 5 levels provides good balance between conversation depth and UI constraints
     */
    NESTING_DEPTH: { MAX: 5 },
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
  FEATURED_CONTENT: {
    CURATOR_NOTES: { MAX: 2000 },
    DESCRIPTION: { MAX: 5000, MIN: 10 },
    TITLE: { MAX: 255, MIN: 10 },
  },
  LOGIN_HISTORY: {
    FAILURE_REASON: { MAX: 255 },
    IP_ADDRESS: { MAX: 50 },
    USER_AGENT: { MAX: 1000 },
  },
  NEWSLETTER_SEND: {
    BODY_HTML: { MAX: 50000 },
    ERROR_DETAILS: { MAX: 5000 },
    SUBJECT: { MAX: 255 },
  },
  NEWSLETTER_SIGNUP: {
    EMAIL: { MAX: 255, MIN: 5 },
    USER_ID: { MAX: 255 },
  },
  NEWSLETTER_TEMPLATE: {
    BODY_HTML: { MAX: 50000 },
    BODY_MARKDOWN: { MAX: 50000 },
    SUBJECT: { MAX: 255, MIN: 1 },
    TITLE: { MAX: 200, MIN: 1 },
  },
  NOTIFICATION: {
    TITLE: { MAX: 255, MIN: 1 },
  },
  PLATFORM_SETTING: {
    KEY: { MAX: 100, MIN: 1 },
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
    AVATAR_URL: { MAX: 500 },
    BIO: { MAX: 500 },
    CLERK_ID: { MAX: 255 },
    DISPLAY_NAME: { MAX: 100, MIN: 1 },
    EMAIL: { MAX: 255 },
    LOCATION: { MAX: 100 },
    USERNAME: { MAX: 50, MIN: 3 },
    USERNAME_CHANGE_COOLDOWN_DAYS: 90,
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
