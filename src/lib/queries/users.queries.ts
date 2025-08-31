import { eq } from 'drizzle-orm';
import { cache } from 'react';

import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export const getUserByClerkIdAsync = cache(async (clerkId: string, dbInstance: DatabaseExecutor = db) => {
  const result = await dbInstance.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
  if (result.length === 0) return null;
  return result[0];
});
