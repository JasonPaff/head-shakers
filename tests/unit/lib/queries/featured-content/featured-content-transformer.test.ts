/**
 * Unit tests for FeaturedContentTransformer
 * Tests data transformation logic and business rules
 */

import { describe, expect, it } from 'vitest';

import {
  type FeaturedContentData,
  FeaturedContentTransformer,
  type RawFeaturedContentData,
} from '@/lib/queries/featured-content/featured-content-transformer';

describe('FeaturedContentTransformer', () => {
  describe('transformFeaturedContent', () => {
    it('should transform complete bobblehead record correctly', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: 'my-collection',
          bobbleheadLikes: 42,
          bobbleheadName: 'Yankees Derek Jeter',
          bobbleheadOwner: 'user-123',
          bobbleheadOwnerUsername: 'bobblefan',
          bobbleheadPrimaryPhotoUrl: 'https://cdn.example.com/bobblehead.jpg',
          bobbleheadSlug: 'yankees-derek-jeter',
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'bobblehead-id-123',
          contentType: 'bobblehead',
          createdAt: new Date('2024-01-15T10:00:00Z'),
          curatorNotes: 'Rare limited edition piece',
          description: 'Amazing Yankees bobblehead',
          endDate: new Date('2024-12-31T23:59:59Z'),
          featureType: 'editor_pick',
          id: 'featured-123',
          imageUrl: 'https://cdn.example.com/custom-image.jpg',
          isActive: true,
          priority: 1,
          startDate: new Date('2024-01-01T00:00:00Z'),
          title: 'Featured Pick of the Day',
          updatedAt: new Date('2024-01-16T12:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 1500,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        collectionSlug: 'my-collection',
        comments: 0,
        contentId: 'bobblehead-id-123',
        contentName: 'Yankees Derek Jeter',
        contentSlug: 'yankees-derek-jeter',
        contentType: 'bobblehead',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        curatorNotes: 'Rare limited edition piece',
        description: 'Amazing Yankees bobblehead',
        endDate: new Date('2024-12-31T23:59:59Z'),
        featureType: 'editor_pick',
        id: 'featured-123',
        imageUrl: 'https://cdn.example.com/custom-image.jpg',
        isActive: true,
        likes: 42,
        owner: 'user-123',
        ownerDisplayName: 'bobblefan',
        ownerUsername: 'bobblefan',
        priority: 1,
        startDate: new Date('2024-01-01T00:00:00Z'),
        title: 'Featured Pick of the Day',
        updatedAt: new Date('2024-01-16T12:00:00Z'),
        viewCount: 1500,
      });
    });

    it('should transform complete collection record correctly', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: 'https://cdn.example.com/collection-cover.jpg',
          collectionOwner: 'user-456',
          collectionOwnerUsername: 'collector123',
          collectionSlug: 'vintage-baseball',
          contentId: 'collection-id-456',
          contentType: 'collection',
          createdAt: new Date('2024-02-01T10:00:00Z'),
          curatorNotes: 'Outstanding collection',
          description: 'Vintage baseball bobbleheads',
          endDate: null,
          featureType: 'collection_of_week',
          id: 'featured-456',
          imageUrl: null,
          isActive: true,
          priority: 10,
          startDate: new Date('2024-02-01T00:00:00Z'),
          title: 'Collection of the Week',
          updatedAt: new Date('2024-02-01T10:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 2500,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        collectionSlug: null,
        comments: 0,
        contentId: 'collection-id-456',
        contentName: null,
        contentSlug: 'vintage-baseball',
        contentType: 'collection',
        createdAt: new Date('2024-02-01T10:00:00Z'),
        curatorNotes: 'Outstanding collection',
        description: 'Vintage baseball bobbleheads',
        endDate: null,
        featureType: 'collection_of_week',
        id: 'featured-456',
        imageUrl: 'https://cdn.example.com/collection-cover.jpg',
        isActive: true,
        likes: 0,
        owner: 'user-456',
        ownerDisplayName: 'collector123',
        ownerUsername: 'collector123',
        priority: 10,
        startDate: new Date('2024-02-01T00:00:00Z'),
        title: 'Collection of the Week',
        updatedAt: new Date('2024-02-01T10:00:00Z'),
        viewCount: 2500,
      });
    });

    it('should transform complete user record correctly', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'user-id-789',
          contentType: 'user',
          createdAt: new Date('2024-03-01T10:00:00Z'),
          curatorNotes: 'Top contributor',
          description: 'Most active collector',
          endDate: null,
          featureType: 'trending',
          id: 'featured-789',
          imageUrl: 'https://cdn.example.com/user-avatar.jpg',
          isActive: true,
          priority: 5,
          startDate: new Date('2024-03-01T00:00:00Z'),
          title: 'Collector of the Month',
          updatedAt: new Date('2024-03-01T10:00:00Z'),
          userId: 'user-id-789',
          userUsername: 'topuser',
          viewCount: 3000,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        collectionSlug: null,
        comments: 0,
        contentId: 'user-id-789',
        contentName: 'topuser',
        contentSlug: null,
        contentType: 'user',
        createdAt: new Date('2024-03-01T10:00:00Z'),
        curatorNotes: 'Top contributor',
        description: 'Most active collector',
        endDate: null,
        featureType: 'trending',
        id: 'featured-789',
        imageUrl: 'https://cdn.example.com/user-avatar.jpg',
        isActive: true,
        likes: 0,
        owner: 'user-id-789',
        ownerDisplayName: 'topuser',
        ownerUsername: 'topuser',
        priority: 5,
        startDate: new Date('2024-03-01T00:00:00Z'),
        title: 'Collector of the Month',
        updatedAt: new Date('2024-03-01T10:00:00Z'),
        viewCount: 3000,
      });
    });

    it('should handle null optional fields', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'content-123',
          contentType: 'collection',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'homepage_banner',
          id: 'featured-null-fields',
          imageUrl: null,
          isActive: false,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        collectionSlug: null,
        comments: 0,
        contentId: 'content-123',
        contentName: null,
        contentSlug: null,
        contentType: 'collection',
        createdAt: new Date('2024-01-01T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'homepage_banner',
        id: 'featured-null-fields',
        imageUrl: null,
        isActive: false,
        likes: 0,
        owner: null,
        ownerDisplayName: null,
        ownerUsername: null,
        priority: 0,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        viewCount: 0,
      });
    });

    it('should prioritize explicit imageUrl over content-specific images', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: 'test-collection',
          bobbleheadLikes: null,
          bobbleheadName: 'Test Bobblehead',
          bobbleheadOwner: 'user-1',
          bobbleheadOwnerUsername: 'user1',
          bobbleheadPrimaryPhotoUrl: 'https://cdn.example.com/bobblehead-photo.jpg',
          bobbleheadSlug: 'test-bobblehead',
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'bobblehead-123',
          contentType: 'bobblehead',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'editor_pick',
          id: 'featured-image-priority',
          imageUrl: 'https://cdn.example.com/custom-featured-image.jpg',
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.imageUrl).toBe('https://cdn.example.com/custom-featured-image.jpg');
    });

    it('should fallback to bobblehead primary photo when no explicit imageUrl', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: 'test-collection',
          bobbleheadLikes: null,
          bobbleheadName: 'Test Bobblehead',
          bobbleheadOwner: 'user-1',
          bobbleheadOwnerUsername: 'user1',
          bobbleheadPrimaryPhotoUrl: 'https://cdn.example.com/bobblehead-photo.jpg',
          bobbleheadSlug: 'test-bobblehead',
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'bobblehead-123',
          contentType: 'bobblehead',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'editor_pick',
          id: 'featured-bobblehead-image',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.imageUrl).toBe('https://cdn.example.com/bobblehead-photo.jpg');
    });

    it('should fallback to collection cover image when no explicit imageUrl', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: 'https://cdn.example.com/collection-cover.jpg',
          collectionOwner: 'user-2',
          collectionOwnerUsername: 'user2',
          collectionSlug: 'test-collection',
          contentId: 'collection-123',
          contentType: 'collection',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'collection_of_week',
          id: 'featured-collection-image',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.imageUrl).toBe('https://cdn.example.com/collection-cover.jpg');
    });

    it('should prioritize bobblehead owner over collection owner', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: 'test-collection',
          bobbleheadLikes: null,
          bobbleheadName: 'Test Bobblehead',
          bobbleheadOwner: 'bobblehead-owner',
          bobbleheadOwnerUsername: 'bobbleheaduser',
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: 'test-bobblehead',
          collectionCoverImageUrl: null,
          collectionOwner: 'collection-owner',
          collectionOwnerUsername: 'collectionuser',
          collectionSlug: null,
          contentId: 'bobblehead-123',
          contentType: 'bobblehead',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'editor_pick',
          id: 'featured-owner-priority',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: 'user-id',
          userUsername: 'username',
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.owner).toBe('bobblehead-owner');
      expect(result[0]?.ownerDisplayName).toBe('bobbleheaduser');
    });

    it('should use collection owner when no bobblehead owner', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: null,
          collectionOwner: 'collection-owner',
          collectionOwnerUsername: 'collectionuser',
          collectionSlug: 'test-collection',
          contentId: 'collection-123',
          contentType: 'collection',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'collection_of_week',
          id: 'featured-collection-owner',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: 'user-id',
          userUsername: 'username',
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.owner).toBe('collection-owner');
      expect(result[0]?.ownerDisplayName).toBe('collectionuser');
    });

    it('should use userId when no bobblehead or collection owner', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'user-123',
          contentType: 'user',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'trending',
          id: 'featured-user-owner',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: 'user-id',
          userUsername: 'username',
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.owner).toBe('user-id');
      expect(result[0]?.ownerDisplayName).toBe('username');
    });

    it('should transform multiple records correctly', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: 'collection-1',
          bobbleheadLikes: 10,
          bobbleheadName: 'Bobblehead 1',
          bobbleheadOwner: 'user-1',
          bobbleheadOwnerUsername: 'user1',
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: 'bobblehead-1',
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'bobblehead-1',
          contentType: 'bobblehead',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'editor_pick',
          id: 'featured-1',
          imageUrl: null,
          isActive: true,
          priority: 1,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 100,
        },
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: 'https://cdn.example.com/collection.jpg',
          collectionOwner: 'user-2',
          collectionOwnerUsername: 'user2',
          collectionSlug: 'collection-1',
          contentId: 'collection-1',
          contentType: 'collection',
          createdAt: new Date('2024-01-02T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'collection_of_week',
          id: 'featured-2',
          imageUrl: null,
          isActive: true,
          priority: 2,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-02T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 200,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result).toHaveLength(2);
      expect(result[0]?.contentId).toBe('bobblehead-1');
      expect(result[0]?.contentType).toBe('bobblehead');
      expect(result[1]?.contentId).toBe('collection-1');
      expect(result[1]?.contentType).toBe('collection');
    });

    it('should default likes to 0 when bobbleheadLikes is null', () => {
      const rawData: Array<RawFeaturedContentData> = [
        {
          bobbleheadCollectionSlug: null,
          bobbleheadLikes: null,
          bobbleheadName: null,
          bobbleheadOwner: null,
          bobbleheadOwnerUsername: null,
          bobbleheadPrimaryPhotoUrl: null,
          bobbleheadSlug: null,
          collectionCoverImageUrl: null,
          collectionOwner: null,
          collectionOwnerUsername: null,
          collectionSlug: null,
          contentId: 'content-1',
          contentType: 'collection',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          curatorNotes: null,
          description: null,
          endDate: null,
          featureType: 'trending',
          id: 'featured-no-likes',
          imageUrl: null,
          isActive: true,
          priority: 0,
          startDate: null,
          title: null,
          updatedAt: new Date('2024-01-01T00:00:00Z'),
          userId: null,
          userUsername: null,
          viewCount: 0,
        },
      ];

      const result = FeaturedContentTransformer.transformFeaturedContent(rawData);

      expect(result[0]?.likes).toBe(0);
    });

    it('should return empty array for empty input', () => {
      const result = FeaturedContentTransformer.transformFeaturedContent([]);

      expect(result).toEqual([]);
    });
  });

  describe('filterByType', () => {
    const mockData: Array<FeaturedContentData> = [
      {
        comments: 0,
        contentId: 'content-1',
        contentName: 'Content 1',
        contentSlug: 'content-1',
        contentType: 'bobblehead' as const,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'editor_pick' as const,
        id: 'featured-1',
        imageUrl: null,
        isActive: true,
        likes: 10,
        owner: 'user-1',
        ownerDisplayName: 'user1',
        priority: 1,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-01T00:00:00Z'),
        viewCount: 100,
      },
      {
        comments: 0,
        contentId: 'content-2',
        contentName: 'Content 2',
        contentSlug: 'content-2',
        contentType: 'collection' as const,
        createdAt: new Date('2024-01-02T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'collection_of_week' as const,
        id: 'featured-2',
        imageUrl: null,
        isActive: true,
        likes: 20,
        owner: 'user-2',
        ownerDisplayName: 'user2',
        priority: 2,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        viewCount: 200,
      },
      {
        comments: 0,
        contentId: 'content-3',
        contentName: 'Content 3',
        contentSlug: 'content-3',
        contentType: 'bobblehead' as const,
        createdAt: new Date('2024-01-03T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'homepage_banner' as const,
        id: 'featured-3',
        imageUrl: null,
        isActive: true,
        likes: 30,
        owner: 'user-3',
        ownerDisplayName: 'user3',
        priority: 3,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-03T00:00:00Z'),
        viewCount: 300,
      },
      {
        comments: 0,
        contentId: 'content-4',
        contentName: 'Content 4',
        contentSlug: 'content-4',
        contentType: 'user' as const,
        createdAt: new Date('2024-01-04T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'trending' as const,
        id: 'featured-4',
        imageUrl: null,
        isActive: true,
        likes: 40,
        owner: 'user-4',
        ownerDisplayName: 'user4',
        priority: 4,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-04T00:00:00Z'),
        viewCount: 400,
      },
      {
        comments: 0,
        contentId: 'content-5',
        contentName: 'Content 5',
        contentSlug: 'content-5',
        contentType: 'bobblehead' as const,
        createdAt: new Date('2024-01-05T00:00:00Z'),
        curatorNotes: null,
        description: null,
        endDate: null,
        featureType: 'trending' as const,
        id: 'featured-5',
        imageUrl: null,
        isActive: true,
        likes: 50,
        owner: 'user-5',
        ownerDisplayName: 'user5',
        priority: 5,
        startDate: null,
        title: null,
        updatedAt: new Date('2024-01-05T00:00:00Z'),
        viewCount: 500,
      },
    ];

    describe('filtering by single feature type', () => {
      it('should filter by editor_pick feature type', () => {
        const result = FeaturedContentTransformer.filterByType(mockData, 'editor_pick');

        expect(result).toHaveLength(1);
        expect(result[0]?.featureType).toBe('editor_pick');
        expect(result[0]?.contentId).toBe('content-1');
      });

      it('should filter by collection_of_week feature type', () => {
        const result = FeaturedContentTransformer.filterByType(mockData, 'collection_of_week');

        expect(result).toHaveLength(1);
        expect(result[0]?.featureType).toBe('collection_of_week');
        expect(result[0]?.contentId).toBe('content-2');
      });

      it('should filter by homepage_banner feature type', () => {
        const result = FeaturedContentTransformer.filterByType(mockData, 'homepage_banner');

        expect(result).toHaveLength(1);
        expect(result[0]?.featureType).toBe('homepage_banner');
        expect(result[0]?.contentId).toBe('content-3');
      });

      it('should filter by trending feature type', () => {
        const result = FeaturedContentTransformer.filterByType(mockData, 'trending');

        expect(result).toHaveLength(2);
        expect(result[0]?.featureType).toBe('trending');
        expect(result[1]?.featureType).toBe('trending');
      });
    });

    describe('default limits per type', () => {
      it('should limit collection_of_week to 1 by default', () => {
        const multipleCollections: Array<FeaturedContentData> = [
          { ...mockData[1]!, id: 'featured-2a' },
          { ...mockData[1]!, id: 'featured-2b' },
          { ...mockData[1]!, id: 'featured-2c' },
        ];

        const result = FeaturedContentTransformer.filterByType(multipleCollections, 'collection_of_week');

        expect(result).toHaveLength(1);
      });

      it('should limit editor_pick to 6 by default', () => {
        const multipleEditorPicks: Array<FeaturedContentData> = Array.from({ length: 10 }, (_, i) => ({
          ...mockData[0]!,
          contentId: `content-${i}`,
          id: `featured-${i}`,
        }));

        const result = FeaturedContentTransformer.filterByType(multipleEditorPicks, 'editor_pick');

        expect(result).toHaveLength(6);
      });

      it('should limit homepage_banner to 3 by default', () => {
        const multipleBanners: Array<FeaturedContentData> = Array.from({ length: 10 }, (_, i) => ({
          ...mockData[2]!,
          contentId: `content-${i}`,
          id: `featured-${i}`,
        }));

        const result = FeaturedContentTransformer.filterByType(multipleBanners, 'homepage_banner');

        expect(result).toHaveLength(3);
      });

      it('should limit trending to 8 by default', () => {
        const multipleTrending: Array<FeaturedContentData> = Array.from({ length: 20 }, (_, i) => ({
          ...mockData[3]!,
          contentId: `content-${i}`,
          id: `featured-${i}`,
          viewCount: 1000 - i,
        }));

        const result = FeaturedContentTransformer.filterByType(multipleTrending, 'trending');

        expect(result).toHaveLength(8);
      });
    });

    describe('custom limits', () => {
      it('should respect custom limit for editor_pick', () => {
        const multipleEditorPicks: Array<FeaturedContentData> = Array.from({ length: 10 }, (_, i) => ({
          ...mockData[0]!,
          contentId: `content-${i}`,
          id: `featured-${i}`,
        }));

        const result = FeaturedContentTransformer.filterByType(multipleEditorPicks, 'editor_pick', 3);

        expect(result).toHaveLength(3);
      });

      it('should respect custom limit for trending', () => {
        const multipleTrending: Array<FeaturedContentData> = Array.from({ length: 20 }, (_, i) => ({
          ...mockData[3]!,
          contentId: `content-${i}`,
          id: `featured-${i}`,
          viewCount: 1000 - i,
        }));

        const result = FeaturedContentTransformer.filterByType(multipleTrending, 'trending', 5);

        expect(result).toHaveLength(5);
      });

      it('should handle limit of 0', () => {
        const result = FeaturedContentTransformer.filterByType(mockData, 'editor_pick', 0);

        expect(result).toHaveLength(0);
      });
    });

    describe('trending-specific sorting', () => {
      it('should sort trending items by viewCount in descending order', () => {
        const trendingItems: Array<FeaturedContentData> = [
          {
            ...mockData[3]!,
            contentId: 'low-views',
            id: 'featured-low',
            viewCount: 100,
          },
          {
            ...mockData[3]!,
            contentId: 'high-views',
            id: 'featured-high',
            viewCount: 1000,
          },
          {
            ...mockData[3]!,
            contentId: 'medium-views',
            id: 'featured-medium',
            viewCount: 500,
          },
        ];

        const result = FeaturedContentTransformer.filterByType(trendingItems, 'trending');

        expect(result).toHaveLength(3);
        expect(result[0]?.viewCount).toBe(1000);
        expect(result[1]?.viewCount).toBe(500);
        expect(result[2]?.viewCount).toBe(100);
      });

      it('should not sort non-trending items by viewCount', () => {
        const editorPickItems: Array<FeaturedContentData> = [
          {
            ...mockData[0]!,
            contentId: 'low-views',
            id: 'featured-low',
            viewCount: 100,
          },
          {
            ...mockData[0]!,
            contentId: 'high-views',
            id: 'featured-high',
            viewCount: 1000,
          },
        ];

        const result = FeaturedContentTransformer.filterByType(editorPickItems, 'editor_pick');

        expect(result[0]?.viewCount).toBe(100);
        expect(result[1]?.viewCount).toBe(1000);
      });
    });

    describe('edge cases', () => {
      it('should return empty array for no matches', () => {
        const editorPickOnly: Array<FeaturedContentData> = [mockData[0]!];

        const result = FeaturedContentTransformer.filterByType(editorPickOnly, 'trending');

        expect(result).toEqual([]);
      });

      it('should return empty array for empty input', () => {
        const result = FeaturedContentTransformer.filterByType([], 'editor_pick');

        expect(result).toEqual([]);
      });

      it('should handle array with all items matching', () => {
        const allTrending: Array<FeaturedContentData> = mockData.map((item) => ({
          ...item,
          featureType: 'trending' as const,
        }));

        const result = FeaturedContentTransformer.filterByType(allTrending, 'trending');

        expect(result).toHaveLength(5);
      });
    });
  });
});
