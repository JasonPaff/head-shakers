/**
 * Bobblehead grid factory for creating mock bobblehead dashboard records with stats.
 *
 * NOTE: These are mock data factories for component tests only.
 * They do NOT interact with the database.
 * For integration tests that need real database records, use tests/fixtures/bobblehead.factory.ts instead.
 */

import type { BobbleheadDashboardListRecord } from '@/lib/queries/bobbleheads/bobbleheads-dashboard.query';

/**
 * Create a mock bobblehead dashboard record with stats.
 *
 * @example
 * ```ts
 * const bobblehead = createMockBobbleheadDashboardRecord({
 *   name: 'Baseball Star',
 *   likeCount: 10,
 *   viewCount: 50,
 * });
 * ```
 */
export function createMockBobbleheadDashboardRecord(
  overrides?: Partial<BobbleheadDashboardListRecord>,
): BobbleheadDashboardListRecord {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);

  return {
    acquisitionDate: new Date('2024-01-15'),
    acquisitionMethod: 'Online purchase',
    category: 'Sports',
    characterName: 'Baseball Player',
    collectionId: 'collection-1',
    commentCount: 0,
    condition: 'mint',
    customFields: null,
    description: 'Limited edition baseball player bobblehead',
    featurePhoto: 'https://example.com/photo.jpg',
    height: 8,
    id: `bobblehead-${timestamp}-${random}`,
    isFeatured: false,
    isPublic: true,
    likeCount: 0,
    manufacturer: 'Bobblehead Co',
    material: 'Resin',
    name: `Test Bobblehead ${timestamp}`,
    purchaseLocation: 'Online Store',
    purchasePrice: 49.99,
    series: 'MLB Series 1',
    slug: `test-bobblehead-${timestamp}-${random}`,
    status: 'available',
    viewCount: 0,
    weight: 1.5,
    year: 2024,
    ...overrides,
  };
}

/**
 * Create multiple mock bobblehead dashboard records.
 *
 * @example
 * ```ts
 * const bobbleheads = createMockBobbleheadDashboardRecords(3, {
 *   collectionId: 'collection-1',
 *   isFeatured: true,
 * });
 * ```
 */
export function createMockBobbleheadDashboardRecords(
  count: number,
  baseOverrides?: Partial<BobbleheadDashboardListRecord>,
): Array<BobbleheadDashboardListRecord> {
  return Array.from({ length: count }, (_, i) =>
    createMockBobbleheadDashboardRecord({
      ...baseOverrides,
      id: `bobblehead-${i + 1}`,
      name: `Bobblehead ${i + 1}`,
      slug: `bobblehead-${i + 1}`,
    }),
  );
}

/**
 * Create mock pagination metadata.
 *
 * @example
 * ```ts
 * const pagination = createMockPagination(1, 24, 100);
 * // { currentPage: 1, pageSize: 24, totalCount: 100, totalPages: 5 }
 * ```
 */
export function createMockPagination(currentPage: number, pageSize: number, totalCount: number) {
  return {
    currentPage,
    pageSize,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
  };
}
