/**
 * Collections Dashboard Query Integration Tests
 *
 * These tests verify database aggregation queries for collection dashboard functionality
 * using Testcontainers for real PostgreSQL database interactions.
 *
 * Tests cover:
 * - getHeaderByCollectionSlugAsync - aggregates stats for single collection with joins
 * - getListByUserIdAsync - aggregates all user collections with stats
 * - getSelectorsByUserIdAsync - returns minimal collection data for selectors
 * - Permission filtering and null handling
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';

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
    collections: {
      dashboard: <T>(callback: () => T): T => callback(),
      dashboardHeader: <T>(callback: () => T): T => callback(),
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

describe('CollectionsDashboardQuery Integration Tests', () => {
  let queryContext: QueryContext;

  beforeEach(async () => {
    await resetTestDatabase();
    // Create empty query context - will use mocked db from vi.mock above
    queryContext = {};
  });

  describe('getHeaderByCollectionSlugAsync', () => {
    it('should return correct aggregated stats for collection', async () => {
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
        name: 'Featured Bobblehead 1',
        purchasePrice: 50.0,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Featured Bobblehead 2',
        purchasePrice: 75.5,
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Regular Bobblehead',
        purchasePrice: 25.0,
        userId: user!.id,
      });

      // Create social interactions
      const db = getTestDb();
      const { comments, contentViews, likes } = await import('@/lib/db/schema');

      // Create 2 likes from different users
      const user2 = await createTestUser({ username: 'liker1' });
      await db.insert(likes).values([
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: user2!.id,
        },
      ]);

      // Create 3 comments
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
        {
          content: 'Comment 3',
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
      ]);

      // Create 5 views
      for (let i = 0; i < 5; i++) {
        await db.insert(contentViews).values({
          targetId: collection!.id,
          targetType: 'collection',
          viewerId: user!.id,
        });
      }

      // Act
      const result = await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync('test-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(collection!.id);
      expect(result.name).toBe('Test Collection');
      expect(result.slug).toBe('test-collection');
      expect(result.description).toBe('My amazing collection');
      expect(result.coverImageUrl).toBe('https://example.com/cover.jpg');
      expect(result.isPublic).toBe(true);
      expect(result.bobbleheadCount).toBe('3'); // PostgreSQL count() returns string
      expect(result.totalValue).toBe('150.50'); // PostgreSQL sum() returns numeric as string
      expect(result.featuredCount).toBe('0'); // None marked as featured
      expect(result.likeCount).toBe('2');
      expect(result.commentCount).toBe('3');
      expect(result.viewCount).toBe('5');
    });

    it('should return zero counts for collection with no activity', async () => {
      // Arrange - Create collection with no bobbleheads or activity
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Empty Collection',
        slug: 'empty-collection',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync('empty-collection', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(collection!.id);
      expect(result.bobbleheadCount).toBe('0');
      expect(result.totalValue).toBe('0');
      expect(result.featuredCount).toBe('0');
      expect(result.likeCount).toBe('0');
      expect(result.commentCount).toBe('0');
      expect(result.viewCount).toBe('0');
    });

    it('should return null for non-existent collection', async () => {
      // Arrange - No collection created with this slug
      const user = await createTestUser();

      // Act
      const result = await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync('non-existent', {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toBeUndefined();
    });

    it('should respect user permission filtering', async () => {
      // Arrange - Create collection owned by user1, try to access as user2
      const user1 = await createTestUser({ username: 'owner' });
      const user2 = await createTestUser({ username: 'notowner' });

      const collection = await createTestCollection({
        name: 'Private Collection',
        slug: 'private-collection',
        userId: user1!.id,
      });

      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Secret Bobblehead',
        userId: user1!.id,
      });

      // Act - Try to access as user2
      const result = await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync('private-collection', {
        ...queryContext,
        userId: user2!.id,
      });

      // Assert - Should not return the collection (different user)
      expect(result).toBeUndefined();
    });
  });

  describe('getListByUserIdAsync', () => {
    it('should return all user collections with stats', async () => {
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

      await createTestCollection({
        name: 'Collection 3',
        userId: user!.id,
      });

      // Add bobbleheads to collections
      await createTestBobblehead({
        collectionId: collection1!.id,
        name: 'Bobblehead 1-1',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection2!.id,
        name: 'Bobblehead 2-1',
        userId: user!.id,
      });

      await createTestBobblehead({
        collectionId: collection2!.id,
        name: 'Bobblehead 2-2',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getListByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(3);
      expect(result.map((c) => c.name)).toContain('Collection 1');
      expect(result.map((c) => c.name)).toContain('Collection 2');
      expect(result.map((c) => c.name)).toContain('Collection 3');

      const col1 = result.find((c) => c.name === 'Collection 1');
      const col2 = result.find((c) => c.name === 'Collection 2');
      const col3 = result.find((c) => c.name === 'Collection 3');

      expect(col1!.bobbleheadCount).toBe('1');
      expect(col2!.bobbleheadCount).toBe('2');
      expect(col3!.bobbleheadCount).toBe('0');
    });

    it('should aggregate bobblehead counts correctly', async () => {
      // Arrange - Create collection with multiple bobbleheads
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Large Collection',
        userId: user!.id,
      });

      // Create 5 bobbleheads with different prices
      for (let i = 0; i < 5; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Bobblehead ${i + 1}`,
          purchasePrice: (i + 1) * 10,
          userId: user!.id,
        });
      }

      // Act
      const result = await CollectionsDashboardQuery.getListByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.bobbleheadCount).toBe('5');
      expect(result[0]!.totalValue).toBe('150.00'); // 10 + 20 + 30 + 40 + 50
    });

    it('should aggregate likes, views, comments correctly', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Popular Collection',
        userId: user!.id,
      });

      const db = getTestDb();
      const { comments, contentViews, likes } = await import('@/lib/db/schema');

      // Create 4 likes from different users
      const liker1 = await createTestUser({ username: 'liker1' });
      const liker2 = await createTestUser({ username: 'liker2' });
      const liker3 = await createTestUser({ username: 'liker3' });

      await db.insert(likes).values([
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: liker1!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: liker2!.id,
        },
        {
          targetId: collection!.id,
          targetType: 'collection',
          userId: liker3!.id,
        },
      ]);

      // Create 3 comments
      for (let i = 0; i < 3; i++) {
        await db.insert(comments).values({
          content: `Comment ${i + 1}`,
          targetId: collection!.id,
          targetType: 'collection',
          userId: user!.id,
        });
      }

      // Create 7 views
      for (let i = 0; i < 7; i++) {
        await db.insert(contentViews).values({
          targetId: collection!.id,
          targetType: 'collection',
          viewerId: user!.id,
        });
      }

      // Act
      const result = await CollectionsDashboardQuery.getListByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.likeCount).toBe('4');
      expect(result[0]!.commentCount).toBe('3');
      expect(result[0]!.viewCount).toBe('7');
    });
  });

  describe('getSelectorsByUserIdAsync', () => {
    it('should return minimal collection data for selectors', async () => {
      // Arrange - Create multiple collections with full data
      const user = await createTestUser();

      const collection1 = await createTestCollection({
        coverImageUrl: 'https://example.com/cover1.jpg',
        description: 'Description 1',
        name: 'Collection Alpha',
        slug: 'collection-alpha',
        userId: user!.id,
      });

      const collection2 = await createTestCollection({
        coverImageUrl: 'https://example.com/cover2.jpg',
        description: 'Description 2',
        name: 'Collection Beta',
        slug: 'collection-beta',
        userId: user!.id,
      });

      await createTestCollection({
        coverImageUrl: 'https://example.com/cover3.jpg',
        description: 'Description 3',
        name: 'Collection Gamma',
        slug: 'collection-gamma',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getSelectorsByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should return minimal data (id, name, slug only)
      expect(result).toHaveLength(3);

      // Verify each collection has only the minimal fields
      result.forEach((selector) => {
        expect(selector).toHaveProperty('id');
        expect(selector).toHaveProperty('name');
        expect(selector).toHaveProperty('slug');
        // Should NOT have other fields
        expect(selector).not.toHaveProperty('coverImageUrl');
        expect(selector).not.toHaveProperty('description');
        expect(selector).not.toHaveProperty('bobbleheadCount');
      });

      // Verify specific collections are present
      const alphaSelector = result.find((c) => c.slug === 'collection-alpha');
      const betaSelector = result.find((c) => c.slug === 'collection-beta');
      const gammaSelector = result.find((c) => c.slug === 'collection-gamma');

      expect(alphaSelector).toBeDefined();
      expect(alphaSelector!.id).toBe(collection1!.id);
      expect(alphaSelector!.name).toBe('Collection Alpha');

      expect(betaSelector).toBeDefined();
      expect(betaSelector!.id).toBe(collection2!.id);
      expect(betaSelector!.name).toBe('Collection Beta');

      expect(gammaSelector).toBeDefined();
      expect(gammaSelector!.name).toBe('Collection Gamma');

      // Verify ordering by name (case-insensitive ascending)
      expect(result[0]!.name).toBe('Collection Alpha');
      expect(result[1]!.name).toBe('Collection Beta');
      expect(result[2]!.name).toBe('Collection Gamma');
    });

    it('should order collections by name case-insensitively', async () => {
      // Arrange - Create collections with mixed case names
      const user = await createTestUser();

      await createTestCollection({
        name: 'zebra Collection',
        slug: 'zebra-collection',
        userId: user!.id,
      });

      await createTestCollection({
        name: 'Apple Collection',
        slug: 'apple-collection',
        userId: user!.id,
      });

      await createTestCollection({
        name: 'banana Collection',
        slug: 'banana-collection',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getSelectorsByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should be ordered alphabetically (case-insensitive)
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Apple Collection');
      expect(result[1]!.name).toBe('banana Collection');
      expect(result[2]!.name).toBe('zebra Collection');
    });

    it('should return empty array when user has no collections', async () => {
      // Arrange - Create user with no collections
      const user = await createTestUser();

      // Act
      const result = await CollectionsDashboardQuery.getSelectorsByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should only return collections owned by the user', async () => {
      // Arrange - Create two users with their own collections
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });

      await createTestCollection({
        name: 'User 1 Collection',
        slug: 'user-1-collection',
        userId: user1!.id,
      });

      await createTestCollection({
        name: 'User 2 Collection',
        slug: 'user-2-collection',
        userId: user2!.id,
      });

      // Act - Query as user1
      const result = await CollectionsDashboardQuery.getSelectorsByUserIdAsync({
        ...queryContext,
        userId: user1!.id,
      });

      // Assert - Should only return user1's collections
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('User 1 Collection');
    });
  });

  describe('Complex Aggregation Scenarios', () => {
    it('should handle featured bobblehead count aggregation', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Featured Collection',
        userId: user!.id,
      });

      const db = getTestDb();
      const { bobbleheads } = await import('@/lib/db/schema');

      // Create 2 featured bobbleheads
      await db.insert(bobbleheads).values([
        {
          collectionId: collection!.id,
          isFeatured: true,
          name: 'Featured 1',
          slug: `featured-1-${Date.now()}`,
          userId: user!.id,
        },
        {
          collectionId: collection!.id,
          isFeatured: true,
          name: 'Featured 2',
          slug: `featured-2-${Date.now()}`,
          userId: user!.id,
        },
      ]);

      // Create 3 non-featured bobbleheads
      for (let i = 0; i < 3; i++) {
        await createTestBobblehead({
          collectionId: collection!.id,
          name: `Regular ${i + 1}`,
          userId: user!.id,
        });
      }

      // Act
      const result = await CollectionsDashboardQuery.getHeaderByCollectionSlugAsync(collection!.slug, {
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toBeDefined();
      expect(result.bobbleheadCount).toBe('5'); // Total
      expect(result.featuredCount).toBe('2'); // Only featured ones
    });

    it('should handle null purchase prices in total value calculation', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Mixed Price Collection',
        userId: user!.id,
      });

      // Create bobbleheads with and without prices
      await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Priced 1',
        purchasePrice: 100,
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
        name: 'Priced 2',
        purchasePrice: 50,
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getListByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert - Should sum only non-null prices
      expect(result).toHaveLength(1);
      expect(result[0]!.totalValue).toBe('150.00'); // 100 + 50, ignoring null
      expect(result[0]!.bobbleheadCount).toBe('3');
    });

    it('should handle multiple collections with mixed activity levels', async () => {
      // Arrange
      const user = await createTestUser();

      // Collection with no activity
      await createTestCollection({
        name: 'Empty',
        userId: user!.id,
      });

      // Collection with bobbleheads only
      const bobbleheadsOnlyCollection = await createTestCollection({
        name: 'Bobbleheads Only',
        userId: user!.id,
      });
      await createTestBobblehead({
        collectionId: bobbleheadsOnlyCollection!.id,
        name: 'Bobblehead',
        userId: user!.id,
      });

      // Collection with full activity
      const activeCollection = await createTestCollection({
        name: 'Active',
        userId: user!.id,
      });
      await createTestBobblehead({
        collectionId: activeCollection!.id,
        name: 'Active Bobblehead',
        purchasePrice: 100,
        userId: user!.id,
      });

      const db = getTestDb();
      const { likes } = await import('@/lib/db/schema');
      await db.insert(likes).values({
        targetId: activeCollection!.id,
        targetType: 'collection',
        userId: user!.id,
      });

      // Act
      const result = await CollectionsDashboardQuery.getListByUserIdAsync({
        ...queryContext,
        userId: user!.id,
      });

      // Assert
      expect(result).toHaveLength(3);

      const empty = result.find((c) => c.name === 'Empty');
      const bobbleheadsOnly = result.find((c) => c.name === 'Bobbleheads Only');
      const active = result.find((c) => c.name === 'Active');

      expect(empty!.bobbleheadCount).toBe('0');
      expect(empty!.totalValue).toBe('0');
      expect(empty!.likeCount).toBe('0');

      expect(bobbleheadsOnly!.bobbleheadCount).toBe('1');
      expect(bobbleheadsOnly!.totalValue).toBe('0'); // No price
      expect(bobbleheadsOnly!.likeCount).toBe('0');

      expect(active!.bobbleheadCount).toBe('1');
      expect(active!.totalValue).toBe('100.00');
      expect(active!.likeCount).toBe('1');
    });
  });
});
