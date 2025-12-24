# Caching Conventions

## Overview

The project uses a 4-layer caching strategy:

1. **React `cache()`** - Same-request deduplication for server components
2. **Next.js `unstable_cache()`** - Cross-request caching with tag-based invalidation (primary)
3. **Upstash Redis** - High-traffic public data, distributed locks, rate limiting, view tracking
4. **Cloudinary** - Image transformation and CDN-level caching

## File Structure

```
src/lib/services/
├── cache.service.ts              # Main cache service with domain helpers
├── cache-revalidation.service.ts # Coordinated invalidation service
```

```
src/lib/constants/
├── cache.ts                      # Cache keys, tags, TTL config
├── redis-keys.ts                 # Redis-specific keys and TTL
```

```
src/lib/utils/
├── cache-tags.utils.ts           # Tag generator functions
├── cache.utils.ts                # createHashFromObject utility
├── redis-client.ts               # Redis operations wrapper
```

## Required Imports

```typescript
import { CacheService } from '@/lib/services/cache.service';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/constants/cache';
import { REDIS_KEYS, REDIS_TTL } from '@/lib/constants/redis-keys';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createHashFromObject } from '@/lib/utils/cache.utils';
import { RedisOperations } from '@/lib/utils/redis-client';
```

---

## Layer 1: React cache() - Request-Level Caching

> **STATUS: IMPLEMENTED**

Use React's `cache()` for deduplicating expensive operations within a single request/render cycle.

### Use Cases

- Getting current user ID multiple times in server component tree
- Fetching the same data in layout and page components
- Deduplicating auth checks across nested components

### Implemented Functions

The following auth-related functions use React `cache()` for request-level deduplication:

| Function                 | Location                      | Description                                               |
| ------------------------ | ----------------------------- | --------------------------------------------------------- |
| `getCurrentClerkUserId`  | `@/utils/optional-auth-utils` | Returns Clerk user ID (cached)                            |
| `getOptionalUserId`      | `@/utils/optional-auth-utils` | Returns DB user ID or null (cached)                       |
| `getUserId`              | `@/utils/user-utils`          | Returns DB user ID, redirects if unauthenticated (cached) |
| `checkIsModerator`       | `@/lib/utils/admin.utils`     | Checks moderator/admin role (cached)                      |
| `getCurrentUserWithRole` | `@/lib/utils/admin.utils`     | Returns user with role info (cached)                      |

### Pattern

```typescript
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';

// Wrap expensive operations that may be called multiple times per request
export const getCurrentClerkUserId = cache(async (): Promise<string | null> => {
  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
});

// Build on cached functions for derived data
export const getOptionalUserId = cache(async (): Promise<string | null> => {
  const clerkUserId = await getCurrentClerkUserId();
  if (!clerkUserId) return null;

  const dbUser = await UsersFacade.getUserByClerkId(clerkUserId);
  return dbUser?.id ?? null;
});

// Usage in multiple server components - only executes once per request
// layout.tsx
const userId = await getOptionalUserId();

// page.tsx (same request)
const userId = await getOptionalUserId(); // Returns cached result
```

### When to Use

- Function is called multiple times during single request
- Function has side effects that should only happen once
- Expensive auth/session lookups
- Data needed in both layout and page components

---

## Layer 2: Next.js unstable_cache() - Cross-Request Caching

This is the **primary caching mechanism** for the application. Use `CacheService` domain helpers.

### CacheService Domain Helpers

Always prefer domain-specific helpers over the generic `CacheService.cached()`:

#### Bobblehead Caching

```typescript
// Cache single bobblehead by ID
CacheService.bobbleheads.byId(fn, bobbleheadId, options);

// Cache bobbleheads by collection
CacheService.bobbleheads.byCollection(fn, collectionId, optionsHash, options);

// Cache bobbleheads by user
CacheService.bobbleheads.byUser(fn, userId, optionsHash, options);

// Cache bobblehead with relations (includes tags)
CacheService.bobbleheads.withRelations(fn, bobbleheadId, options);

// Cache bobblehead photos
CacheService.bobbleheads.photos(fn, bobbleheadId, options);

// Cache bobblehead search results
CacheService.bobbleheads.search(fn, query, filtersHash, options);
```

