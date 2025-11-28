# Integration Testing Conventions

## Overview

Integration tests validate facades, server actions, and database operations with real PostgreSQL interactions via Testcontainers.

**File Pattern**: `tests/integration/**/*.test.ts` or `*.integration.test.ts`

**Key Characteristics**:

- Real database operations (Testcontainers PostgreSQL)
- Test realistic business logic scenarios
- Use factories for test data creation
- Mock external services (Sentry, Cache, Redis)

## Server Action Test Pattern

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCommentAction } from '@/lib/actions/social/social.actions';
import { db } from '@/lib/db';

// Mock authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(() => ({ userId: 'test-user-id' })),
}));

describe('createCommentAction', () => {
  beforeEach(async () => {
    // Reset database state
    await db.delete(comments);
  });

  it('should create a comment successfully', async () => {
    const input = {
      content: 'Test comment',
      targetId: 'target-123',
      targetType: 'bobblehead' as const,
    };

    const result = await createCommentAction(input);

    expect(result?.data?.success).toBe(true);
    expect(result?.data?.data?.content).toBe('Test comment');
  });

  it('should fail with invalid input', async () => {
    const input = {
      content: '', // Invalid: empty content
      targetId: 'target-123',
      targetType: 'bobblehead' as const,
    };

    const result = await createCommentAction(input);

    expect(result?.validationErrors).toBeDefined();
  });
});
```

## Facade Test Pattern

```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestUser } from '@/tests/fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '@/tests/setup/test-db';

// Mock the database to use test database
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setContext: vi.fn(),
}));

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byId: vi.fn((id, fetcher) => fetcher()),
      byUserId: vi.fn((userId, fetcher) => fetcher()),
    },
  },
  CacheRevalidationService: {
    invalidateBobblehead: vi.fn(),
  },
}));

// Mock Redis
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

import { SocialFacade } from '@/lib/facades/social/social.facade';

describe('SocialFacade', () => {
  let testUserId: string;

  beforeEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();

    // Create test user
    const user = await createTestUser();
    testUserId = user.id;
  });

  describe('toggleLike', () => {
    it('should create a like when not liked', async () => {
      const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, getTestDb());

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(true);
      expect(result.likeCount).toBe(1);
    });

    it('should remove like when already liked', async () => {
      // First like
      await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, getTestDb());

      // Toggle (unlike)
      const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, getTestDb());

      expect(result.isSuccessful).toBe(true);
      expect(result.isLiked).toBe(false);
      expect(result.likeCount).toBe(0);
    });
  });
});
```

## Database Helpers

The database is automatically managed via global setup. Use the helpers from `tests/setup/test-db.ts`:

```typescript
import {
  getTestDb, // Get Drizzle ORM database instance
  resetTestDatabase, // Truncate all tables (23 tables with CASCADE)
  cleanupTable, // Cleanup specific table
  closeTestDb, // Close worker connection
  isTestDbInitialized, // Check initialization status
} from '@/tests/setup/test-db';
```

### Usage Example

```typescript
import { SocialFacade } from '@/lib/facades/social/social.facade';

import { createTestUser } from '@/tests/fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '@/tests/setup/test-db';

describe('SocialFacade', () => {
  let db: ReturnType<typeof getTestDb>;
  let testUserId: string;

  beforeAll(() => {
    db = getTestDb(); // Get Drizzle ORM instance
  });

  beforeEach(async () => {
    await resetTestDatabase(); // Truncate all tables with CASCADE
    const user = await createTestUser();
    testUserId = user.id;
  });

  it('should toggle like', async () => {
    const result = await SocialFacade.toggleLike('target-123', 'bobblehead', testUserId, db);
    expect(result.isSuccessful).toBe(true);
  });
});
```

## Database Configuration

- **Container**: PostgreSQL 16 Alpine (Testcontainers)
- **Migrations**: Auto-run from `src/lib/db/migrations/`
- **Connection pooling**: Max 5 connections per worker
- **Timeouts**: 5s connection, 30s idle

## Factory Usage

```typescript
import { createTestUser } from '@/tests/fixtures/user.factory';
import { createTestBobblehead } from '@/tests/fixtures/bobblehead.factory';
import { createTestCollection } from '@/tests/fixtures/collection.factory';

// Create user
const user = await createTestUser();

// Create user with overrides
const adminUser = await createTestUser({
  role: 'admin',
  displayName: 'Admin User',
});

// Create bobblehead for user
const bobblehead = await createTestBobblehead(user.id, {
  name: 'Test Bobblehead',
  isPublic: true,
});

// Create collection
const collection = await createTestCollection(user.id);
```

## Mocking External Services

### Sentry Mocking

```typescript
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  setContext: vi.fn(),
  startSpan: vi.fn((options, callback) => callback({})),
}));

// Verify breadcrumb was added
import * as Sentry from '@sentry/nextjs';

expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
  expect.objectContaining({
    category: 'business-logic',
    message: expect.stringContaining('toggleLike'),
  }),
);
```

### Cache Service Mocking

```typescript
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byId: vi.fn((id, fetcher) => fetcher()), // Pass through
      byUserId: vi.fn((userId, fetcher) => fetcher()),
    },
  },
  CacheRevalidationService: {
    invalidateBobblehead: vi.fn(),
    invalidateUser: vi.fn(),
  },
}));

// Verify cache was invalidated
import { CacheRevalidationService } from '@/lib/services/cache.service';

expect(CacheRevalidationService.invalidateBobblehead).toHaveBeenCalledWith('bobblehead-id');
```

### Redis Mocking

```typescript
vi.mock('@/lib/redis', () => ({
  redis: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
  },
}));
```

## Testing Transactions

```typescript
describe('BobbleheadFacade.deleteAsync', () => {
  it('should delete bobblehead and related data in transaction', async () => {
    const user = await createTestUser();
    const bobblehead = await createTestBobblehead(user.id);
    await createTestComment(bobblehead.id);
    await createTestLike(bobblehead.id);

    const result = await BobbleheadFacade.deleteAsync(bobblehead.id, user.id);

    expect(result.success).toBe(true);

    // Verify all related data deleted
    const comments = await getTestDb().query.comments.findMany({
      where: eq(comments.targetId, bobblehead.id),
    });
    expect(comments).toHaveLength(0);
  });
});
```

## Checklist

- [ ] Database auto-started via global setup (Testcontainers)
- [ ] Use `getTestDb()` from `tests/setup/test-db.ts`
- [ ] Use `resetTestDatabase()` in `beforeEach`
- [ ] Mock `@/lib/db` to use test database
- [ ] Use factories from `tests/fixtures/` for test data
- [ ] Mock Sentry for breadcrumb verification
- [ ] Mock CacheService for cache behavior
- [ ] Mock Redis client
- [ ] Test realistic scenarios with real database operations
- [ ] No imports for `describe`/`it`/`expect`/`vi` (globals enabled)
