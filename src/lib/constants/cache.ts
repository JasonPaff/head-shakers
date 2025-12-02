export const CACHE_CONFIG = {
  /**
   * environment-specific cache settings
   */
  ENVIRONMENT: {
    development: {
      IS_CACHE_ENABLED: true,
      IS_CACHE_LOGGING_ENABLED: false,
      TTL_MULTIPLIER: 0.2, // 20% of production TTL
    },
    edge: {
      IS_CACHE_ENABLED: true,
      IS_CACHE_LOGGING_ENABLED: false,
      TTL_MULTIPLIER: 1,
    },
    production: {
      IS_CACHE_ENABLED: true,
      IS_CACHE_LOGGING_ENABLED: false,
      TTL_MULTIPLIER: 1,
    },
    test: {
      IS_CACHE_ENABLED: false,
      IS_CACHE_LOGGING_ENABLED: false,
      TTL_MULTIPLIER: 0.01, // 1% of production TTL
    },
  },

  /**
   * cache key namespaces for a consistent organization
   */
  NAMESPACES: {
    ANALYTICS: 'analytics',
    BOBBLEHEADS: 'bobbleheads',
    COLLECTIONS: 'collections',
    FEATURED: 'featured',
    NEWSLETTER: 'newsletter',
    PLATFORM: 'platform',
    SEARCH: 'search',
    SOCIAL: 'social',
    TAGS: 'tags',
    USERS: 'users',
  },

  /**
   * cache tag patterns for efficient invalidation
   */
  TAGS: {
    // analytics tags
    ANALYTICS: 'analytics',
    // entity-based tags
    BOBBLEHEAD: (id: string) => `bobblehead:${id}`,
    BOBBLEHEAD_TAGS: (bobbleheadId: string) => `bobblehead-tags:${bobbleheadId}`,
    COLLECTION: (id: string) => `collection:${id}`,

    COLLECTION_BOBBLEHEADS: (collectionId: string) => `collection-bobbleheads:${collectionId}`,

    // feature-based tags
    FEATURED_CONTENT: 'featured-content',
    GLOBAL_STATS: 'global-stats',

    // metadata-specific tags (for SEO metadata caching only)
    METADATA_BOBBLEHEAD: (id: string) => `metadata:bobblehead:${id}`,
    METADATA_COLLECTION: (id: string) => `metadata:collection:${id}`,
    METADATA_USER: (id: string) => `metadata:user:${id}`,

    NEWSLETTER: 'newsletter',
    NEWSLETTER_SUBSCRIPTION: (email: string) => `newsletter:subscription:${email}`,
    PLATFORM_STATS: 'platform-stats',
    POPULAR_CONTENT: 'popular-content',
    PUBLIC_CONTENT: 'public-content',
    PUBLIC_SEARCH: 'public-search',

    SEARCH_RESULTS: 'search-results',
    TAG: (id: string) => `tag:${id}`,
    TRENDING: 'trending',
    USER: (id: string) => `user:${id}`,

    // relationship-based tags
    USER_BOBBLEHEADS: (userId: string) => `user-bobbleheads:${userId}`,
    USER_COLLECTIONS: (userId: string) => `user-collections:${userId}`,
    // aggregate data tags
    USER_STATS: (userId: string) => `user-stats:${userId}`,
  },

  /**
   * cache TTL configurations (in seconds)
   */
  TTL: {
    // 24-hours
    DAILY: 86400,

    // 4-hours
    EXTENDED: 14400,

    // 1-hour
    LONG: 3600,

    // 30-minute cache
    MEDIUM: 1800,

    // 10-minute cache
    PUBLIC_SEARCH: 600,

    // 30-second cache
    REALTIME: 30,

    // 5-minute cache
    SHORT: 300,

    // weekly cache
    WEEKLY: 604800,
  },
} as const;

/**
 * cache key builder patterns following consistent naming conventions
 */
