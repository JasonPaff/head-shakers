// cache tags for invalidation
export const CACHE_TAGS = {
  ADMIN_CONTENT: 'admin_content',
  ANALYTICS: 'analytics',
  CONTENT_METRICS: 'content_metrics',
  // Cross-domain relationship tags
  CONTENT_RELATIONSHIPS: {
    BOBBLEHEAD_FEATURED: (bobbleheadId: string) => `bobblehead:${bobbleheadId}:featured`,
    COLLECTION_FEATURED: (collectionId: string) => `collection:${collectionId}:featured`,
  },
  // Hierarchical featured content tags
  FEATURED_CONTENT: {
    ACTIVE: 'featured_content:active',
    ADMIN: 'featured_content:admin',
    ALL: 'featured_content',
    BY_CATEGORY: (category: string) => `featured_content:category:${category}`,
    BY_TYPE: (type: string) => `featured_content:type:${type}`,
    COLLECTION_OF_WEEK: 'featured_content:collection_of_week',
    EDITOR_PICKS: 'featured_content:editor_picks',
    HOMEPAGE: 'featured_content:homepage',
    HOMEPAGE_BANNER: 'featured_content:homepage_banner',
    TRENDING: 'featured_content:trending',
  },
  USER_CONTENT: 'user_content',
} as const;

// cache TTL constants (in seconds)
export const CACHE_TTL = {
  LONG: 3600, // 1 hour
  MEDIUM: 1800, // 30 minutes
  SHORT: 300, // 5 minutes
  VERY_LONG: 86400, // 24 hours
} as const;

// cache key builders
export const CACHE_KEYS = {
  CONTENT_METRICS: {
    ANALYTICS_SUMMARY: 'content_metrics:analytics_summary',
    BY_CONTENT: (contentId: string) => `content_metrics:${contentId}`,
    TOP_PERFORMERS: 'content_metrics:top_performers',
  },
  FEATURED_CONTENT: {
    ACTIVE: 'featured_content:active',
    ALL: 'featured_content:all',
    BY_CATEGORY: (category: string) => `featured_content:category:${category}`,
    BY_TYPE: (type: string) => `featured_content:type:${type}`,
    COLLECTION_OF_WEEK: 'featured_content:collection_of_week',
    EDITOR_PICKS: 'featured_content:editor_picks',
    HOMEPAGE_BANNER: 'featured_content:homepage_banner',
    TRENDING: 'featured_content:trending',
  },
  USER_CONTENT: {
    BOBBLEHEADS: (userId: string) => `user_content:${userId}:bobbleheads`,
    COLLECTIONS: (userId: string) => `user_content:${userId}:collections`,
    FEATURED: (userId: string) => `user_content:${userId}:featured`,
  },
} as const;
