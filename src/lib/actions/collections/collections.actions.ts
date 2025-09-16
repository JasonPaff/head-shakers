'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
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
  .action(async ({ ctx, parsedInput }) => {
    const collectionData = insertCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COLLECTION_DATA, collectionData);

    try {
      const newCollection = await CollectionsFacade.createAsync(collectionData, ctx.userId, dbInstance);

      if (!newCollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.COLLECTIONS.CREATE_FAILED,
          ERROR_MESSAGES.COLLECTION.CREATE_FAILED,
          { ctx, operation: OPERATIONS.COLLECTIONS.CREATE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          collection: newCollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created collection: ${newCollection.name}`,
      });

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
        operation: OPERATIONS.COLLECTIONS.CREATE,
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
    const collectionData = updateCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COLLECTION_DATA, collectionData);

    try {
      const currentCollection = await CollectionsFacade.getCollectionById(
        collectionData.collectionId,
        ctx.userId,
        dbInstance,
      );

      if (!currentCollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.COLLECTIONS.EXISTING_NOT_FOUND,
          ERROR_MESSAGES.COLLECTION.NOT_FOUND,
          { ctx, operation: OPERATIONS.COLLECTIONS.UPDATE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          collection: currentCollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Updated collection: ${currentCollection.name}`,
      });

      const updatedCollection = await CollectionsFacade.updateAsync(collectionData, ctx.userId, dbInstance);

      if (!updatedCollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.COLLECTIONS.EXISTING_UPDATE_FAILED,
          ERROR_MESSAGES.COLLECTION.UPDATE_FAILED,
          { ctx, operation: OPERATIONS.COLLECTIONS.UPDATE },
          false,
          500,
        );
      }

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
        operation: OPERATIONS.COLLECTIONS.UPDATE,
        userId: ctx.userId,
      });
    }
  });

export const deleteCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const collectionData = deleteCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

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
        operation: OPERATIONS.COLLECTIONS.DELETE,
        userId: ctx.userId,
      });
    }
  });
