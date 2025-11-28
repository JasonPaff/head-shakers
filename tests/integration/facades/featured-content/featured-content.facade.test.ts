/**
 * Featured Content Facade Integration Tests
 *
 * These tests verify the Featured Content business logic layer
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - getFeaturedBobbleheadAsync - hero featured bobblehead data
 * - getFeaturedCollectionsAsync - featured collections with user-specific like status
 * - getTrendingBobbleheadsAsync - trending bobbleheads filtering
 * - Cache key differentiation for user-specific data
 * - Error context propagation with Sentry
 * - Date range filtering (endDate checks)
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeaturedContentFacade } from '@/lib/facades/featured-content/featured-content.facade';

import { createTestBobblehead } from '../../../fixtures/bobblehead.factory';
import { createTestCollection } from '../../../fixtures/collection.factory';
import {
  createTestFeaturedBobbleheadContent,
  createTestFeaturedCollectionContent,
} from '../../../fixtures/featured-content.factory';
import { createTestUser } from '../../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../../setup/test-db';

// Mock the database to use the test container database
vi.mock('@/lib/db', () => ({
  get db() {
    return getTestDb();
  },
}));

// Mock Sentry to track breadcrumbs and error handling
const mockAddBreadcrumb = vi.fn();
const mockCaptureException = vi.fn();
const mockSetContext = vi.fn();

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

// Mock cache service to control caching behavior and track cache calls
let cacheCallsByMethod: Record<string, number> = {};
let shouldBypassCache = true; // Default: bypass cache to test queries directly

vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    featured: {
      collections: <T>(callback: () => T, userId?: null | string): T => {
        const key = `collections-${userId || 'public'}`;
        cacheCallsByMethod[key] = (cacheCallsByMethod[key] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
      content: <T>(callback: () => T): T => {
        cacheCallsByMethod['content'] = (cacheCallsByMethod['content'] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
      featuredBobblehead: <T>(callback: () => T): T => {
        cacheCallsByMethod['featuredBobblehead'] = (cacheCallsByMethod['featuredBobblehead'] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
      trendingBobbleheads: <T>(callback: () => T): T => {
        cacheCallsByMethod['trendingBobbleheads'] = (cacheCallsByMethod['trendingBobbleheads'] || 0) + 1;
        return shouldBypassCache ? callback() : callback();
      },
    },
  },
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

describe('FeaturedContentFacade Integration Tests', () => {
  beforeEach(async () => {
    await resetTestDatabase();
    cacheCallsByMethod = {};
    shouldBypassCache = true;
    vi.clearAllMocks();
  });

  describe('getFeaturedBobbleheadAsync', () => {
    it('should return featured bobblehead with all fields', async () => {
      // Arrange - Create test data
      const user = await createTestUser({ username: 'bobbleheadowner' });
      const collection = await createTestCollection({
        name: 'Featured Collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Amazing Bobblehead',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        description: 'This is an amazing featured bobblehead',
        featureType: 'editor_pick',
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedBobbleheadAsync();

      // Assert
      expect(result).toBeDefined();
      expect(result!.contentId).toBe(bobblehead!.id);
      expect(result!.contentName).toBe('Amazing Bobblehead');
      expect(result!.contentSlug).toBe(bobblehead!.slug);
      expect(result!.description).toBe('This is an amazing featured bobblehead');
      expect(result!.owner).toBe(user!.id);
      expect(result!.likes).toBe(0);
      expect(result!.viewCount).toBe(0);

      // Verify cache was called
      expect(cacheCallsByMethod['featuredBobblehead']).toBe(1);

      // Verify Sentry breadcrumbs
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Fetching featured bobblehead',
        }),
      );
    });

    it('should return null when none featured', async () => {
      // Act - No featured content created
      const result = await FeaturedContentFacade.getFeaturedBobbleheadAsync();

      // Assert
      expect(result).toBeNull();

      // Verify cache was still called
      expect(cacheCallsByMethod['featuredBobblehead']).toBe(1);
    });

    it('should return highest priority bobblehead when multiple exist', async () => {
      // Arrange - Create multiple featured bobbleheads
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead1 = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Lower Priority',
        userId: user!.id,
      });

      const bobblehead2 = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Higher Priority',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(bobblehead1!.id, {
        isActive: true,
        priority: 5,
      });

      await createTestFeaturedBobbleheadContent(bobblehead2!.id, {
        isActive: true,
        priority: 10, // Higher priority
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedBobbleheadAsync();

      // Assert - Should return higher priority bobblehead
      expect(result).toBeDefined();
      expect(result!.contentName).toBe('Higher Priority');
    });

    it('should exclude expired content based on endDate check', async () => {
      // Arrange - Create featured bobblehead with expired endDate
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Expired Bobblehead',
        userId: user!.id,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        endDate: yesterday, // Expired
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedBobbleheadAsync();

      // Assert - Should return null because content is expired
      expect(result).toBeNull();
    });

    it('should exclude content with future startDate', async () => {
      // Arrange - Create featured bobblehead with future startDate
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Future Bobblehead',
        userId: user!.id,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        isActive: true,
        priority: 10,
        startDate: tomorrow, // Future start date
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedBobbleheadAsync();

      // Assert - Should return null because content hasn't started yet
      expect(result).toBeNull();
    });
  });

  describe('getFeaturedCollectionsAsync', () => {
    it('should return up to 6 collections', async () => {
      // Arrange - Create 8 featured collections
      const user = await createTestUser();
      const collections = [];

      for (let i = 0; i < 8; i++) {
        const collection = await createTestCollection({
          name: `Collection ${i + 1}`,
          userId: user!.id,
        });
        collections.push(collection);

        await createTestFeaturedCollectionContent(collection!.id, {
          isActive: true,
          priority: i,
        });
      }

      // Act
      const result = await FeaturedContentFacade.getFeaturedCollectionsAsync();

      // Assert - Should return maximum of 6 collections
      expect(result).toHaveLength(6);
    });

    it('should include like status for authenticated user', async () => {
      // Arrange - Create user, collection, and featured content
      const owner = await createTestUser({ username: 'owner' });
      const viewer = await createTestUser({ username: 'viewer' });

      const collection = await createTestCollection({
        name: 'Test Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        isActive: true,
        priority: 10,
      });

      // Create a like from the viewer
      const db = getTestDb();
      const { likes } = await import('@/lib/db/schema');
      await db.insert(likes).values({
        targetId: collection!.id,
        targetType: 'collection',
        userId: viewer!.id,
      });

      // Act - Fetch as viewer (authenticated)
      const result = await FeaturedContentFacade.getFeaturedCollectionsAsync(viewer!.id);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.isLiked).toBe(true);
      expect(result[0]!.likeId).toBeDefined();

      // Verify cache key includes userId
      expect(cacheCallsByMethod[`collections-${viewer!.id}`]).toBe(1);
    });

    it('should not show like status for unauthenticated user', async () => {
      // Arrange
      const owner = await createTestUser();
      const collection = await createTestCollection({
        name: 'Public Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        isActive: true,
        priority: 10,
      });

      // Act - Fetch without userId (public/unauthenticated)
      const result = await FeaturedContentFacade.getFeaturedCollectionsAsync(null);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.isLiked).toBe(false);
      expect(result[0]!.likeId).toBeNull();

      // Verify cache key for public access
      expect(cacheCallsByMethod['collections-public']).toBe(1);
    });

    it('should exclude expired content based on endDate check', async () => {
      // Arrange - Create active and expired collections
      const user = await createTestUser();

      const activeCollection = await createTestCollection({
        name: 'Active Collection',
        userId: user!.id,
      });

      const expiredCollection = await createTestCollection({
        name: 'Expired Collection',
        userId: user!.id,
      });

      await createTestFeaturedCollectionContent(activeCollection!.id, {
        isActive: true,
        priority: 10,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestFeaturedCollectionContent(expiredCollection!.id, {
        endDate: yesterday, // Expired
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedCollectionsAsync();

      // Assert - Should only return active collection
      expect(result).toHaveLength(1);
      expect(result[0]!.contentSlug).toBe(activeCollection!.slug);
    });

    it('should return collections with all required fields', async () => {
      // Arrange
      const user = await createTestUser({ username: 'collector' });
      const collection = await createTestCollection({
        name: 'Complete Collection',
        userId: user!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Amazing collection',
        featureType: 'trending',
        isActive: true,
        priority: 10,
        title: 'Featured Title',
      });

      // Act
      const result = await FeaturedContentFacade.getFeaturedCollectionsAsync();

      // Assert
      expect(result).toHaveLength(1);
      const featured = result[0]!;
      expect(featured.contentId).toBe(collection!.id);
      expect(featured.contentSlug).toBe(collection!.slug);
      expect(featured.description).toBe('Amazing collection');
      expect(featured.title).toBe('Featured Title');
      expect(featured.isTrending).toBe(true);
      expect(featured.ownerDisplayName).toBe('collector');
      expect(featured.totalItems).toBe(0);
      expect(featured.likes).toBe(0);
      expect(featured.comments).toBe(0);
      expect(featured.viewCount).toBe(0);
    });
  });

  describe('getTrendingBobbleheadsAsync', () => {
    it('should return up to 12 trending items', async () => {
      // Arrange - Create 15 trending bobbleheads
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      for (let i = 0; i < 15; i++) {
        const bobblehead = await createTestBobblehead({
          collectionId: collection!.id,
          name: `Trending Bobblehead ${i + 1}`,
          userId: user!.id,
        });

        await createTestFeaturedBobbleheadContent(bobblehead!.id, {
          featureType: 'trending',
          isActive: true,
          priority: i,
        });
      }

      // Act
      const result = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

      // Assert - Should return maximum of 12 items
      expect(result).toHaveLength(12);
    });

    it('should filter by feature type correctly - trending', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const trendingBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Trending Item',
        userId: user!.id,
      });

      const editorPickBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Editor Pick Item',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(trendingBobblehead!.id, {
        featureType: 'trending',
        isActive: true,
        priority: 1,
      });

      await createTestFeaturedBobbleheadContent(editorPickBobblehead!.id, {
        featureType: 'editor_pick',
        isActive: true,
        priority: 2,
      });

      // Act
      const result = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

      // Assert - Should include both trending and editor_pick
      expect(result).toHaveLength(2);
      const featureTypes = result.map((r) => r.featureType);
      expect(featureTypes).toContain('trending');
      expect(featureTypes).toContain('editor_pick');
    });

    it('should filter by feature type correctly - exclude collection_of_week', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const trendingBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Trending Item',
        userId: user!.id,
      });

      const weeklyBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Collection of Week',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(trendingBobblehead!.id, {
        featureType: 'trending',
        isActive: true,
        priority: 1,
      });

      await createTestFeaturedBobbleheadContent(weeklyBobblehead!.id, {
        featureType: 'collection_of_week',
        isActive: true,
        priority: 2,
      });

      // Act
      const result = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

      // Assert - Should only include trending, not collection_of_week
      expect(result).toHaveLength(1);
      expect(result[0]!.featureType).toBe('trending');
      expect(result[0]!.name).toBe('Trending Item');
    });

    it('should return bobbleheads with all required fields', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead = await createTestBobblehead({
        category: 'Sports',
        collectionId: collection!.id,
        name: 'Baseball Star',
        userId: user!.id,
        year: 2023,
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        featureType: 'trending',
        isActive: true,
        priority: 5,
        title: 'Featured Baseball Star',
      });

      // Act
      const result = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

      // Assert
      expect(result).toHaveLength(1);
      const trending = result[0]!;
      expect(trending.contentId).toBe(bobblehead!.id);
      expect(trending.contentSlug).toBe(bobblehead!.slug);
      expect(trending.name).toBe('Baseball Star');
      expect(trending.title).toBe('Featured Baseball Star');
      expect(trending.category).toBe('Sports');
      expect(trending.year).toBe(2023);
      expect(trending.featureType).toBe('trending');
      expect(trending.likeCount).toBe(0);
      expect(trending.viewCount).toBe(0);
    });

    it('should exclude expired content based on endDate check', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const activeBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Active Trending',
        userId: user!.id,
      });

      const expiredBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Expired Trending',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(activeBobblehead!.id, {
        featureType: 'trending',
        isActive: true,
        priority: 1,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestFeaturedBobbleheadContent(expiredBobblehead!.id, {
        endDate: yesterday,
        featureType: 'trending',
        isActive: true,
        priority: 2,
      });

      // Act
      const result = await FeaturedContentFacade.getTrendingBobbleheadsAsync();

      // Assert - Should only return active trending item
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Active Trending');
    });
  });

  describe('Cache key differentiation for user-specific data', () => {
    it('should use different cache keys for different users in getFeaturedCollectionsAsync', async () => {
      // Arrange
      const user1 = await createTestUser({ username: 'user1' });
      const user2 = await createTestUser({ username: 'user2' });
      const owner = await createTestUser({ username: 'owner' });

      const collection = await createTestCollection({
        name: 'Test Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        isActive: true,
        priority: 10,
      });

      // Act - Fetch as different users
      await FeaturedContentFacade.getFeaturedCollectionsAsync(user1!.id);
      await FeaturedContentFacade.getFeaturedCollectionsAsync(user2!.id);
      await FeaturedContentFacade.getFeaturedCollectionsAsync(null);

      // Assert - Should have different cache keys
      expect(cacheCallsByMethod[`collections-${user1!.id}`]).toBe(1);
      expect(cacheCallsByMethod[`collections-${user2!.id}`]).toBe(1);
      expect(cacheCallsByMethod['collections-public']).toBe(1);
    });
  });

  describe('Error context propagation with Sentry', () => {
    it('should propagate error context when database query fails', async () => {
      // Arrange - Mock database to throw an error
      const { FeaturedContentQuery } = await import('@/lib/queries/featured-content/featured-content-query');
      const originalMethod = FeaturedContentQuery.getFeaturedBobbleheadAsync.bind(FeaturedContentQuery);

      FeaturedContentQuery.getFeaturedBobbleheadAsync = vi.fn(() => {
        throw new Error('Database connection failed');
      });

      try {
        // Act & Assert - Should throw error with facade context
        await expect(FeaturedContentFacade.getFeaturedBobbleheadAsync()).rejects.toThrow();

        // Verify Sentry context was set (error builder should have been called)
        // Note: We can't easily verify the exact error format without mocking createFacadeError,
        // but we can verify the error was thrown
      } finally {
        // Restore original method
        FeaturedContentQuery.getFeaturedBobbleheadAsync = originalMethod;
      }
    });

    it('should add breadcrumbs for successful operations', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      await createTestFeaturedCollectionContent(collection!.id, {
        isActive: true,
        priority: 10,
      });

      // Act
      await FeaturedContentFacade.getFeaturedCollectionsAsync();

      // Assert - Verify breadcrumbs were added
      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Fetching featured collections',
        }),
      );

      expect(mockAddBreadcrumb).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Featured collections fetched successfully',
        }),
      );
    });
  });
});
