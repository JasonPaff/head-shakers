# Facade Layer Conventions

## Overview

The facade layer in The project provides a business logic abstraction between server actions and database queries. Facades coordinate multiple queries, manage transactions, handle caching, orchestrate cross-service operations, and enforce business rules with Sentry monitoring.

## File Structure

```
src/lib/facades/
├── {domain}/
│   └── {domain}.facade.ts
```

## File Naming

- **Files**: `{domain}.facade.ts` (e.g., `social.facade.ts`, `bobbleheads.facade.ts`)
- **Classes**: `{Domain}Facade` (e.g., `SocialFacade`, `BobbleheadsFacade`)
- **Methods**: `{verb}{Entity}Async` - **ALL async methods MUST use `Async` suffix** (e.g., `createAsync`, `getBobbleheadByIdAsync`, `toggleLikeAsync`)

> **IMPORTANT**: The `Async` suffix is REQUIRED for all async methods. This ensures consistent API across all facades and makes it clear which methods are asynchronous.

## Facade Class Structure

```typescript
import * as Sentry from '@sentry/nextjs';

import type { FindOptions } from '@/lib/queries/base/query-context';
import type { {EntityRecord}, {EntityWithRelations} } from '@/lib/queries/{domain}/{domain}-query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { Insert{Entity}, Update{Entity} } from '@/lib/validations/{domain}.validation';

import { OPERATIONS, SENTRY_BREADCRUMB_CATEGORIES, SENTRY_LEVELS } from '@/lib/constants';
import { db } from '@/lib/db';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { {Domain}Query } from '@/lib/queries/{domain}/{domain}-query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { CacheService } from '@/lib/services/cache.service';
import { createFacadeError } from '@/lib/utils/error-builders';

// Define facade name constant for consistent error context
const facadeName = '{Domain}Facade';

// Result interfaces
export interface {Entity}MutationResult {
  entity: {EntityType} | null;
  error?: string;
  isSuccessful: boolean;
}

export interface {Entity}ListData {
  items: Array<{EntityType}>;
  hasMore: boolean;
  total: number;
}

export class {Domain}Facade {
  // Read operations (with domain-specific caching)
  static async get{Entity}ById(
    id: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{EntityRecord} | null> {
    return CacheService.{domain}.byId(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return {Domain}Query.findByIdAsync(id, context);
      },
      id,
      {
        context: {
          entityId: id,
          entityType: '{entity}',
          facade: facadeName,
          operation: 'getById',
          userId: viewerUserId,
        },
      },
    );
  }

  // Write operations (with transactions)
  static async createAsync(
    data: Insert{Entity},
    userId: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<{EntityRecord} | null> {
    try {
      const context = createUserQueryContext(userId, { dbInstance });
      return {Domain}Query.createAsync(data, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { name: data.name },
        facade: facadeName,
        method: 'createAsync',
        operation: OPERATIONS.{DOMAIN}.CREATE,
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
```

## Context Selection

| Operation Type   | Context Factory               | Use Case                                 |
| ---------------- | ----------------------------- | ---------------------------------------- |
| Public reads     | `createPublicQueryContext`    | Unauthenticated data access              |
| User reads       | `createUserQueryContext`      | Authenticated reads with ownership       |
| Protected writes | `createProtectedQueryContext` | All write operations within transactions |
| Admin reads      | `createAdminQueryContext`     | Admin/moderator access to all content    |

```typescript
// Public read - no auth required
const context = createPublicQueryContext({ dbInstance });

// User read - shows user's private + all public
const context = createUserQueryContext(viewerUserId, { dbInstance });

// Protected write - requires auth, typically within transaction
const context = createProtectedQueryContext(userId, { dbInstance: tx });

// Admin read - sees all content regardless of visibility
const context = createAdminQueryContext(adminUserId, { dbInstance });
```

## QueryContext and Automatic Filtering

The `QueryContext` drives automatic filtering in query methods. Query classes extend `BaseQuery` which provides filter utilities that respect context flags.

### QueryContext Interface

```typescript
interface QueryContext {
  dbInstance?: DatabaseExecutor; // Transaction or main db
  isPublic?: boolean; // Public access mode - only public content
  requiredUserId?: string; // For protected operations - must be owner
  shouldIncludeDeleted?: boolean; // Include soft-deleted records
  userId?: string; // Current user ID
}
```

### How Context Flags Affect Filtering

Query methods internally use `buildBaseFilters()` which applies:

1. **Permission filter** - Based on `isPublic`, `userId`, `requiredUserId`
2. **Soft-delete filter** - Based on `shouldIncludeDeleted`

| Context Factory                   | Flags Set            | Permission Behavior            | Soft-Delete Behavior |
| --------------------------------- | -------------------- | ------------------------------ | -------------------- |
| `createPublicQueryContext()`      | `isPublic: true`     | Only `isPublic = true` records | Excludes deleted     |
| `createUserQueryContext(id)`      | `userId: id`         | Public OR owned by user        | Excludes deleted     |
| `createProtectedQueryContext(id)` | `requiredUserId: id` | Only owned by user             | Excludes deleted     |
| `createAdminQueryContext(id)`     | `userId: id`         | All content (no filter)        | Excludes deleted     |

