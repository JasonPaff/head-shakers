/**
 * Collection factory for creating test collections in the database.
 *
 * NOTE: These factories interact with the actual database.
 * Use them in integration tests with Testcontainers or a test database.
 * For unit tests, use the mock data from tests/mocks/data/collections.mock.ts instead.
 */

// Import these when you have Testcontainers set up:
// import { db } from '@/lib/db';
// import { collections } from '@/lib/db/schema';

export interface CreateTestCollectionOptions {
  coverImageUrl?: null | string;
  description?: null | string;
  id?: string;
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
  const timestamp = Date.now();
  const name = options.name ?? `Test Collection ${timestamp}`;
  const slug = options.slug ?? name.toLowerCase().replace(/\s+/g, '-');

  const defaultCollection = {
    coverImageUrl: options.coverImageUrl ?? null,
    createdAt: new Date(),
    description: options.description ?? null,
    id: options.id ?? `collection-${timestamp}`,
    isPublic: options.isPublic ?? true,
    lastItemAddedAt: null,
    name,
    slug,
    totalItems: 0,
    updatedAt: new Date(),
    userId: options.userId,
  };

  // TODO: Uncomment when Testcontainers is set up
  // const [collection] = await db.insert(collections).values(defaultCollection).returning();
  // return collection;

  // For now, return the mock collection object
  return defaultCollection;
}

/**
 * Create multiple test collections for a user.
 */
export async function createTestCollections(
  userId: string,
  count: number,
  overrides: Partial<Omit<CreateTestCollectionOptions, 'userId'>> = {},
) {
  const collections = [];
  for (let i = 0; i < count; i++) {
    const collection = await createTestCollection({
      ...overrides,
      name: `Collection ${i + 1}`,
      userId,
    });
    collections.push(collection);
  }
  return collections;
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
