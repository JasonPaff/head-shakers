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
  const uniqueId = crypto.randomUUID();

  const userData = {
    avatarUrl: overrides.avatarUrl ?? null,
    bio: overrides.bio ?? null,
    clerkId: overrides.clerkId ?? `clerk-${uniqueId}`,
    email: overrides.email ?? `test-${uniqueId}@example.com`,
    location: overrides.location ?? null,
    role: overrides.role ?? 'user',
    username: overrides.username ?? `testuser-${uniqueId}`,
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
    const uniqueId = crypto.randomUUID();
    const user = await createTestUser({
      ...overrides,
      email: `testuser-${uniqueId}@example.com`,
      username: `testuser-${uniqueId}`,
    });
    createdUsers.push(user);
  }
  return createdUsers;
}