### Why This Matters for Facades

**Facades should trust query methods to handle filtering.** When you:

1. Create the correct context type
2. Pass it to query methods
3. The query layer automatically applies appropriate filters

```typescript
// CORRECT: Let query handle filtering
const context = createPublicQueryContext({ dbInstance });
const count = await BobbleheadsQuery.getTotalBobbleheadCountAsync(context);
// Query internally applies: WHERE deleted_at IS NULL (based on context)

// INCORRECT: Manually adding filters that query already handles
const context = createPublicQueryContext({ dbInstance });
const count = await dbInstance
  .select({ count: count() })
  .from(bobbleheads)
  .where(
    and(
      eq(bobbleheads.isPublic, true), // Redundant - context handles this
      isNull(bobbleheads.deletedAt), // Redundant - context handles this
    ),
  );
```

### Override Flags When Needed

You can override default flags for special cases:

```typescript
// Include soft-deleted records (e.g., for admin restore feature)
const context = createAdminQueryContext(adminUserId, {
  dbInstance,
  shouldIncludeDeleted: true, // Override to see deleted records
});

// Public context with transaction support
const context = createPublicQueryContext({
  dbInstance: tx, // Use transaction executor
});
```

## Transaction Handling

### Standard Transaction Pattern

```typescript
static async update{Entity}(
  data: Update{Entity},
  userId: string,
  dbInstance: DatabaseExecutor = db,
): Promise<{Entity}MutationResult> {
  try {
    return await (dbInstance ?? db).transaction(async (tx) => {
      const context = createProtectedQueryContext(userId, { dbInstance: tx });

      // Step 1: Verify ownership/permissions
      const existing = await {Domain}Query.findByIdAsync(data.id, context);
      if (!existing || existing.userId !== userId) {
        return { entity: null, isSuccessful: false };
      }

      // Step 2: Perform the update
      const updated = await {Domain}Query.updateAsync(data, userId, context);

      // Step 3: Related operations
      await {Domain}Query.updateRelatedAsync(data.id, context);

      return {
        entity: updated,
        isSuccessful: !!updated,
      };
    });
  } catch (error) {
    const errorContext: FacadeErrorContext = {
      data: { id: data.id },
      facade: facadeName,
      method: 'update{Entity}',
      operation: OPERATIONS.{DOMAIN}.UPDATE,
      userId,
    };
    throw createFacadeError(errorContext, error);
  }
}
```

### Non-Transaction Pattern (Simple Queries)

```typescript
static async get{Entity}ById(
  id: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<{EntityRecord} | null> {
  try {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });
    return {Domain}Query.findByIdAsync(id, context);
  } catch (error) {
    const context: FacadeErrorContext = {
      data: { id },
      facade: facadeName,
      method: 'get{Entity}ById',
      operation: 'getById',
      userId: viewerUserId,
    };
    throw createFacadeError(context, error);
  }
}
```

## Caching Integration

### Domain-Specific CacheService Helpers

The project uses domain-specific cache helpers instead of generic `CacheService.cached()`:

```typescript
// Use domain-specific helpers
return CacheService.bobbleheads.byId(fn, id, options);
return CacheService.bobbleheads.photos(fn, bobbleheadId, options);
return CacheService.bobbleheads.byCollection(fn, collectionId, optionsHash, options);
return CacheService.bobbleheads.byUser(fn, userId, optionsHash, options);
return CacheService.bobbleheads.search(fn, searchTerm, filtersHash, options);
return CacheService.bobbleheads.withRelations(fn, id, options);

// Analytics caching
return CacheService.analytics.aggregates(fn, targetType, targetId, period, options);
return CacheService.analytics.engagement(fn, targetType, targetIds, optionsHash, options);
return CacheService.analytics.performance(fn, targetType, targetIds, options);
```

### Cache Context Pattern

```typescript
{
  context: {
    entityId: id,
    entityType: 'bobblehead',
    facade: 'BobbleheadsFacade',
    operation: 'getById',
    userId: viewerUserId,
  },
  ttl: 1800, // Optional custom TTL
}
```

### Using createHashFromObject for Cache Keys

```typescript
import { createHashFromObject } from '@/lib/utils/cache.utils';

static async search{Entity}s(
  searchTerm: string,
  filters: { category?: string; status?: string } = {},
  options: FindOptions = {},
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<Array<{EntityRecord}>> {
  try {
    const filtersHash = createHashFromObject(filters || {});
    return CacheService.{domain}.search(
      () => {
        const context =
          viewerUserId ?
            createUserQueryContext(viewerUserId, { dbInstance })
          : createPublicQueryContext({ dbInstance });
        return {Domain}Query.searchAsync(searchTerm, filters, options, context);
      },
      searchTerm,
      filtersHash,
      {
        context: {
          entityType: 'search',
          facade: facadeName,
          operation: 'search',
          userId: viewerUserId,
        },
      },
    );
  } catch (error) {
    // ... error handling
  }
}
```

### Cache Invalidation with CacheRevalidationService

