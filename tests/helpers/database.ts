import type { PgDatabase } from 'drizzle-orm/pg-core';

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

// test isolation with transaction rollback
export const withTestIsolation = async <T>(testFn: (db: PgDatabase<never>) => Promise<T>): Promise<T> => {
  let result: T;

  try {
    await testDb.transaction(async (tx) => {
      // @ts-expect-error ignoring type issue with transaction
      result = await testFn(tx);
      // rollback transaction after getting the result
      throw new Error('TEST_ROLLBACK');
    });
  } catch (error: unknown) {
    if ((error as Error).message !== 'TEST_ROLLBACK') throw error;
  }

  return result!;
};
