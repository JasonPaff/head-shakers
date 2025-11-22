# Caching Conventions

## Overview

Head Shakers uses a dual-layer caching strategy:

1. **Next.js unstable_cache** - For most cached data with tag-based invalidation
2. **Upstash Redis** - For high-traffic public search queries

## File Structure

```
src/lib/services/
├── cache.service.ts              # Main cache service with domain helpers
├── cache-revalidation.service.ts # Coordinated invalidation service
```

```
src/lib/constants/
├── cache.ts                      # Cache keys, tags, TTL config
```

```
src/lib/utils/
├── cache-tags.utils.ts           # Tag generator functions
├── cache.utils.ts                # createHashFromObject utility
├── redis-client.ts               # Redis operations
```

## Required Imports

```typescript
import { CacheService } from '@/lib/services/cache.service';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CACHE_CONFIG, CACHE_KEYS } from '@/lib/constants/cache';
import { CacheTagGenerators } from '@/lib/utils/cache-tags.utils';
import { createHashFromObject } from '@/lib/utils/cache.utils';
```

## CacheService Domain Helpers

The `CacheService` provides domain-specific caching methods. Always prefer these over the generic `CacheService.cached()`:

### Bobblehead Caching

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

### Collection Caching

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

### User Caching

```typescript
// Cache user profile
CacheService.users.profile(fn, userId, options);

// Cache user statistics
CacheService.users.stats(fn, userId, options);
```

### Search Caching (Next.js unstable_cache)

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

### Redis Search Caching (High-Traffic)

For high-traffic public search queries, use Redis-backed caching:

```typescript
// Cache public search dropdown in Redis
CacheService.redisSearch.publicDropdown(fn, queryHash, options);

// Cache public search page in Redis
CacheService.redisSearch.publicPage(fn, queryHash, filtersHash, options);
```

### Analytics Caching

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

### Featured Content Caching

```typescript
// Cache featured content by type
CacheService.featured.content(fn, type, options);
```

## Generic Cache Method

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

CACHE_CONFIG.TTL.SHORT; // 60 seconds - Frequently changing data
CACHE_CONFIG.TTL.MEDIUM; // 300 seconds (5 min) - Standard data
CACHE_CONFIG.TTL.LONG; // 900 seconds (15 min) - Stable entity data
CACHE_CONFIG.TTL.EXTENDED; // 3600 seconds (1 hour) - Rarely changing data
CACHE_CONFIG.TTL.PUBLIC_SEARCH; // 600 seconds (10 min) - Public search results
```

| TTL Type      | Duration | Use Case                                        |
| ------------- | -------- | ----------------------------------------------- |
| SHORT         | 1 min    | Dashboard stats, trending content, recent views |
| MEDIUM        | 5 min    | List results, user stats, analytics             |
| LONG          | 15 min   | Single entity data, user profiles               |
| EXTENDED      | 1 hour   | Featured content, photos, popular searches      |
| PUBLIC_SEARCH | 10 min   | Public search results (dropdown and page)       |

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

### Search Cache Pattern

```typescript
static async searchBobbleheads(
  query: string,
  filters: SearchFilters = {},
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<Array<BobbleheadRecord>> {
  try {
    // 1. Create hash from filters for cache key
    const filtersHash = createHashFromObject(filters);

    // 2. Use search-specific cache helper
    return CacheService.bobbleheads.search(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });

        return BobbleheadsQuery.searchAsync(query, filters, context);
      },
      query,
      filtersHash,
      {
        context: {
          entityType: 'search',
          facade: facadeName,
          operation: 'searchBobbleheads',
          userId: viewerUserId,
        },
      },
    );
  } catch (error) {
    throw createFacadeError(errorContext, error);
  }
}
```

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

### Direct Tag Invalidation

```typescript
// Invalidate specific tag
CacheService.invalidateByTag(CACHE_CONFIG.TAGS.COLLECTION(collectionId));

// Invalidate multiple tags
const cacheTags = CacheTagGenerators.social.comments(entityType, entityId);
cacheTags.forEach((tag) => CacheService.invalidateByTag(tag));
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

## Redis Caching (High-Traffic)

For high-traffic public search queries, use Redis-backed caching:

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
    const dbInstance = ctx.tx ?? ctx.db;

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

## Anti-Patterns to Avoid

1. **Never cache write operations** - Only cache reads
2. **Never use generic `CacheService.cached()` when domain helper exists** - Use `CacheService.{domain}.{method}()`
3. **Never use hardcoded cache keys** - Use `CACHE_KEYS` constants
4. **Never use hardcoded TTL values** - Use `CACHE_CONFIG.TTL`
5. **Never skip cache invalidation** - Always invalidate after mutations
6. **Never cache user-specific data without user ID in key** - Include userId in cache key or options hash
7. **Never cache paginated data without pagination in key** - Include limit/offset in options hash
8. **Never ignore cache invalidation failures** - Log to Sentry as warnings
9. **Never use Redis for all caching** - Only use for high-traffic public search
10. **Never skip Sentry logging on cache errors** - Always capture exceptions with appropriate context
