/**
 * User factory for creating test users in the database.
 *
 * NOTE: These factories interact with the actual test database via Testcontainers.
 * Use them in integration tests only.
 * For unit tests, use the mock data from tests/mocks/data/users.mock.ts instead.
 */

import { users } from '@/lib/db/schema/index';

import { getTestDb } from '../setup/test-db';

export interface CreateTestUserOptions {
  avatarUrl?: null | string;
  bio?: null | string;
  clerkId?: string;
  displayName?: string;
  email?: string;
  id?: string;
  location?: null | string;
  role?: 'admin' | 'moderator' | 'user';
  username?: string;
}

/**
 * Create an admin test user in the database.
 */
export async function createTestAdminUser(overrides: CreateTestUserOptions = {}) {
  return createTestUser({
    ...overrides,
    role: 'admin',
  });
}

/**
 * Create a moderator test user in the database.
 */
export async function createTestModeratorUser(overrides: CreateTestUserOptions = {}) {
  return createTestUser({
    ...overrides,
    role: 'moderator',
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
  const db = getTestDb();
  const timestamp = Date.now();

  const userData = {
    avatarUrl: overrides.avatarUrl ?? null,
    bio: overrides.bio ?? null,
    clerkId: overrides.clerkId ?? `clerk-${timestamp}`,
    displayName: overrides.displayName ?? 'Test User',
    email: overrides.email ?? `test-${timestamp}@example.com`,
    location: overrides.location ?? null,
    role: overrides.role ?? 'user',
    username: overrides.username ?? `testuser-${timestamp}`,
  };

  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

/**
 * Create multiple test users.
 */
export async function createTestUsers(count: number, overrides: CreateTestUserOptions = {}) {
  const createdUsers = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      ...overrides,
      email: `testuser-${Date.now()}-${i}@example.com`,
      username: `testuser-${Date.now()}-${i}`,
    });
    createdUsers.push(user);
  }
  return createdUsers;
}
