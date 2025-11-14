/**
 * Application configuration constants
 * Environment-specific and feature configuration
 */
export const CONFIG = {
  ANALYTICS: {
    BATCH_SIZE: 100,
    FLUSH_INTERVAL: 30000, // 30 seconds
    IS_TRACK_ANONYMOUS: true,
    RETENTION_DAYS: 90,
    SAMPLE_RATE: 1.0, // 100% sampling
  },
  CONTENT: {
    MAX_BOBBLEHEADS_PER_COLLECTION: 1000,
    MAX_COLLECTIONS_PER_USER: 100,
    MAX_COMMENT_DEPTH: 3,
    MAX_CUSTOM_TAGS_PER_USER: 200,
    MAX_FEATURED_CONTENT: 10,
    MAX_PHOTOS_PER_BOBBLEHEAD: 8,
    MAX_TAGS_PER_BOBBLEHEAD: 10,
  },
  DATABASE: {
    CONNECTION_POOL_SIZE: 20,
    MAX_RETRIES: 3,
    MAX_USES: 7500,
    QUERY_TIMEOUT: 30000, // 30 seconds
    RETRY_DELAY: 1000, // 1 second
    TRANSACTION_TIMEOUT: 60000, // 1 minute
  },
  EMAIL: {
    BATCH_SIZE: 50,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    TEMPLATES: {
      EMAIL_VERIFICATION: 'email-verification',
      NEW_COMMENT: 'new-comment',
      NEW_FOLLOWER: 'new-follower',
      PASSWORD_RESET: 'password-reset',
      WEEKLY_DIGEST: 'weekly-digest',
      WELCOME: 'welcome',
    },
  },
  EXTERNAL_SERVICES: {
    ABLY: {
      MAX_RETRIES: 2,
      TIMEOUT: 5000, // 5 seconds
    },
    CLOUDINARY: {
      MAX_RETRIES: 2,
      TIMEOUT: 30000, // 30 seconds
    },
    RESEND: {
      MAX_RETRIES: 3,
      TIMEOUT: 10000, // 10 seconds
    },
  },
  FEATURES: {
    IS_ENABLE_ADVANCED_SEARCH: true,
    IS_ENABLE_ANALYTICS: true,
    IS_ENABLE_COMMENTS: true,
    IS_ENABLE_CONTENT_MODERATION: true,
    IS_ENABLE_EMAIL_NOTIFICATIONS: true,
    IS_ENABLE_FOLLOWS: true,
    IS_ENABLE_LIKES: true,
    IS_ENABLE_PUSH_NOTIFICATIONS: false,
    IS_ENABLE_REAL_TIME: true,
  },
  FILE_UPLOAD: {
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    IMAGE_QUALITY: 85,
    LARGE_SIZE: { height: 900, width: 1200 },
    MAX_FILES_PER_BOBBLEHEAD: 10,
    MAX_RETRY_ATTEMPTS: 2, // maximum retry attempts for failed uploads
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    MEDIUM_SIZE: { height: 600, width: 800 },
    PHOTO_REORDER_DEBOUNCE_MS: 800, // 800ms debounce for photo reordering
    THUMBNAIL_SIZE: { height: 300, width: 300 },
  },
  PAGINATION: {
    BOBBLEHEADS: {
      DEFAULT: 24,
      MAX: 50,
    },
    COLLECTIONS: {
      DEFAULT: 12,
      MAX: 30,
    },
    COMMENTS: {
      DEFAULT: 10,
      MAX: 50,
    },
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    SEARCH_RESULTS: {
      DEFAULT: 20,
      MAX: 100,
    },
  },
  RATE_LIMITING: {
    ACTION_SPECIFIC: {
      BOBBLEHEAD_CREATE: { REQUESTS: 5, WINDOW: 60 }, // 5 creates per minute
      BOBBLEHEAD_DELETE: { REQUESTS: 10, WINDOW: 60 }, // 10 deletes per minute
      BOBBLEHEAD_UPDATE: { REQUESTS: 30, WINDOW: 60 }, // 30 updates per minute
      COLLECTION_CREATE: { REQUESTS: 10, WINDOW: 60 }, // 10 creates per minute
      COLLECTION_UPDATE: { REQUESTS: 60, WINDOW: 60 }, // 60 updates per minute
      COMMENT: { REQUESTS: 20, WINDOW: 300 }, // 20 comments per 5 minutes
      LIKE: { REQUESTS: 50, WINDOW: 300 }, // 50 likes per 5 minutes
      PHOTO_DELETE: { REQUESTS: 10, WINDOW: 60 }, // 10 photo deletes per minute
      PHOTO_REORDER: { REQUESTS: 20, WINDOW: 60 }, // 20 photo reorders per minute
      PHOTO_SET_PRIMARY: { REQUESTS: 10, WINDOW: 60 }, // 10 photo primary sets per minute
      PHOTO_UPLOAD: { REQUESTS: 5, WINDOW: 60 }, // 5 photo uploads per minute
      SEARCH: { REQUESTS: 100, WINDOW: 3600 }, // 100 searches per hour
      TAG_ADD: { REQUESTS: 30, WINDOW: 60 }, // 30 tag adds per minute
      TAG_REMOVE: { REQUESTS: 30, WINDOW: 60 }, // 30 tag removes per minute
      UPLOAD: { REQUESTS: 5, WINDOW: 300 }, // 5 uploads per 5 minutes
    },
    REQUESTS_PER_MINUTE: 10,
    WINDOW_SECONDS: 60,
  },
  REALTIME: {
    CONNECTION_TIMEOUT: 30000, // 30 seconds
    HEARTBEAT_INTERVAL: 25000, // 25 seconds
    MAX_CHANNELS_PER_USER: 50,
    MESSAGE_HISTORY_LIMIT: 100,
  },
  SEARCH: {
    DEBOUNCE_MS: 300,
    HIGHLIGHT_TAGS: ['<mark>', '</mark>'],
    MAX_QUERY_LENGTH: 500,
    MAX_SUGGESTIONS: 10,
    MIN_QUERY_LENGTH: 2,
    RESULTS_PER_PAGE: 20,
  },
  SECURITY: {
    EMAIL_VERIFICATION_EXPIRY: 86400, // 24 hours
    LOCKOUT_DURATION: 900, // 15 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    PASSWORD_RESET_EXPIRY: 3600, // 1 hour
    SESSION_TIMEOUT: 86400, // 24 hours
  },
} as const;

// helper function to get config value with type safety
export function getConfig<T extends keyof typeof CONFIG>(category: T): (typeof CONFIG)[T] {
  return CONFIG[category];
}

// environment-specific overrides
export function getEnvironmentConfig() {
  const env = process.env.NODE_ENV;

  if (env === 'development') {
    return {
      ...CONFIG,
      RATE_LIMITING: {
        ...CONFIG.RATE_LIMITING,
        REQUESTS_PER_MINUTE: 100,
      },
    };
  }

  if (env === 'test') {
    return {
      ...CONFIG,
      FEATURES: {
        ...CONFIG.FEATURES,
        IS_ENABLE_ANALYTICS: false,
        IS_ENABLE_EMAIL_NOTIFICATIONS: false,
      },
    };
  }

  return CONFIG;
}

// helper function to check if the feature is enabled
export const isFeatureEnabled = (feature: keyof typeof CONFIG.FEATURES): boolean => {
  return CONFIG.FEATURES[feature];
};
