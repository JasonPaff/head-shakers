import { eq } from 'drizzle-orm';
import { cache } from 'react';

import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';

export const getCollectionByIdAsync = cache(async (id: string, dbInstance = db) => {
  return dbInstance.select().from(collections).where(eq(collections.id, id));
});