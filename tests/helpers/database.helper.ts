import { sql } from 'drizzle-orm';

import { db } from '@/lib/db';

export const setupTestDatabase = async () => {
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
    collectionId,
    name: `Test Bobblehead ${i}`,
    userId: 'test-user-id',
  }));

  // @ts-expect-error ignore
  return db.insert(bobbleheads).values(bobbleheads).returning();
};
