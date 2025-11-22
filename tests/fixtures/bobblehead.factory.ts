/**
 * Bobblehead factory for creating test bobbleheads in the database.
 *
 * NOTE: These factories interact with the actual database.
 * Use them in integration tests with Testcontainers or a test database.
 * For unit tests, use the mock data from tests/mocks/data/bobbleheads.mock.ts instead.
 */

// Import these when you have Testcontainers set up:
// import { db } from '@/lib/db';
// import { bobbleheads } from '@/lib/db/schema';

export type BobbleheadCondition = 'excellent' | 'fair' | 'good' | 'mint' | 'poor';

export interface CreateTestBobbleheadOptions {
  acquisitionDate?: Date | null;
  collectionId: string;
  condition?: BobbleheadCondition;
  description?: null | string;
  id?: string;
  isPublic?: boolean;
  name?: string;
  purchasePrice?: null | string;
  subcollectionId?: null | string;
  userId: string;
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
  const timestamp = Date.now();
  const name = options.name ?? `Test Bobblehead ${timestamp}`;

  const defaultBobblehead = {
    acquisitionDate: options.acquisitionDate ?? null,
    collectionId: options.collectionId,
    condition: options.condition ?? 'good',
    createdAt: new Date(),
    description: options.description ?? null,
    id: options.id ?? `bobblehead-${timestamp}`,
    isPublic: options.isPublic ?? true,
    name,
    photos: [],
    purchasePrice: options.purchasePrice ?? null,
    subcollectionId: options.subcollectionId ?? null,
    updatedAt: new Date(),
    userId: options.userId,
  };

  // TODO: Uncomment when Testcontainers is set up
  // const [bobblehead] = await db.insert(bobbleheads).values(defaultBobblehead).returning();
  // return bobblehead;

  // For now, return the mock bobblehead object
  return defaultBobblehead;
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
  const bobbleheads = [];
  for (let i = 0; i < count; i++) {
    const bobblehead = await createTestBobblehead({
      ...overrides,
      collectionId,
      name: `Bobblehead ${i + 1}`,
      userId,
    });
    bobbleheads.push(bobblehead);
  }
  return bobbleheads;
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
