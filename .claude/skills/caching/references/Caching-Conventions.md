# Caching Conventions

## Overview

Head Shakers uses a dual-layer caching strategy:
1. **Next.js unstable_cache** - For most cached data with tag-based invalidation
2. **Upstash Redis** - For high-traffic public search queries

## Cache Service Architecture

```
src/lib/services/
├── cache.service.ts              # Main cache service
├── cache-revalidation.service.ts # Coordinated invalidation
```

```
src/lib/constants/
├── cache.ts                      # Cache keys, tags, TTL config
```

```
src/lib/utils/
├── cache-tags.utils.ts           # Tag generator functions
├── redis-client.ts               # Redis operations
```

## CacheService Domain Utilities

The `CacheService` provides domain-specific caching methods:

```typescript
// Bobblehead caching
CacheService.bobbleheads.byId(fn, bobbleheadId, options);
CacheService.bobbleheads.byCollection(fn, collectionId, optionsHash, options);
CacheService.bobbleheads.byUser(fn, userId, optionsHash, options);
CacheService.bobbleheads.withRelations(fn, bobbleheadId, options);
CacheService.bobbleheads.photos(fn, bobbleheadId, options);
CacheService.bobbleheads.search(fn, query, filtersHash, options);

// Collection caching
CacheService.collections.byId(fn, collectionId, options);
CacheService.collections.byUser(fn, userId, optionsHash, options);
CacheService.collections.withRelations(fn, collectionId, options);
CacheService.collections.dashboard(fn, userId, options);
CacheService.collections.metrics(fn, collectionId, options);
CacheService.collections.public(fn, optionsHash, options);

// User caching
CacheService.users.profile(fn, userId, options);
CacheService.users.stats(fn, userId, options);

// Search caching
CacheService.search.results(fn, query, type, filtersHash, options);
CacheService.search.popular(fn, timeframe, options);
CacheService.search.publicDropdown(fn, queryHash, options);
CacheService.search.publicPage(fn, queryHash, filtersHash, options);

// Redis-based search (high-traffic)
CacheService.redisSearch.publicDropdown(fn, queryHash, options);
CacheService.redisSearch.publicPage(fn, queryHash, filtersHash, options);

// Analytics caching
CacheService.analytics.viewCounts(fn, targetType, targetId, options);
CacheService.analytics.aggregates(fn, targetType, targetId, period, options);
CacheService.analytics.trending(fn, targetType, timeframe, options);

// Featured content
CacheService.featured.content(fn, type, options);
```

## Generic Cache Method

For custom caching needs:

```typescript
const result = await CacheService.cached(
  () => fetchData(), // The async function to cache
  'custom:cache:key',
  {
    context: {
      entityId: 'id',
      entityType: 'type',
      facade: 'FacadeName',
      operation: 'operationName',
    },
    tags: ['tag1', 'tag2'],
    ttl: CACHE_CONFIG.TTL.MEDIUM,
  }
);
```

## Cache Keys

Use `CACHE_KEYS` constants for consistent key generation:

```typescript
import { CACHE_KEYS } from '@/lib/constants/cache';

// Entity-specific keys
CACHE_KEYS.BOBBLEHEADS.BY_ID(bobbleheadId);           // bobblehead:{id}
CACHE_KEYS.BOBBLEHEADS.BY_COLLECTION(collectionId);   // bobblehead:collection:{id}
CACHE_KEYS.BOBBLEHEADS.BY_USER(userId, optionsHash);  // bobblehead:user:{id}:{hash}

CACHE_KEYS.COLLECTIONS.BY_ID(collectionId);           // collection:{id}
CACHE_KEYS.COLLECTIONS.BY_USER(userId, optionsHash);  // collection:user:{id}:{hash}
CACHE_KEYS.COLLECTIONS.DASHBOARD(userId);             // collection:dashboard:{id}

CACHE_KEYS.USERS.PROFILE(userId);                     // user:profile:{id}
CACHE_KEYS.USERS.STATS(userId);                       // user:stats:{id}

// Search keys
CACHE_KEYS.SEARCH.RESULTS(query, type, filtersHash);  // search:{type}:{query}:{hash}
CACHE_KEYS.SEARCH.PUBLIC_DROPDOWN(queryHash);         // search:public:dropdown:{hash}
CACHE_KEYS.SEARCH.PUBLIC_PAGE(queryHash, filtersHash);// search:public:page:{hash}:{hash}

// Social keys
CACHE_KEYS.SOCIAL.COMMENTS(targetType, targetId);     // social:comments:{type}:{id}
CACHE_KEYS.SOCIAL.LIKES(targetType, targetId);        // social:likes:{type}:{id}
```

## Cache Tags

Use `CacheTagGenerators` for consistent tag generation:

```typescript
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';

// Entity tags
CacheTagGenerators.bobblehead.read(bobbleheadId, userId);
CacheTagGenerators.collection.read(collectionId, userId);
CacheTagGenerators.user.profile(userId);
CacheTagGenerators.user.stats(userId);

// Social tags
CacheTagGenerators.social.like(entityType, entityId, userId);
CacheTagGenerators.social.comments(entityType, entityId);
CacheTagGenerators.social.comment(commentId, userId);

// Search tags
CacheTagGenerators.search.results(query, type);
CacheTagGenerators.search.popular();

// Featured tags
CacheTagGenerators.featured.content(type);
```

## TTL Configuration

Use `CACHE_CONFIG.TTL` for consistent TTL values:

