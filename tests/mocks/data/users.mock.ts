/**
 * Mock user data for testing.
 */
export const mockUser = {
  bio: 'Passionate bobblehead collector',
  clerkId: 'clerk-test-user-id',
  createdAt: new Date('2024-01-01'),
  displayName: 'Test User',
  email: 'test@example.com',
  id: 'test-user-id',
  imageUrl: 'https://example.com/avatar.jpg',
  isAdmin: false,
  updatedAt: new Date('2024-01-01'),
  username: 'testuser',
};

export const mockAdminUser = {
  ...mockUser,
  clerkId: 'clerk-admin-user-id',
  displayName: 'Admin User',
  email: 'admin@example.com',
  id: 'admin-user-id',
  isAdmin: true,
  username: 'adminuser',
};

export const mockNewUser = {
  ...mockUser,
  bio: null,
  clerkId: 'clerk-new-user-id',
  createdAt: new Date(),
  displayName: null,
  email: 'newuser@example.com',
  id: 'new-user-id',
  imageUrl: null,
  updatedAt: new Date(),
  username: null,
};

/**
 * Generate a unique mock user for testing.
 */
export function createMockUser(overrides: Partial<typeof mockUser> = {}) {
  const timestamp = Date.now();
  return {
    ...mockUser,
    clerkId: `clerk-${timestamp}`,
    email: `user-${timestamp}@example.com`,
    id: `user-${timestamp}`,
    username: `user${timestamp}`,
    ...overrides,
  };
}