```typescript
// After mutations, invalidate using domain-specific revalidation
CacheRevalidationService.bobbleheads.onPhotoChange(bobbleheadId, userId, 'delete');
CacheRevalidationService.bobbleheads.onPhotoChange(bobbleheadId, userId, 'update');
CacheRevalidationService.bobbleheads.onPhotoChange(bobbleheadId, userId, 'reorder');

// Social invalidation
const cacheTags = CacheTagGenerators.social.comments(targetType, targetId);
cacheTags.forEach((tag) => CacheService.invalidateByTag(tag));
```

## Query Delegation Pattern

Facades should NEVER write raw SQL or Drizzle queries directly. Always delegate to query classes that properly handle soft-delete filters, permissions, and other concerns.

### Why Query Delegation Matters

1. **Soft-delete consistency** - Query methods handle `deletedAt IS NULL` filters
2. **Permission enforcement** - Query methods apply visibility rules
3. **Single source of truth** - Changes to filters propagate automatically
4. **Testability** - Query methods can be mocked independently

### Correct Pattern

```typescript
// CORRECT: Delegate to query methods that handle soft-delete
static async getPlatformStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  const context = createPublicQueryContext({ dbInstance });

  const [bobbleheadsCount, collectionsCount, usersCount] = await Promise.all([
    BobbleheadsQuery.getTotalBobbleheadCountAsync(context),  // Handles deletedAt filter
    CollectionsQuery.getCollectionsCountAsync(context),      // Handles deletedAt filter
    UsersQuery.getUsersCountAsync(context),                  // Handles deletedAt filter
  ]);

  return { totalBobbleheads: bobbleheadsCount, totalCollections: collectionsCount, totalCollectors: usersCount };
}
```

### Incorrect Pattern

```typescript
// INCORRECT: Raw SQL in facade - bypasses soft-delete, permissions, etc.
static async getPlatformStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  const executor = dbInstance ?? db;

  const [bobbleheadsCount, collectionsCount, usersCount] = await Promise.all([
    // BAD: Missing soft-delete filter!
    executor.select({ count: count() }).from(bobbleheads).then(r => r[0]?.count || 0),
    // BAD: Missing soft-delete filter!
    executor.select({ count: count() }).from(collections).then(r => r[0]?.count || 0),
    // BAD: Using admin method for public query!
    UsersQuery.countUsersForAdminAsync({}, context),
  ]);
}
```

## Operation Constants

Always use semantically correct operation constants from `OPERATIONS` in `@/lib/constants/operations`. If an appropriate operation doesn't exist, ADD it rather than using an incorrect one.

### Correct Usage

```typescript
// CORRECT: Using semantically matching operation
const errorContext: FacadeErrorContext = {
  facade: facadeName,
  method: 'getPlatformStats',
  operation: OPERATIONS.PLATFORM.GET_STATS, // Matches the actual operation
};

// If OPERATIONS.PLATFORM.GET_STATS doesn't exist, ADD it to operations.ts:
// PLATFORM: {
//   GET_STATS: 'get_platform_stats',
// },
```

### Incorrect Usage

```typescript
// INCORRECT: Using unrelated operation constant
const errorContext: FacadeErrorContext = {
  facade: facadeName,
  method: 'getPlatformStats',
  operation: OPERATIONS.ANALYTICS.GET_VIEW_STATS, // Wrong! This is for view analytics
};
```

## Query Method Naming Semantics

Use query methods whose names match the access context. Don't use admin-named methods for public queries or vice versa.

### Method Naming Guidelines

| Access Context       | Method Naming Pattern                                | Example                       |
| -------------------- | ---------------------------------------------------- | ----------------------------- |
| Public (no auth)     | `get{Entity}CountAsync`, `find{Entity}sAsync`        | `getUsersCountAsync()`        |
| User (authenticated) | `get{Entity}ByUserAsync`, `findUserOwnedAsync`       | `getBobbleheadsByUserAsync()` |
| Admin (elevated)     | `{action}ForAdminAsync`, `get{Entity}sForAdminAsync` | `countUsersForAdminAsync()`   |

### Correct Usage

```typescript
// CORRECT: Public query using public-named method
const context = createPublicQueryContext({ dbInstance });
const count = await UsersQuery.getUsersCountAsync(context);

// CORRECT: Admin query using admin-named method
const context = createAdminQueryContext(adminUserId, { dbInstance });
const users = await UsersQuery.findUsersForAdminAsync(filters, context);
```

### Incorrect Usage

```typescript
// INCORRECT: Public query using admin-named method
const context = createPublicQueryContext({ dbInstance });
const count = await UsersQuery.countUsersForAdminAsync({}, context); // Semantically wrong!
```

## Consistent Context Usage

When making parallel queries, create ONE shared context and pass it to ALL queries. Never mix raw executor access with context-based queries.

### Correct Pattern

```typescript
// CORRECT: Single context shared across all parallel queries
static async getAggregateDataAsync(userId: string, dbInstance?: DatabaseExecutor) {
  const context = createUserQueryContext(userId, { dbInstance });

  const [bobbleheads, collections, stats] = await Promise.all([
    BobbleheadsQuery.findByUserAsync(userId, context),    // Uses context
    CollectionsQuery.findByUserAsync(userId, context),    // Uses same context
    UsersQuery.getUserStatsAsync(userId, context),        // Uses same context
  ]);

  return { bobbleheads, collections, stats };
}
```

