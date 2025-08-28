import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertBobblehead, InsertBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import { createBobbleheadAsync } from '@/lib/queries/bobbleheads.queries';

export class BobbleheadService {
  static async createAsync(data: InsertBobblehead, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadAsync(data, dbInstance);
    return result?.[0] || null;
  }

  static async createWithPhotosAsync(
    data: InsertBobblehead,
    photos: Array<InsertBobbleheadPhoto>,
    dbInstance: DatabaseExecutor = db,
  ) {
    const result = await createBobbleheadAsync(data, dbInstance);

    console.log(photos);

    // if (photos.length > 0) {
    //   await createBobbleheadPhotos(photos.map(p => ({
    //     ...p,
    //     bobbleheadId: result[0].id
    //   })), dbInstance);
    // }

    // Update collection aggregates
    //await updateCollectionStats(data.collectionId);

    return result?.[0];
  }
}
