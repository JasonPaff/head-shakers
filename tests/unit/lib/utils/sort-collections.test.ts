import { describe, expect, it } from 'vitest';

import type { CollectionSortOption } from '@/hooks/use-user-preferences';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { sortCollections } from '@/lib/utils/collection.utils';

describe('sortCollections', () => {
  describe('name-asc', () => {
    it('should sort collections by name in ascending alphabetical order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Zebra Collection',
          slug: 'zebra-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Apple Collection',
          slug: 'apple-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Banana Collection',
          slug: 'banana-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'name-asc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Apple Collection');
      expect(result[1]!.name).toBe('Banana Collection');
      expect(result[2]!.name).toBe('Zebra Collection');
    });
  });

  describe('name-desc', () => {
    it('should sort collections by name in descending alphabetical order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Apple Collection',
          slug: 'apple-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Banana Collection',
          slug: 'banana-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Zebra Collection',
          slug: 'zebra-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'name-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.name).toBe('Zebra Collection');
      expect(result[1]!.name).toBe('Banana Collection');
      expect(result[2]!.name).toBe('Apple Collection');
    });
  });

  describe('count-desc', () => {
    it('should sort collections by bobblehead count in descending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Small Collection',
          slug: 'small-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 100,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Large Collection',
          slug: 'large-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 25,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Collection',
          slug: 'medium-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'count-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.bobbleheadCount).toBe(100);
      expect(result[1]!.bobbleheadCount).toBe(25);
      expect(result[2]!.bobbleheadCount).toBe(5);
    });
  });

  describe('count-asc', () => {
    it('should sort collections by bobblehead count in ascending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 100,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Large Collection',
          slug: 'large-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Small Collection',
          slug: 'small-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 25,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Collection',
          slug: 'medium-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'count-asc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.bobbleheadCount).toBe(5);
      expect(result[1]!.bobbleheadCount).toBe(25);
      expect(result[2]!.bobbleheadCount).toBe(100);
    });
  });

  describe('likes-desc', () => {
    it('should sort collections by like count in descending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 10,
          name: 'Low Likes',
          slug: 'low-likes',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 500,
          name: 'High Likes',
          slug: 'high-likes',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 75,
          name: 'Medium Likes',
          slug: 'medium-likes',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'likes-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.likeCount).toBe(500);
      expect(result[1]!.likeCount).toBe(75);
      expect(result[2]!.likeCount).toBe(10);
    });
  });

  describe('views-desc', () => {
    it('should sort collections by view count in descending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Low Views',
          slug: 'low-views',
          totalValue: null,
          viewCount: 50,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'High Views',
          slug: 'high-views',
          totalValue: null,
          viewCount: 1000,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Views',
          slug: 'medium-views',
          totalValue: null,
          viewCount: 250,
        },
      ];
      const sortOption: CollectionSortOption = 'views-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.viewCount).toBe(1000);
      expect(result[1]!.viewCount).toBe(250);
      expect(result[2]!.viewCount).toBe(50);
    });
  });

  describe('value-desc', () => {
    it('should sort collections by total value in descending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Low Value',
          slug: 'low-value',
          totalValue: 100.0,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'High Value',
          slug: 'high-value',
          totalValue: 5000.0,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Value',
          slug: 'medium-value',
          totalValue: 750.0,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'value-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.totalValue).toBe(5000.0);
      expect(result[1]!.totalValue).toBe(750.0);
      expect(result[2]!.totalValue).toBe(100.0);
    });

    it('should handle null total values by treating them as zero', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'No Value',
          slug: 'no-value',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Has Value',
          slug: 'has-value',
          totalValue: 100.0,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'value-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]!.totalValue).toBe(100.0);
      expect(result[1]!.totalValue).toBeNull();
    });
  });

  describe('value-asc', () => {
    it('should sort collections by total value in ascending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'High Value',
          slug: 'high-value',
          totalValue: 5000.0,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Low Value',
          slug: 'low-value',
          totalValue: 100.0,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Value',
          slug: 'medium-value',
          totalValue: 750.0,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'value-asc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.totalValue).toBe(100.0);
      expect(result[1]!.totalValue).toBe(750.0);
      expect(result[2]!.totalValue).toBe(5000.0);
    });
  });

  describe('comments-desc', () => {
    it('should sort collections by comment count in descending order', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 0,
          commentCount: 5,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Low Comments',
          slug: 'low-comments',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 100,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'High Comments',
          slug: 'high-comments',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 0,
          commentCount: 25,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-3',
          isPublic: true,
          likeCount: 0,
          name: 'Medium Comments',
          slug: 'medium-comments',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'comments-desc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(3);
      expect(result[0]!.commentCount).toBe(100);
      expect(result[1]!.commentCount).toBe(25);
      expect(result[2]!.commentCount).toBe(5);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array input', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [];
      const sortOption: CollectionSortOption = 'name-asc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should handle single item array', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Only Collection',
          slug: 'only-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'name-asc';

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Only Collection');
    });

    it('should not mutate the original array', () => {
      // Arrange
      const collections: Array<CollectionDashboardListRecord> = [
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-1',
          isPublic: true,
          likeCount: 0,
          name: 'Zebra Collection',
          slug: 'zebra-collection',
          totalValue: null,
          viewCount: 0,
        },
        {
          bobbleheadCount: 5,
          commentCount: 0,
          coverImageUrl: null,
          description: null,
          featuredCount: 0,
          id: 'id-2',
          isPublic: true,
          likeCount: 0,
          name: 'Apple Collection',
          slug: 'apple-collection',
          totalValue: null,
          viewCount: 0,
        },
      ];
      const sortOption: CollectionSortOption = 'name-asc';
      const originalFirstName = collections[0]!.name;

      // Act
      const result = sortCollections(collections, sortOption);

      // Assert
      expect(result[0]!.name).not.toBe(originalFirstName);
      expect(collections[0]!.name).toBe(originalFirstName);
    });
  });
});
