/**
 * Bobblehead factory for creating test bobbleheads in the database.
 *
 * NOTE: These factories interact with the actual test database via Testcontainers.
 * Use them in integration tests only.
 * For unit tests, use the mock data from tests/mocks/data/bobbleheads.mock.ts instead.
 */

import { bobbleheadCollections, bobbleheads } from '@/lib/db/schema/index';

import { getTestDb } from '../setup/test-db';

export type BobbleheadCondition = 'excellent' | 'fair' | 'good' | 'mint' | 'poor';

export interface CreateTestBobbleheadOptions {
  acquisitionDate?: Date | null;
  acquisitionMethod?: null | string;
  category?: null | string;
  characterName?: null | string;
  collectionId: string;
  currentCondition?: BobbleheadCondition;
  description?: null | string;
  isPublic?: boolean;
  manufacturer?: null | string;
  name?: string;
  purchasePrice?: null | number;
  series?: null | string;
  slug?: string;
  subcollectionId?: null | string;
  userId: string;
  year?: null | number;
}

/**
 * Create a test bobblehead in the database.
 *
 * @example
 * ```ts
 * const bobblehead = await createTestBobblehead({
 *   userId: 'test-user-id',
 *   collectionId: 'collection-1',
 *   name: 'Baseball Star',
 * });
 * ```
 */
export async function createTestBobblehead(options: CreateTestBobbleheadOptions) {
  const db = getTestDb();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const name = options.name ?? `Test Bobblehead ${timestamp}`;
  const slug = options.slug ?? `test-bobblehead-${timestamp}-${random}`;

  const bobbleheadData = {
    acquisitionDate: options.acquisitionDate ?? null,
    acquisitionMethod: options.acquisitionMethod ?? null,
    category: options.category ?? null,
    characterName: options.characterName ?? null,
    currentCondition: options.currentCondition ?? 'good',
    description: options.description ?? null,
    isPublic: options.isPublic ?? true,
    manufacturer: options.manufacturer ?? null,
    name,
    purchasePrice: options.purchasePrice ?? null,
    series: options.series ?? null,
    slug,
    subcollectionId: options.subcollectionId ?? null,
    userId: options.userId,
    year: options.year ?? null,
  };

  const [bobblehead] = await db.insert(bobbleheads).values(bobbleheadData).returning();

  // Create junction table entry for the collection
  await db.insert(bobbleheadCollections).values({
    bobbleheadId: bobblehead!.id,
    collectionId: options.collectionId,
  });

  return bobblehead;
}

/**
 * Create multiple test bobbleheads for a collection.
 */
export async function createTestBobbleheads(
  userId: string,
  collectionId: string,
  count: number,
  overrides: Partial<Omit<CreateTestBobbleheadOptions, 'collectionId' | 'userId'>> = {},
) {
  const createdBobbleheads = [];
  for (let i = 0; i < count; i++) {
    const bobblehead = await createTestBobblehead({
      ...overrides,
      collectionId,
      name: `Bobblehead ${i + 1}`,
      slug: `bobblehead-${Date.now()}-${i}`,
      userId,
    });
    createdBobbleheads.push(bobblehead);
  }
  return createdBobbleheads;
}

/**
 * Create a featured test bobblehead.
 */
export async function createTestFeaturedBobblehead(options: CreateTestBobbleheadOptions) {
  const db = getTestDb();
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  const name = options.name ?? `Featured Bobblehead ${timestamp}`;
  const slug = options.slug ?? `featured-bobblehead-${timestamp}-${random}`;

  const bobbleheadData = {
    acquisitionDate: options.acquisitionDate ?? null,
    acquisitionMethod: options.acquisitionMethod ?? null,
    category: options.category ?? null,
    characterName: options.characterName ?? null,
    currentCondition: options.currentCondition ?? 'mint',
    description: options.description ?? null,
    isFeatured: true,
    isPublic: true,
    manufacturer: options.manufacturer ?? null,
    name,
    purchasePrice: options.purchasePrice ?? null,
    series: options.series ?? null,
    slug,
    subcollectionId: options.subcollectionId ?? null,
    userId: options.userId,
    year: options.year ?? null,
  };

  const [bobblehead] = await db.insert(bobbleheads).values(bobbleheadData).returning();

  // Create junction table entry for the collection
  await db.insert(bobbleheadCollections).values({
    bobbleheadId: bobblehead!.id,
    collectionId: options.collectionId,
  });

  return bobblehead;
}

/**
 * Create a private test bobblehead.
 */
export async function createTestPrivateBobblehead(options: Omit<CreateTestBobbleheadOptions, 'isPublic'>) {
  return createTestBobblehead({
    ...options,
    isPublic: false,
  });
}
