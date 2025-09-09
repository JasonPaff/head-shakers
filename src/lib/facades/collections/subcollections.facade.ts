import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertSubCollection } from '@/lib/validations/subcollections.validation';

import { db } from '@/lib/db';
import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { SubcollectionsQuery } from '@/lib/queries/collections/subcollections.query';

export type PublicSubcollection = Awaited<
  ReturnType<typeof SubcollectionsFacade.getSubCollectionForPublicView>
>;

/**
 * handles all business logic and orchestration for subcollections
 */
export class SubcollectionsFacade {
  /**
   * create a new subcollection
   */
  static async createAsync(data: InsertSubCollection, dbInstance: DatabaseExecutor = db) {
    return await SubcollectionsQuery.createAsync(data, dbInstance);
  }

  /**
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string }>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return SubcollectionsQuery.getSubcollectionBobbleheadsWithPhotos(subcollectionId, context);
  }

  /**
   * get a specific subcollection for public view with collection context
   */
  static async getSubCollectionForPublicView(
    collectionId: string,
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    bobbleheadCount: number;
    collectionId: string;
    collectionName: string;
    createdAt: Date;
    description: null | string;
    featuredBobbleheadCount: number;
    featurePhoto: null | string;
    id: string;
    lastUpdatedAt: Date;
    name: string;
    userId?: string;
  }> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return SubcollectionsQuery.getSubCollectionForPublicView(collectionId, subcollectionId, context);
  }

  /**
   * get subcollections for a collection
   */
  static async getSubCollectionsByCollection(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<{ id: string; name: string }>> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return SubcollectionsQuery.getSubCollectionsByCollection(collectionId, context);
  }

  /**
   * get subcollections for a collection with detailed data for public display
   */
  static async getSubCollectionsForPublicView(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<null | {
    subCollections: Array<{
      bobbleheadCount: number;
      description: null | string;
      featurePhoto: null | string;
      id: string;
      name: string;
    }>;
    userId?: string;
  }> {
    const context =
      viewerUserId ?
        createUserQueryContext(viewerUserId, { dbInstance })
      : createPublicQueryContext({ dbInstance });

    return SubcollectionsQuery.getSubCollectionsForPublicView(collectionId, context);
  }
}