export const CACHE_KEYS = {
  /**
   * analytics cache keys
   */
  ANALYTICS: {
    AGGREGATES: (targetType: string, targetId: string, period: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:aggregates:${targetType}:${targetId}:${period}`,
    ENGAGEMENT: (targetType: string, targetIds: string, optionsHash?: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:engagement:${targetType}:${targetIds}${optionsHash ? `:${optionsHash}` : ''}`,
    PERFORMANCE: (targetType: string, targetIds: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:performance:${targetType}:${targetIds}`,
    POPULAR: (entityType: string, timeframe: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:popular:${entityType}:${timeframe}`,
    RECENT_VIEWS: (targetType: string, targetId: string, limit: number) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:recent-views:${targetType}:${targetId}:${limit}`,
    TRENDING: (targetType: string, timeframe: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:trending:${targetType}:${timeframe}`,
    TRENDS: (timeframe: string) => `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:trends:${timeframe}`,
    VIEW_COUNTS: (targetType: string, targetId: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:view-counts:${targetType}:${targetId}`,
    VIEW_STATS: (targetType: string, targetId: string, timeframe: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:view-stats:${targetType}:${targetId}:${timeframe}`,
    VIEWS: (entityType: string, entityId: string, timeframe: string) =>
      `${CACHE_CONFIG.NAMESPACES.ANALYTICS}:views:${entityType}:${entityId}:${timeframe}`,
  },

  /**
   * bobblehead-related cache keys
   */
  BOBBLEHEADS: {
    BY_COLLECTION: (collectionId: string, options?: string) =>
      `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:by-collection:${collectionId}${options ? `:${options}` : ''}`,
    BY_ID: (id: string) => `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:by-id:${id}`,
    BY_USER: (userId: string, options?: string) =>
      `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:by-user:${userId}${options ? `:${options}` : ''}`,
    CATEGORIES_BY_COLLECTION: (collectionSlug: string) =>
      `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:categories:${collectionSlug}`,
    COUNT_BY_COLLECTION: (collectionId: string, filtersHash?: string) =>
      `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:count:by-collection:${collectionId}${filtersHash ? `:${filtersHash}` : ''}`,
    PHOTOS: (bobbleheadId: string) => `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:photos:${bobbleheadId}`,
    SEARCH: (query: string, filters: string) =>
      `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:search:${query}:${filters}`,
    WITH_RELATIONS: (id: string) => `${CACHE_CONFIG.NAMESPACES.BOBBLEHEADS}:with-relations:${id}`,
  },

  /**
   * collection-related cache keys
   */
  COLLECTIONS: {
    BY_ID: (id: string) => `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:by-id:${id}`,
    BY_USER: (userId: string, options?: string) =>
      `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:by-user:${userId}${options ? `:${options}` : ''}`,
    DASHBOARD: (userId: string) => `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:dashboard:${userId}`,
    DASHBOARD_HEADER: (userId: string, slug: string) =>
      `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:dashboard-header:${userId}:${slug}`,
    METRICS: (collectionId: string) => `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:metrics:${collectionId}`,
    PUBLIC: (options?: string) =>
      `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:public${options ? `:${options}` : ''}`,
    WITH_RELATIONS: (id: string) => `${CACHE_CONFIG.NAMESPACES.COLLECTIONS}:with-relations:${id}`,
  },

  /**
   * featured content cache keys
   */
  FEATURED: {
    BOBBLEHEADS: () => `${CACHE_CONFIG.NAMESPACES.FEATURED}:bobbleheads`,
    COLLECTIONS: () => `${CACHE_CONFIG.NAMESPACES.FEATURED}:collections`,
    CONTENT: (type: string) => `${CACHE_CONFIG.NAMESPACES.FEATURED}:${type}`,
    CONTENT_TYPES: {
      ACTIVE: 'active',
      FOOTER: 'footer',
    },
    FEATURED_BOBBLEHEAD: () => `${CACHE_CONFIG.NAMESPACES.FEATURED}:featured:bobblehead`,
    TRENDING_BOBBLEHEADS: () => `${CACHE_CONFIG.NAMESPACES.FEATURED}:trending:bobbleheads`,
  },

  /**
   * newsletter-related cache keys
   */
  NEWSLETTER: {
    IS_ACTIVE_SUBSCRIBER: (email: string) => `${CACHE_CONFIG.NAMESPACES.NEWSLETTER}:active:${email}`,
  },

  /**
   * platform-level cache keys
   */
  PLATFORM: {
    STATS: () => `${CACHE_CONFIG.NAMESPACES.PLATFORM}:stats`,
  },

  /**
   * search-related cache keys
   */
  SEARCH: {
    POPULAR: (timeframe: string) => `${CACHE_CONFIG.NAMESPACES.SEARCH}:popular:${timeframe}`,
    PUBLIC_DROPDOWN: (queryHash: string) => `${CACHE_CONFIG.NAMESPACES.SEARCH}:public:dropdown:${queryHash}`,
    PUBLIC_PAGE: (queryHash: string, filtersHash: string) =>
      `${CACHE_CONFIG.NAMESPACES.SEARCH}:public:page:${queryHash}:${filtersHash}`,
    RESULTS: (query: string, type: string, filters: string) =>
      `${CACHE_CONFIG.NAMESPACES.SEARCH}:${type}:${query}:${filters}`,
    SUGGESTIONS: (prefix: string, type: string) =>
      `${CACHE_CONFIG.NAMESPACES.SEARCH}:suggestions:${type}:${prefix}`,
  },

  /**
   * social features cache keys
   */
  SOCIAL: {
    COMMENTS: (entityType: string, entityId: string) =>
      `${CACHE_CONFIG.NAMESPACES.SOCIAL}:comments:${entityType}:${entityId}`,
    FOLLOWERS: (userId: string) => `${CACHE_CONFIG.NAMESPACES.SOCIAL}:followers:${userId}`,
    FOLLOWS: (userId: string) => `${CACHE_CONFIG.NAMESPACES.SOCIAL}:follows:${userId}`,
    LIKES: (entityType: string, entityId: string) =>
      `${CACHE_CONFIG.NAMESPACES.SOCIAL}:likes:${entityType}:${entityId}`,
  },

  /**
   * tag-related cache keys
   */
  TAGS: {
    ALL: () => `${CACHE_CONFIG.NAMESPACES.TAGS}:all`,
    BY_CATEGORY: (category: string) => `${CACHE_CONFIG.NAMESPACES.TAGS}:category:${category}`,
    POPULAR: (timeframe: string) => `${CACHE_CONFIG.NAMESPACES.TAGS}:popular:${timeframe}`,
    USER_TAGS: (userId: string) => `${CACHE_CONFIG.NAMESPACES.TAGS}:user:${userId}`,
  },

  /**
   * user-related cache keys
   */
  USERS: {
    ACTIVITY: (userId: string) => `${CACHE_CONFIG.NAMESPACES.USERS}:activity:${userId}`,
    PREFERENCES: (userId: string) => `${CACHE_CONFIG.NAMESPACES.USERS}:preferences:${userId}`,
    PROFILE: (userId: string) => `${CACHE_CONFIG.NAMESPACES.USERS}:profile:${userId}`,
    STATS: (userId: string) => `${CACHE_CONFIG.NAMESPACES.USERS}:stats:${userId}`,
  },
} as const;

export const CACHE_ENTITY_TYPE = {
  BOBBLEHEAD: 'bobblehead',
  COLLECTION: 'collection',
  FEATURED: 'featured',
  NEWSLETTER: 'newsletter',
  PLATFORM: 'platform',
  USER: 'user',
} as const;

export type CacheEnvironment = keyof typeof CACHE_CONFIG.ENVIRONMENT;
/**
 * type definitions for cache operations
 */
export type CacheNamespace = keyof typeof CACHE_CONFIG.NAMESPACES;
export type CacheTTL = keyof typeof CACHE_CONFIG.TTL;

/**
 * Helper function to get environment-adjusted TTL
 *
 * @param ttl - Base TTL in seconds
 * @returns Adjusted TTL based on current environment multiplier
 *
 * @example
 * ```typescript
 * const adjustedTTL = getEnvironmentTTL(3600); // 1 hour in production, 6 minutes in dev
 * ```
 */
export function getEnvironmentTTL(ttl: number): number {
  const validEnv = getValidatedEnvironment();
  const config = CACHE_CONFIG.ENVIRONMENT[validEnv];
  return Math.floor(ttl * config.TTL_MULTIPLIER);
}

/**
 * Helper function to check if caching is enabled
 *
 * @returns True if caching is enabled for the current environment
 *
 * @example
 * ```typescript
 * if (isCacheEnabled()) {
 *   // Perform cache operations
 * }
 * ```
 */
export function isCacheEnabled(): boolean {
  const validEnv = getValidatedEnvironment();
  return CACHE_CONFIG.ENVIRONMENT[validEnv].IS_CACHE_ENABLED;
}

/**
 * Helper function to check if cache logging is enabled
 *
 * @returns True if cache operation logging is enabled for the current environment
 *
 * @example
 * ```typescript
 * if (isCacheLoggingEnabled()) {
 *   console.log('Cache operation performed');
 * }
 * ```
 */
export function isCacheLoggingEnabled(): boolean {
  const validEnv = getValidatedEnvironment();
  return CACHE_CONFIG.ENVIRONMENT[validEnv].IS_CACHE_LOGGING_ENABLED;
}

/**
 * Get the current validated environment with safe fallback
 *
 * @returns Validated environment key, defaults to 'production' for unknown environments
 * @internal This function is for internal use only
 *
 * @remarks
 * This function ensures that only valid environment configurations are used.
 * If an unknown NODE_ENV is encountered, it logs a warning (in development only)
 * and falls back to production configuration for safety.
 */
function getValidatedEnvironment(): CacheEnvironment {
  const env = process.env.NODE_ENV || 'production';

  // validate the environment and fallback to production for safety
  if (env in CACHE_CONFIG.ENVIRONMENT) {
    return env as CacheEnvironment;
  }

  // log warning for unknown environments in development
  if (typeof console !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.warn(`[Cache] Unknown NODE_ENV: ${env}, falling back to production cache config`);
  }

  return 'production';
}