#### Collection Caching

```typescript
// Cache single collection by ID
CacheService.collections.byId(fn, collectionId, options);

// Cache collections by user
CacheService.collections.byUser(fn, userId, optionsHash, options);

// Cache collection with relations
CacheService.collections.withRelations(fn, collectionId, options);

// Cache collection dashboard data
CacheService.collections.dashboard(fn, userId, options);

// Cache collection metrics
CacheService.collections.metrics(fn, collectionId, options);

// Cache public collections
CacheService.collections.public(fn, optionsHash, options);
```

#### User Caching

```typescript
// Cache user profile
CacheService.users.profile(fn, userId, options);

// Cache user statistics
CacheService.users.stats(fn, userId, options);
```

#### Search Caching (Next.js unstable_cache)

```typescript
// Cache search results
CacheService.search.results(fn, query, type, filtersHash, options);

// Cache popular searches
CacheService.search.popular(fn, timeframe, options);

// Cache public search dropdown (unstable_cache)
CacheService.search.publicDropdown(fn, queryHash, options);

// Cache public search page (unstable_cache)
CacheService.search.publicPage(fn, queryHash, filtersHash, options);

// Invalidate all public search cache
CacheService.search.invalidatePublic();
```

#### Analytics Caching

```typescript
// Cache view counts
CacheService.analytics.viewCounts(fn, targetType, targetId, options);

// Cache view aggregates
CacheService.analytics.aggregates(fn, targetType, targetId, period, options);

// Cache trending content
CacheService.analytics.trending(fn, targetType, timeframe, options);

// Cache view statistics
CacheService.analytics.viewStats(fn, targetType, targetId, timeframe, options);

// Cache recent views
CacheService.analytics.recentViews(fn, targetType, targetId, limit, options);

// Cache engagement metrics
CacheService.analytics.engagement(fn, targetType, targetIds, optionsHash, options);

// Cache performance metrics
CacheService.analytics.performance(fn, targetType, targetIds, options);
```

#### Featured Content Caching

```typescript
// Cache featured content by type
CacheService.featured.content(fn, type, options);
```

### Generic Cache Method

For custom caching needs not covered by domain helpers:

```typescript
const result = await CacheService.cached(
  () => fetchData(), // 1. The async function to cache
  'custom:cache:key', // 2. Unique cache key
  {
    context: {
      // 3. Operation context for logging
      entityId: 'id',
      entityType: 'type',
      facade: 'FacadeName',
      operation: 'operationName',
    },
    tags: ['tag1', 'tag2'], // 4. Tags for invalidation
    ttl: CACHE_CONFIG.TTL.MEDIUM, // 5. Time-to-live
  },
);
```

---

## Layer 3: Upstash Redis - High-Traffic & Distributed Caching

Use Redis for high-traffic public endpoints, distributed operations, and features requiring TTL-based expiry.

### Redis Search Caching (High-Traffic)

For high-traffic public search queries:

```typescript
import { createHashFromObject } from '@/lib/utils/cache.utils';

// Public search dropdown
const results = await CacheService.redisSearch.publicDropdown(
  () => searchPublicConsolidated(query),
  createHashFromObject({ query }),
);

// Public search page with filters
const results = await CacheService.redisSearch.publicPage(
  () => searchPublicWithFilters(query, filters),
  createHashFromObject({ query }),
  createHashFromObject({ filters, pagination }),
);
```

### Redis Keys Structure

Use `REDIS_KEYS` for Redis-specific operations:

