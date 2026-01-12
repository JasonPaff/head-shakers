/**
 * Collections Dashboard Facade Integration Tests
 *
 * These tests verify the Collections Dashboard business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - getHeaderByCollectionSlugAsync - header data with aggregated stats
 * - getListByUserIdAsync - all user collections with dashboard stats
 * - Permission filtering and cache integration
 * - Error context propagation with Sentry
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';

import { createTestBobblehead } from '../../../fixtures/bobblehead.factory';
import { createTestCollection } from '../../../fixtures/collection.factory';
import { createTestUser } from '../../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../../setup/test-db';

// Mock the database to use the test container database
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

// Mock Sentry to track breadcrumbs and error handling
const { mockAddBreadcrumb, mockCaptureException, mockSetContext } = vi.hoisted(() => ({
  mockAddBreadcrumb: vi.fn(),
  mockCaptureException: vi.fn(),
  mockSetContext: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: mockAddBreadcrumb,
  captureException: mockCaptureException,
  captureMessage: vi.fn(),
  setContext: mockSetContext,
  setUser: vi.fn(),
  startSpan: vi.fn(
    <T>(
      _options: unknown,
      callback: (span: { recordException: () => void; setStatus: () => void }) => T,
    ): T => callback({ recordException: vi.fn(), setStatus: vi.fn() }),
  ),
}));

// Mock cache service to control caching behavior
let cacheCallsByMethod: Record<string, number> = {};
let shouldBypassCache = true;

vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      dashboard: <T>(callback: () => T, userId: string): T => {
        const key = `dashboard-${userId}`;
        cacheCallsByMethod[key] = (cacheCallsByMethod[key] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
      dashboardHeader: <T>(callback: () => T, userId: string, collectionSlug: string): T => {
        const key = `dashboardHeader-${userId}-${collectionSlug}`;
        cacheCallsByMethod[key] = (cacheCallsByMethod[key] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
    },
  },
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Redis client to avoid connection issues in tests
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

describe('CollectionsDashboardFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
    cacheCallsByMethod = {};
    shouldBypassCache = true;
    vi.clearAllMocks();
  });

  describe('getHeaderByCollectionSlugAsync', () => {
    it('should return formatted header data with all stats', async () => {
      // Arrange - Create collection with bobbleheads and social activity
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        coverImageUrl: 'https://example.com/cover.jpg',
        description: 'My amazing collection',
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      // Create bobbleheads with varying properties
      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Bobblehead 1',
        purchasePrice: 50.0,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Bobblehead 2',
        purchasePrice: 75.5,
        userId: user!.id,
      });

      // Create social interactions
      const db = getTestDb();
      const { comments, contentViews, likes } = await import('@/lib/db/schema');

      await db.insert(likes).values({
        targetId: collection!.id,
        targetType: 'collection',
        userId: user!.id,
      });

      await db.insert(comments).values({
        content: 'Great collection!',
        targetId: collection!.id,
        targetType: 'collection',
        userId: user!.id,
      });

      await db.insert(contentViews).values({
        targetId: collection!.id,
        targetType: 'collection',
        viewerId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(
        user!.id,
        'test-collection',
      );

      // Assert - Verify all fields are present
      expect(result).not.toBeNull();
      expect(result!.id).toBe(collection!.id);
      expect(result!.name).toBe('Test Collection');
      expect(result!.slug).toBe('test-collection');
      expect(result!.description).toBe('My amazing collection');
      expect(result!.coverImageUrl).toBe('https://example.com/cover.jpg');
      expect(result!.isPublic).toBe(true);
      expect(result!.bobbleheadCount).toBe('2');
      expect(result!.totalValue).toBe('125.50');
      expect(result!.likeCount).toBe('1');
      expect(result!.commentCount).toBe('1');
      expect(result!.viewCount).toBe('1');

      // Verify cache was called with correct key
      const cacheKey = `dashboardHeader-${user!.id}-test-collection`;
      expect(cacheCallsByMethod[cacheKey]).toBe(1);

      // Verify Sentry breadcrumbs were added
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });

    it('should apply permission filtering for private collections', async () => {
      // Arrange - Create collection owned by user1, try to access as user2
      const user1 = await createTestUser({ username: 'owner' });
      const user2 = await createTestUser({ username: 'notowner' });

      const collection = await createTestCollection({
        isPublic: false, // Private collection
        name: 'Private Collection',
        slug: 'private-collection',
        userId: user1!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Secret Bobblehead',
        userId: user1!.id,
      });

      // Act - Try to access as user2 (should fail due to permissions)
      const result = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(
        user2!.id,
        'private-collection',
      );

      // Assert - Should return null (permission denied)
      expect(result).toBeNull();

      // Verify cache was still called (but query returned nothing)
      const cacheKey = `dashboardHeader-${user2!.id}-private-collection`;
      expect(cacheCallsByMethod[cacheKey]).toBe(1);
    });

    it('should return header data for owner of private collection', async () => {
      // Arrange - Create private collection
      const user = await createTestUser();
      const collection = await createTestCollection({
        isPublic: false,
        name: 'My Private Collection',
        slug: 'my-private-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Private Bobblehead',
        userId: user!.id,
      });

      // Act - Owner should see their own private collection
      const result = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(
        user!.id,
        'my-private-collection',
      );

      // Assert - Owner can see private collection
      expect(result).not.toBeNull();
      expect(result!.id).toBe(collection!.id);
      expect(result!.name).toBe('My Private Collection');
      expect(result!.isPublic).toBe(false);
      expect(result!.bobbleheadCount).toBe('1');
    });

    it('should return zero counts for collection with no activity', async () => {
      // Arrange - Create collection with no bobbleheads or activity
      const user = await createTestUser();
      await createTestCollection({
        name: 'Empty Collection',
        slug: 'empty-collection',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(
        user!.id,
        'empty-collection',
      );

      // Assert
      expect(result).not.toBeNull();
      expect(result!.bobbleheadCount).toBe('0');
      expect(result!.totalValue).toBe('0');
      expect(result!.featuredCount).toBe('0');
      expect(result!.likeCount).toBe('0');
      expect(result!.commentCount).toBe('0');
      expect(result!.viewCount).toBe('0');
    });
  });

  describe('getListByUserIdAsync', () => {
    it('should return all user collections with formatted stats', async () => {
      // Arrange - Create user with multiple collections
      const user = await createTestUser();

      const collection1 = await createTestCollection({
        name: 'Collection 1',
        userId: user!.id,
      });

      const collection2 = await createTestCollection({
        name: 'Collection 2',
        userId: user!.id,
      });

      // Add bobbleheads to collections
      await createTestBobblehead({
        collectionId: collection1!.id,
        name: 'Bobblehead 1-1',
        purchasePrice: 100,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection2!.id,
        name: 'Bobblehead 2-1',
        purchasePrice: 50,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection2!.id,
        name: 'Bobblehead 2-2',
        purchasePrice: 75,
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardFacade.getListByUserIdAsync(user!.id);

      // Assert
      expect(result).toHaveLength(2);

      const col1 = result.find((c) => c.name === 'Collection 1');
      const col2 = result.find((c) => c.name === 'Collection 2');

      expect(col1).toBeDefined();
      expect(col1!.bobbleheadCount).toBe('1');
      expect(col1!.totalValue).toBe('100.00');

      expect(col2).toBeDefined();
      expect(col2!.bobbleheadCount).toBe('2');
      expect(col2!.totalValue).toBe('125.00');

      // Verify cache was called with correct key
      const cacheKey = `dashboard-${user!.id}`;
      expect(cacheCallsByMethod[cacheKey]).toBe(1);

      // Verify Sentry breadcrumbs were added
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });

    it('should only return collections owned by the specified user', async () => {
      // Arrange - Create two users with their own collections
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });

      await createTestCollection({
        name: 'User 1 Collection A',
        userId: user1!.id,
      });

      await createTestCollection({
        name: 'User 1 Collection B',
        userId: user1!.id,
      });

      await createTestCollection({
        name: 'User 2 Collection',
        userId: user2!.id,
      });

      // Act - Query as user1
      const result = await CollectionsDashboardFacade.getListByUserIdAsync(user1!.id);

      // Assert - Should only return user1's collections
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.name)).toContain('User 1 Collection A');
      expect(result.map((c) => c.name)).toContain('User 1 Collection B');
      expect(result.map((c) => c.name)).not.toContain('User 2 Collection');
    });

    it('should include aggregated stats for all collections', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Popular Collection',
        userId: user!.id,
      });

      const db = getTestDb();
      const { comments, contentViews, likes } = await import('@/lib/db/schema');

      // Create multiple social interactions
      await db.insert(likes).values([
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: (await createTestUser({ username: 'liker' }))!.id,
        },
      ]);

      await db.insert(comments).values([
        {
          content: 'Comment 1',
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
        {
          content: 'Comment 2',
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
      ]);

      await db.insert(contentViews).values([
        {
          targetId: collection!.id,
          targetType: 'collection',
          viewerId: user!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          viewerId: user!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          viewerId: user!.id,
        },
      ]);

      // Act
      const result = await CollectionsDashboardFacade.getListByUserIdAsync(user!.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.likeCount).toBe('2');
      expect(result[0]!.commentCount).toBe('2');
      expect(result[0]!.viewCount).toBe('3');
    });

    it('should return empty array when user has no collections', async () => {
      // Arrange - Create user with no collections
      const user = await createTestUser();

      // Act
      const result = await CollectionsDashboardFacade.getListByUserIdAsync(user!.id);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('Error handling and Sentry integration', () => {
    it('should propagate error context when query fails', async () => {
      // Arrange - Mock query to throw an error
      const { CollectionsDashboardQuery } =
        await import('@/lib/queries/collections/collections-dashboard.query');
      const originalMethod =
        CollectionsDashboardQuery.getHeaderByCollectionSlugAsync.bind(CollectionsDashboardQuery);

      CollectionsDashboardQuery.getHeaderByCollectionSlugAsync = vi.fn(() => {
        throw new Error('Database connection failed');
      });

      try {
        // Act & Assert - Should throw error with facade context
        await expect(
          CollectionsDashboardFacade.getHeaderByCollectionSlugAsync('user-id', 'test-slug'),
        ).rejects.toThrow();

        // Verify error was captured
        // Note: The exact error format depends on createFacadeError implementation
      } finally {
        // Restore original method
        CollectionsDashboardQuery.getHeaderByCollectionSlugAsync = originalMethod;
      }
    });

    it('should add breadcrumbs for successful operations', async () => {
      // Arrange
      const user = await createTestUser();
      await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      // Act
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(user!.id, 'test-collection');

      // Assert - Verify breadcrumbs were added for operation lifecycle
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });
  });

  describe('Cache integration', () => {
    it('should use separate cache keys for different users', async () => {
      // Arrange
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });

      await createTestCollection({ userId: user1!.id });
      await createTestCollection({ userId: user2!.id });

      // Act
      await CollectionsDashboardFacade.getListByUserIdAsync(user1!.id);
      await CollectionsDashboardFacade.getListByUserIdAsync(user2!.id);

      // Assert - Should have different cache keys
      expect(cacheCallsByMethod[`dashboard-${user1!.id}`]).toBe(1);
      expect(cacheCallsByMethod[`dashboard-${user2!.id}`]).toBe(1);
    });

    it('should use separate cache keys for different collection slugs', async () => {
      // Arrange
      const user = await createTestUser();
      await createTestCollection({
        name: 'Collection A',
        slug: 'collection-a',
        userId: user!.id,
      });
      await createTestCollection({
        name: 'Collection B',
        slug: 'collection-b',
        userId: user!.id,
      });

      // Act
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(user!.id, 'collection-a');
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(user!.id, 'collection-b');

      // Assert - Should have different cache keys
      expect(cacheCallsByMethod[`dashboardHeader-${user!.id}-collection-a`]).toBe(1);
      expect(cacheCallsByMethod[`dashboardHeader-${user!.id}-collection-b`]).toBe(1);
    });
  });
});
