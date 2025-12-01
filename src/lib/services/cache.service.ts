import { revalidateTag, unstable_cache } from 'next/cache';

import {
  CACHE_CONFIG,
  CACHE_ENTITY_TYPE,
  CACHE_KEYS,
  getEnvironmentTTL,
  isCacheEnabled,
  isCacheLoggingEnabled,
} from '@/lib/constants/cache';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { RedisOperations } from '@/lib/utils/redis-client';

/**
 * cache operation context for consistent tracking
 */
export interface CacheContext {
  entityId?: string;
  entityType?: string;
  facade?: string;
  operation: string;
  userId?: string;
}

/**
 * cache options for customizing cache behavior
 */
export interface CacheOptions {
  context?: CacheContext;
  isBypassCache?: boolean;
  isForceRefresh?: boolean;
  tags?: Array<string>;
  ttl?: number;
}

/**
 * cache statistics for monitoring
 */
export interface CacheStats {
  errors: number;
  hitRate: number;
  hits: number;
  misses: number;
  totalOperations: number;
}

export class CacheService {
  /**
   * analytics-specific cache utilities
   */
  static readonly analytics = {
    /**
     * cache view aggregates
     */
    aggregates: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetId: string,
      period: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.AGGREGATES(targetType, targetId, period);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:${targetType}:${targetId}`,
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: targetId,
          entityType: 'analytics',
          operation: 'analytics:aggregates',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache engagement metrics
     */
    engagement: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetIds: Array<string>,
      optionsHash?: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.ENGAGEMENT(targetType, targetIds.join(','), optionsHash);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:engagement:${targetType}`,
        ...targetIds.map((id) => `analytics:${targetType}:${id}`),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'analytics',
          operation: 'analytics:engagement',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache content performance metrics
     */
    performance: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetIds: Array<string>,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.PERFORMANCE(targetType, targetIds.join(','));
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:performance:${targetType}`,
        ...targetIds.map((id) => `analytics:${targetType}:${id}`),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'analytics',
          operation: 'analytics:performance',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache recent views
     */
    recentViews: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetId: string,
      limit: number,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.RECENT_VIEWS(targetType, targetId, limit);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:${targetType}:${targetId}`,
        `analytics:recent:${targetType}:${targetId}`,
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: targetId,
          entityType: 'analytics',
          operation: 'analytics:recent-views',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.SHORT,
      });
    },

    /**
     * cache trending content
     */
    trending: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      timeframe: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.TRENDING(targetType, timeframe);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:trending:${targetType}`,
        `analytics:trending:${timeframe}`,
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'analytics',
          operation: 'analytics:trending',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.SHORT,
      });
    },

    /**
     * cache view counts
     */
    viewCounts: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetId: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.VIEW_COUNTS(targetType, targetId);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:${targetType}:${targetId}`,
        `analytics:views:${targetType}:${targetId}`,
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: targetId,
          entityType: 'analytics',
          operation: 'analytics:view-counts',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache view statistics
     */
    viewStats: async <T>(
      fn: () => Promise<T>,
      targetType: string,
      targetId: string,
      timeframe: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.ANALYTICS.VIEW_STATS(targetType, targetId, timeframe);
      const tags = [
        CACHE_CONFIG.TAGS.ANALYTICS,
        `analytics:${targetType}`,
        `analytics:${targetType}:${targetId}`,
        `analytics:stats:${targetType}:${targetId}`,
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: targetId,
          entityType: 'analytics',
          operation: 'analytics:view-stats',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },
  };

  /**
   * bobblehead-specific cache utilities
   */
  static readonly bobbleheads = {
    /**
     * cache bobbleheads by collection
     */
    byCollection: async <T>(
      fn: () => Promise<T>,
      collectionId: string,
      optionsHash?: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.BOBBLEHEADS.BY_COLLECTION(collectionId, optionsHash);
      const tags = [
        ...CacheTagGenerators.collection.read(collectionId, options.context?.userId),
        CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: collectionId,
          entityType: 'collection',
          operation: 'bobblehead:by-collection',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache a bobblehead by ID
     */
    byId: async <T>(fn: () => Promise<T>, bobbleheadId: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.BOBBLEHEADS.BY_ID(bobbleheadId);
      const tags = CacheTagGenerators.bobblehead.read(bobbleheadId, options.context?.userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: bobbleheadId,
          entityType: 'bobblehead',
          operation: 'bobblehead:by-id',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },

    /**
     * cache bobbleheads by user
     */
    byUser: async <T>(
      fn: () => Promise<T>,
      userId: string,
      optionsHash?: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.BOBBLEHEADS.BY_USER(userId, optionsHash);
      const tags = CacheTagGenerators.bobblehead.read(userId, userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'bobblehead', operation: 'bobblehead:by-user', userId },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache bobblehead photos
     */
    photos: async <T>(
      fn: () => Promise<T>,
      bobbleheadId: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.BOBBLEHEADS.PHOTOS(bobbleheadId);
      const tags = CacheTagGenerators.bobblehead.read(bobbleheadId, options.context?.userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: bobbleheadId,
          entityType: 'bobblehead',
          operation: 'bobblehead:photos',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.EXTENDED,
      });
    },

    /**
     * cache bobblehead search results
     */
    search: async <T>(
      fn: () => Promise<T>,
      query: string,
      filtersHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.BOBBLEHEADS.SEARCH(query, filtersHash);
      const tags = CacheTagGenerators.search.results(query, 'bobbleheads');

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'search', operation: 'bobblehead:search' },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.SHORT,
      });
    },

    /**
     * cache bobblehead with relations
     */
    withRelations: async <T>(
      fn: () => Promise<T>,
      bobbleheadId: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.BOBBLEHEADS.WITH_RELATIONS(bobbleheadId);
      const tags = [
        ...CacheTagGenerators.bobblehead.read(bobbleheadId, options.context?.userId),
        CACHE_CONFIG.TAGS.BOBBLEHEAD_TAGS(bobbleheadId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: bobbleheadId,
          entityType: 'bobblehead',
          operation: 'bobblehead:with-relations',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },
  };

  /**
   * collection-specific cache utilities
   */
  static readonly collections = {
    /**
     * cache a collection by ID
     */
    byId: async <T>(fn: () => Promise<T>, collectionId: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.COLLECTIONS.BY_ID(collectionId);
      const tags = CacheTagGenerators.collection.read(collectionId, options.context?.userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: collectionId,
          entityType: CACHE_ENTITY_TYPE.COLLECTION,
          operation: `${CACHE_ENTITY_TYPE.COLLECTION}:by-id`,
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },

    /**
     * cache collections by user
     */
    byUser: async <T>(
      fn: () => Promise<T>,
      userId: string,
      optionsHash?: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.COLLECTIONS.BY_USER(userId, optionsHash);
      const tags = [CACHE_CONFIG.TAGS.USER(userId), CACHE_CONFIG.TAGS.USER_COLLECTIONS(userId)];

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'collection', operation: 'collection:by-user', userId },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache dashboard data for a user
     * @param fn - The async function that performs the dashboard query
     * @param userId - The ID of the user whose dashboard data to cache
     * @param options - Cache options (TTL defaults to 1 hour)
     */
    dashboard: async <T>(fn: () => Promise<T>, userId: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.COLLECTIONS.DASHBOARD(userId);
      // Investigate these cache tags
      const tags = [
        CACHE_CONFIG.TAGS.USER(userId),
        CACHE_CONFIG.TAGS.USER_COLLECTIONS(userId),
        CACHE_CONFIG.TAGS.USER_STATS(userId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: CACHE_ENTITY_TYPE.COLLECTION,
          operation: `${CACHE_ENTITY_TYPE.COLLECTION}:dashboard`,
          userId,
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache collection dashboard header by user and slug
     */
    dashboardHeader: async <T>(
      fn: () => Promise<T>,
      userId: string,
      slug: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.COLLECTIONS.DASHBOARD_HEADER(userId, slug);
      const tags = [
        CACHE_CONFIG.TAGS.USER(userId),
        CACHE_CONFIG.TAGS.USER_COLLECTIONS(userId),
        CACHE_CONFIG.TAGS.USER_STATS(userId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: CACHE_ENTITY_TYPE.COLLECTION,
          operation: `${CACHE_ENTITY_TYPE.COLLECTION}:dashboard-header`,
          userId,
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache collection metrics
     */
    metrics: async <T>(
      fn: () => Promise<T>,
      collectionId: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.COLLECTIONS.METRICS(collectionId);
      const tags = [
        CACHE_CONFIG.TAGS.COLLECTION(collectionId),
        CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: collectionId,
          entityType: 'collection',
          operation: 'collection:metrics',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.SHORT,
      });
    },

    /**
     * cache public collections
     */
    public: async <T>(
      fn: () => Promise<T>,
      optionsHash?: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.COLLECTIONS.PUBLIC(optionsHash);
      const tags = [CACHE_CONFIG.TAGS.PUBLIC_CONTENT];

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'collection', operation: 'collection:public' },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },

    /**
     * cache collection with relations
     */
    withRelations: async <T>(
      fn: () => Promise<T>,
      collectionId: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.COLLECTIONS.WITH_RELATIONS(collectionId);
      const tags = [
        ...CacheTagGenerators.collection.read(collectionId, options.context?.userId),
        CACHE_CONFIG.TAGS.COLLECTION_BOBBLEHEADS(collectionId),
      ];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityId: collectionId,
          entityType: 'collection',
          operation: 'collection:with-relations',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },
  };

  /**
   * featured content cache utilities
   */
  static readonly featured = {
    /**
     * cache featured collections data in Redis with user-specific keys
     *
     * uses Redis for distributed caching of featured collections display data.
     * supports user-specific cache keys to cache like data separately per user.
     * this is high-traffic homepage content that benefits from fast Redis access.
     */
    collections: async <T>(
      fn: () => Promise<T>,
      userId: null | string | undefined,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = `${CACHE_KEYS.FEATURED.COLLECTIONS()}:${userId || 'public'}`;

      return CacheService.cachedWithRedis(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'featured',
          operation: 'featured:collections',
          userId: userId || undefined,
        },
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },

    /**
     * cache featured content by type
     */
    content: async <T>(fn: () => Promise<T>, type: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.FEATURED.CONTENT(type);
      const tags = CacheTagGenerators.featured.content(type);

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'featured', operation: 'featured:content' },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.EXTENDED,
      });
    },

    /**
     * cache hero featured bobblehead data in Redis
     *
     * uses Redis for distributed caching of the hero bobblehead display data.
     * this is high-traffic homepage content that benefits from fast Redis access.
     */
    featuredBobblehead: async <T>(fn: () => Promise<T>, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.FEATURED.FEATURED_BOBBLEHEAD();

      return CacheService.cachedWithRedis(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'featured', operation: 'featured:bobblehead' },
        ttl: options.ttl || CACHE_CONFIG.TTL.EXTENDED,
      });
    },

    /**
     * cache trending bobbleheads data in Redis
     *
     * uses Redis for distributed caching of trending bobbleheads display data.
     * this is high-traffic homepage content that benefits from fast Redis access.
     * uses LONG TTL (4 hour) as trending content doesn't need real-time updates.
     */
    trendingBobbleheads: async <T>(fn: () => Promise<T>, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.FEATURED.TRENDING_BOBBLEHEADS();

      return CacheService.cachedWithRedis(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'featured', operation: 'featured:trending-bobbleheads' },
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },
  };

  /**
   * newsletter-specific cache utilities
   */
  static readonly newsletter = {
    /**
     * cache newsletter subscription status check
     *
     * Caches whether an email is actively subscribed to the newsletter.
     * Uses LONG TTL (4 hours) to balance freshness with performance
     * as subscription status changes infrequently but needs reasonable freshness.
     *
     * @template T - The return type (typically boolean)
     * @param fn - The async function that checks subscription status
     * @param email - The normalized email address to check
     * @param options - Cache options (TTL defaults to 5 minutes)
     *
     * @remarks
     * - Cache invalidated on subscribe/unsubscribe operations
     * - Uses email-specific tags for targeted invalidation
     * - Privacy-preserving: cache key includes hashed email
     */
    isActiveSubscriber: async <T>(
      fn: () => Promise<T>,
      email: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.NEWSLETTER.IS_ACTIVE_SUBSCRIBER(email);
      const tags = [CACHE_CONFIG.TAGS.NEWSLETTER, CACHE_CONFIG.TAGS.NEWSLETTER_SUBSCRIPTION(email)];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: CACHE_ENTITY_TYPE.NEWSLETTER,
          operation: `${CACHE_CONFIG.NAMESPACES.NEWSLETTER}:is-active-subscriber`,
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },
  };

  /**
   * platform-level cache utilities
   */
  static readonly platform = {
    /**
     * Caches platform-level stats (total bobbleheads, total collections, etc.)
     *
     * @param fn - The async function that performs the stats query
     * @param options - Cache options (TTL defaults to 1 hour)
     */
    stats: async <T>(fn: () => Promise<T>, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.PLATFORM.STATS();
      const tags = [CACHE_CONFIG.TAGS.PLATFORM_STATS];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: CACHE_ENTITY_TYPE.PLATFORM,
          operation: `${CACHE_CONFIG.NAMESPACES.PLATFORM}:stats`,
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },
  };

  /**
   * Redis-based search cache utilities for public search
   *
   * Provides distributed caching via Redis for high-traffic public search queries.
   * Separate from the regular search cache to enable Redis-specific optimizations
   * while keeping other searches on Next.js unstable_cache.
   */
  static readonly redisSearch = {
    /**
     * Cache public search dropdown results in Redis
     *
     * Caches consolidated dropdown results (top 5 items across all entity types)
     * using Redis for distributed caching and better performance.
     *
     * @template T - The return type of the search function
     * @param fn - The async function that performs the search query
     * @param queryHash - Hashed search query for cache key generation
     * @param options - Cache options (TTL defaults to 10 minutes)
     * @returns Promise resolving to the cached or fresh search results
     *
     * @example
     * ```typescript
     * const results = await CacheService.redisSearch.publicDropdown(
     *   () => searchPublicConsolidated(query),
     *   createHashFromObject({ query })
     * );
     * ```
     *
     * @remarks
     * - Uses Redis for distributed cache across server instances
     * - Cache keys follow pattern: search:public:dropdown:{queryHash}
     * - Falls back to unstable_cache if Redis is unavailable
     * - Logs cache hits/misses for monitoring
     */
    publicDropdown: async <T>(
      fn: () => Promise<T>,
      queryHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.SEARCH.PUBLIC_DROPDOWN(queryHash);
      return CacheService.cachedWithRedis(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'search',
          operation: 'search:redis-public-dropdown',
        },
        ttl: options.ttl || CACHE_CONFIG.TTL.PUBLIC_SEARCH,
      });
    },

    /**
     * Cache public search page results in Redis
     *
     * Caches paginated search results for the full search results page
     * with advanced filtering using Redis for distributed caching.
     *
     * @template T - The return type of the search function
     * @param fn - The async function that performs the search query
     * @param queryHash - Hashed search query for cache key generation
     * @param filtersHash - Hashed filter parameters (entity types, tags, sort, pagination)
     * @param options - Cache options (TTL defaults to 10 minutes)
     * @returns Promise resolving to the cached or fresh search results
     *
     * @example
     * ```typescript
     * const results = await CacheService.redisSearch.publicPage(
     *   () => searchPublicWithFilters(query, filters),
     *   createHashFromObject({ query }),
     *   createHashFromObject({ filters, pagination })
     * );
     * ```
     *
     * @remarks
     * - Uses Redis for distributed cache across server instances
     * - Cache keys follow pattern: search:public:page:{queryHash}:{filtersHash}
     * - Falls back to unstable_cache if Redis is unavailable
     * - Separate caching from dropdown allows independent TTL management
     */
    publicPage: async <T>(
      fn: () => Promise<T>,
      queryHash: string,
      filtersHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.SEARCH.PUBLIC_PAGE(queryHash, filtersHash);
      return CacheService.cachedWithRedis(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'search',
          operation: 'search:redis-public-page',
        },
        ttl: options.ttl || CACHE_CONFIG.TTL.PUBLIC_SEARCH,
      });
    },
  };

  /**
   * Search cache utilities
   */
  static readonly search = {
    /**
     * invalidate all public search cache
     *
     * Clears all cached public search results (both dropdown and page results).
     * Use this when content is updated that would affect public search results.
     *
     * @example
     * ```typescript
     * // After updating a collection or bobblehead
     * CacheService.search.invalidatePublic();
     * ```
     *
     * @remarks
     * Invalidates all cache entries tagged with 'public-search'
     * This affects both dropdown and full page search results
     * Should be called sparingly as it clears all public search cache
     */
    invalidatePublic: (): void => {
      return CacheService.invalidateByTag(CACHE_CONFIG.TAGS.PUBLIC_SEARCH);
    },

    /**
     * cache popular searches
     */
    popular: async <T>(fn: () => Promise<T>, timeframe: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.SEARCH.POPULAR(timeframe);
      const tags = CacheTagGenerators.search.popular();

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'search', operation: 'search:popular' },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.EXTENDED,
      });
    },

    /**
     * cache public search dropdown results
     *
     * Caches consolidated search results for the header dropdown (top 5 results across all entity types).
     * Uses a 10-minute TTL to balance freshness with performance for frequently searched terms.
     *
     * @template T - The return type of the search function
     * @param fn - The async function that performs the search query
     * @param queryHash - Hashed search query for cache key generation
     * @param options - Cache options (TTL defaults to 10 minutes)
     * @returns Promise resolving to the cached or fresh search results
     *
     * @example
     * ```typescript
     * const results = await CacheService.search.publicDropdown(
     *   () => searchPublicConsolidated(query),
     *   createHashFromObject(query)
     * );
     * ```
     *
     * @remarks
     * Cache keys follow the pattern: search:public:dropdown:{queryHash}
     * Tagged with 'public-search' for bulk invalidation if needed
     * Logs cache hits/misses for monitoring popular search terms
     */
    publicDropdown: async <T>(
      fn: () => Promise<T>,
      queryHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.SEARCH.PUBLIC_DROPDOWN(queryHash);
      const tags = [CACHE_CONFIG.TAGS.PUBLIC_SEARCH, CACHE_CONFIG.TAGS.SEARCH_RESULTS];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'search',
          operation: 'search:public-dropdown',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.PUBLIC_SEARCH,
      });
    },

    /**
     * cache public search page results
     *
     * Caches paginated search results for the full search results page with advanced filtering.
     * Uses a 10-minute TTL to optimize performance for frequently accessed search combinations.
     *
     * @template T - The return type of the search function
     * @param fn - The async function that performs the search query
     * @param queryHash - Hashed search query for cache key generation
     * @param filtersHash - Hashed filter parameters (entity types, tags, sort, pagination)
     * @param options - Cache options (TTL defaults to 10 minutes)
     * @returns Promise resolving to the cached or fresh search results
     *
     * @example
     * ```typescript
     * const results = await CacheService.search.publicPage(
     *   () => searchPublicWithFilters(query, filters),
     *   createHashFromObject(query),
     *   createHashFromObject(filters)
     * );
     * ```
     *
     * @remarks
     * Cache keys follow the pattern: search:public:page:{queryHash}:{filtersHash}
     * Tagged with 'public-search' for bulk invalidation if needed
     * Separate caching from dropdown results allows independent TTL management
     * Logs cache hits/misses for monitoring search performance
     */
    publicPage: async <T>(
      fn: () => Promise<T>,
      queryHash: string,
      filtersHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.SEARCH.PUBLIC_PAGE(queryHash, filtersHash);
      const tags = [CACHE_CONFIG.TAGS.PUBLIC_SEARCH, CACHE_CONFIG.TAGS.SEARCH_RESULTS];

      return CacheService.cached(fn, key, {
        ...options,
        context: {
          ...options.context,
          entityType: 'search',
          operation: 'search:public-page',
        },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.PUBLIC_SEARCH,
      });
    },

    /**
     * cache search results
     */
    results: async <T>(
      fn: () => Promise<T>,
      query: string,
      type: string,
      filtersHash: string,
      options: Omit<CacheOptions, 'tags'> = {},
    ) => {
      const key = CACHE_KEYS.SEARCH.RESULTS(query, type, filtersHash);
      const tags = CacheTagGenerators.search.results(query, type);

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'search', operation: 'search:results' },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.SHORT,
      });
    },
  };

  /**
   * user-specific cache utilities
   */
  static readonly users = {
    /**
     * cache user profile
     */
    profile: async <T>(fn: () => Promise<T>, userId: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.USERS.PROFILE(userId);
      const tags = CacheTagGenerators.user.profile(userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'user', operation: 'user:profile', userId },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.LONG,
      });
    },

    /**
     * cache user statistics
     */
    stats: async <T>(fn: () => Promise<T>, userId: string, options: Omit<CacheOptions, 'tags'> = {}) => {
      const key = CACHE_KEYS.USERS.STATS(userId);
      const tags = CacheTagGenerators.user.stats(userId);

      return CacheService.cached(fn, key, {
        ...options,
        context: { ...options.context, entityType: 'user', operation: 'user:stats', userId },
        tags,
        ttl: options.ttl || CACHE_CONFIG.TTL.MEDIUM,
      });
    },
  };

  private static stats: CacheStats = {
    errors: 0,
    hitRate: 0,
    hits: 0,
    misses: 0,
    totalOperations: 0,
  };

  /**
   * Generic cache wrapper for any async function using NextJS unstable_cache
   *
   * @template T - The return type of the cached function
   * @param fn - The async function to cache
   * @param key - Unique cache key for this operation
   * @param options - Cache options including TTL, tags, and behavior flags
   * @returns Promise resolving to the cached or fresh result
   *
   * @example
   * ```typescript
   * const result = await CacheService.cached(
   *   () => fetchUserData(userId),
   *   `user:${userId}`,
   *   {
   *     ttl: CACHE_CONFIG.TTL.LONG,
   *     tags: ['user', `user:${userId}`],
   *     context: { operation: 'fetchUser', userId }
   *   }
   * );
   * ```
   *
   * @remarks
   * This function provides comprehensive error handling, fallback to direct function calls,
   * and integrates with the project's monitoring and logging systems.
   */
  static async cached<T>(fn: () => Promise<T>, key: string, options: CacheOptions = {}): Promise<T> {
    // check if caching is enabled
    if (!isCacheEnabled() || options.isBypassCache) {
      this.logCacheOperation('bypass', key, options.context);
      return fn();
    }

    try {
      const ttl = options.ttl ? getEnvironmentTTL(options.ttl) : getEnvironmentTTL(CACHE_CONFIG.TTL.MEDIUM);
      const tags = options.tags || [];

      this.stats.totalOperations++;

      // force refresh bypasses cache but still populates it
      if (options.isForceRefresh) {
        this.logCacheOperation('force-refresh', key, options.context);
        const result = await fn();

        // try to cache the fresh result, but don't fail if caching fails
        try {
          await this.cacheResult(fn, key, ttl, tags);
        } catch (cacheError) {
          this.stats.errors++;
          this.logCacheOperation('error', key, options.context, cacheError);
          // continue - we have the result even if caching fails
        }

        return result;
      }

      // use unstable_cache with our configuration
      const cachedFn = unstable_cache(fn, [key], {
        revalidate: ttl,
        tags,
      });

      const result = await cachedFn();
      this.stats.hits++;
      this.updateHitRate();
      this.logCacheOperation('hit', key, options.context);

      return result;
    } catch (error) {
      this.stats.errors++;
      this.stats.misses++;
      this.updateHitRate();
      this.logCacheOperation('error', key, options.context, error);

      // fallback to direct function call on cache error
      try {
        return await fn();
      } catch (functionError) {
        // if both cache and function fail, throw the original function error
        this.logCacheOperation('error', key, options.context, functionError);
        throw functionError;
      }
    }
  }

  /**
   * get cache statistics
   */
  static getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * invalidate cache by tag
   *
   * Revalidates all cache entries associated with a specific tag, forcing fresh data
   * on the next request. Useful for manual cache clearing when content is updated.
   *
   * @param tag - The cache tag to invalidate (e.g., 'public-search', 'search-results')
   *
   * @example
   * ```typescript
   * // Invalidate all public search results
   * CacheService.invalidateByTag(CACHE_CONFIG.TAGS.PUBLIC_SEARCH);
   *
   * // Invalidate all search results
   * CacheService.invalidateByTag(CACHE_CONFIG.TAGS.SEARCH_RESULTS);
   * ```
   *
   * @remarks
   * This method uses Next.js revalidateTag() to invalidate cache entries.
   * Can be called from Server Actions or API routes when content changes.
   * Logs invalidation operations for monitoring in development.
   */
  static invalidateByTag(tag: string): void {
    if (!isCacheEnabled()) {
      this.logCacheOperation('bypass', `invalidate:${tag}`, {
        operation: 'cache:invalidate',
      });
      return;
    }

    try {
      revalidateTag(tag, 'max');
      this.logCacheOperation('force-refresh', `invalidate:${tag}`, {
        operation: 'cache:invalidate',
      });
    } catch (error) {
      this.stats.errors++;
      this.logCacheOperation('error', `invalidate:${tag}`, { operation: 'cache:invalidate' }, error);
      throw error;
    }
  }

  /**
   * reset cache statistics
   */
  static resetStats() {
    this.stats = {
      errors: 0,
      hitRate: 0,
      hits: 0,
      misses: 0,
      totalOperations: 0,
    };
  }

  /**
   * Redis-based cache wrapper for search results
   *
   * Provides distributed caching using Redis for high-traffic public search queries.
   * Falls back to unstable_cache if Redis is unavailable.
   *
   * @template T - The return type of the cached function
   * @param fn - The async function to cache
   * @param key - Unique cache key for this operation
   * @param options - Cache options including TTL and context
   * @returns Promise resolving to the cached or fresh result
   *
   * @example
   * ```typescript
   * const result = await CacheService.cachedWithRedis(
   *   () => searchPublicContent(query),
   *   'search:public:dropdown:hash123',
   *   { ttl: CACHE_CONFIG.TTL.PUBLIC_SEARCH }
   * );
   * ```
   *
   * @remarks
   * - Uses Upstash Redis REST API via RedisOperations
   * - Stores JSON-serialized data with explicit TTL
   * - Gracefully falls back to unstable_cache on Redis failure
   * - Includes comprehensive error handling and logging
   */
  private static async cachedWithRedis<T>(
    fn: () => Promise<T>,
    key: string,
    options: CacheOptions = {},
  ): Promise<T> {
    // check if caching is enabled
    if (!isCacheEnabled() || options.isBypassCache) {
      this.logCacheOperation('bypass', key, options.context);
      return fn();
    }

    try {
      const ttl = options.ttl ? getEnvironmentTTL(options.ttl) : getEnvironmentTTL(CACHE_CONFIG.TTL.MEDIUM);

      this.stats.totalOperations++;

      // force refresh bypasses cache but still populates it
      if (options.isForceRefresh) {
        this.logCacheOperation('force-refresh', key, options.context);
        const result = await fn();

        // try to cache the fresh result in Redis
        // Note: Upstash client auto-serializes, so we pass the object directly
        try {
          await RedisOperations.set(key, result, ttl);
        } catch (cacheError) {
          this.stats.errors++;
          this.logCacheOperation('error', key, options.context, cacheError);
          // continue - we have the result even if caching fails
        }

        return result;
      }

      // try to get from Redis first
      // Note: Upstash client auto-deserializes, so we get the object directly
      const cached = await RedisOperations.get<T>(key);

      if (cached) {
        this.stats.hits++;
        this.updateHitRate();
        this.logCacheOperation('hit', key, options.context);
        return cached;
      }

      // cache miss - fetch fresh data
      this.stats.misses++;
      this.updateHitRate();
      this.logCacheOperation('miss', key, options.context);

      const result = await fn();

      // store in Redis asynchronously (non-blocking)
      // Note: Upstash client auto-serializes, so we pass the object directly
      try {
        const setResult = await RedisOperations.set(key, result, ttl);
        if (isCacheLoggingEnabled()) {
          console.log('[Redis Debug] SET result:', {
            key,
            success: setResult,
            ttl,
          });
        }
      } catch (cacheError) {
        this.stats.errors++;
        this.logCacheOperation('error', key, options.context, cacheError);
        // continue - we have the result even if caching fails
      }

      return result;
    } catch (error) {
      this.stats.errors++;
      this.stats.misses++;
      this.updateHitRate();
      this.logCacheOperation('error', key, options.context, error);

      // fallback to unstable_cache on Redis failure
      try {
        const cachedFn = unstable_cache(fn, [key], {
          revalidate:
            options.ttl ? getEnvironmentTTL(options.ttl) : getEnvironmentTTL(CACHE_CONFIG.TTL.MEDIUM),
          tags: options.tags || [],
        });
        return await cachedFn();
      } catch (fallbackError) {
        this.logCacheOperation('error', key, options.context, fallbackError);
        // final fallback - direct function call
        return fn();
      }
    }
  }

  /**
   * cache result directly without going through unstable_cache wrapper
   */
  private static async cacheResult<T>(
    fn: () => Promise<T>,
    key: string,
    ttl: number,
    tags: Array<string>,
  ): Promise<T> {
    const cachedFn = unstable_cache(fn, [key], {
      revalidate: ttl,
      tags,
    });
    return cachedFn();
  }

  /**
   * log cache operations for monitoring
   */
  private static logCacheOperation(
    operation: 'bypass' | 'error' | 'force-refresh' | 'hit' | 'miss',
    key: string,
    context?: CacheContext,
    error?: unknown,
  ) {
    if (!isCacheLoggingEnabled()) return;

    const logData: Record<string, unknown> = {
      context,
      key,
      operation,
      timestamp: new Date().toISOString(),
    };

    if (error) {
      logData.error =
        error instanceof Error ? error.message
        : typeof error === 'string' ? error
        : JSON.stringify(error);
    }

    // use an appropriate log level based on operation
    switch (operation) {
      case 'bypass':
      case 'force-refresh':
        console.info(`[CacheService] ${operation.toUpperCase()}:`, logData);
        break;
      case 'error':
        console.error(`[CacheService] ${operation.toUpperCase()}:`, logData);
        break;
      default:
        console.debug(`[CacheService] ${operation.toUpperCase()}:`, logData);
        break;
    }
  }

  /**
   * update hit rate statistics
   */
  private static updateHitRate() {
    this.stats.hitRate =
      this.stats.totalOperations > 0 ? (this.stats.hits / this.stats.totalOperations) * 100 : 0;
  }
}
