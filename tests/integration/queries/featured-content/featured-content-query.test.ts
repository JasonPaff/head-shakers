/**
 * Featured Content Query Integration Tests
 *
 * These tests verify raw database query methods for featured content
 * using Testcontainers for real database interactions.
 *
 * Tests cover:
 * - getFeaturedBobbleheadAsync - joins with bobbleheads table, orders by priority
 * - getFeaturedCollectionsAsync - includes owner user data, calculates like status
 * - getTrendingBobbleheadsAsync - filters by isActive and date range
 * - Query null/empty result handling
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { QueryContext } from '@/lib/queries/base/query-context';

import { FeaturedContentQuery } from '@/lib/queries/featured-content/featured-content-query';

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

describe('FeaturedContentQuery Integration Tests', () => {
  let queryContext: QueryContext;

  beforeEach(async () => {
    await resetTestDatabase();
    // Create empty query context - will use mocked db from vi.mock above
    queryContext = {};
  });

  describe('getFeaturedBobbleheadAsync', () => {
    it('should join with bobbleheads table correctly', async () => {
      // Arrange - Create bobblehead and featured content
      const user = await createTestUser({ username: 'bobbleheadowner' });
      const collection = await createTestCollection({
        name: 'Test Collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Amazing Bobblehead',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        description: 'Featured bobblehead description',
        featureType: 'editor_pick',
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert - Verify join worked correctly
      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.contentId).toBe(bobblehead!.id);
      expect(result!.contentName).toBe('Amazing Bobblehead');
      expect(result!.contentSlug).toBe(bobblehead!.slug);
      expect(result!.owner).toBe(user!.id);
      expect(result!.likes).toBe(0);
      expect(result!.description).toBe('Featured bobblehead description');
    });

    it('should order by priority descending', async () => {
      // Arrange - Create multiple featured bobbleheads with different priorities
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead1 = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Priority 5 Bobblehead',
        userId: user!.id,
      });

      const bobblehead2 = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Priority 15 Bobblehead',
        userId: user!.id,
      });

      const bobblehead3 = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Priority 10 Bobblehead',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(bobblehead1!.id, {
        description: 'Desc 1',
        isActive: true,
        priority: 5,
      });

      await createTestFeaturedBobbleheadContent(bobblehead2!.id, {
        description: 'Desc 2',
        isActive: true,
        priority: 15, // Highest priority
      });

      await createTestFeaturedBobbleheadContent(bobblehead3!.id, {
        description: 'Desc 3',
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert - Should return highest priority (15)
      expect(result).toBeDefined();
      expect(result!.contentName).toBe('Priority 15 Bobblehead');
    });

    it('should handle null/empty results gracefully when no featured bobbleheads exist', async () => {
      // Arrange - No featured bobbleheads created

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert
      expect(result).toBeNull();
    });

    it('should filter by active status and date range', async () => {
      // Arrange - Create inactive and expired bobbleheads
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const activeBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Active Bobblehead',
        userId: user!.id,
      });

      const inactiveBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Inactive Bobblehead',
        userId: user!.id,
      });

      const expiredBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Expired Bobblehead',
        userId: user!.id,
      });

      await createTestFeaturedBobbleheadContent(activeBobblehead!.id, {
        description: 'Active',
        isActive: true,
        priority: 10,
      });

      await createTestFeaturedBobbleheadContent(inactiveBobblehead!.id, {
        description: 'Inactive',
        isActive: false, // Inactive
        priority: 20,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestFeaturedBobbleheadContent(expiredBobblehead!.id, {
        description: 'Expired',
        endDate: yesterday, // Expired
        isActive: true,
        priority: 15,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert - Should only return the active, non-expired bobblehead
      expect(result).toBeDefined();
      expect(result!.contentName).toBe('Active Bobblehead');
    });

    it('should exclude bobbleheads with future start dates', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const futureBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Future Bobblehead',
        userId: user!.id,
      });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestFeaturedBobbleheadContent(futureBobblehead!.id, {
        description: 'Future',
        isActive: true,
        priority: 10,
        startDate: tomorrow, // Future start date
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert
      expect(result).toBeNull();
    });

    it('should use innerJoin to ensure bobblehead exists', async () => {
      // Arrange - Create featured content that points to non-existent bobblehead
      const db = getTestDb();
      const { featuredContent } = await import('@/lib/db/schema');

      // Use a valid UUID format for non-existent bobblehead
      const nonExistentBobbleheadId = '00000000-0000-0000-0000-000000000000';

      await db.insert(featuredContent).values({
        contentId: nonExistentBobbleheadId,
        contentType: 'bobblehead',
        description: 'This points to nothing',
        featureType: 'editor_pick',
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert - Should return null because innerJoin requires bobblehead to exist
      expect(result).toBeNull();
    });
  });

  describe('getFeaturedCollectionsAsync', () => {
    it('should include owner user data', async () => {
      // Arrange
      const owner = await createTestUser({
        avatarUrl: 'https://example.com/avatar.jpg',
        username: 'collectionowner',
      });

      const collection = await createTestCollection({
        name: 'Amazing Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Featured collection',
        featureType: 'collection_of_week',
        isActive: true,
        priority: 10,
        title: 'Collection of the Week',
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext);

      // Assert - Verify owner data is included
      expect(result).toHaveLength(1);
      expect(result[0]!.ownerDisplayName).toBe('collectionowner');
      expect(result[0]!.ownerAvatarUrl).toBe('https://example.com/avatar.jpg');
      expect(result[0]!.contentSlug).toBe(collection!.slug);
    });

    it('should calculate like status for authenticated user', async () => {
      // Arrange
      const owner = await createTestUser({ username: 'owner' });
      const viewer = await createTestUser({ username: 'viewer' });

      const collection = await createTestCollection({
        name: 'Likeable Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Test',
        isActive: true,
        priority: 10,
      });

      // Create a like from viewer
      const db = getTestDb();
      const { likes } = await import('@/lib/db/schema');
      await db.insert(likes).values({
        targetId: collection!.id,
        targetType: 'collection',
        userId: viewer!.id,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext, viewer!.id);

      // Assert - Should show liked status for viewer
      expect(result).toHaveLength(1);
      expect(result[0]!.isLiked).toBe(true);
      expect(result[0]!.likeId).toBeDefined();
      expect(result[0]!.likeId).not.toBeNull();
      expect(result[0]!.likes).toBe(1);
    });

    it('should not show like status for unauthenticated user', async () => {
      // Arrange
      const owner = await createTestUser();
      const collection = await createTestCollection({
        name: 'Public Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Public',
        isActive: true,
        priority: 10,
      });

      // Act - Pass null userId (unauthenticated)
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext, null);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.isLiked).toBe(false);
      expect(result[0]!.likeId).toBeNull();
      expect(result[0]!.likes).toBe(0);
    });

    it('should limit results to 6 collections', async () => {
      // Arrange - Create 10 featured collections
      const owner = await createTestUser();

      for (let i = 0; i < 10; i++) {
        const collection = await createTestCollection({
          name: `Collection ${i + 1}`,
          userId: owner!.id,
        });

        await createTestFeaturedCollectionContent(collection!.id, {
          description: `Description ${i + 1}`,
          isActive: true,
          priority: i,
        });
      }

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext);

      // Assert - Should return maximum 6 collections
      expect(result).toHaveLength(6);
    });

    it('should handle null/empty results gracefully when no featured collections exist', async () => {
      // Arrange - No featured collections created

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should return all required fields', async () => {
      // Arrange
      const owner = await createTestUser({ username: 'owner' });
      const collection = await createTestCollection({
        coverImageUrl: 'https://example.com/cover.jpg',
        name: 'Complete Collection',
        slug: 'complete-collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Amazing collection',
        featureType: 'trending',
        imageUrl: 'https://example.com/featured.jpg',
        isActive: true,
        priority: 10,
        title: 'Featured Title',
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext);

      // Assert - Verify all fields are present
      expect(result).toHaveLength(1);
      const featured = result[0]!;
      expect(featured.contentId).toBe(collection!.id);
      expect(featured.contentSlug).toBe('complete-collection');
      expect(featured.description).toBe('Amazing collection');
      expect(featured.title).toBe('Featured Title');
      expect(featured.isTrending).toBe(true);
      expect(featured.imageUrl).toBe('https://example.com/featured.jpg'); // Uses featuredContent.imageUrl
      expect(featured.ownerDisplayName).toBe('owner');
      expect(featured.totalItems).toBe(0); // Default total items
      expect(featured.totalValue).toBe('0'); // Default total value (decimal returned as string)
      expect(featured.likes).toBe(0); // Default like count
      expect(featured.comments).toBe(0); // Default comment count
      expect(featured.viewCount).toBe(0);
      expect(featured.isLiked).toBe(false);
      expect(featured.likeId).toBeNull();
    });

    it('should use collection coverImageUrl when featuredContent imageUrl is null', async () => {
      // Arrange
      const owner = await createTestUser();
      const collection = await createTestCollection({
        coverImageUrl: 'https://example.com/collection-cover.jpg',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Test',
        imageUrl: null, // No custom featured image
        isActive: true,
        priority: 10,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext);

      // Assert - Should use COALESCE to fall back to collection cover image
      expect(result).toHaveLength(1);
      expect(result[0]!.imageUrl).toBe('https://example.com/collection-cover.jpg');
    });
  });

  describe('getTrendingBobbleheadsAsync', () => {
    it('should filter by isActive and date range', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const activeBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Active Trending',
        userId: user!.id,
      });

      const inactiveBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Inactive Trending',
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

      await createTestFeaturedBobbleheadContent(inactiveBobblehead!.id, {
        featureType: 'trending',
        isActive: false, // Inactive
        priority: 2,
      });

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestFeaturedBobbleheadContent(expiredBobblehead!.id, {
        endDate: yesterday, // Expired
        featureType: 'trending',
        isActive: true,
        priority: 3,
      });

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert - Should only return active, non-expired bobblehead
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Active Trending');
    });

    it('should filter by feature type - include trending and editor_pick', async () => {
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

      const homepageBannerBobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Homepage Banner Item',
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

      await createTestFeaturedBobbleheadContent(homepageBannerBobblehead!.id, {
        featureType: 'homepage_banner', // Should be excluded
        isActive: true,
        priority: 3,
      });

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert - Should include trending and editor_pick, but not homepage_banner
      expect(result).toHaveLength(2);
      const names = result.map((r) => r.name);
      expect(names).toContain('Trending Item');
      expect(names).toContain('Editor Pick Item');
      expect(names).not.toContain('Homepage Banner Item');
    });

    it('should order by priority ascending and limit to 12 items', async () => {
      // Arrange - Create 15 trending bobbleheads
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobbleheads = [];
      for (let i = 0; i < 15; i++) {
        const bobblehead = await createTestBobblehead({
          collectionId: collection!.id,
          name: `Trending ${i + 1}`,
          userId: user!.id,
        });
        bobbleheads.push(bobblehead);

        await createTestFeaturedBobbleheadContent(bobblehead!.id, {
          featureType: 'trending',
          isActive: true,
          priority: i, // 0 to 14
        });
      }

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert - Should return 12 items ordered by priority ascending
      expect(result).toHaveLength(12);
      expect(result[0]!.name).toBe('Trending 1'); // priority 0
      expect(result[11]!.name).toBe('Trending 12'); // priority 11
    });

    it('should handle null/empty results gracefully when no trending bobbleheads exist', async () => {
      // Arrange - No trending bobbleheads created

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should return all required fields', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead = await createTestBobblehead({
        category: 'Sports',
        collectionId: collection!.id,
        name: 'Baseball Star',
        slug: 'baseball-star',
        userId: user!.id,
        year: 2023,
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        featureType: 'trending',
        imageUrl: 'https://example.com/custom.jpg',
        isActive: true,
        priority: 5,
        title: 'Featured Baseball Star',
        viewCount: 100,
      });

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert - Verify all required fields
      expect(result).toHaveLength(1);
      const trending = result[0]!;
      expect(trending.contentId).toBe(bobblehead!.id);
      expect(trending.contentSlug).toBe('baseball-star');
      expect(trending.name).toBe('Baseball Star');
      expect(trending.title).toBe('Featured Baseball Star');
      expect(trending.category).toBe('Sports');
      expect(trending.year).toBe(2023);
      expect(trending.featureType).toBe('trending');
      expect(trending.likeCount).toBe(0);
      expect(trending.viewCount).toBe(100);
      expect(trending.imageUrl).toBe('https://example.com/custom.jpg');
    });

    it('should use bobblehead primary photo when featuredContent imageUrl is null', async () => {
      // Arrange
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Bobblehead with Photo',
        userId: user!.id,
      });

      // Create primary photo
      const db = getTestDb();
      const { bobbleheadPhotos } = await import('@/lib/db/schema');
      await db.insert(bobbleheadPhotos).values({
        bobbleheadId: bobblehead!.id,
        isPrimary: true,
        url: 'https://example.com/primary-photo.jpg',
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        featureType: 'trending',
        imageUrl: null, // No custom featured image
        isActive: true,
        priority: 1,
      });

      // Act
      const result = await FeaturedContentQuery.getTrendingBobbleheadsAsync(queryContext);

      // Assert - Should use COALESCE to fall back to primary photo
      expect(result).toHaveLength(1);
      expect(result[0]!.imageUrl).toBe('https://example.com/primary-photo.jpg');
    });
  });

  describe('Complex Join Scenarios', () => {
    it('should handle multiple joins correctly in getFeaturedBobbleheadAsync', async () => {
      // Arrange - Create complete data with all joined tables
      const user = await createTestUser({
        avatarUrl: 'https://example.com/user-avatar.jpg',
        username: 'bobbleheadcreator',
      });

      const collection = await createTestCollection({
        name: 'Sports Collection',
        userId: user!.id,
      });

      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Limited Edition Bobblehead',
        slug: 'limited-edition',
        userId: user!.id,
      });

      // Create primary photo
      const db = getTestDb();
      const { bobbleheadPhotos } = await import('@/lib/db/schema');
      await db.insert(bobbleheadPhotos).values({
        bobbleheadId: bobblehead!.id,
        isPrimary: true,
        url: 'https://example.com/bobblehead-photo.jpg',
      });

      await createTestFeaturedBobbleheadContent(bobblehead!.id, {
        description: 'Amazing limited edition piece',
        featureType: 'editor_pick',
        isActive: true,
        priority: 20,
        viewCount: 500,
      });

      // Act
      const result = await FeaturedContentQuery.getFeaturedBobbleheadAsync(queryContext);

      // Assert - All joins should work correctly
      expect(result).toBeDefined();
      expect(result!.contentId).toBe(bobblehead!.id);
      expect(result!.contentName).toBe('Limited Edition Bobblehead');
      expect(result!.contentSlug).toBe('limited-edition');
      expect(result!.owner).toBe(user!.id);
      expect(result!.imageUrl).toBe('https://example.com/bobblehead-photo.jpg');
      expect(result!.likes).toBe(0);
      expect(result!.viewCount).toBe(500);
      expect(result!.description).toBe('Amazing limited edition piece');
    });

    it('should handle multiple joins correctly in getFeaturedCollectionsAsync', async () => {
      // Arrange
      const owner = await createTestUser({
        avatarUrl: 'https://example.com/owner-avatar.jpg',
        username: 'collectionowner',
      });

      const viewer = await createTestUser({ username: 'viewer' });

      const collection = await createTestCollection({
        coverImageUrl: 'https://example.com/collection-cover.jpg',
        name: 'Complete Collection',
        userId: owner!.id,
      });

      await createTestFeaturedCollectionContent(collection!.id, {
        description: 'Featured collection',
        featureType: 'collection_of_week',
        isActive: true,
        priority: 15,
        title: 'Collection of the Week',
      });

      // Create like
      const db = getTestDb();
      const { likes } = await import('@/lib/db/schema');
      const [like] = await db
        .insert(likes)
        .values({
          targetId: collection!.id,
          targetType: 'collection',
          userId: viewer!.id,
        })
        .returning();

      // Act
      const result = await FeaturedContentQuery.getFeaturedCollectionsAsync(queryContext, viewer!.id);

      // Assert - All joins should provide complete data
      expect(result).toHaveLength(1);
      const featured = result[0]!;
      expect(featured.contentId).toBe(collection!.id);
      expect(featured.ownerDisplayName).toBe('collectionowner');
      expect(featured.ownerAvatarUrl).toBe('https://example.com/owner-avatar.jpg');
      expect(featured.isLiked).toBe(true);
      expect(featured.likeId).toBe(like!.id);
      expect(featured.likes).toBe(1);
      expect(featured.comments).toBe(0);
      expect(featured.totalItems).toBe(0);
      expect(featured.totalValue).toBe('0');
    });
  });
});
