/**
 * Redis key patterns and builders
 */
export const REDIS_KEYS = {
  ANALYTICS: {
    DAILY_VIEWS: (date: string) => `analytics:views:${date}`,
    POPULAR_SEARCHES: (date: string) => `analytics:searches:${date}`,
    USER_ACTIVITY: (userId: string, date: string) => `analytics:user:${userId}:${date}`,
  },
  CACHE: {
    BOBBLEHEAD: (bobbleheadId: string) => `cache:bobblehead:${bobbleheadId}`,
    COLLECTION: (collectionId: string) => `cache:collection:${collectionId}`,
    FEATURED_CONTENT: (type: string) => `cache:featured:${type}`,
    POPULAR_BOBBLEHEADS: (limit: number) => `cache:popular_bobbleheads:${limit}`,
    SEARCH_RESULTS: (query: string, filters: string) => `cache:search:${query}:${filters}`,
    TAG_SUGGESTIONS: (prefix: string) => `cache:tags:${prefix}`,
    USER_COLLECTIONS: (userId: string) => `cache:user_collections:${userId}`,
    USER_PROFILE: (userId: string) => `cache:user:${userId}`,
  },
  LOCKS: {
    AGGREGATE_UPDATE: (type: string, id: string) => `lock:aggregate:${type}:${id}`,
    BOBBLEHEAD_UPDATE: (bobbleheadId: string) => `lock:bobblehead_update:${bobbleheadId}`,
    COLLECTION_UPDATE: (collectionId: string) => `lock:collection_update:${collectionId}`,
    USER_UPDATE: (userId: string) => `lock:user_update:${userId}`,
  },
  RATE_LIMIT: (userId: string) => `rate_limit:${userId}`,
  RATE_LIMIT_ACTION: (userId: string, action: string) => `rate_limit:${userId}:${action}`,
  REALTIME: {
    COLLECTION_VIEWERS: (collectionId: string) => `viewers:collection:${collectionId}`,
    NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
    USER_ONLINE: (userId: string) => `online:${userId}`,
  },
  TEMP: {
    EMAIL_VERIFICATION: (token: string) => `temp:email_verify:${token}`,
    PASSWORD_RESET: (token: string) => `temp:password_reset:${token}`,
    UPLOAD_SESSION: (sessionId: string) => `temp:upload:${sessionId}`,
  },
  USER_ACTIVE_SESSIONS: (userId: string) => `sessions:${userId}`,
  USER_SESSION: (sessionId: string) => `session:${sessionId}`,
} as const;

export const buildRedisKey = (namespace: string, ...parts: Array<string>): string => {
  return [namespace, ...parts].join(':');
};

export const parseRedisKey = (key: string): Array<string> => {
  return key.split(':');
};

export const REDIS_TTL = {
  ANALYTICS: 604800, // 1 week
  CACHE: {
    DAILY: 86400, // 24 hours
    LONG: 3600, // 1 hour
    MEDIUM: 1800, // 30 minutes
    SHORT: 300, // 5 minutes
  },
  LOCK: 30, // 30 seconds
  RATE_LIMIT: 60, // 1 minute
  SESSION: 86400, // 24 hours
  TEMP: 3600, // 1 hour
} as const;
