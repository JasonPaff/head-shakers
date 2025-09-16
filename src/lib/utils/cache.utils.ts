/**
 * cache-related constants
 */
export const CACHE_CONSTANTS = {
  HASH_LENGTH: 16, // truncated hash length
  MAX_KEY_LENGTH: 250, // nextJS cache key limit
  TAG_LOG_LIMIT: 10, // maximum tags to log
} as const;

/**
 * create a normalized cache key from multiple parameters
 */
export function createCacheKey(...parts: Array<number | string | undefined>): string {
  const key = parts
    .filter(Boolean)
    .map((part) => String(part))
    .join(':');

  // check if key exceeds length limit
  if (key.length > CACHE_CONSTANTS.MAX_KEY_LENGTH) {
    // hash long keys to stay within limits
    const prefix = key.slice(0, 50);
    const hash = createHashFromObject(key);
    return `${prefix}:${hash}`;
  }

  return key;
}

/**
 * standardized cache key generation for facade operations
 * ensures consistency across all facade implementations
 */
export function createFacadeCacheKey(
  entityType: string,
  operation: string,
  identifier: string,
  options?: Record<string, unknown>
): string {
  const baseKey = `${entityType}:${operation}:${identifier}`;

  if (!options || Object.keys(options).length === 0) {
    return baseKey;
  }

  const optionsHash = createHashFromObject(options);
  return `${baseKey}:${optionsHash}`;
}

/**
 * create a hash from an object for consistent cache keys
 * uses crypto.createHash for security and collision resistance
 */
export function createHashFromObject(obj: unknown): string {
  try {
    // sort object keys for deterministic serialization
    const normalizedObj = normalizeObjectForHashing(obj);
    const jsonString = JSON.stringify(normalizedObj);

    // use a simple safe hash for all environments to avoid import issues
    return simpleSafeHash(jsonString);
  } catch {
    // if all else fails, create a basic hash from the error and timestamp
    const fallbackData = `error-${Date.now()}-${Math.random()}`;
    return simpleSafeHash(fallbackData);
  }
}

/**
 * standardized cache key generation for search operations
 * handles complex filtering and pagination parameters
 */
export function createSearchCacheKey(
  searchType: string,
  query: string,
  filters?: {
    [key: string]: unknown;
    excludeTags?: Array<string>;
    includeTags?: Array<string>;
    limit?: number;
    offset?: number;
    userId?: string;
  }
): string {
  const baseKey = `search:${searchType}:${sanitizeCacheKey(query)}`;

  if (!filters || Object.keys(filters).length === 0) {
    return baseKey;
  }

  const filtersHash = createHashFromObject(filters);
  return `${baseKey}:${filtersHash}`;
}

/**
 * standardized cache key generation for user-specific operations
 * handles viewer context and privacy concerns
 */
export function createUserContextCacheKey(
  entityType: string,
  entityId: string,
  viewerUserId?: string,
  options?: Record<string, unknown>
): string {
  const baseKey = `${entityType}:${entityId}`;
  const viewerPart = viewerUserId ? `:viewer:${viewerUserId}` : ':public';

  if (!options || Object.keys(options).length === 0) {
    return `${baseKey}${viewerPart}`;
  }

  const optionsHash = createHashFromObject(options);
  return `${baseKey}${viewerPart}:${optionsHash}`;
}

/**
 * sanitize a string for use in cache keys
 */
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9\-_:]/g, '_').toLowerCase();
}

/**
 * normalize an object for consistent hashing
 */
function normalizeObjectForHashing(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(normalizeObjectForHashing);
  }

  // sort object keys for deterministic serialization
  const sortedObj: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();

  for (const key of keys) {
    sortedObj[key] = normalizeObjectForHashing((obj as Record<string, unknown>)[key]);
  }

  return sortedObj;
}

/**
 * simple but safe hash function as a fallback
 */
function simpleSafeHash(input: string): string {
  let hash = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // convert to 32-bit integer
  }

  // convert to positive hex string
  const hexHash = Math.abs(hash).toString(16);

  // pad with zeros and truncate to the desired length
  return hexHash.padStart(CACHE_CONSTANTS.HASH_LENGTH, '0').slice(0, CACHE_CONSTANTS.HASH_LENGTH);
}
