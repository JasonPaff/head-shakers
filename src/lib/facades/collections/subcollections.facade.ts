import { eq } from 'drizzle-orm';

import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { FacadeErrorContext } from '@/lib/utils/error-types';
import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';
import type {
  DeleteSubCollection,
  InsertSubCollection,
  UpdateSubCollection,
} from '@/lib/validations/subcollections.validation';

import { db } from '@/lib/db';
import { subCollections } from '@/lib/db/schema';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import {
  createProtectedQueryContext,
  createPublicQueryContext,
  createUserQueryContext,
} from '@/lib/queries/base/query-context';
import { SubcollectionsQuery } from '@/lib/queries/collections/subcollections.query';
import { CloudinaryService } from '@/lib/services/cloudinary.service';
import { createFacadeError } from '@/lib/utils/error-builders';
import { ensureUniqueSlug, generateSlug } from '@/lib/utils/slug';

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
      const context = createPublicQueryContext({ dbInstance });
      const dbInst = context.dbInstance ?? db;

      // generate slug from name
      const baseSlug = generateSlug(data.name);

      // query existing subcollection slugs for this collection only (collection-scoped)
      const existingSlugs = await dbInst
        .select({ slug: subCollections.slug })
        .from(subCollections)
        .where(eq(subCollections.collectionId, data.collectionId))
        .then((results) => results.map((r) => r.slug));

      // ensure slug is unique within collection's subcollections
      const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);

      // create subcollection with unique slug
      return await SubcollectionsQuery.createAsync({ ...data, slug: uniqueSlug }, context);
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
   * delete a subcollection
   */
  static async deleteAsync(data: DeleteSubCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const deletedSubcollection = await SubcollectionsQuery.deleteAsync(
        data.subcollectionId,
        userId,
        context,
      );

      // cleanup cover photo from Cloudinary if it exists
      if (deletedSubcollection?.coverImageUrl) {
        try {
          const publicId = CloudinaryService.extractPublicIdFromUrl(deletedSubcollection.coverImageUrl);
          if (publicId) {
            await CloudinaryService.deletePhotosFromCloudinary([publicId]);
          }
        } catch (cloudinaryError) {
          // log the error but don't fail the deletion operation
          console.error('Failed to delete subcollection cover photo from Cloudinary:', cloudinaryError);
        }
      }

      return deletedSubcollection;
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { subcollectionId: data.subcollectionId },
        facade: 'SubcollectionsFacade',
        method: 'deleteAsync',
        operation: 'delete',
        userId,
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
    options?: { searchTerm?: string; sortBy?: string },
    dbInstance?: DatabaseExecutor,
  ): Promise<
    Array<
      BobbleheadListRecord & {
        collectionId: string;
        collectionSlug: null | string;
        featurePhoto?: null | string;
        likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
        subcollectionId: null | string;
        subcollectionSlug: null | string;
      }
    >
  > {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      const bobbleheads = await SubcollectionsQuery.getSubcollectionBobbleheadsWithPhotosAsync(
        subcollectionId,
        context,
        options,
      );

      if (bobbleheads.length === 0) {
        return bobbleheads;
      }

      const bobbleheadIds = bobbleheads.map((b) => b.id);
      const likesMap = await SocialFacade.getLikesForMultipleContentItems(
        bobbleheadIds,
        'bobblehead',
        viewerUserId,
        dbInstance,
      );

      return bobbleheads.map((bobblehead) => ({
        ...bobblehead,
        likeData: likesMap.get(bobblehead.id) || { isLiked: false, likeCount: 0, likeId: null },
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
   * get a subcollection by slug within a collection
   */
  static async getSubcollectionBySlug(
    collectionSlug: string,
    subcollectionSlug: string,
    userId: string,
    viewerUserId?: string,
    dbInstance?: DatabaseExecutor,
  ) {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return await SubcollectionsQuery.findBySlugAsync(collectionSlug, subcollectionSlug, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { collectionSlug, subcollectionSlug, userId },
        facade: 'SubcollectionsFacade',
        method: 'getSubcollectionBySlug',
        operation: 'getBySlug',
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
    collectionSlug: string;
    coverImageUrl: null | string;
    createdAt: Date;
    description: null | string;
    featuredBobbleheadCount: number;
    featurePhoto: null | string;
    id: string;
    isPublic: boolean;
    lastUpdatedAt: Date;
    name: string;
    slug: string;
    userId?: string;
  }> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SubcollectionsQuery.getSubCollectionForPublicViewAsync(collectionId, subcollectionId, context);
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

      return SubcollectionsQuery.getSubCollectionsByCollectionAsync(collectionId, context);
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
      isPublic: boolean;
      name: string;
      slug: string;
    }>;
    userId?: string;
  }> {
    try {
      const context =
        viewerUserId ?
          createUserQueryContext(viewerUserId, { dbInstance })
        : createPublicQueryContext({ dbInstance });

      return SubcollectionsQuery.getSubCollectionsForPublicViewAsync(collectionId, context);
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

  /**
   * update a subcollection
   */
  static async updateAsync(data: UpdateSubCollection, userId: string, dbInstance: DatabaseExecutor = db) {
    try {
      const context = createProtectedQueryContext(userId, { dbInstance });
      const dbInst = context.dbInstance ?? db;
      const { subcollectionId, ...updateData } = data;

      const finalUpdateData: Omit<UpdateSubCollection, 'subcollectionId'> & { slug?: string } = {
        ...updateData,
      };

      // if name is being updated, regenerate slug
      if (updateData.name) {
        // need to get the current subcollection to find its collectionId
        const currentSubcollection = await dbInst.query.subCollections.findFirst({
          columns: { collectionId: true },
          where: eq(subCollections.id, subcollectionId),
        });

        if (currentSubcollection) {
          const baseSlug = generateSlug(updateData.name);

          // query existing slugs for this collection, excluding current subcollection
          const existingSlugs = await dbInst
            .select({ slug: subCollections.slug })
            .from(subCollections)
            .where(eq(subCollections.collectionId, currentSubcollection.collectionId))
            .then((results) => results.map((r) => r.slug).filter((slug) => slug !== subcollectionId));

          // ensure new slug is unique within collection's subcollections
          const uniqueSlug = ensureUniqueSlug(baseSlug, existingSlugs);
          finalUpdateData.slug = uniqueSlug;
        }
      }

      return await SubcollectionsQuery.updateAsync(subcollectionId, finalUpdateData, userId, context);
    } catch (error) {
      const context: FacadeErrorContext = {
        data: { subcollectionId: data.subcollectionId },
        facade: 'SubcollectionsFacade',
        method: 'updateAsync',
        operation: 'update',
        userId,
      };
      throw createFacadeError(context, error);
    }
  }
}