```typescript
import { REDIS_KEYS } from '@/lib/constants/redis-keys';

// View tracking
REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION(targetType, targetId, viewerId);
REDIS_KEYS.VIEW_TRACKING.DEDUPLICATION_ANONYMOUS(targetType, targetId, ipAddress);
REDIS_KEYS.VIEW_TRACKING.VIEW_COUNTS(targetType, targetId);
REDIS_KEYS.VIEW_TRACKING.VIEW_AGGREGATES(targetType, targetId, period);
REDIS_KEYS.VIEW_TRACKING.TRENDING_CACHE(targetType, timeframe);
REDIS_KEYS.VIEW_TRACKING.RECENT_VIEWS(targetType, targetId);

// Distributed locks
REDIS_KEYS.LOCKS.AGGREGATE_UPDATE(type, id);
REDIS_KEYS.LOCKS.BOBBLEHEAD_UPDATE(bobbleheadId);
REDIS_KEYS.LOCKS.COLLECTION_UPDATE(collectionId);
REDIS_KEYS.LOCKS.USER_UPDATE(userId);

// Rate limiting
REDIS_KEYS.RATE_LIMIT(userId);
REDIS_KEYS.RATE_LIMIT_ACTION(userId, action);

// Entity caching
REDIS_KEYS.CACHE.BOBBLEHEAD(bobbleheadId);
REDIS_KEYS.CACHE.COLLECTION(collectionId);
REDIS_KEYS.CACHE.USER_PROFILE(userId);
REDIS_KEYS.CACHE.FEATURED_CONTENT(type);
```

### RedisOperations API

```typescript
import { RedisOperations } from '@/lib/utils/redis-client';

// Basic operations
await RedisOperations.get<T>(key); // Auto-deserializes JSON
await RedisOperations.set<T>(key, value, ttlSeconds); // Auto-serializes
await RedisOperations.del(key);
await RedisOperations.exists(key);
await RedisOperations.expire(key, ttlSeconds);

// Hash operations
await RedisOperations.hset(key, { field1: 'value1', field2: 123 });
await RedisOperations.hgetall(key);
await RedisOperations.hincrby(key, field, increment);

// Counter operations
await RedisOperations.incr(key);
```

---

## Cache Keys

Use `CACHE_KEYS` constants for consistent key generation:

```typescript
import { CACHE_KEYS } from '@/lib/constants/cache';

// Bobblehead keys
CACHE_KEYS.BOBBLEHEADS.BY_ID(bobbleheadId);
CACHE_KEYS.BOBBLEHEADS.BY_COLLECTION(collectionId, optionsHash);
CACHE_KEYS.BOBBLEHEADS.BY_USER(userId, optionsHash);
CACHE_KEYS.BOBBLEHEADS.PHOTOS(bobbleheadId);
CACHE_KEYS.BOBBLEHEADS.SEARCH(query, filtersHash);
CACHE_KEYS.BOBBLEHEADS.WITH_RELATIONS(bobbleheadId);

// Collection keys
CACHE_KEYS.COLLECTIONS.BY_ID(collectionId);
CACHE_KEYS.COLLECTIONS.BY_USER(userId, optionsHash);
CACHE_KEYS.COLLECTIONS.DASHBOARD(userId);
CACHE_KEYS.COLLECTIONS.METRICS(collectionId);
CACHE_KEYS.COLLECTIONS.PUBLIC(optionsHash);
CACHE_KEYS.COLLECTIONS.WITH_RELATIONS(collectionId);

// User keys
CACHE_KEYS.USERS.PROFILE(userId);
CACHE_KEYS.USERS.STATS(userId);

// Search keys
CACHE_KEYS.SEARCH.RESULTS(query, type, filtersHash);
CACHE_KEYS.SEARCH.POPULAR(timeframe);
CACHE_KEYS.SEARCH.PUBLIC_DROPDOWN(queryHash);
CACHE_KEYS.SEARCH.PUBLIC_PAGE(queryHash, filtersHash);

// Analytics keys
CACHE_KEYS.ANALYTICS.VIEW_COUNTS(targetType, targetId);
CACHE_KEYS.ANALYTICS.AGGREGATES(targetType, targetId, period);
CACHE_KEYS.ANALYTICS.TRENDING(targetType, timeframe);
CACHE_KEYS.ANALYTICS.VIEW_STATS(targetType, targetId, timeframe);
CACHE_KEYS.ANALYTICS.RECENT_VIEWS(targetType, targetId, limit);
CACHE_KEYS.ANALYTICS.ENGAGEMENT(targetType, targetIds, optionsHash);
CACHE_KEYS.ANALYTICS.PERFORMANCE(targetType, targetIds);

// Featured keys
CACHE_KEYS.FEATURED.CONTENT(type);
```

