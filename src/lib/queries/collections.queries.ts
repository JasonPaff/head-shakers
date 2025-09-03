import { eq } from 'drizzle-orm';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { collections, subCollections } from '@/lib/db/schema';

export const getCollectionsByUserAsync = cache(async (userId: string, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.select().from(collections).where(eq(collections.userId, userId));
});

export const getSubCollectionsByCollectionAsync = cache(
  async (collectionId: string, dbInstance: DatabaseExecutor = db) => {
    return dbInstance.select().from(subCollections).where(eq(subCollections.collectionId, collectionId));
  },
);