### Incorrect Pattern

```typescript
// INCORRECT: Mixing raw executor with context-based queries
static async getAggregateDataAsync(userId: string, dbInstance?: DatabaseExecutor) {
  const context = createUserQueryContext(userId, { dbInstance });
  const executor = dbInstance ?? db;  // Redundant - context already has this

  const [bobbleheads, collections, stats] = await Promise.all([
    // BAD: Raw executor bypasses context
    executor.select().from(bobbleheads).where(eq(bobbleheads.userId, userId)),
    // OK: Uses context
    CollectionsQuery.findByUserAsync(userId, context),
    // BAD: Uses context but also has separate executor variable
    UsersQuery.getUserStatsAsync(userId, context),
  ]);
}
```

## Facade Operation Helpers

The project provides facade operation helper utilities in `@/lib/utils/facade-helpers.ts` that combine breadcrumb tracking with error handling for consistent facade patterns.

### Import

```typescript
import {
  executeFacadeMethod,
  executeFacadeOperation,
  executeFacadeOperationWithoutBreadcrumbs,
  includeFullResult,
} from '@/lib/utils/facade-helpers';
```

### `executeFacadeOperation()` - Full Wrapper (Recommended)

Executes a facade operation with **both** Sentry breadcrumbs AND error handling. This is the default helper for most facade operations:

```typescript
import { executeFacadeOperation } from '@/lib/utils/facade-helpers';

static async getPlatformStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  return executeFacadeOperation(
    {
      facade: facadeName,
      method: 'getPlatformStatsAsync',
      operation: OPERATIONS.PLATFORM.GET_STATS,
    },
    async () => {
      return await CacheService.platform.stats(async () => {
        const context = createPublicQueryContext({ dbInstance });
        // ... fetch stats
        return { totalBobbleheads, totalCollections, totalCollectors };
      });
    },
    {
      includeResultSummary: (stats) => ({
        totalBobbleheads: stats.totalBobbleheads,
        totalCollections: stats.totalCollections,
      }),
    },
  );
}
```

### `executeFacadeMethod()` - Simplified Wrapper

Simplified version when the operation name matches the method name. Does NOT include Sentry breadcrumbs - use for simple operations:

```typescript
import { executeFacadeMethod } from '@/lib/utils/facade-helpers';

static async getBobbleheadBySlugAsync(
  slug: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null> {
  return executeFacadeMethod(
    facadeName,
    'getBobbleheadBySlugAsync',
    async () => {
      const context = viewerUserId
        ? createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });
      return BobbleheadsQuery.findBySlugAsync(slug, context);
    },
    { userId: viewerUserId, data: { slug } },
  );
}
```

### `executeFacadeOperationWithoutBreadcrumbs()` - Error Handling Only

Wraps operation with error handling but skips breadcrumbs. Use for simple operations that don't need Sentry tracking:

```typescript
import { executeFacadeOperationWithoutBreadcrumbs } from '@/lib/utils/facade-helpers';

static async simpleQueryAsync(
  id: string,
  dbInstance?: DatabaseExecutor,
): Promise<EntityRecord | null> {
  return executeFacadeOperationWithoutBreadcrumbs(
    {
      facade: facadeName,
      method: 'simpleQueryAsync',
      operation: 'simpleQuery',
      data: { id },
    },
    async () => {
      const context = createPublicQueryContext({ dbInstance });
      return EntityQuery.findByIdAsync(id, context);
    },
  );
}
```

### `includeFullResult()` - Result Summarizer Helper

Helper for `includeResultSummary` that spreads the entire result into breadcrumb data:

```typescript
import { executeFacadeOperation, includeFullResult } from '@/lib/utils/facade-helpers';

// Include all result fields in breadcrumb
return executeFacadeOperation(
  { facade: facadeName, method: 'getDataAsync', operation: 'getData' },
  async () => fetchData(),
  { includeResultSummary: includeFullResult }, // Spreads entire result
);
```

### When to Use Each Helper

| Scenario                                      | Helper                                       | Breadcrumbs | Error Handling |
| --------------------------------------------- | -------------------------------------------- | ----------- | -------------- |
| Complex operations needing full observability | `executeFacadeOperation`                     | ✓           | ✓              |
| Simple queries (operation name = method name) | `executeFacadeMethod`                        | ✗           | ✓              |
| Operations without breadcrumb needs           | `executeFacadeOperationWithoutBreadcrumbs`   | ✗           | ✓              |
| Manual control needed                         | `withFacadeBreadcrumbs` (from sentry-server) | ✓           | ✗              |

### FacadeOperationConfig Interface

```typescript
interface FacadeOperationConfig {
  /** Name of the facade class */
  facade: string;
  /** Method name being executed */
  method: string;
  /** Operation identifier (from OPERATIONS constants) */
  operation: string;
  /** User ID if available */
  userId?: string;
  /** Additional data for error context (sanitized for logging) */
  data?: Record<string, unknown>;
}
```

