import type { PgDatabase } from 'drizzle-orm/pg-core';

import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

import { testDb } from './test-db';

export const setupTestDatabase = async () => {
  const testDbUrl = process.env.DATABASE_URL_TEST;

  if (!testDbUrl) {
    console.warn('No test database URL configured, skipping database setup');
    return;
  }

  // clear all tables
  await testDb.execute(sql`TRUNCATE TABLE
    bobblehead_tags, bobblehead_photos, bobbleheads,
    sub_collections, collections, tags,
    comments, likes, follows, user_blocks,
    content_reports, notifications, user_activity,
    user_settings, notification_settings, users
    RESTART IDENTITY CASCADE`);
};

export const cleanupTestDatabase = async () => {
  await setupTestDatabase();
};

export const createManyBobbleheads = async (collectionId: string, count: number) => {
  const bobbleheads = Array.from({ length: count }, (_, i) => ({
    category: faker.helpers.arrayElement(['Sports', 'Movies', 'TV Shows', 'Comics']),
    characterName: faker.person.fullName(),
    collectionId,
    currentCondition: faker.helpers.arrayElement(['mint', 'excellent', 'good', 'fair', 'poor']),
    height: faker.number.float({ fractionDigits: 1, max: 12, min: 3 }).toString(),
    isFeatured: faker.datatype.boolean({ probability: 0.1 }),
    isPublic: faker.datatype.boolean({ probability: 0.8 }),
    manufacturer: faker.company.name(),
    name: `${faker.person.firstName()} ${faker.person.lastName()} Bobblehead ${i}`,
    purchasePrice: faker.commerce.price({ max: 500, min: 5 }),
    status: faker.helpers.arrayElement(['owned', 'for_trade', 'for_sale', 'wishlist']),
    userId: 'test-user-id',
    year: faker.date.past({ years: 30 }).getFullYear(),
  }));

  // @ts-expect-error ignoring type issue with array insert
  return testDb.insert(bobbleheads).values(bobbleheads).returning();
};

// transaction-based test isolation
export const withTestTransaction = async <T>(testFn: (tx: PgDatabase<never>) => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    testDb
      .transaction(async (tx) => {
        // eslint-disable-next-line no-useless-catch
        try {
          // @ts-expect-error ignoring type issue with transaction
          await testFn(tx);
          // force rollback by throwing the error
          throw new Error('ROLLBACK_TEST_TRANSACTION');
        } catch (error) {
          throw error;
        }
      })
      .catch((error: Error) => {
        if (error.message === 'ROLLBACK_TEST_TRANSACTION') {
          // transaction was rolled back successfully, but we need to return the result
          // run the test function again to get the result (transaction already rolled back)
          // @ts-expect-error ignoring type issue with test db
          testFn(testDb).then(resolve).catch(reject);
        } else {
          reject(error);
        }
      });
  });
};

// improved test isolation with transaction rollback
export const withTestIsolation = async <T>(testFn: (db: PgDatabase<never>) => Promise<T>): Promise<T> => {
  return testDb
    .transaction(async (tx) => {
      // @ts-expect-error ignoring type issue with transaction
      await testFn(tx);
      // rollback transaction after getting the result
      throw new Error('TEST_ROLLBACK');
    })
    .catch((error: Error) => {
      if (error.message !== 'TEST_ROLLBACK') {
        throw error;
      }
      // the transaction was rolled back, run again to get the actual result
      // @ts-expect-error ignoring type issue with test db
      return testFn(testDb);
    });
};

// clean database state for tests
export const ensureCleanDatabase = async () => {
  const testDbUrl = process.env.DATABASE_URL_TEST;

  if (!testDbUrl) {
    throw new Error('DATABASE_URL_TEST is required for running database tests');
  }

  await setupTestDatabase();
};