---

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

---

## TTL Configuration

### CACHE_CONFIG.TTL (for unstable_cache)

```typescript
import { CACHE_CONFIG } from '@/lib/constants/cache';

CACHE_CONFIG.TTL.REALTIME; // 30 seconds - Ultra-fast changing data (trending)
CACHE_CONFIG.TTL.SHORT; // 300 seconds (5 min) - User-specific, frequent updates
CACHE_CONFIG.TTL.MEDIUM; // 1800 seconds (30 min) - Semi-static list data
CACHE_CONFIG.TTL.LONG; // 3600 seconds (1 hour) - Stable entity data
CACHE_CONFIG.TTL.EXTENDED; // 14400 seconds (4 hours) - Rarely changing
CACHE_CONFIG.TTL.PUBLIC_SEARCH; // 600 seconds (10 min) - Public search results
CACHE_CONFIG.TTL.DAILY; // 86400 seconds (24 hours) - Aggregated data
CACHE_CONFIG.TTL.WEEKLY; // 604800 seconds (7 days) - Statistical data
```

| TTL Type      | Duration | Use Case                                |
| ------------- | -------- | --------------------------------------- |
| REALTIME      | 30s      | Trending content, live metrics          |
| SHORT         | 5 min    | User dashboards, recent activity        |
| MEDIUM        | 30 min   | Collection lists, search results        |
| LONG          | 1 hour   | Entity details, user profiles           |
| EXTENDED      | 4 hours  | Photos, rarely changing data            |
| PUBLIC_SEARCH | 10 min   | Public search dropdown and page results |
| DAILY         | 24 hours | Aggregated statistics, historical data  |
| WEEKLY        | 7 days   | Long-term statistics, global metrics    |

### REDIS_TTL (for Redis operations)

```typescript
import { REDIS_TTL } from '@/lib/constants/redis-keys';

REDIS_TTL.ANALYTICS; // 604800 (1 week)
REDIS_TTL.CACHE.SHORT; // 300 (5 min)
REDIS_TTL.CACHE.MEDIUM; // 1800 (30 min)
REDIS_TTL.CACHE.LONG; // 3600 (1 hour)
REDIS_TTL.CACHE.DAILY; // 86400 (24 hours)
REDIS_TTL.LOCK; // 30 seconds
REDIS_TTL.RATE_LIMIT; // 60 seconds
REDIS_TTL.SESSION; // 86400 (24 hours)
REDIS_TTL.TEMP; // 3600 (1 hour)

// View tracking specific
REDIS_TTL.VIEW_TRACKING.DEDUPLICATION; // 300 (5 min)
REDIS_TTL.VIEW_TRACKING.COUNTS; // 3600 (1 hour)
REDIS_TTL.VIEW_TRACKING.AGGREGATES; // 86400 (24 hours)
REDIS_TTL.VIEW_TRACKING.TRENDING; // 900 (15 min)
REDIS_TTL.VIEW_TRACKING.STATS; // 1800 (30 min)
```

---

## Caching in Facades

### Standard Cache Pattern

```typescript
static async getBobbleheadById(
  bobbleheadId: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  // 1. Use domain-specific cache helper (handles key, tags, TTL automatically)
  return CacheService.bobbleheads.byId(
    () => {
      // 2. Create appropriate query context
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      // 3. Execute the query
      return BobbleheadsQuery.findByIdAsync(bobbleheadId, context);
    },
    bobbleheadId,
    {
      // 4. Provide operation context for logging
      context: {
        entityId: bobbleheadId,
        entityType: 'bobblehead',
        facade: facadeName,
        operation: 'getById',
        userId: viewerUserId,
      },
    },
  );
}
```

### Paginated Cache Pattern

