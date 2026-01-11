/**
 * CollectionHeaderAsync Integration Tests
 *
 * Tests the async server component that fetches collection header data
 * and renders the display component. Uses real database via Testcontainers.
 *
 * Tests cover:
 * - Fetching collection header data with collectionSlug
 * - Null handling when collectionSlug is not provided
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock server-only to allow importing server components in tests
vi.mock('server-only', () => ({}));

import { CollectionHeaderAsync } from '@/app/(app)/dashboard/collection/components/async/collection-header-async';
import { collectionDashboardSearchParamsCache } from '@/app/(app)/dashboard/collection/route-type';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { createTestCollection } from '../../fixtures/collection.factory';
import { createTestUser } from '../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../setup/test-db';

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
  startSpan: vi.fn((_options: unknown, callback: (span: unknown) => unknown) =>
    callback({ recordException: vi.fn(), setStatus: vi.fn() }),
  ),
}));

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      dashboardHeader: vi.fn((callback: () => unknown) => callback()),
    },
  },
}));

// Mock Redis
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  })),
  redis: {
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  },
}));

// Mock route-type search params cache
vi.mock('@/app/(app)/dashboard/collection/route-type', () => ({
  collectionDashboardSearchParamsCache: {
    get: vi.fn(),
  },
}));

// Mock auth utils
vi.mock('@/utils/auth-utils', () => ({
  getRequiredUserIdAsync: vi.fn(),
}));

// Mock the display component to simplify testing
vi.mock('@/app/(app)/dashboard/collection/(collection)/components/display/collection-header-display', () => ({
  CollectionHeaderDisplay: ({ collection }: { collection: unknown }) => (
    <div data-testid={'collection-header-display'}>{JSON.stringify(collection)}</div>
  ),
}));

describe('CollectionHeaderAsync', () => {
  let testUserId: string;

  beforeEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();

    // Create test user
    const user = await createTestUser();
    testUserId = user!.id;

    // Default mock for getRequiredUserIdAsync
    vi.mocked(getRequiredUserIdAsync).mockResolvedValue(testUserId);
  });

  it('should fetch collection header data and render CollectionHeaderDisplay', async () => {
    const collection = await createTestCollection({
      description: 'Test collection description',
      name: 'Test Collection',
      userId: testUserId,
    });

    // Mock search params to return the collection slug
    vi.mocked(collectionDashboardSearchParamsCache.get).mockReturnValue(collection!.slug);

    const result = await CollectionHeaderAsync();

    // Verify the result is JSX
    expect(result).toBeDefined();
    expect(result).not.toBeNull();

    // Verify that getRequiredUserIdAsync was called
    expect(getRequiredUserIdAsync).toHaveBeenCalledTimes(1);

    // Verify that search params cache was queried
    expect(collectionDashboardSearchParamsCache.get).toHaveBeenCalledWith('collectionSlug');
  });

  it('should return null when collectionSlug is not provided', async () => {
    // Mock search params to return null (no collection slug)
    vi.mocked(collectionDashboardSearchParamsCache.get).mockReturnValue(null);

    const result = await CollectionHeaderAsync();

    // Should return null when no slug
    expect(result).toBeNull();

    // Verify that getRequiredUserIdAsync was still called
    expect(getRequiredUserIdAsync).toHaveBeenCalledTimes(1);

    // Verify that search params cache was queried
    expect(collectionDashboardSearchParamsCache.get).toHaveBeenCalledWith('collectionSlug');
  });
});
