'use server';

import { and, eq } from 'drizzle-orm';
import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ACTION_NAMES } from '@/lib/constants';
import { collections, subCollections } from '@/lib/db/schema';
import { CollectionsFacade } from '@/lib/queries/collections/collections-facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  insertCollectionSchema,
  insertSubCollectionSchema,
  updateCollectionSchema,
} from '@/lib/validations/collections.validation';

export const createCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(insertCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      CollectionsFacade.validateCollectionCreation(sanitizedData, ctx.userId);

      const [newCollection] = await dbInstance
        .insert(collections)
        .values({
          ...sanitizedData,
          userId: ctx.userId,
        })
        .returning();

      // revalidate the collection list for the user
      revalidatePath(
        $path({
          route: '/dashboard/collection',
        }),
      );

      return {
        data: newCollection,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.CREATE,
        },
        operation: 'create_collection',
        userId: ctx.userId,
      });
    }
  });

export const updateCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.UPDATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      // get the current collection to validate
      const currentCollection = await CollectionsFacade.getCollectionById(
        sanitizedData.collectionId,
        ctx.userId,
        dbInstance,
      );

      if (!currentCollection) {
        throw new Error('Collection not found');
      }

      CollectionsFacade.validateCollectionUpdate(sanitizedData, currentCollection, ctx.userId);

      const [updatedCollection] = await dbInstance
        .update(collections)
        .set({
          ...sanitizedData,
        })
        .where(and(eq(collections.id, sanitizedData.collectionId), eq(collections.userId, ctx.userId)))
        .returning();

      // revalidate the collection list for the user
      revalidatePath(
        $path({
          route: '/dashboard/collection',
        }),
      );

      // revalidate the specific collection page
      revalidatePath(
        $path({
          route: '/collections/[collectionId]',
          routeParams: { collectionId: sanitizedData.collectionId },
        }),
      );

      return {
        data: updatedCollection,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.UPDATE,
        },
        operation: 'update_collection',
        userId: ctx.userId,
      });
    }
  });

export const deleteCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(z.object({ collectionId: z.string() }))
  .action(async ({ ctx, parsedInput }) => {
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      await dbInstance
        .delete(collections)
        .where(and(eq(collections.id, parsedInput.collectionId), eq(collections.userId, ctx.userId)));

      // revalidate the collection list for the user
      revalidatePath(
        $path({
          route: '/dashboard/collection',
        }),
      );

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.DELETE,
        },
        operation: 'delete_collection',
        userId: ctx.userId,
      });
    }
  });

export const createSubCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.CREATE_SUB,
    isTransactionRequired: true,
  })
  .inputSchema(insertSubCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const sanitizedData = ctx.sanitizedInput as typeof parsedInput;
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const [newSubCollection] = await dbInstance
        .insert(subCollections)
        .values({
          ...sanitizedData,
        })
        .returning();

      // revalidate the collection list for the user
      revalidatePath(
        $path({
          route: '/dashboard/collection',
        }),
      );

      return {
        data: newSubCollection,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.CREATE_SUB,
        },
        operation: 'create_sub_collection',
        userId: ctx.userId,
      });
    }
  });

export const getSubCollectionsByCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.GET_SUB_COLLECTIONS,
  })
  .inputSchema(z.object({ collectionId: z.string() }))
  .action(async ({ ctx, parsedInput }) => {
    try {
      const subCollections = await CollectionsFacade.getSubCollectionsByCollection(
        parsedInput.collectionId,
        ctx.userId,
        ctx.db,
      );

      return {
        data: subCollections,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.GET_SUB_COLLECTIONS,
        },
        operation: 'get_sub_collections',
        userId: ctx.userId,
      });
    }
  });