## Sentry Integration

### Using Helper Utilities (Recommended)

The recommended approach is to use helper utilities from `@/lib/utils/sentry-server/breadcrumbs.server`:

| Function                  | Purpose                                                    |
| ------------------------- | ---------------------------------------------------------- |
| `withFacadeBreadcrumbs()` | Wrap facade method with automatic breadcrumbs              |
| `trackFacadeEntry()`      | Track facade operation start                               |
| `trackFacadeSuccess()`    | Track facade success with optional result data             |
| `trackFacadeWarning()`    | Track facade warning for partial failures (breadcrumb)     |
| `trackFacadeError()`      | Track facade error (breadcrumb)                            |
| `facadeBreadcrumb()`      | Add a simple breadcrumb for facade operations              |
| `captureFacadeWarning()`  | Capture non-critical exception with warning level and tags |

#### `withFacadeBreadcrumbs()` - Full Wrapper (Recommended)

Wraps facade methods with automatic entry/success/error breadcrumbs:

```typescript
import { withFacadeBreadcrumbs } from '@/lib/utils/sentry-server/breadcrumbs.server';

static async getUserByIdAsync(
  id: string,
  dbInstance?: DatabaseExecutor,
): Promise<UserRecord | null> {
  return withFacadeBreadcrumbs(
    { facade: 'UsersFacade', method: 'getUserByIdAsync' },
    async () => {
      const context = createPublicQueryContext({ dbInstance });
      return await UsersQuery.getUserByIdAsync(id, context);
    },
  );
}

// With result summary for richer breadcrumbs
static async getStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  return withFacadeBreadcrumbs(
    { facade: 'PlatformStatsFacade', method: 'getStatsAsync' },
    async () => {
      const stats = await fetchStats();
      return stats;
    },
    {
      includeResultSummary: (stats) => ({
        totalBobbleheads: stats.totalBobbleheads,
        totalCollections: stats.totalCollections,
      }),
    },
  );
}
```

#### Tracking Functions - For Manual Control

Use tracking functions when you need fine-grained control:

```typescript
import {
  captureFacadeWarning,
  trackFacadeEntry,
  trackFacadeSuccess,
  trackFacadeWarning,
} from '@/lib/utils/sentry-server/breadcrumbs.server';

static async deleteAsync(entityId: string, userId: string, dbInstance?: DatabaseExecutor) {
  trackFacadeEntry('BobbleheadsFacade', 'deleteAsync', { entityId });

  try {
    const result = await (dbInstance ?? db).transaction(async (tx) => {
      // ... deletion logic
    });

    trackFacadeSuccess('BobbleheadsFacade', 'deleteAsync', { entityId, deleted: true });

    // Non-blocking cleanup
    try {
      await CloudinaryService.deletePhotos(photoUrls);
    } catch (error) {
      // Use captureFacadeWarning to capture the exception with proper tags
      captureFacadeWarning(error, 'BobbleheadsFacade', 'cloudinary-cleanup', {
        entityId,
        photoCount: photoUrls.length,
      });
    }

    return result;
  } catch (error) {
    throw createFacadeError({ /* ... */ }, error);
  }
}
```

#### `captureFacadeWarning()` - For Non-Critical Exceptions

Capture a non-critical exception with proper facade tags and warning level. Use when you need to log an exception to Sentry but shouldn't fail the main operation:

```typescript
// Email sending failure (non-critical)
try {
  await EmailService.sendWelcomeEmail(userId);
} catch (emailError) {
  captureFacadeWarning(emailError, facadeName, OPERATIONS.NEWSLETTER.SEND_WELCOME_EMAIL, {
    signupId,
  });
  // Continue execution - don't throw
}

// Cloudinary cleanup failure
try {
  await CloudinaryService.deletePhotos(urls);
} catch (error) {
  captureFacadeWarning(error, 'BobbleheadsFacade', 'cloudinary-cleanup', {
    bobbleheadId,
    photoCount: urls.length,
  });
}
```

**Key difference from `trackFacadeWarning()`:**

- `trackFacadeWarning()` adds a breadcrumb (trail of events leading up to an error)
- `captureFacadeWarning()` captures an exception to Sentry (shows up as an issue with stack trace)

### Manual Pattern (Fallback)

For cases requiring direct Sentry access:

#### Breadcrumbs for Business Logic

```typescript
Sentry.addBreadcrumb({
  category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
  data: { bobbleheadId: bobblehead.id, count: successfulDeletions },
  level: SENTRY_LEVELS.INFO,
  message: `Successfully deleted ${successfulDeletions} photos from Cloudinary`,
});
```

#### Non-Blocking Error Capture

```typescript
// For non-critical operations that shouldn't fail the main operation
try {
  await ExternalService.cleanup(resourceId);
} catch (error) {
  // Don't fail the entire operation if cleanup fails
  Sentry.captureException(error, {
    extra: { resourceId, operation: 'cleanup' },
    level: 'warning',
  });
}
```

## Cross-Facade Coordination

### Calling Other Facades

