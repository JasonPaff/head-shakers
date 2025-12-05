/**
 * Collection header factory for creating test collection header data.
 *
 * NOTE: These are mock data factories for component/unit tests.
 * They do NOT interact with the database.
 * For integration tests with database, create a database factory in tests/fixtures/.
 */

import type { CollectionDashboardHeaderRecord } from '@/lib/queries/collections/collections-dashboard.query';

// Counter for unique IDs
let headerIdCounter = 0;

export interface CreateMockCollectionHeaderOptions {
  bobbleheadCount?: number;
  commentCount?: number;
  coverImageUrl?: null | string;
  description?: null | string;
  featuredCount?: number;
  id?: string;
  isPublic?: boolean;
  likeCount?: number;
  name?: string;
  slug?: string;
  totalValue?: number;
  viewCount?: number;
}

/**
 * Create a mock collection header with full data and defaults.
 *
 * @example
 * ```ts
 * const header = createMockCollectionHeader({ name: 'My Collection' });
 * ```
 */
export function createMockCollectionHeader(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  const timestamp = Date.now();
  const uniqueId = overrides.id ?? `collection-header-${timestamp}-${headerIdCounter++}`;
  const name = overrides.name ?? `Collection ${timestamp}`;
  const slug = overrides.slug ?? name.toLowerCase().replace(/\s+/g, '-');

  return {
    bobbleheadCount: overrides.bobbleheadCount ?? 15,
    commentCount: overrides.commentCount ?? 8,
    coverImageUrl:
      overrides.coverImageUrl ?? 'https://res.cloudinary.com/test/image/upload/collection-cover.jpg',
    description: overrides.description ?? 'Test collection description',
    featuredCount: overrides.featuredCount ?? 3,
    id: uniqueId,
    isPublic: overrides.isPublic ?? true,
    likeCount: overrides.likeCount ?? 24,
    name,
    slug,
    totalValue: overrides.totalValue ?? 450.0,
    viewCount: overrides.viewCount ?? 156,
  };
}

/**
 * Create a mock collection header with high comment count.
 *
 * @example
 * ```ts
 * const activeHeader = createMockCollectionWithComments();
 * ```
 */
export function createMockCollectionWithComments(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    commentCount: 75,
    likeCount: 50,
    viewCount: 300,
    ...overrides,
  });
}

/**
 * Create a mock collection header with high like count.
 *
 * @example
 * ```ts
 * const popularHeader = createMockCollectionWithLikes();
 * ```
 */
export function createMockCollectionWithLikes(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    commentCount: 45,
    likeCount: 150,
    viewCount: 500,
    ...overrides,
  });
}

/**
 * Create a mock collection header with high total value.
 *
 * @example
 * ```ts
 * const valuableHeader = createMockCollectionWithValue();
 * ```
 */
export function createMockCollectionWithValue(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    bobbleheadCount: 50,
    featuredCount: 15,
    totalValue: 2500.0,
    ...overrides,
  });
}

/**
 * Create a mock empty collection header (zero stats).
 *
 * @example
 * ```ts
 * const emptyHeader = createMockEmptyCollectionHeader();
 * ```
 */
export function createMockEmptyCollectionHeader(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    bobbleheadCount: 0,
    commentCount: 0,
    coverImageUrl: null,
    description: 'An empty collection',
    featuredCount: 0,
    likeCount: 0,
    name: overrides.name ?? 'Empty Collection',
    totalValue: 0,
    viewCount: 0,
    ...overrides,
  });
}

/**
 * Create a mock private collection header.
 *
 * @example
 * ```ts
 * const privateHeader = createMockPrivateCollectionHeader();
 * ```
 */
export function createMockPrivateCollectionHeader(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    description: 'Private collection',
    isPublic: false,
    name: overrides.name ?? 'Private Collection',
    ...overrides,
  });
}

/**
 * Create a mock public collection header variant.
 *
 * @example
 * ```ts
 * const publicHeader = createMockPublicCollection({ name: 'Public Collection' });
 * ```
 */
export function createMockPublicCollection(
  overrides: CreateMockCollectionHeaderOptions = {},
): CollectionDashboardHeaderRecord {
  return createMockCollectionHeader({
    isPublic: true,
    ...overrides,
  });
}
