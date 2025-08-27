import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertBobblehead } from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import { bobbleheads } from '@/lib/db/schema';

export const createBobbleheadAsync = async (data: InsertBobblehead, dbInstance: DatabaseExecutor = db) => {
  return dbInstance.insert(bobbleheads).values(data).returning();
};
