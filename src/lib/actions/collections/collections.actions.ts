'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import type { CollectionRecord } from '@/lib/queries/collections/collections.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  CACHE_ENTITY_TYPE,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { createInternalError, createNotFoundError } from '@/lib/utils/error-builders';
import { ActionError, ErrorType } from '@/lib/utils/errors';
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
        const newCollection = await CollectionsFacade.createAsync(collectionData, ctx.userId, ctx.db);

        if (!newCollection) {
          throw createInternalError(ERROR_MESSAGES.COLLECTION.CREATE_FAILED, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.CREATE_FAILED,
            operation: OPERATIONS.COLLECTIONS.CREATE,
          });
        }

        // TODO: investigate caching
        invalidateMetadataCache(CACHE_ENTITY_TYPE.COLLECTION, newCollection.id);
        CacheRevalidationService.collections.onCreate(newCollection.id, ctx.userId, newCollection.slug);

        return actionSuccess(newCollection);
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
        const currentCollection = await CollectionsFacade.getById(
          collectionData.collectionId,
          ctx.userId,
          ctx.db,
        );

        if (!currentCollection) {
          throw createNotFoundError(ERROR_MESSAGES.COLLECTION.NOT_FOUND, collectionData.collectionId, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.EXISTING_NOT_FOUND,
            operation: OPERATIONS.COLLECTIONS.UPDATE,
          });
        }

        const updatedCollection = await CollectionsFacade.updateAsync(collectionData, ctx.userId, ctx.db);

        if (!updatedCollection) {
          throw createInternalError(ERROR_MESSAGES.COLLECTION.UPDATE_FAILED, {
            ctx,
            errorCode: ERROR_CODES.COLLECTIONS.EXISTING_UPDATE_FAILED,
            operation: OPERATIONS.COLLECTIONS.UPDATE,
          });
        }

        // TODO: investigate caching
        invalidateMetadataCache(CACHE_ENTITY_TYPE.COLLECTION, collectionData.collectionId);
        CacheRevalidationService.collections.onUpdate(collectionData.collectionId, ctx.userId);

        return actionSuccess(updatedCollection);
      },
    );
  });

export const deleteCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteCollectionSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<null>> => {
    const collectionData = deleteCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COLLECTION_DATA, collectionData);

    try {
      const deletedCollection = await CollectionsFacade.deleteAsync(collectionData, ctx.userId, dbInstance);

      if (!deletedCollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.COLLECTIONS.DELETE_FAILED,
          ERROR_MESSAGES.COLLECTION.DELETE_FAILED,
          { ctx, operation: OPERATIONS.COLLECTIONS.DELETE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          collection: deletedCollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted collection: ${deletedCollection.name}`,
      });

      // invalidate metadata cache for the deleted collection
      invalidateMetadataCache('collection', collectionData.collectionId);

      CacheRevalidationService.collections.onDelete(collectionData.collectionId, ctx.userId);

      return actionSuccess(null);
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.DELETE,
        },
        operation: OPERATIONS.COLLECTIONS.DELETE,
        userId: ctx.userId,
      });
    }
  });
