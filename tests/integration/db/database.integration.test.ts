/**
 * Database Integration Tests
 *
 * These tests verify that the Testcontainers setup works correctly
 * and that the test factories can create and query database records.
 */

import { eq } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { bobbleheads, collections, users } from '@/lib/db/schema/index';

import { createTestBobblehead, createTestBobbleheads } from '../../fixtures/bobblehead.factory';
import { createTestCollection, createTestCollections } from '../../fixtures/collection.factory';
import { createTestAdminUser, createTestUser, createTestUsers } from '../../fixtures/user.factory';
import { getTestDb, resetTestDatabase } from '../../setup/test-db';

describe('Database Integration Tests', () => {
  // Reset database before each test for isolation
  beforeEach(async () => {
    await resetTestDatabase();
  });

  // Clean up after each test
  afterEach(async () => {
    await resetTestDatabase();
  });

  describe('User Factory', () => {
    it('should create a user in the database', async () => {
      const user = await createTestUser({
        username: 'johndoe',
      });

      expect(user).toBeDefined();
      expect(user!.id).toBeDefined();
      expect(user!.username).toBe('johndoe');
      expect(user!.role).toBe('user');
    });

    it('should create an admin user', async () => {
      const admin = await createTestAdminUser({
        username: 'admin-test',
      });

      expect(admin).toBeDefined();
      expect(admin!.role).toBe('admin');
    });

    it('should create multiple users', async () => {
      const testUsers = await createTestUsers(3);

      expect(testUsers).toHaveLength(3);
      testUsers.forEach((user) => {
        expect(user!.id).toBeDefined();
      });
    });

    it('should persist user to database', async () => {
      const db = getTestDb();
      const user = await createTestUser({ username: 'persistent' });

      // Query the user from database
      const [foundUser] = await db.select().from(users).where(eq(users.id, user!.id));

      expect(foundUser).toBeDefined();
      expect(foundUser!.username).toBe('persistent');
    });
  });

  describe('Collection Factory', () => {
    it('should create a collection in the database', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'My Bobbleheads',
        userId: user!.id,
      });

      expect(collection).toBeDefined();
      expect(collection!.id).toBeDefined();
      expect(collection!.name).toBe('My Bobbleheads');
      expect(collection!.userId).toBe(user!.id);
      expect(collection!.isPublic).toBe(true);
    });

    it('should create multiple collections for a user', async () => {
      const user = await createTestUser();
      const testCollections = await createTestCollections(user!.id, 3);

      expect(testCollections).toHaveLength(3);
      testCollections.forEach((collection) => {
        expect(collection!.userId).toBe(user!.id);
      });
    });

    it('should persist collection to database with foreign key', async () => {
      const db = getTestDb();
      const user = await createTestUser();
      const collection = await createTestCollection({
        name: 'Persisted Collection',
        userId: user!.id,
      });

      // Query the collection from database
      const [foundCollection] = await db.select().from(collections).where(eq(collections.id, collection!.id));

      expect(foundCollection).toBeDefined();
      expect(foundCollection!.name).toBe('Persisted Collection');
      expect(foundCollection!.userId).toBe(user!.id);
    });
  });

  describe('Bobblehead Factory', () => {
    it('should create a bobblehead in the database', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Baseball Star',
        userId: user!.id,
      });

      expect(bobblehead).toBeDefined();
      expect(bobblehead!.id).toBeDefined();
      expect(bobblehead!.name).toBe('Baseball Star');
      expect(bobblehead!.collectionId).toBe(collection!.id);
      expect(bobblehead!.userId).toBe(user!.id);
    });

    it('should create multiple bobbleheads for a collection', async () => {
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const testBobbleheads = await createTestBobbleheads(user!.id, collection!.id, 5);

      expect(testBobbleheads).toHaveLength(5);
      testBobbleheads.forEach((bobblehead) => {
        expect(bobblehead!.collectionId).toBe(collection!.id);
        expect(bobblehead!.userId).toBe(user!.id);
      });
    });

    it('should persist bobblehead to database with foreign keys', async () => {
      const db = getTestDb();
      const user = await createTestUser();
      const collection = await createTestCollection({ userId: user!.id });
      const bobblehead = await createTestBobblehead({
        collectionId: collection!.id,
        name: 'Persisted Bobblehead',
        userId: user!.id,
      });

      // Query the bobblehead from database
      const [foundBobblehead] = await db.select().from(bobbleheads).where(eq(bobbleheads.id, bobblehead!.id));

      expect(foundBobblehead).toBeDefined();
      expect(foundBobblehead!.name).toBe('Persisted Bobblehead');
      expect(foundBobblehead!.collectionId).toBe(collection!.id);
      expect(foundBobblehead!.userId).toBe(user!.id);
    });
  });

  describe('Database Reset', () => {
    it('should isolate tests from each other', async () => {
      const db = getTestDb();

      // Create data in this test
      const user = await createTestUser({ username: 'isolation-test' });
      await createTestCollection({ userId: user!.id });

      // Verify data exists
      const [foundUser] = await db.select().from(users).where(eq(users.username, 'isolation-test'));
      expect(foundUser).toBeDefined();

      // After reset (in next test), this data should not exist
    });

    it('should reset database between tests', async () => {
      const db = getTestDb();

      // This test verifies beforeEach reset worked - no user with 'isolation-test' from previous test
      const isolationUsers = await db.select().from(users).where(eq(users.username, 'isolation-test'));
      expect(isolationUsers).toHaveLength(0);
    });
  });

  describe('Complex Queries', () => {
    it('should support joins and complex queries', async () => {
      const db = getTestDb();

      // Create test data
      const user = await createTestUser({ username: 'complex-query-user' });
      const collection = await createTestCollection({
        name: 'Complex Query Collection',
        userId: user!.id,
      });
      await createTestBobbleheads(user!.id, collection!.id, 3);

      // Query with join
      const result = await db
        .select({
          bobbleheadId: bobbleheads.id,
          bobbleheadName: bobbleheads.name,
          collectionName: collections.name,
          username: users.username,
        })
        .from(bobbleheads)
        .innerJoin(collections, eq(bobbleheads.collectionId, collections.id))
        .innerJoin(users, eq(bobbleheads.userId, users.id))
        .where(eq(users.username, 'complex-query-user'));

      expect(result).toHaveLength(3);
      result.forEach((row) => {
        expect(row.username).toBe('complex-query-user');
        expect(row.collectionName).toBe('Complex Query Collection');
      });
    });
  });
});
