/**
 * BobbleheadsDashboardQuery Integration Tests
 *
 * These tests verify database aggregation queries for bobblehead dashboard functionality
 * using Testcontainers for real PostgreSQL database interactions.
 *
 * Tests cover:
 * - getListAsync - aggregates bobbleheads with stats (likes, views, comments) via subqueries
 * - getCategoriesByCollectionSlugAsync - returns distinct categories for a collection
 * - getCountAsync - returns count with filters applied
 * - Filtering: category, condition, featured status, search terms
 * - Sorting: newest, oldest, name, value
 * - Pagination and permission filtering
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { BobbleheadsDashboardQuery } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';

import { createTestBobblehead, createTestFeaturedBobblehead } from '../../../fixtures/bobblehead.factory';
import { createTestCollection } from '../../../fixtures/collection.factory';
import { createTestUser } from '../../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../../setup/test-db';

// Mock the database to use the test container database
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

// Mock Sentry
vi.mock('@sentry/nextjs', () => ({
  addBreadcrumb: vi.fn(),
  captureException: vi.fn(),
  startSpan: vi.fn(
    (_, callback: (span: { recordException: () => void; setStatus: () => void }) => unknown): unknown =>
      callback({
        recordException: vi.fn(),
        setStatus: vi.fn(),
      }),
  ),
}));

// Mock cache service
vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    bobbleheads: {
      byCollection: <T>(callback: () => T): T => callback(),
      categoriesByCollection: <T>(callback: () => T): T => callback(),
      countByCollection: <T>(callback: () => T): T => callback(),
    },
  },
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Redis
vi.mock('@/lib/utils/redis-client', () => ({
  getRedisClient: vi.fn(() => ({
    del: vi.fn(),
    get: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    set: vi.fn(),
  })),
}));

describe('BobbleheadsDashboardQuery Integration Tests', () => {
  let queryContext: QueryContext;

  beforeEach(async () => {
    await resetTestDatabase();
    // Create empty query context - will use mocked db from vi.mock above
    queryContext = {};
  });

  describe('getListAsync', () => {
    it('should return bobbleheads for collection with stats (likeCount, viewCount, commentCount)', async () => {
      // Arrange
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

      // Create social activity
      const db = getTestDb();
      const { comments, contentViews, likes } = await import('@/lib/db/schema');

      // Create 2 likes
      const liker1 = await createTestUser({ username: 'liker1' });
      await db.insert(likes).values([
        {
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          userId: user!.id,
        },
        {
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          userId: liker1!.id,
        },
      ]);

      // Create 3 comments
      for (let i = 0; i < 3; i++) {
        await db.insert(comments).values({
          content: `Comment ${i + 1}`,
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          userId: user!.id,
        });
      }

      // Create 5 views
      for (let i = 0; i < 5; i++) {
        await db.insert(contentViews).values({
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          viewerId: user!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(bobblehead!.id);
      expect(result[0]!.name).toBe('Test Bobblehead');
      expect(result[0]!.likeCount).toBe('2'); // PostgreSQL COUNT returns string
      expect(result[0]!.commentCount).toBe('3');
      expect(result[0]!.viewCount).toBe('5');
    });

    it('should include likeCount from subquery', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Popular Bobblehead',
        userId: user!.id,
      });

      // Create 4 likes from different users
      const db = getTestDb();
      const { likes } = await import('@/lib/db/schema');

      const users = await Promise.all([
        createTestUser({ username: 'liker1' }),
        createTestUser({ username: 'liker2' }),
        createTestUser({ username: 'liker3' }),
        createTestUser({ username: 'liker4' }),
      ]);

      for (const liker of users) {
        await db.insert(likes).values({
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          userId: liker!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.likeCount).toBe('4'); // PostgreSQL COUNT returns string
    });

    it('should include viewCount from subquery', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Viewed Bobblehead',
        userId: user!.id,
      });

      // Create 10 views
      const db = getTestDb();
      const { contentViews } = await import('@/lib/db/schema');

      for (let i = 0; i < 10; i++) {
        await db.insert(contentViews).values({
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          viewerId: user!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.viewCount).toBe('10'); // PostgreSQL COUNT returns string
    });

    it('should include commentCount from subquery', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Commented Bobblehead',
        userId: user!.id,
      });

      // Create 7 comments
      const db = getTestDb();
      const { comments } = await import('@/lib/db/schema');

      for (let i = 0; i < 7; i++) {
        await db.insert(comments).values({
          content: `Comment ${i + 1}`,
          targetId: bobblehead!.id,
          targetType: 'bobblehead',
          userId: user!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.commentCount).toBe('7'); // PostgreSQL COUNT returns string
    });

    it('should filter by category when provided', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
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

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Another Sports',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { category: 'sports' },
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.category === 'sports')).toBe(true);
      expect(result.map((b) => b.name)).toContain('Sports Bobblehead');
      expect(result.map((b) => b.name)).toContain('Another Sports');
    });

    it('should filter by condition when provided', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        currentCondition: 'mint',
        name: 'Mint Bobblehead',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        currentCondition: 'good',
        name: 'Good Bobblehead',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        currentCondition: 'mint',
        name: 'Another Mint',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { condition: 'mint' },
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.condition === 'mint')).toBe(true);
    });

    it("should filter by featured='featured' (isFeatured=true only)", async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestFeaturedBobblehead({
        collectionId: collection!.id,
        name: 'Featured 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Not Featured',
        userId: user!.id,
      });

      await createTestFeaturedBobblehead({
        collectionId: collection!.id,
        name: 'Featured 2',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { featured: 'featured' },
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.isFeatured === true)).toBe(true);
      expect(result.map((b) => b.name)).toContain('Featured 1');
      expect(result.map((b) => b.name)).toContain('Featured 2');
    });

    it("should filter by featured='not-featured' (isFeatured=false only)", async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestFeaturedBobblehead({
        collectionId: collection!.id,
        name: 'Featured',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Not Featured 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Not Featured 2',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { featured: 'not-featured' },
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.isFeatured === false)).toBe(true);
    });

    it('should search by name (case-insensitive)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Baseball Star',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Soccer Hero',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Baseballer Champion',
        userId: user!.id,
      });

      // Act - Search case-insensitive for "base"
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { searchTerm: 'BASE' },
      );

      // Assert - Should find "Baseball" and "Baseballer"
      expect(result).toHaveLength(2);
      expect(result.map((b) => b.name)).toContain('Baseball Star');
      expect(result.map((b) => b.name)).toContain('Baseballer Champion');
    });

    it('should search by characterName', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        characterName: 'Mickey Mouse',
        collectionId: collection!.id,
        name: 'Disney Character 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        characterName: 'Donald Duck',
        collectionId: collection!.id,
        name: 'Disney Character 2',
        userId: user!.id,
      });

      await createTestBobblehead({
        characterName: 'Bugs Bunny',
        collectionId: collection!.id,
        name: 'Looney Tunes',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { searchTerm: 'Duck' },
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.characterName).toBe('Donald Duck');
    });

    it('should sort by newest (default)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      // Create bobbleheads with slight delay to ensure different timestamps
      const first = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'First',
        userId: user!.id,
      });

      // Small delay
      await new Promise((resolve) => setTimeout(resolve, 10));

      const second = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Second',
        userId: user!.id,
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const third = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Third',
        userId: user!.id,
      });

      // Act - Default sort (newest first)
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should be reverse chronological (newest first)
      expect(result).toHaveLength(3);
      expect(result[0]!.id).toBe(third!.id);
      expect(result[1]!.id).toBe(second!.id);
      expect(result[2]!.id).toBe(first!.id);
    });

    it('should sort by name-asc (ascending)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Zebra',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Apple',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Monkey',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { sortBy: 'name-asc' },
      );

      // Assert - Alphabetically ascending
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Apple');
      expect(result[1]!.name).toBe('Monkey');
      expect(result[2]!.name).toBe('Zebra');
    });

    it('should sort by value-high (DESC NULLS LAST)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Cheap',
        purchasePrice: 10,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'No Price',
        purchasePrice: null,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Expensive',
        purchasePrice: 100,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Medium',
        purchasePrice: 50,
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { sortBy: 'value-high' },
      );

      // Assert - Descending by price, nulls last
      expect(result).toHaveLength(4);
      expect(result[0]!.name).toBe('Expensive');
      expect(result[1]!.name).toBe('Medium');
      expect(result[2]!.name).toBe('Cheap');
      expect(result[3]!.name).toBe('No Price'); // Null last
    });

    it('should paginate correctly (page 2, pageSize 10)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      // Create 25 bobbleheads
      for (let i = 1; i <= 25; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Bobblehead ${i.toString().padStart(2, '0')}`,
          userId: user!.id,
        });
      }

      // Act - Get page 2 with pageSize 10
      const result = await BobbleheadsDashboardQuery.getListAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { page: 2, pageSize: 10, sortBy: 'name-asc' },
      );

      // Assert - Should get items 11-20
      expect(result).toHaveLength(10);
      expect(result[0]!.name).toBe('Bobblehead 11');
      expect(result[9]!.name).toBe('Bobblehead 20');
    });

    it('should apply permission filters (userId context)', async () => {
      // Arrange
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });

      const collection1 = await createTestCollection({
        isPublic: false,
        slug: 'private-collection',
        userId: user1!.id,
      });

      await createTestBobblehead({
        collectionId: collection1!.id,
        isPublic: false,
        name: 'Private Bobblehead',
        userId: user1!.id,
      });

      // Act - Try to access as user2 (should not see private collection)
      const result = await BobbleheadsDashboardQuery.getListAsync('private-collection', {
        ...queryContext,
        userId: user2!.id,
      });

      // Assert - Should be empty (permission denied)
      expect(result).toHaveLength(0);
    });

    it('should exclude soft-deleted bobbleheads (deletedAt IS NULL)', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      const activeBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Active Bobblehead',
        userId: user!.id,
      });

      // Create deleted bobblehead
      const db = getTestDb();
      const { bobbleheads } = await import('@/lib/db/schema');

      const [deletedBobblehead] = await db
        .insert(bobbleheads)
        .values({
          collectionId: collection!.id,
          deletedAt: new Date(),
          name: 'Deleted Bobblehead',
          slug: `deleted-${Date.now()}`,
          userId: user!.id,
        })
        .returning();

      // Act
      const result = await BobbleheadsDashboardQuery.getListAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should only return active bobblehead
      expect(result).toHaveLength(1);
      expect(result[0]!.id).toBe(activeBobblehead!.id);
      expect(result[0]!.name).toBe('Active Bobblehead');
      expect(result.map((b) => b.id)).not.toContain(deletedBobblehead!.id);
    });
  });

  describe('getCategoriesByCollectionSlugAsync', () => {
    it('should return distinct categories', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

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
        name: 'Movie',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'music',
        collectionId: collection!.id,
        name: 'Music',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getCategoriesByCollectionSlugAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should return unique categories only
      expect(result).toHaveLength(3);
      expect(result).toContain('sports');
      expect(result).toContain('movies');
      expect(result).toContain('music');
    });

    it('should exclude null categories', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'sports',
        collectionId: collection!.id,
        name: 'Sports',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: null,
        collectionId: collection!.id,
        name: 'No Category 1',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: null,
        collectionId: collection!.id,
        name: 'No Category 2',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getCategoriesByCollectionSlugAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should only return non-null categories
      expect(result).toHaveLength(1);
      expect(result).toContain('sports');
      expect(result).not.toContain(null);
    });

    it('should order categories alphabetically', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'zebra',
        collectionId: collection!.id,
        name: 'Z',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'apple',
        collectionId: collection!.id,
        name: 'A',
        userId: user!.id,
      });

      await createTestBobblehead({
        category: 'monkey',
        collectionId: collection!.id,
        name: 'M',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getCategoriesByCollectionSlugAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should be alphabetically ordered
      expect(result).toEqual(['apple', 'monkey', 'zebra']);
    });
  });

  describe('getCountAsync', () => {
    it('should return correct count with no filters', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      for (let i = 0; i < 5; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Bobblehead ${i + 1}`,
          userId: user!.id,
        });
      }

      // Act
      const result = await BobbleheadsDashboardQuery.getCountAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toBe(5);
    });

    it('should return correct count with category filter', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

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
        name: 'Movie',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getCountAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { category: 'sports' },
      );

      // Assert
      expect(result).toBe(2);
    });

    it('should return correct count with search term', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        slug: 'test-collection',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Baseball Player',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Soccer Hero',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Baseballer Star',
        userId: user!.id,
      });

      // Act
      const result = await BobbleheadsDashboardQuery.getCountAsync(
        'test-collection',
        {
          ...queryContext,
          userId: user!.id,
        },
        { searchTerm: 'base' },
      );

      // Assert - Should match "Baseball" and "Baseballer"
      expect(result).toBe(2);
    });
  });
});
