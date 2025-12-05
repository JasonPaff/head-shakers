/**
 * BobbleheadsDashboardFacade Integration Tests
 *
 * These tests verify the Bobbleheads Dashboard business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - getListByCollectionSlugAsync - bobbleheads with pagination metadata
 * - getCategoriesByCollectionSlugAsync - distinct categories for collection
 * - getBobbleheadForEditAsync - bobblehead data with tags for owner
 * - getUserCollectionSelectorsAsync - collection selectors ordered by name
 * - Permission filtering and cache integration
 * - Error context propagation with Sentry
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';

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

// Mock cache service - pass through to actual execution
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byCollection: <T>(callback: () => T): T => callback(),
      categoriesByCollection: <T>(callback: () => T): T => callback(),
      countByCollection: <T>(callback: () => T): T => callback(),
    },
    collections: {
      selectorsByUser: <T>(callback: () => T): T => callback(),
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

describe('BobbleheadsDashboardFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
    vi.clearAllMocks();
  });

  describe('getListByCollectionSlugAsync', () => {
    it('should return bobbleheads with pagination metadata', async () => {
      // Arrange - Create collection with bobbleheads
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Bobblehead 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Bobblehead 2',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardFacade.getListByCollectionSlugAsync(
        'test-collection',
        user!.id,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.bobbleheads).toHaveLength(2);
      expect(result.collectionId).toBe(collection!.id);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.totalCount).toBe(2);
    });

    it('should calculate totalPages correctly', async () => {
      // Arrange - Create collection with 26 bobbleheads (more than 1 page at default 24 per page)
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Large Collection',
        slug: 'large-collection',
        userId: user!.id,
      });

      // Create 26 bobbleheads
      for (let i = 1; i <= 26; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Bobblehead ${i}`,
          userId: user!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardFacade.getListByCollectionSlugAsync(
        'large-collection',
        user!.id,
      );

      // Assert - Should have 2 pages (26 items / 24 per page = 2 pages)
      expect(result.pagination.totalCount).toBe(26);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.pageSize).toBe(24);
      expect(result.bobbleheads).toHaveLength(24); // First page
    });

    it('should return correct currentPage and pageSize in pagination', async () => {
      // Arrange
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      // Create 30 bobbleheads
      for (let i = 1; i <= 30; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Bobblehead ${i}`,
          userId: user!.id,
        });
      }

      // Act - Request page 2 with 10 items per page
      const result = await BobbleheadsDashboardFacade.getListByCollectionSlugAsync(
        'test-collection',
        user!.id,
        { page: 2, pageSize: 10 },
      );

      // Assert
      expect(result.pagination.currentPage).toBe(2);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalPages).toBe(3); // 30 / 10 = 3 pages
      expect(result.bobbleheads).toHaveLength(10);
    });

    it('should handle empty results gracefully', async () => {
      // Arrange - Create collection with no bobbleheads
      const user = await createTestUser({ username: 'owner' });
      await createTestCollection({
        name: 'Empty Collection',
        slug: 'empty-collection',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardFacade.getListByCollectionSlugAsync(
        'empty-collection',
        user!.id,
      );

      // Assert
      expect(result.bobbleheads).toEqual([]);
      expect(result.pagination.totalCount).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.pageSize).toBe(24);
    });
  });

  describe('getCategoriesByCollectionSlugAsync', () => {
    it('should return cached categories', async () => {
      // Arrange
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Sports Bobblehead',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'movies',
        collectionId: collection!.id,
        name: 'Movie Bobblehead',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardFacade.getCategoriesByCollectionSlugAsync(
        'test-collection',
        user!.id,
      );

      // Assert - Should have executed query (cache passes through)
      expect(result).toBeDefined();
      expect(result).toContain('sports');
      expect(result).toContain('movies');
    });

    it('should return distinct categories for collection', async () => {
      // Arrange
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      // Create multiple bobbleheads with same categories
      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Sports 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Sports 2',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'movies',
        collectionId: collection!.id,
        name: 'Movie 1',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardFacade.getCategoriesByCollectionSlugAsync(
        'test-collection',
        user!.id,
      );

      // Assert - Should have only distinct categories
      expect(result).toHaveLength(2);
      expect(result).toContain('sports');
      expect(result).toContain('movies');
    });
  });

  describe('getBobbleheadForEditAsync', () => {
    it('should return bobblehead with tags for owner', async () => {
      // Arrange - Create user, collection, bobblehead, and tags
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Test Bobblehead',
        userId: user!.id,
      });

      const db = getTestDb();
      const { bobbleheadTags, tags } = await import('@/lib/db/schema');

      // Create tags
      const [tag1] = await db
        .insert(tags)
        .values({
          name: 'sports',
          userId: user!.id,
        })
        .returning();

      const [tag2] = await db
        .insert(tags)
        .values({
          name: 'vintage',
          userId: user!.id,
        })
        .returning();

      // Associate tags with bobblehead
      await db.insert(bobbleheadTags).values([
        {
          bobbleheadId: bobblehead!.id,
          tagId: tag1!.id,
        },
        {
          bobbleheadId: bobblehead!.id,
          tagId: tag2!.id,
        },
      ]);

      // Act
      const result = await BobbleheadsDashboardFacade.getBobbleheadForEditAsync(bobblehead!.id, user!.id);

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe(bobblehead!.id);
      expect(result!.name).toBe('Test Bobblehead');
      expect(result!.tags).toHaveLength(2);
      expect(result!.tags).toContainEqual({ id: tag1!.id, name: 'sports' });
      expect(result!.tags).toContainEqual({ id: tag2!.id, name: 'vintage' });
    });

    it('should return null for non-owner', async () => {
      // Arrange - Create bobblehead owned by user1, try to access as user2
      const user1 = await createTestUser({ username: 'owner' });
      const user2 = await createTestUser({ username: 'notowner' });

      const collection = await createTestCollection({
        name: 'User1 Collection',
        slug: 'user1-collection',
        userId: user1!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'User1 Bobblehead',
        userId: user1!.id,
      });

      // Act - Try to access as user2
      const result = await BobbleheadsDashboardFacade.getBobbleheadForEditAsync(bobblehead!.id, user2!.id);

      // Assert - Should return null (permission denied)
      expect(result).toBeNull();
    });

    it('should return null for non-existent bobblehead', async () => {
      // Arrange
      const user = await createTestUser({ username: 'owner' });
      const nonExistentId = '00000000-0000-0000-0000-000000000000'; // Valid UUID format that doesn't exist

      // Act
      const result = await BobbleheadsDashboardFacade.getBobbleheadForEditAsync(nonExistentId, user!.id);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getUserCollectionSelectorsAsync', () => {
    it('should return collection selectors ordered by name', async () => {
      // Arrange - Create collections with names that will test ordering
      const user = await createTestUser({ username: 'owner' });

      await createTestCollection({
        name: 'Zebra Collection',
        slug: 'zebra-collection',
        userId: user!.id,
      });

      await createTestCollection({
        name: 'Alpha Collection',
        slug: 'alpha-collection',
        userId: user!.id,
      });

      await createTestCollection({
        name: 'Beta Collection',
        slug: 'beta-collection',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(user!.id);

      // Assert - Should be ordered alphabetically by name
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Alpha Collection');
      expect(result[1]!.name).toBe('Beta Collection');
      expect(result[2]!.name).toBe('Zebra Collection');

      // Verify structure
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
    });

    it('should return empty array when user has no collections', async () => {
      // Arrange - Create user with no collections
      const user = await createTestUser({ username: 'owner' });

      // Act
      const result = await BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(user!.id);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should only return collections owned by the user', async () => {
      // Arrange - Create two users with their own collections
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });

      await createTestCollection({
        name: 'User1 Collection A',
        slug: 'user1-collection-a',
        userId: user1!.id,
      });

      await createTestCollection({
        name: 'User1 Collection B',
        slug: 'user1-collection-b',
        userId: user1!.id,
      });

      await createTestCollection({
        name: 'User2 Collection',
        slug: 'user2-collection',
        userId: user2!.id,
      });

      // Act - Query as user1
      const result = await BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(user1!.id);

      // Assert - Should only return user1's collections
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.name)).toContain('User1 Collection A');
      expect(result.map((c) => c.name)).toContain('User1 Collection B');
      expect(result.map((c) => c.name)).not.toContain('User2 Collection');
    });
  });

  describe('Error handling and Sentry integration', () => {
    it('should add breadcrumbs for successful operations', async () => {
      // Arrange
      const user = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Test Bobblehead',
        userId: user!.id,
      });

      // Act
      await BobbleheadsDashboardFacade.getListByCollectionSlugAsync('test-collection', user!.id);

      // Assert - Verify breadcrumbs were added for operation lifecycle
      expect(mockAddBreadcrumb).toHaveBeenCalled();
    });
  });
});
