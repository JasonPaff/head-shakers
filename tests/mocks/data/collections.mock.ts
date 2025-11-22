/**
 * Mock collection data for testing.
 */
export const mockCollection = {
  coverImageUrl: null,
  createdAt: new Date('2024-01-01'),
  description: 'My favorite sports bobbleheads',
  id: 'collection-1',
  isPublic: true,
  lastItemAddedAt: new Date('2024-01-15'),
  name: 'Sports Collection',
  slug: 'sports-collection',
  totalItems: 5,
  updatedAt: new Date('2024-01-15'),
  userId: 'test-user-id',
};

export const mockPrivateCollection = {
  ...mockCollection,
  description: 'My private collection',
  id: 'collection-private',
  isPublic: false,
  name: 'Private Collection',
  slug: 'private-collection',
};

export const mockEmptyCollection = {
  ...mockCollection,
  description: 'An empty collection',
  id: 'collection-empty',
  lastItemAddedAt: null,
  name: 'Empty Collection',
  slug: 'empty-collection',
  totalItems: 0,
};

/**
 * Generate a unique mock collection for testing.
 */
export function createMockCollection(overrides: Partial<typeof mockCollection> = {}) {
  const timestamp = Date.now();
  const name = overrides.name ?? `Collection ${timestamp}`;
  return {
    ...mockCollection,
    id: `collection-${timestamp}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    ...overrides,
  };
}

/**
 * Generate multiple mock collections.
 */
export function createMockCollections(count: number, baseOverrides: Partial<typeof mockCollection> = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockCollection({
      ...baseOverrides,
      name: `Collection ${i + 1}`,
    }),
  );
}
