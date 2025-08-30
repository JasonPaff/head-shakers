import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  InsertBobblehead,
  InsertBobbleheadPhoto,
  UpdateBobblehead,
} from '@/lib/validations/bobbleheads.validation';

import { db } from '@/lib/db';
import {
  addTagToBobbleheadAsync,
  createBobbleheadAsync,
  createBobbleheadPhotoAsync,
  deleteBobbleheadAsync,
  deleteBobbleheadPhotoAsync,
  deleteBobbleheadsAsync,
  getBobbleheadByIdAsync,
  getBobbleheadPhotosAsync,
  getBobbleheadsByCollectionAsync,
  getBobbleheadsByUserAsync,
  getBobbleheadTagsAsync,
  getBobbleheadWithDetailsAsync,
  removeTagFromBobbleheadAsync,
  searchBobbleheadsAsync,
  updateBobbleheadAsync,
} from '@/lib/queries/bobbleheads.queries';

export class BobbleheadService {
  static async addPhotoAsync(data: InsertBobbleheadPhoto, dbInstance: DatabaseExecutor = db) {
    const result = await createBobbleheadPhotoAsync(data, dbInstance);
    return result?.[0] || null;
  }

  static async addTagAsync(bobbleheadId: string, tagId: string, dbInstance: DatabaseExecutor = db) {
    const result = await addTagToBobbleheadAsync(bobbleheadId, tagId, dbInstance);
    return result?.[0] || null;
  }

  static async belongsToUserAsync(
    id: string,
    userId: string,
    dbInstance: DatabaseExecutor = db,
  ): Promise<boolean> {
    const result = await getBobbleheadByIdAsync(id, dbInstance);
    return result?.[0]?.userId === userId;
  }

  // create operations
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

    if (!!result?.[0]?.id && photos.length > 0) {
      await Promise.all(
        photos.map((photo) =>
          createBobbleheadPhotoAsync({ ...photo, bobbleheadId: result[0]!.id }, dbInstance),
        ),
      );
    }

    // TODO: Update collection aggregates
    // await updateCollectionStats(data.collectionId);

    return result?.[0];
  }

  // delete operations
  static async deleteAsync(id: string, userId: string, dbInstance: DatabaseExecutor = db) {
    const result = await deleteBobbleheadAsync(id, userId, dbInstance);
    return result?.[0] || null;
  }

  static async deleteBulkAsync(ids: Array<string>, userId: string, dbInstance: DatabaseExecutor = db) {
    return deleteBobbleheadsAsync(ids, userId, dbInstance);
  }

  static async deletePhotoAsync(photoId: string, bobbleheadId: string, dbInstance: DatabaseExecutor = db) {
    const result = await deleteBobbleheadPhotoAsync(photoId, bobbleheadId, dbInstance);
    return result?.[0] || null;
  }

  // utility methods
  static async existsAsync(id: string, dbInstance: DatabaseExecutor = db): Promise<boolean> {
    const result = await getBobbleheadByIdAsync(id, dbInstance);
    return result && result.length > 0;
  }

  static async getByCollectionAsync(
    collectionId: string,
    userId?: string,
    dbInstance: DatabaseExecutor = db,
  ) {
    return getBobbleheadsByCollectionAsync(collectionId, userId, dbInstance);
  }

  // read operations
  static async getByIdAsync(id: string, userId?: string, dbInstance: DatabaseExecutor = db) {
    const result = await getBobbleheadWithDetailsAsync(id, userId, dbInstance);
    return result?.[0] || null;
  }

  static async getByIdBasicAsync(id: string, dbInstance: DatabaseExecutor = db) {
    const result = await getBobbleheadByIdAsync(id, dbInstance);
    return result?.[0] || null;
  }

  static async getByUserAsync(userId: string, viewerUserId?: string, dbInstance: DatabaseExecutor = db) {
    return getBobbleheadsByUserAsync(userId, viewerUserId, dbInstance);
  }

  static async getPhotosAsync(bobbleheadId: string, dbInstance: DatabaseExecutor = db) {
    return getBobbleheadPhotosAsync(bobbleheadId, dbInstance);
  }

  static async getTagsAsync(bobbleheadId: string, dbInstance: DatabaseExecutor = db) {
    return getBobbleheadTagsAsync(bobbleheadId, dbInstance);
  }

  static async removeTagAsync(bobbleheadId: string, tagId: string, dbInstance: DatabaseExecutor = db) {
    const result = await removeTagFromBobbleheadAsync(bobbleheadId, tagId, dbInstance);
    return result?.[0] || null;
  }

  static async searchAsync(
    searchTerm: string,
    filters: {
      category?: string;
      collectionId?: string;
      manufacturer?: string;
      maxYear?: number;
      minYear?: number;
      status?: string;
      userId?: string;
    } = {},
    userId?: string,
    limit = 20,
    offset = 0,
    dbInstance: DatabaseExecutor = db,
  ) {
    return searchBobbleheadsAsync(searchTerm, filters, userId, limit, offset, dbInstance);
  }

  // update operations
  static async updateAsync(id: string, data: UpdateBobblehead, dbInstance: DatabaseExecutor = db) {
    const result = await updateBobbleheadAsync(id, data, dbInstance);
    return result?.[0] || null;
  }
}
