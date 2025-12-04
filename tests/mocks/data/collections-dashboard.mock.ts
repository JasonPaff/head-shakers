import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';
import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

/**
 * Mock collection dashboard list record with aggregated stats.
 */
export const mockCollectionDashboardRecord: CollectionDashboardListRecord = {
  bobbleheadCount: 15,
  commentCount: 8,
  coverImageUrl: 'https://res.cloudinary.com/test/image/upload/collection-cover-1.jpg',
  description: 'My favorite sports bobbleheads',
  featuredCount: 3,
  id: 'collection-1',
  isPublic: true,
  likeCount: 24,
  name: 'Sports Collection',
  slug: 'sports-collection',
  totalValue: 450.0,
  viewCount: 156,
};

/**
 * Mock collection dashboard header record with all stats.
 */
export const mockCollectionDashboardHeaderRecord: CollectionDashboardHeaderRecord = {
  bobbleheadCount: 15,
  commentCount: 8,
  coverImageUrl: 'https://res.cloudinary.com/test/image/upload/collection-cover-1.jpg',
  description: 'My favorite sports bobbleheads',
  featuredCount: 3,
  id: 'collection-1',
  isPublic: true,
  likeCount: 24,
  name: 'Sports Collection',
  slug: 'sports-collection',
  totalValue: 450.0,
  viewCount: 156,
};

// Counter for unique IDs across all mock generation
let idCounter = 0;

/**
 * Generate a unique mock collection dashboard record for testing.
 */
export function createMockCollectionDashboardRecord(
  overrides: Partial<CollectionDashboardListRecord> = {},
): CollectionDashboardListRecord {
  const timestamp = Date.now();
  const uniqueId = `collection-${timestamp}-${idCounter++}`;
  const name = overrides.name ?? `Collection ${timestamp}`;
  return {
    ...mockCollectionDashboardRecord,
    id: uniqueId,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    ...overrides,
  };
}

/**
 * Generate multiple mock collection dashboard records.
 */
export function createMockCollectionDashboardRecords(
  count: number,
  baseOverrides: Partial<CollectionDashboardListRecord> = {},
): Array<CollectionDashboardListRecord> {
  const baseTimestamp = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const name = `Collection ${i + 1}`;
    return {
      ...mockCollectionDashboardRecord,
      ...baseOverrides,
      id: `collection-${baseTimestamp}-${i}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
    };
  });
}

/**
 * Mock collection dashboard record with zero stats (empty collection).
 */
export const mockEmptyCollectionDashboardRecord: CollectionDashboardListRecord = {
  ...mockCollectionDashboardRecord,
  bobbleheadCount: 0,
  commentCount: 0,
  coverImageUrl: null,
  description: 'An empty collection',
  featuredCount: 0,
  id: 'collection-empty',
  likeCount: 0,
  name: 'Empty Collection',
  slug: 'empty-collection',
  totalValue: null,
  viewCount: 0,
};

/**
 * Mock private collection dashboard record.
 */
export const mockPrivateCollectionDashboardRecord: CollectionDashboardListRecord = {
  ...mockCollectionDashboardRecord,
  description: 'My private collection',
  id: 'collection-private',
  isPublic: false,
  name: 'Private Collection',
  slug: 'private-collection',
};

/**
 * Mock collection dashboard record with high stats.
 */
export const mockPopularCollectionDashboardRecord: CollectionDashboardListRecord = {
  ...mockCollectionDashboardRecord,
  bobbleheadCount: 150,
  commentCount: 87,
  coverImageUrl: 'https://res.cloudinary.com/test/image/upload/collection-cover-popular.jpg',
  description: 'A highly popular collection',
  featuredCount: 25,
  id: 'collection-popular',
  likeCount: 1024,
  name: 'Popular Collection',
  slug: 'popular-collection',
  totalValue: 12500.0,
  viewCount: 5432,
};