```typescript
static async getCollectionsByUser(
  userId: string,
  options: FindOptions = {},
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<CollectionListData> {
  try {
    // 1. Create options hash for cache key segmentation
    const optionsHash = createHashFromObject({
      limit: options.limit || 10,
      offset: options.offset || 0,
      sort: options.sort,
      viewerUserId,
    });

    // 2. Use domain helper with options hash
    return CacheService.collections.byUser(
      async () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        const items = await CollectionsQuery.findByUserAsync(userId, options, context);
        const total = await CollectionsQuery.countByUserAsync(userId, context);
        const hasMore = (options.offset || 0) + items.length < total;

        return { items, hasMore, total };
      },
      userId,
      optionsHash,
      {
        context: {
          entityType: 'collection',
          facade: facadeName,
          operation: 'getByUser',
          userId,
        },
      },
    );
  } catch (error) {
    throw createFacadeError(errorContext, error);
  }
}
```

---

## Cache Invalidation

### CacheRevalidationService Domain Methods

The `CacheRevalidationService` provides domain-specific invalidation:

#### Bobblehead Invalidation

```typescript
// After creation
CacheRevalidationService.bobbleheads.onCreate(bobbleheadId, userId, collectionId, slug);

// After update
CacheRevalidationService.bobbleheads.onUpdate(bobbleheadId, userId, collectionId, slug);

// After deletion
CacheRevalidationService.bobbleheads.onDelete(bobbleheadId, userId, collectionId, slug);

// After photo operations
CacheRevalidationService.bobbleheads.onPhotoChange(
  bobbleheadId,
  userId,
  'add' | 'delete' | 'update' | 'reorder',
  slug,
);

// After tag operations
CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'add' | 'remove', slug);
```

#### Collection Invalidation

```typescript
// After creation
CacheRevalidationService.collections.onCreate(collectionId, userId, slug);

// After update
CacheRevalidationService.collections.onUpdate(collectionId, userId, slug);

// After deletion
CacheRevalidationService.collections.onDelete(collectionId, userId, slug);

// After bobblehead added/removed
CacheRevalidationService.collections.onBobbleheadChange(
  collectionId,
  bobbleheadId,
  userId,
  'add' | 'remove',
  collectionSlug,
  bobbleheadSlug,
);
```

#### Social Invalidation

```typescript
// After like/unlike
CacheRevalidationService.social.onLikeChange(entityType, entityId, userId, 'like' | 'unlike', slug);

// After comment operations
CacheRevalidationService.social.onCommentChange(
  entityType,
  entityId,
  userId,
  'add' | 'update' | 'delete',
  slug,
  commentId,
  parentCommentId,
);

// After follow/unfollow
CacheRevalidationService.social.onFollowChange(followerId, followedId, 'follow' | 'unfollow');
```

#### User Invalidation

```typescript
// After profile update
CacheRevalidationService.users.onProfileUpdate(userId);

// After settings change
CacheRevalidationService.users.onSettingsChange(userId);
```

#### Analytics Invalidation

```typescript
// After view recorded
CacheRevalidationService.analytics.onViewRecord(entityType, entityId, userId);

// After view aggregation
CacheRevalidationService.analytics.onViewAggregation(entityType, processedCount);

// After trending update
CacheRevalidationService.analytics.onTrendingUpdate();
```

#### Featured Content Invalidation

```typescript
// After featured content change
CacheRevalidationService.featured.onContentChange(type);

// After major update
CacheRevalidationService.featured.onMajorUpdate();
```

#### Admin Invalidation

```typescript
// Full cache clear (nuclear option)
CacheRevalidationService.admin.onFullRevalidation(reason);

// System-wide changes
CacheRevalidationService.admin.onSystemChange(reason);
```

### Handling Invalidation Results

```typescript
// 1. Execute invalidation
const revalidationResult = CacheRevalidationService.bobbleheads.onUpdate(
  bobbleheadId,
  userId,
  collectionId,
  slug,
);

// 2. Check for failures (non-blocking)
if (!revalidationResult.isSuccess) {
  Sentry.captureException(new Error('Cache invalidation failed'), {
    extra: {
      error: revalidationResult.error,
      tagsAttempted: revalidationResult.tagsInvalidated,
      context: revalidationResult.context,
    },
    level: 'warning',
  });
}
```

