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
  VIEW_TRACKING: {
    BATCH_QUEUE: (batchId: string) => `view_tracking:batch_queue:${batchId}`,
    DEDUPLICATION: (targetType: string, targetId: string, viewerId: string) => `view_tracking:dedupe:${targetType}:${targetId}:${viewerId}`,
    DEDUPLICATION_ANONYMOUS: (targetType: string, targetId: string, ipAddress: string) => `view_tracking:dedupe_anon:${targetType}:${targetId}:${ipAddress}`,
    PENDING_VIEWS: (sessionId: string) => `view_tracking:pending:${sessionId}`,
    RECENT_VIEWS: (targetType: string, targetId: string) => `view_tracking:recent:${targetType}:${targetId}`,
    SESSION_VIEWS: (sessionId: string) => `view_tracking:session:${sessionId}`,
    TRENDING_CACHE: (targetType: string, timeframe: string) => `view_tracking:trending:${targetType}:${timeframe}`,
    VIEW_AGGREGATES: (targetType: string, targetId: string, period: string) => `view_tracking:aggregates:${targetType}:${targetId}:${period}`,
    VIEW_COUNTS: (targetType: string, targetId: string) => `view_tracking:counts:${targetType}:${targetId}`,
    VIEW_STATS: (targetType: string, targetId: string, timeframe: string) => `view_tracking:stats:${targetType}:${targetId}:${timeframe}`,
  },
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
  VIEW_TRACKING: {
    AGGREGATES: 86400, // 24 hours
    BATCH_QUEUE: 3600, // 1 hour
    COUNTS: 3600, // 1 hour
    DEDUPLICATION: 300, // 5 minutes
    PENDING_VIEWS: 1800, // 30 minutes
    SESSION_VIEWS: 28800, // 8 hours
    STATS: 1800, // 30 minutes
    TRENDING: 900, // 15 minutes
  },
} as const;
