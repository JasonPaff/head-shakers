import { faker } from '@faker-js/faker';
import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

export const setupTestDatabase = async () => {
  // Use test-specific database URL or skip if not configured
  const testDbUrl = process.env.DATABASE_URL_TEST;
  console.log('testDbUrl', testDbUrl);
  if (!testDbUrl) {
    console.warn('No test database URL configured, skipping database setup');
    return;
  }
  // clear all tables
  await db.execute(sql`TRUNCATE TABLE
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
  return db.insert(bobbleheads).values(bobbleheads).returning();
};

// transaction-based test isolation
export const withTestTransaction = async <T>(testFn: (tx: typeof db) => Promise<T>): Promise<T | void> => {
  return await db
    .transaction(async (tx) => {
      // @ts-expect-error ignoring type issue with transaction
      await testFn(tx);
      // transaction will be rolled back automatically after the test
      throw new Error('ROLLBACK_TEST');
    })
    .catch((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.message === 'ROLLBACK_TEST') {
        return testFn(db);
      }
      throw error;
    });
};
