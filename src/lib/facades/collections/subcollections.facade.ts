import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type { InsertSubCollection } from '@/lib/validations/subcollections.validation';

import { db } from '@/lib/db';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { createPublicQueryContext, createUserQueryContext } from '@/lib/queries/base/query-context';
import { SubcollectionsQuery } from '@/lib/queries/collections/subcollections.query';
import { createFacadeError } from '@/lib/utils/error-builders';

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
    try {
      return await SubcollectionsQuery.createAsync(data, dbInstance);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId: data.collectionId, name: data.name },
        facade: 'SubcollectionsFacade',
        method: 'createAsync',
        operation: 'create',
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get bobbleheads in a subcollection with photo data for public display
   */
  static async getSubcollectionBobbleheadsWithPhotos(
    subcollectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<BobbleheadListRecord & { featurePhoto?: null | string; likeData?: { isLiked: boolean; likeCount: number; likeId: null | string } }>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const bobbleheads = await SubcollectionsQuery.getSubcollectionBobbleheadsWithPhotos(subcollectionId, context);

      if (bobbleheads.length === 0) {
        return bobbleheads;
      }

      const bobbleheadIds = bobbleheads.map(b => b.id);
      const likesMap = await SocialFacade.getLikesForMultipleContentItems(
        bobbleheadIds,
        'bobblehead',
        viewerUserId,
        dbInstance
      );

      return bobbleheads.map(bobblehead => ({
        ...bobblehead,
        likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null }
      }));
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { subcollectionId },
        facade: 'SubcollectionsFacade',
        method: 'getSubcollectionBobbleheadsWithPhotos',
        operation: 'getBobbleheadsWithPhotos',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
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
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SubcollectionsQuery.getSubCollectionForPublicView(collectionId, subcollectionId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId, subcollectionId },
        facade: 'SubcollectionsFacade',
        method: 'getSubCollectionForPublicView',
        operation: 'getForPublicView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }

  /**
   * get subcollections for a collection
   */
  static async getSubCollectionsByCollection(
    collectionId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SubcollectionsQuery.getSubCollectionsByCollection(collectionId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'SubcollectionsFacade',
        method: 'getSubCollectionsByCollection',
        operation: 'getByCollection',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
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
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SubcollectionsQuery.getSubCollectionsForPublicView(collectionId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionId },
        facade: 'SubcollectionsFacade',
        method: 'getSubCollectionsForPublicView',
        operation: 'getForPublicView',
        userId: viewerUserId,
      };
      throw createFacadeError(context, error);
    }
  }
}
