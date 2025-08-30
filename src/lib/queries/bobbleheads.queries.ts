import { desc, eq } from 'drizzle-orm';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertBobblehead, UpdateBobblehead } from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';

export const createBobbleheadAsync = async (data: InsertBobblehead, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.insert(bobbleheads).values(data).returning();
};

export const getBobbleheadByIdAsync = cache(async (id: string, dbInstance = db) => {
  return dbInstance.select().from(bobbleheads).where(eq(bobbleheads.id, id));
});

export const updateBobbleheadAsync = async (id: string, data: UpdateBobblehead, dbInstance = db) => {
  return dbInstance.update(bobbleheads).set(data).where(eq(bobbleheads.id, id)).returning();
};

export const getTrendingBobbleheads = unstable_cache(
  async (limit: number = 10) => {
    return db.select().from(bobbleheads).orderBy(desc(bobbleheads.viewCount)).limit(limit);
  },
  ['trending-bobbleheads'],
  { revalidate: 300, tags: ['bobbleheads'] },
);
