import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import { createBobbleheadAsync, createBobbleheadPhotoAsync } from '@/lib/queries/bobbleheads.queries';

export class BobbleheadService {
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadPhotoAsync(data, dbInstance);
    return result?.[0] || null;
  }

  static async createAsync(data: InsertBobblehead, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadAsync(data, userId, dbInstance);
    return result?.[0] || null;
  }
}
