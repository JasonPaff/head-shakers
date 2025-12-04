/* eslint-disable @typescript-eslint/unbound-method */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { OPERATIONS } from '@/lib/constants';

// Mock all dependencies at the top of the test file
vi.mock('@/lib/queries/collections/collections-dashboard.query', () => ({
  CollectionsDashboardQuery: {
    getHeaderByCollectionSlugAsync: vi.fn(),
    getListByUserIdAsync: vi.fn(),
  },
}));

vi.mock('@/lib/services/cache.service', () => ({
  CacheService: {
    collections: {
      dashboard: vi.fn(),
      dashboardHeader: vi.fn(),
    },
  },
}));

vi.mock('@/lib/utils/facade-helpers', () => ({
  executeFacadeOperation: vi.fn((_config: unknown, operation: () => unknown) => operation()),
}));

import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { CollectionsDashboardQuery } from '@/lib/queries/collections/collections-dashboard.query';
import { CacheService } from '@/lib/services/cache.service';

describe('CollectionsDashboardFacade', () => {
  const mockDb = {} as never;
  const testUserId = 'user-123';
  const testCollectionSlug = 'my-collection';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHeaderByCollectionSlugAsync', () => {
    const mockHeaderData: CollectionDashboardHeaderRecord = {
      bobbleheadCount: 10,
      commentCount: 5,
      coverImageUrl: 'https://example.com/cover.jpg',
      description: 'Test collection description',
      featuredCount: 3,
      id: 'collection-1',
      isPublic: true,
      likeCount: 20,
      name: 'My Collection',
      slug: testCollectionSlug,
      totalValue: 500,
      viewCount: 100,
    };

    it('should call query with correct context', async () => {
      // Arrange
      vi.mocked(CacheService.collections.dashboardHeader).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getHeaderByCollectionSlugAsync).mockResolvedValue(mockHeaderData);

      // Act
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(testUserId, testCollectionSlug, mockDb);

      // Assert
      expect(vi.mocked(CollectionsDashboardQuery.getHeaderByCollectionSlugAsync)).toHaveBeenCalledWith(
        testCollectionSlug,
        expect.objectContaining({
          dbInstance: mockDb,
          userId: testUserId,
        }),
      );
    });

    it('should wrap result in cache service', async () => {
      // Arrange
      vi.mocked(CacheService.collections.dashboardHeader).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getHeaderByCollectionSlugAsync).mockResolvedValue(mockHeaderData);

      // Act
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(testUserId, testCollectionSlug, mockDb);

      // Assert
      expect(vi.mocked(CacheService.collections.dashboardHeader)).toHaveBeenCalledWith(
        expect.any(Function),
        testUserId,
        testCollectionSlug,
        expect.objectContaining({
          context: {
            facade: 'collections_dashboard_facade',
            operation: OPERATIONS.COLLECTIONS_DASHBOARD.GET_HEADER_BY_COLLECTION_SLUG,
          },
        }),
      );
    });

    it('should pass userId and slug correctly', async () => {
      // Arrange
      const differentUserId = 'user-456';
      const differentSlug = 'another-collection';

      vi.mocked(CacheService.collections.dashboardHeader).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getHeaderByCollectionSlugAsync).mockResolvedValue(mockHeaderData);

      // Act
      await CollectionsDashboardFacade.getHeaderByCollectionSlugAsync(differentUserId, differentSlug, mockDb);

      // Assert
      expect(vi.mocked(CollectionsDashboardQuery.getHeaderByCollectionSlugAsync)).toHaveBeenCalledWith(
        differentSlug,
        expect.objectContaining({
          userId: differentUserId,
        }),
      );
      expect(vi.mocked(CacheService.collections.dashboardHeader)).toHaveBeenCalledWith(
        expect.any(Function),
        differentUserId,
        differentSlug,
        expect.any(Object),
      );
    });
  });

  describe('getListByUserIdAsync', () => {
    const mockCollectionsList: Array<CollectionDashboardListRecord> = [
      {
        bobbleheadCount: 10,
        commentCount: 5,
        coverImageUrl: 'https://example.com/cover1.jpg',
        description: 'First collection',
        featuredCount: 3,
        id: 'collection-1',
        isPublic: true,
        likeCount: 20,
        name: 'Collection One',
        slug: 'collection-one',
        totalValue: 500,
        viewCount: 100,
      },
      {
        bobbleheadCount: 5,
        commentCount: 2,
        coverImageUrl: 'https://example.com/cover2.jpg',
        description: 'Second collection',
        featuredCount: 1,
        id: 'collection-2',
        isPublic: false,
        likeCount: 10,
        name: 'Collection Two',
        slug: 'collection-two',
        totalValue: 250,
        viewCount: 50,
      },
    ];

    it('should call query with user context', async () => {
      // Arrange
      vi.mocked(CacheService.collections.dashboard).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getListByUserIdAsync).mockResolvedValue(mockCollectionsList);

      // Act
      await CollectionsDashboardFacade.getListByUserIdAsync(testUserId, mockDb);

      // Assert
      expect(vi.mocked(CollectionsDashboardQuery.getListByUserIdAsync)).toHaveBeenCalledWith(
        expect.objectContaining({
          dbInstance: mockDb,
          userId: testUserId,
        }),
      );
    });

    it('should wrap result in cache service', async () => {
      // Arrange
      vi.mocked(CacheService.collections.dashboard).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getListByUserIdAsync).mockResolvedValue(mockCollectionsList);

      // Act
      await CollectionsDashboardFacade.getListByUserIdAsync(testUserId, mockDb);

      // Assert
      expect(vi.mocked(CacheService.collections.dashboard)).toHaveBeenCalledWith(
        expect.any(Function),
        testUserId,
      );
    });

    it('should return empty array when no collections exist', async () => {
      // Arrange
      const emptyResult: Array<CollectionDashboardListRecord> = [];

      vi.mocked(CacheService.collections.dashboard).mockImplementation(async (fn) => {
        return fn();
      });
      vi.mocked(CollectionsDashboardQuery.getListByUserIdAsync).mockResolvedValue(emptyResult);

      // Act
      const result = await CollectionsDashboardFacade.getListByUserIdAsync(testUserId, mockDb);

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
      expect(vi.mocked(CollectionsDashboardQuery.getListByUserIdAsync)).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: testUserId,
        }),
      );
    });
  });
});