```typescript
static async deleteAsync(
  data: Delete{Entity},
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<{EntityRecord} | null> {
  try {
    const context = createUserQueryContext(userId, { dbInstance });

    // Delete from primary query
    const deleteResult = await {Domain}Query.deleteAsync(data, userId, context);

    if (!deleteResult.entity) {
      return null;
    }

    // Coordinate with other facades
    const wasTagRemovalSuccessful = await TagsFacade.removeAllFrom{Entity}(
      deleteResult.entity.id,
      userId
    );

    if (!wasTagRemovalSuccessful) {
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: { entityId: deleteResult.entity.id },
        level: SENTRY_LEVELS.WARNING,
        message: 'Failed to remove tags during entity deletion',
      });
    }

    return deleteResult.entity;
  } catch (error) {
    // ... error handling
  }
}
```

### Parallel Data Fetching

```typescript
static async getContentData(
  targetId: string,
  targetType: LikeTargetType,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<ContentData> {
  try {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    // Fetch independent data in parallel
    const [likeCount, userStatus, comments] = await Promise.all([
      SocialFacade.getLikeCount(targetId, targetType, dbInstance),
      viewerUserId ?
        SocialQuery.getUserLikeStatusAsync(targetId, targetType, viewerUserId, context)
      : Promise.resolve({ isLiked: false, likeId: null }),
      SocialQuery.getCommentsAsync(targetId, targetType, {}, context),
    ]);

    return {
      comments,
      isLiked: userStatus.isLiked,
      likeCount,
      likeId: userStatus.likeId,
    };
  } catch (error) {
    // ... error handling
  }
}
```

## Error Handling

### Error Context Structure

```typescript
const errorContext: FacadeErrorContext = {
  data: { entityId, additionalData }, // Relevant data for debugging
  facade: facadeName, // Uses the const defined at top
  method: 'methodName', // Method that failed
  operation: OPERATIONS.DOMAIN.OP, // Operation constant
  userId: viewerUserId, // Optional user context
};
```

### Using createFacadeError

```typescript
import { createFacadeError } from '@/lib/utils/error-builders';

try {
  // ... operation
} catch (error) {
  const errorContext: FacadeErrorContext = {
    data: { entityId },
    facade: facadeName,
    method: 'toggleLike',
    operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
    userId,
  };
  throw createFacadeError(errorContext, error);
}
```

## Return Type Conventions

### Mutation Results (for complex operations)

```typescript
export interface MutationResult {
  entity: EntityType | null; // The created/updated entity
  error?: string; // Optional error message
  isSuccessful: boolean; // Success flag
}
```

### Simple Returns (for straightforward operations)

```typescript
// Return entity or null directly
static async createAsync(...): Promise<{EntityRecord} | null>

// Return boolean for delete operations
static async deleteAsync(...): Promise<boolean>

// Return typed data directly
static async getPhotosAsync(...): Promise<Array<PhotoRecord>>
```

### List Results

```typescript
export interface ListData {
  items: Array<EntityType>; // The list items
  hasMore: boolean; // Pagination indicator
  total: number; // Total count
}
```

## Business Logic Patterns

### Ownership Verification

```typescript
// Verify ownership before updates/deletes
const existing = await {Domain}Query.findByIdAsync(entityId, context);
if (!existing || existing.userId !== userId) {
  return { entity: null, isSuccessful: false };
}
```

### Cascading Operations with Cleanup

```typescript
static async deleteWithCascade(
  data: Delete{Entity},
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<{EntityRecord} | null> {
  try {
    const context = createUserQueryContext(userId, { dbInstance });

    // Get entity and related data, then delete from database
    const deleteResult = await {Domain}Query.deleteAsync(data, userId, context);
    const { entity, relatedItems } = deleteResult;

    if (!entity) {
      return null;
    }

    // Non-blocking cleanup of external resources
    if (relatedItems && relatedItems.length > 0) {
      try {
        const cleanupResults = await ExternalService.cleanup(relatedItems);

        const successCount = cleanupResults.filter((r) => r.success).length;
        const failures = cleanupResults.filter((r) => !r.success);

        if (successCount > 0) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { entityId: entity.id, count: successCount },
            level: SENTRY_LEVELS.INFO,
            message: `Successfully cleaned up ${successCount} related items`,
          });
        }

        if (failures.length > 0) {
          Sentry.addBreadcrumb({
            category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
            data: { entityId: entity.id, count: failures.length, failures },
            level: SENTRY_LEVELS.WARNING,
            message: `Failed to clean up ${failures.length} related items`,
          });
        }
      } catch (error) {
        // Don't fail the entire operation if cleanup fails
        Sentry.captureException(error, {
          extra: { entityId: entity.id, operation: 'cleanup' },
          level: 'warning',
        });
      }
    }

    return entity;
  } catch (error) {
    // ... error handling
  }
}
```

### Depth/Limit Validation

```typescript
// Validate nesting depth for hierarchical data
const currentDepth = await this.calculateDepth(parentId, context);
if (currentDepth >= MAX_NESTING_DEPTH) {
  return {
    entity: null,
    error: `Maximum nesting depth of ${MAX_NESTING_DEPTH} exceeded`,
    isSuccessful: false,
  };
}
```

## Anti-Patterns to Avoid

