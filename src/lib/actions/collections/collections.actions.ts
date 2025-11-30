'use server';

import 'server-only';

import type { CollectionRecord } from '@/lib/queries/collections/collections.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_CODES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { createInternalError, createNotFoundError } from '@/lib/utils/error-builders';
import { authActionClient } from '@/lib/utils/next-safe-action';
import { withActionErrorHandling } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  deleteCollectionSchema,
  insertCollectionSchema,
  updateCollectionSchema,
} from '@/lib/validations/collections.validation';

export const createCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(insertCollectionSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CollectionRecord>> => {
    const collectionData = insertCollectionSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COLLECTIONS.CREATE,
        contextData: { parsedInput },
        contextType: SENTRY_CONTEXTS.COLLECTION_DATA,
        input: parsedInput,
        operation: OPERATIONS.COLLECTIONS.CREATE,
        userId: ctx.userId,
      },
      async () => {
        const createdCollection = await CollectionsFacade.createAsync(collectionData, ctx.userId, ctx.db);

        if (!createdCollection) {
          throw createInternalError(ERROR_MESSAGES.COLLECTION.CREATE_FAILED, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.CREATE_FAILED,
            operation: OPERATIONS.COLLECTIONS.CREATE,
          });
        }

        return actionSuccess(createdCollection, 'Collection created successfully!');
      },
    );
  });

export const updateCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.UPDATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateCollectionSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CollectionRecord>> => {
    const collectionData = updateCollectionSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COLLECTIONS.UPDATE,
        contextData: { parsedInput },
        contextType: SENTRY_CONTEXTS.COLLECTION_DATA,
        input: parsedInput,
        operation: OPERATIONS.COLLECTIONS.UPDATE,
        userId: ctx.userId,
      },
      async () => {
        const updatedCollection = await CollectionsFacade.updateAsync(collectionData, ctx.userId, ctx.db);

        if (!updatedCollection) {
          throw createNotFoundError(ERROR_MESSAGES.COLLECTION.NOT_FOUND, collectionData.collectionId, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.EXISTING_NOT_FOUND,
            operation: OPERATIONS.COLLECTIONS.UPDATE,
          });
        }

        return actionSuccess(updatedCollection, 'Collection updated successfully!');
      },
    );
  });

export const deleteCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteCollectionSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CollectionRecord>> => {
    const collectionData = deleteCollectionSchema.parse(ctx.sanitizedInput);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COLLECTIONS.DELETE,
        contextData: { parsedInput },
        contextType: SENTRY_CONTEXTS.COLLECTION_DATA,
        input: parsedInput,
        operation: OPERATIONS.COLLECTIONS.DELETE,
        userId: ctx.userId,
      },
      async () => {
        const deletedCollection = await CollectionsFacade.deleteAsync(collectionData, ctx.userId, ctx.db);

        if (!deletedCollection) {
          throw createInternalError(ERROR_MESSAGES.COLLECTION.DELETE_FAILED, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.DELETE_FAILED,
            operation: OPERATIONS.COLLECTIONS.DELETE,
          });
        }

        return actionSuccess(deletedCollection, 'Collection deleted successfully!');
      },
    );
  });