```typescript
import { CACHE_CONFIG } from '@/lib/constants/cache';

CACHE_CONFIG.TTL.SHORT    // 60 seconds - Frequently changing data
CACHE_CONFIG.TTL.MEDIUM   // 300 seconds (5 min) - Standard data
CACHE_CONFIG.TTL.LONG     // 900 seconds (15 min) - Stable entity data
CACHE_CONFIG.TTL.EXTENDED // 3600 seconds (1 hour) - Rarely changing data
CACHE_CONFIG.TTL.PUBLIC_SEARCH // 600 seconds (10 min) - Public search results
```

| TTL Type | Duration | Use Case |
|----------|----------|----------|
| SHORT | 1 min | Dashboard stats, trending content |
| MEDIUM | 5 min | List results, user data |
| LONG | 15 min | Single entity data |
| EXTENDED | 1 hour | Featured content, photos |
| PUBLIC_SEARCH | 10 min | Public search results |

## Caching in Facades

### Standard Cache Pattern

```typescript
static async getData(
  entityId: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<DataType | null> {
  try {
    return CacheService.cached(
      async () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        return Query.getByIdAsync(entityId, context);
      },
      CACHE_KEYS.ENTITY.BY_ID(entityId),
      {
        context: {
          entityId,
          entityType: 'entity',
          facade: 'EntityFacade',
          operation: 'getData',
        },
        tags: CacheTagGenerators.entity.read(entityId, viewerUserId),
      },
    );
  } catch (error) {
    throw createFacadeError(errorContext, error);
  }
}
```

### Paginated Cache Pattern

```typescript
static async getList(
  entityId: string,
  options: FindOptions = {},
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<ListData> {
  try {
    // Include pagination in cache key for proper segmentation
    const limit = options.limit || 10;
    const offset = options.offset || 0;
    const cacheKey = `${CACHE_KEYS.ENTITY.LIST(entityId)}:${limit}:${offset}:${viewerUserId || 'public'}`;

    return CacheService.cached(
      async () => {
        const context = /* ... */;
        const items = await Query.getListAsync(entityId, options, context);
        const total = await Query.getCountAsync(entityId, context);
        const hasMore = offset + items.length < total;

        return { items, hasMore, total };
      },
      cacheKey,
      {
        context: { /* ... */ },
        tags: CacheTagGenerators.entity.list(entityId, viewerUserId),
      },
    );
  } catch (error) {
    throw createFacadeError(errorContext, error);
  }
}
```

## Cache Invalidation

### Using CacheService.invalidateByTag

```typescript
// Invalidate all cache entries with a specific tag
CacheService.invalidateByTag(CACHE_CONFIG.TAGS.COLLECTION(collectionId));

// Invalidate multiple tags
const cacheTags = CacheTagGenerators.social.comments(entityType, entityId);
cacheTags.forEach((tag) => CacheService.invalidateByTag(tag));
```

### Using CacheRevalidationService

For coordinated invalidation after mutations:

```typescript
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';

// After like/unlike
CacheRevalidationService.social.onLikeChange(
  entityType,  // 'bobblehead' | 'collection'
  entityId,
  userId,
  action,      // 'like' | 'unlike'
);

// After comment add/update/delete
CacheRevalidationService.social.onCommentChange(
  entityType,
  entityId,
  userId,
  action,      // 'add' | 'update' | 'delete'
);

// Check for failures (non-blocking)
const revalidationResult = CacheRevalidationService.social.onLikeChange(...);
if (!revalidationResult.isSuccess) {
  Sentry.captureException(new Error('Cache invalidation failed'), {
    extra: {
      error: revalidationResult.error,
      tagsAttempted: revalidationResult.tagsInvalidated,
    },
    level: 'warning',
  });
}
```

## Redis Caching (High-Traffic)

For high-traffic public search queries:

```typescript
// Use Redis for public search dropdown
const results = await CacheService.redisSearch.publicDropdown(
  () => searchPublicConsolidated(query),
  createHashFromObject({ query }),
);

// Use Redis for public search page
const results = await CacheService.redisSearch.publicPage(
  () => searchPublicWithFilters(query, filters),
  createHashFromObject({ query }),
  createHashFromObject({ filters, pagination }),
);
```

### Redis Operations

```typescript
import { RedisOperations } from '@/lib/utils/redis-client';

// Set with TTL
await RedisOperations.set(key, data, ttlSeconds);

// Get (auto-deserializes)
const data = await RedisOperations.get<DataType>(key);

// Delete
await RedisOperations.delete(key);
```

## Cache Options

```typescript
interface CacheOptions {
  context?: CacheContext;       // Operation context for logging
  isBypassCache?: boolean;      // Skip cache, call function directly
  isForceRefresh?: boolean;     // Refresh cache with new data
  tags?: Array<string>;         // Cache tags for invalidation
  ttl?: number;                 // Time-to-live in seconds
}

interface CacheContext {
  entityId?: string;
  entityType?: string;
  facade?: string;
  operation: string;
  userId?: string;
}
```

## Anti-Patterns to Avoid

1. **Never cache write operations** - Only cache reads
2. **Never use hardcoded cache keys** - Use `CACHE_KEYS` constants
3. **Never use hardcoded TTL values** - Use `CACHE_CONFIG.TTL`
4. **Never skip cache invalidation** - Always invalidate after mutations
5. **Never cache user-specific data without user ID in key** - Include userId in cache key
6. **Never cache paginated data without pagination in key** - Include limit/offset in key
7. **Never ignore cache invalidation failures** - Log to Sentry as warnings