1. **Never skip error wrapping** - Always use `createFacadeError`
2. **Never access queries without context** - Always create proper context
3. **Never expose raw query results** - Transform to typed interfaces
4. **Never skip ownership checks** - Always verify before mutations
5. **Never cache write operations** - Only cache reads
6. **Never let cleanup failures break main operations** - Use try/catch with Sentry
7. **Never hardcode facade name in errors** - Use `const facadeName` at top of file
8. **Never use generic `CacheService.cached()`** - Use domain-specific helpers
9. **Never skip cache invalidation after writes** - Use CacheRevalidationService
10. **Never fetch sequential independent data** - Use `Promise.all` for parallel fetching
11. **Never omit `Async` suffix** - ALL async methods must have `Async` suffix
12. **Never skip Sentry breadcrumbs** - ALL facade methods must add breadcrumbs on success
13. **Never skip JSDoc documentation** - ALL public methods must have JSDoc
14. **Never create duplicate methods** - Don't have both `getX()` and `getXAsync()`
15. **Never create stub methods** - Don't return hardcoded values (e.g., `return Promise.resolve({})`)
16. **Never skip transactions for multi-step mutations** - ALL multi-step writes need transactions
17. **Never write raw SQL in facades** - Delegate to query methods that handle soft-delete and other filters
18. **Never use semantically incorrect operation constants** - Use/create operations that match the actual operation
19. **Never hardcode cache keys** - Use `CACHE_KEYS.*` constants from `@/lib/constants/cache`
20. **Never use admin-named methods for public queries** - Use appropriately named query methods
21. **Never mix raw executor with context** - All parallel queries should use the same shared context

## Return Type Decision Matrix

Use this matrix to determine the appropriate return type for facade methods:

| Operation Type          | Return Type                          | When to Use                                |
| ----------------------- | ------------------------------------ | ------------------------------------------ |
| Find single entity      | `Promise<Entity \| null>`            | Simple lookups where not found is expected |
| Find many entities      | `Promise<Array<Entity>>`             | List queries (empty array if none)         |
| Paginated queries       | `Promise<{ items, hasMore, total }>` | When pagination is needed                  |
| Create/Update mutations | `Promise<MutationResult>`            | Complex mutations with potential failures  |
| Simple mutations        | `Promise<Entity \| null>`            | Simple single-step mutations               |
| Delete operations       | `Promise<boolean>`                   | When only success/failure matters          |
| Validation checks       | `Promise<ValidationResult>`          | Pre-flight validation                      |

### MutationResult Pattern (for complex operations)

```typescript
export interface {Entity}MutationResult {
  entity: {EntityType} | null;
  error?: string;
  isSuccessful: boolean;
}
```

### When to throw vs. return error

- **THROW**: Unexpected errors, database failures, programming errors
- **RETURN error object**: Business rule violations, validation failures, "not found" scenarios

## Transaction Requirements

### Operations that REQUIRE transactions

1. **Multi-table mutations** - Creating/updating related records
2. **Cascading deletes** - Deleting entity with related data
3. **Count updates** - Incrementing/decrementing counters with main operation
4. **Ownership transfers** - Moving items between collections
5. **Batch operations** - Multiple related changes that must succeed together

### Operations that DON'T need transactions

1. **Single-table reads** - Simple SELECT queries
2. **Single-row inserts** - Creating one record with no side effects
3. **Cache-only operations** - No database writes

### Transaction Pattern

```typescript
static async deleteWithRelatedAsync(
  entityId: string,
  userId: string,
  dbInstance?: DatabaseExecutor,
): Promise<boolean> {
  try {
    return await (dbInstance ?? db).transaction(async (tx) => {
      const context = createProtectedQueryContext(userId, { dbInstance: tx });

      // Step 1: Verify ownership
      const entity = await EntityQuery.findByIdAsync(entityId, context);
      if (!entity || entity.userId !== userId) {
        return false;
      }

      // Step 2: Delete related records (within transaction)
      await RelatedQuery.deleteByEntityIdAsync(entityId, context);

      // Step 3: Delete main entity
      await EntityQuery.deleteAsync(entityId, context);

      // Step 4: Update counts
      await ParentQuery.decrementCountAsync(entity.parentId, context);

      return true;
    });
  } catch (error) {
    throw createFacadeError({ /* context */ }, error);
  }
}
```

## JSDoc Documentation Requirements

ALL public facade methods MUST have JSDoc documentation:

```typescript
/**
 * Get a bobblehead by ID with optional viewer context.
 * Returns null if not found or if viewer lacks permission.
 *
 * Caching: Uses LONG TTL (15 min) with bobblehead-based invalidation.
 * Invalidated by: bobblehead updates, photo changes, tag changes.
 *
 * @param bobbleheadId - The unique identifier of the bobblehead
 * @param viewerUserId - Optional viewer for permission context (sees own + public)
 * @param dbInstance - Optional database instance for transaction support
 * @returns The bobblehead record or null if not found/unauthorized
 */
static async getBobbleheadByIdAsync(
  bobbleheadId: string,
  viewerUserId?: string,
  dbInstance?: DatabaseExecutor,
): Promise<BobbleheadRecord | null>
```

