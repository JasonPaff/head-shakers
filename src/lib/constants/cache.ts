export const CACHE_TAGS = {
  ADMIN: {
    FEATURED_CONTENT: 'admin:featured_content',
    USER_CONTENT: 'admin:user_content',
  },
  ANALYTICS: 'analytics',
  CONTENT_METRICS: 'content_metrics',
  CONTENT_RELATIONSHIPS: {
    BOBBLEHEAD_FEATURED: (bobbleheadId: string) => `bobblehead:${bobbleheadId}:featured`,
    COLLECTION_FEATURED: (collectionId: string) => `collection:${collectionId}:featured`,
  },
  DASHBOARD: {
    COLLECTION: (collectionId: string) => `dashboard:collection:${collectionId}`,
    COLLECTIONS: 'dashboard:collections',
    SUBCOLLECTION: (collectionId: string, subcollectionId: string) =>
      `dashboard:collection:${collectionId}:subcollection:${subcollectionId}`,
  },
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
  TAGS: {
    SUGGESTIONS: 'tags:suggestions',
    TAGS: 'tags',
  },
  USER_CONTENT: 'user_content',
} as const;

export const CACHE_TTL = {
  FIVE_MINUTES: 300,
  ONE_HOUR: 3600,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  TWENTY_FOUR_HOURS: 86400,
} as const;

export const CACHE_KEYS = {} as const;
