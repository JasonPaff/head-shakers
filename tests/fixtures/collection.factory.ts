/**
 * Collection factory for creating test collections in the database.
 *
 * NOTE: These factories interact with the actual test database via Testcontainers.
 * Use them in integration tests only.
 * For unit tests, use the mock data from tests/mocks/data/collections.mock.ts instead.
 */

import { collections } from '@/lib/db/schema/index';

import { getTestDb } from '../setup/test-db';

export interface CreateTestCollectionOptions {
  coverImageUrl?: null | string;
  description?: null | string;
  isPublic?: boolean;
  name?: string;
  slug?: string;
  userId: string;
}

/**
 * Create a test collection in the database.
 *
 * @example
 * ```ts
 * const collection = await createTestCollection({
 *   userId: 'test-user-id',
 *   name: 'Sports Collection',
 * });
 * ```
 */
export async function createTestCollection(options: CreateTestCollectionOptions) {
  const db = getTestDb();
  const timestamp = Date.now();
  const name = options.name ?? `Test Collection ${timestamp}`;
  const slug = options.slug ?? `test-collection-${timestamp}`;

  const collectionData = {
    coverImageUrl: options.coverImageUrl ?? null,
    description: options.description ?? null,
    isPublic: options.isPublic ?? true,
    name,
    slug,
    userId: options.userId,
  };

  const [collection] = await db.insert(collections).values(collectionData).returning();
  return collection;
}

/**
 * Create multiple test collections for a user.
 */
export async function createTestCollections(
  userId: string,
  count: number,
  overrides: Partial<Omit<CreateTestCollectionOptions, 'userId'>> = {},
) {
  const createdCollections = [];
  for (let i = 0; i < count; i++) {
    const collection = await createTestCollection({
      ...overrides,
      name: `Collection ${i + 1}`,
      slug: `collection-${Date.now()}-${i}`,
      userId,
    });
    createdCollections.push(collection);
  }
  return createdCollections;
}

/**
 * Create a private test collection.
 */
export async function createTestPrivateCollection(options: Omit<CreateTestCollectionOptions, 'isPublic'>) {
  return createTestCollection({
    ...options,
    isPublic: false,
  });
}