### JSDoc Checklist

- [ ] One-line summary of what the method does
- [ ] Cache behavior (TTL, invalidation triggers)
- [ ] `@param` for each parameter with description
- [ ] `@returns` describing the return value and edge cases
- [ ] `@throws` if the method can throw (most should via `createFacadeError`)

## Method Complexity Guidelines

### Maximum Method Length

- **Target**: 30-50 lines
- **Maximum**: 60 lines
- **If exceeding**: Extract helper methods

### Extracting Helpers

```typescript
// BAD: 150+ line method doing everything
static async browseCollectionsAsync(...) {
  // 150 lines of validation, transformation, caching, error handling
}

// GOOD: Main method orchestrates, helpers do work
static async browseCollectionsAsync(...) {
  const filters = this.validateAndNormalizeFilters(input);
  const cacheKey = this.buildCacheKey(filters);

  return CacheService.collections.public(
    () => this.executeBrowseQuery(filters, context),
    cacheKey,
    { context: { /* ... */ } },
  );
}

private static validateAndNormalizeFilters(input: BrowseInput): NormalizedFilters { /* ... */ }
private static buildCacheKey(filters: NormalizedFilters): string { /* ... */ }
private static async executeBrowseQuery(filters: NormalizedFilters, context: QueryContext) { /* ... */ }
```

## Sentry Breadcrumb Requirements

ALL facade methods MUST add Sentry breadcrumbs for:

1. **Successful operations** - Track what happened
2. **Partial failures** - Non-critical issues that didn't fail the operation
3. **Business logic decisions** - Important branching logic

### Breadcrumb Placement with Cached Operations

When using `CacheService` helpers, breadcrumbs placed INSIDE the cache callback only execute on cache misses. To ensure observability for ALL requests (including cache hits), add a pre-operation breadcrumb OUTSIDE the cache callback:

```typescript
// CORRECT: Pre-operation breadcrumb outside cache callback
static async getPlatformStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  // This breadcrumb fires on EVERY request (cache hit or miss)
  Sentry.addBreadcrumb({
    category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
    level: SENTRY_LEVELS.INFO,
    message: 'Fetching platform statistics',
  });

  try {
    return await CacheService.platform.stats(
      async () => {
        // ... fetch data ...

        // This breadcrumb only fires on cache MISS (fresh data fetch)
        Sentry.addBreadcrumb({
          category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
          data: { bobbleheadsCount, collectionsCount },
          level: SENTRY_LEVELS.INFO,
          message: 'Platform statistics fetched from database',
        });

        return result;
      },
      { /* options */ },
    );
  } catch (error) {
    // ... error handling
  }
}

// INCORRECT: Only breadcrumb inside cache callback - invisible on cache hits
static async getPlatformStatsAsync(dbInstance?: DatabaseExecutor): Promise<PlatformStats> {
  try {
    return await CacheService.platform.stats(
      async () => {
        // This ONLY fires on cache miss - no visibility into cache hits!
        Sentry.addBreadcrumb({ /* ... */ });
        return result;
      },
    );
  } catch (error) { /* ... */ }
}
```

### Required Breadcrumb Pattern

```typescript
static async updateAsync(data: UpdateEntity, userId: string, dbInstance?: DatabaseExecutor) {
  try {
    const result = await (dbInstance ?? db).transaction(async (tx) => {
      // ... operation
    });

    // REQUIRED: Add breadcrumb on success
    Sentry.addBreadcrumb({
      category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
      data: {
        entityId: result.id,
        operation: 'update',
        userId,
      },
      level: SENTRY_LEVELS.INFO,
      message: `Updated entity ${result.id}`,
    });

    return result;
  } catch (error) {
    throw createFacadeError({ /* ... */ }, error);
  }
}
```

## Common Facade Patterns

### Cloudinary Cleanup Helper (extract to avoid duplication)

```typescript
/**
 * Safely delete cover image from Cloudinary.
 * Non-blocking - logs to Sentry on failure but doesn't throw.
 */
private static async cleanupCoverImageAsync(imageUrl: string | null, entityId: string): Promise<void> {
  if (!imageUrl) return;

  try {
    const publicId = CloudinaryService.extractPublicIdFromUrl(imageUrl);
    if (publicId) {
      await CloudinaryService.deletePhotosFromCloudinary([publicId]);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.EXTERNAL_SERVICE,
        data: { entityId, publicId },
        level: SENTRY_LEVELS.INFO,
        message: 'Deleted cover image from Cloudinary',
      });
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: { entityId, imageUrl, operation: 'cloudinary-cleanup' },
      level: 'warning',
    });
  }
}
```

### Ownership Verification Pattern

```typescript
/**
 * Verify entity ownership before mutation.
 * Returns entity if owned by user, null otherwise.
 */
private static async verifyOwnershipAsync<T extends { userId: string }>(
  entityId: string,
  userId: string,
  findFn: (id: string, context: QueryContext) => Promise<T | null>,
  context: QueryContext,
): Promise<T | null> {
  const entity = await findFn(entityId, context);
  if (!entity || entity.userId !== userId) {
    return null;
  }
  return entity;
}
```
