/**
 * User factory for creating test users in the database.
 *
 * NOTE: These factories interact with the actual database.
 * Use them in integration tests with Testcontainers or a test database.
 * For unit tests, use the mock data from tests/mocks/data/users.mock.ts instead.
 */

// Import these when you have Testcontainers set up:
// import { db } from '@/lib/db';
// import { users } from '@/lib/db/schema';

export interface CreateTestUserOptions {
  bio?: null | string;
  clerkId?: string;
  displayName?: null | string;
  email?: string;
  id?: string;
  imageUrl?: null | string;
  isAdmin?: boolean;
  username?: null | string;
}

/**
 * Create an admin test user in the database.
 */
export async function createTestAdminUser(overrides: CreateTestUserOptions = {}) {
  return createTestUser({
    ...overrides,
    isAdmin: true,
  });
}

/**
 * Create a test user in the database.
 *
 * @example
 * ```ts
 * const user = await createTestUser({ username: 'collector1' });
 * ```
 */
export async function createTestUser(overrides: CreateTestUserOptions = {}) {
  const timestamp = Date.now();
  const defaultUser = {
    bio: null,
    clerkId: overrides.clerkId ?? `clerk-${timestamp}`,
    createdAt: new Date(),
    displayName: overrides.displayName ?? 'Test User',
    email: overrides.email ?? `test-${timestamp}@example.com`,
    id: overrides.id ?? `user-${timestamp}`,
    imageUrl: null,
    isAdmin: overrides.isAdmin ?? false,
    updatedAt: new Date(),
    username: overrides.username ?? `testuser-${timestamp}`,
  };

  // TODO: Uncomment when Testcontainers is set up
  // const [user] = await db.insert(users).values(defaultUser).returning();
  // return user;

  // For now, return the mock user object
  return defaultUser;
}

/**
 * Create multiple test users.
 */
export async function createTestUsers(count: number, overrides: CreateTestUserOptions = {}) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      ...overrides,
      username: `testuser-${Date.now()}-${i}`,
    });
    users.push(user);
  }
  return users;
}
