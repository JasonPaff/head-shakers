'use server';

import { $path } from 'next-typesafe-url';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { ACTION_NAMES } from '@/lib/constants';
import { collections, subCollections } from '@/lib/db/schema';
import { getSubCollectionsByCollectionAsync } from '@/lib/queries/collections.queries';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { insertCollectionSchema, insertSubCollectionSchema } from '@/lib/validations/collections.validation';

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
      const [newCollection] = await dbInstance
        .insert(collections)
        .values({
          ...sanitizedData,
          userId: ctx.userId,
        })
        .returning();

      // Revalidate the collection list for the user
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
      const subCollections = await getSubCollectionsByCollectionAsync(parsedInput.collectionId, ctx.db);
      
      return {
        data: subCollections.map((sc) => ({ id: sc.id, name: sc.name })),
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
