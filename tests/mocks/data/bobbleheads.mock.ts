/**
 * Mock bobblehead data for testing.
 */
export const mockBobblehead = {
  acquisitionDate: new Date('2024-01-15'),
  collectionId: 'collection-1',
  condition: 'mint' as const,
  createdAt: new Date('2024-01-15'),
  description: 'Limited edition baseball player bobblehead',
  id: 'bobblehead-1',
  isPublic: true,
  name: 'Baseball Star',
  photos: [],
  purchasePrice: '49.99',
  subcollectionId: null,
  updatedAt: new Date('2024-01-15'),
  userId: 'test-user-id',
};

export const mockPrivateBobblehead = {
  ...mockBobblehead,
  description: 'A private bobblehead',
  id: 'bobblehead-private',
  isPublic: false,
  name: 'Private Bobblehead',
};

export const mockBobbleheadWithPhotos = {
  ...mockBobblehead,
  id: 'bobblehead-with-photos',
  name: 'Bobblehead With Photos',
  photos: [
    {
      bobbleheadId: 'bobblehead-with-photos',
      id: 'photo-1',
      isPrimary: true,
      url: 'https://example.com/photo1.jpg',
    },
    {
      bobbleheadId: 'bobblehead-with-photos',
      id: 'photo-2',
      isPrimary: false,
      url: 'https://example.com/photo2.jpg',
    },
  ],
};

/**
 * Valid bobblehead conditions
 */
export const validConditions = ['mint', 'excellent', 'good', 'fair', 'poor'] as const;

/**
 * Generate a unique mock bobblehead for testing.
 */
export function createMockBobblehead(overrides: Partial<typeof mockBobblehead> = {}) {
  const timestamp = Date.now();
  return {
    ...mockBobblehead,
    id: `bobblehead-${timestamp}`,
    name: `Bobblehead ${timestamp}`,
    ...overrides,
  };
}

/**
 * Generate multiple mock bobbleheads.
 */
export function createMockBobbleheads(count: number, baseOverrides: Partial<typeof mockBobblehead> = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockBobblehead({
      ...baseOverrides,
      name: `Bobblehead ${i + 1}`,
    }),
  );
}
