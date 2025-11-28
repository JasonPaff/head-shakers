/**
 * Featured content factory for creating test featured content in the database.
 *
 * NOTE: These factories interact with the actual test database via Testcontainers.
 * Use them in integration tests only.
 * For unit tests, use the mock data from tests/mocks/data/featured-content.mock.ts instead.
 */

import { featuredContent } from '@/lib/db/schema/index';

import { getTestDb } from '../setup/test-db';

export interface CreateTestFeaturedContentOptions {
  contentId: string;
  contentType?: FeaturedContentType;
  curatorId?: null | string;
  curatorNotes?: null | string;
  description?: string;
  endDate?: Date | null;
  featureType?: FeatureType;
  imageUrl?: null | string;
  isActive?: boolean;
  priority?: number;
  sortOrder?: number;
  startDate?: Date | null;
  title?: null | string;
  viewCount?: number;
}
export type FeaturedContentType = 'bobblehead' | 'collection' | 'user';

export type FeatureType = 'collection_of_week' | 'editor_pick' | 'homepage_banner' | 'trending';

/**
 * Create a featured bobblehead record.
 */
export async function createTestFeaturedBobbleheadContent(
  bobbleheadId: string,
  overrides: Partial<Omit<CreateTestFeaturedContentOptions, 'contentId' | 'contentType'>> = {},
) {
  return createTestFeaturedContent({
    ...overrides,
    contentId: bobbleheadId,
    contentType: 'bobblehead',
    featureType: overrides.featureType ?? 'editor_pick',
  });
}

/**
 * Create a featured collection record.
 */
export async function createTestFeaturedCollectionContent(
  collectionId: string,
  overrides: Partial<Omit<CreateTestFeaturedContentOptions, 'contentId' | 'contentType'>> = {},
) {
  return createTestFeaturedContent({
    ...overrides,
    contentId: collectionId,
    contentType: 'collection',
    featureType: overrides.featureType ?? 'collection_of_week',
  });
}

/**
 * Create a test featured content record in the database.
 *
 * @example
 * ```ts
 * const featured = await createTestFeaturedContent({
 *   contentId: 'bobblehead-id',
 *   contentType: 'bobblehead',
 *   featureType: 'editor_pick',
 *   description: 'Amazing bobblehead',
 * });
 * ```
 */
export async function createTestFeaturedContent(options: CreateTestFeaturedContentOptions) {
  const db = getTestDb();
  const timestamp = Date.now();

  const featuredContentData = {
    contentId: options.contentId,
    contentType: options.contentType ?? 'collection',
    curatorId: options.curatorId ?? null,
    curatorNotes: options.curatorNotes ?? null,
    description: options.description ?? `Featured content description ${timestamp}`,
    endDate: options.endDate === undefined ? null : options.endDate,
    featureType: options.featureType ?? 'trending',
    imageUrl: options.imageUrl ?? null,
    isActive: options.isActive ?? true,
    priority: options.priority ?? 0,
    sortOrder: options.sortOrder ?? 0,
    startDate: options.startDate === undefined ? null : options.startDate,
    title: options.title === undefined ? null : options.title,
    viewCount: options.viewCount ?? 0,
  };

  const [featured] = await db.insert(featuredContent).values(featuredContentData).returning();
  return featured;
}

/**
 * Create multiple featured content records.
 */
export async function createTestFeaturedContentRecords(
  count: number,
  contentIds: Array<string>,
  baseOptions: Partial<Omit<CreateTestFeaturedContentOptions, 'contentId'>> = {},
) {
  if (contentIds.length < count) {
    throw new Error(`Need at least ${count} content IDs, but only ${contentIds.length} were provided`);
  }

  const createdRecords = [];
  for (let i = 0; i < count; i++) {
    const contentId = contentIds[i];
    if (!contentId) {
      throw new Error(`Content ID at index ${i} is undefined`);
    }
    const record = await createTestFeaturedContent({
      ...baseOptions,
      contentId,
      sortOrder: baseOptions.sortOrder ?? i,
    });
    createdRecords.push(record);
  }
  return createdRecords;
}

/**
 * Create a homepage banner record.
 */
export async function createTestHomepageBannerContent(
  contentId: string,
  contentType: FeaturedContentType,
  overrides: Partial<
    Omit<CreateTestFeaturedContentOptions, 'contentId' | 'contentType' | 'featureType'>
  > = {},
) {
  return createTestFeaturedContent({
    ...overrides,
    contentId,
    contentType,
    featureType: 'homepage_banner',
  });
}

/**
 * Create an inactive featured content record.
 */
export async function createTestInactiveFeaturedContent(
  options: Omit<CreateTestFeaturedContentOptions, 'isActive'>,
) {
  return createTestFeaturedContent({
    ...options,
    isActive: false,
  });
}

/**
 * Create a trending content record.
 */
export async function createTestTrendingContent(
  contentId: string,
  contentType: FeaturedContentType,
  overrides: Partial<
    Omit<CreateTestFeaturedContentOptions, 'contentId' | 'contentType' | 'featureType'>
  > = {},
) {
  return createTestFeaturedContent({
    ...overrides,
    contentId,
    contentType,
    featureType: 'trending',
  });
}