---

## Cache Options

```typescript
interface CacheOptions {
  context?: CacheContext; // Operation context for logging
  isBypassCache?: boolean; // Skip cache, call function directly
  isForceRefresh?: boolean; // Refresh cache with new data
  tags?: Array<string>; // Cache tags for invalidation
  ttl?: number; // Time-to-live in seconds
}

interface CacheContext {
  entityId?: string;
  entityType?: string;
  facade?: string;
  operation: string;
  userId?: string;
}
```

---

## Server Action Integration

Always invalidate cache after mutations in server actions:

```typescript
export const updateBobbleheadAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.BOBBLEHEADS.UPDATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateBobbleheadSchema)
  .action(async ({ ctx, parsedInput }) => {
    const data = updateBobbleheadSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      // 1. Delegate to facade
      const result = await BobbleheadsFacade.updateAsync(data, ctx.userId, dbInstance);

      if (!result.isSuccessful) {
        throw new ActionError(/* ... */);
      }

      // 2. Invalidate cache after mutation
      CacheRevalidationService.bobbleheads.onUpdate(
        result.entity.id,
        ctx.userId,
        result.entity.collectionId,
        result.entity.slug,
      );

      return { success: true, message: 'Bobblehead updated', data: result.entity };
    } catch (error) {
      handleActionError(error, {
        /* ... */
      });
    }
  });
```

---

## When to Use Each Caching Layer

| Use Case                               | Recommended Layer | Rationale                                                |
| -------------------------------------- | ----------------- | -------------------------------------------------------- |
| Same-request deduplication             | React `cache()`   | Prevents redundant calls within single render            |
| Entity data (bobbleheads, collections) | `unstable_cache`  | Tag-based invalidation, automatic revalidation           |
| User-specific dashboard                | `unstable_cache`  | Privacy separation, tag invalidation                     |
| Public search results (high traffic)   | Redis             | Distributed, fast, handles scale                         |
| View tracking deduplication            | Redis             | Distributed, TTL-based expiry, prevents duplicate counts |
| Rate limiting                          | Redis             | Distributed counters, automatic TTL expiry               |
| Distributed locks                      | Redis             | Prevents concurrent updates across instances             |
| Image transformations                  | Cloudinary        | CDN-level caching, on-the-fly transforms                 |

---

## Anti-Patterns to Avoid

1. **Never cache write operations** - Only cache reads
2. **Never use generic `CacheService.cached()` when domain helper exists** - Use `CacheService.{domain}.{method}()`
3. **Never use hardcoded cache keys** - Use `CACHE_KEYS` or `REDIS_KEYS` constants
4. **Never use hardcoded TTL values** - Use `CACHE_CONFIG.TTL` or `REDIS_TTL`
5. **Never skip cache invalidation** - Always invalidate after mutations
6. **Never cache user-specific data without user ID in key** - Include userId in cache key or options hash
7. **Never cache paginated data without pagination in key** - Include limit/offset in options hash
8. **Never ignore cache invalidation failures** - Log to Sentry as warnings
9. **Never use Redis for all caching** - Redis is expensive; use unstable_cache for most entity data
10. **Never use unstable_cache without tags** - Makes invalidation impossible
11. **Never skip deduplication for view tracking** - Causes inflated counts
12. **Never skip Sentry logging on cache errors** - Always capture exceptions with appropriate context

---

## Facade Integration Requirements (MANDATORY)

When implementing facades, caching is NOT optional:

### Read Operations

- **ALL facade read methods MUST use domain-specific CacheService helpers**
- Example: `CacheService.bobbleheads.byId()`, NOT raw query calls

### Write Operations

- **ALL facade write methods MUST invalidate cache after mutation**
- Use `CacheRevalidationService.{domain}.on{Action}()` methods
- Cache invalidation must happen AFTER successful database operation
- Cache invalidation failures should be logged to Sentry but NOT fail the operation
