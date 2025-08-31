import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { db } from '@/lib/db';
import { getCollectionsByUserAsync } from '@/lib/queries/collections.queries';

export class CollectionService {
  static async getCollectionsByUserAsync(userId: string, dbInstance: DatabaseExecutor = db) {
    return getCollectionsByUserAsync(userId, dbInstance);
  }
}
