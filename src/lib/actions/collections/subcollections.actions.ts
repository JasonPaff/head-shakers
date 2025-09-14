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
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  deleteSubCollectionSchema,
  GetSubCollectionsByCollectionSchema,
  insertSubCollectionSchema,
  updateSubCollectionSchema,
} from '@/lib/validations/subcollections.validation';

export const createSubCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.CREATE_SUB,
    isTransactionRequired: true,
  })
  .inputSchema(insertSubCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const subcollectionData = insertSubCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.SUBCOLLECTION_DATA, subcollectionData);

    try {
      const newSubcollection = await SubcollectionsFacade.createAsync(subcollectionData, dbInstance);

      if (!newSubcollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.SUBCOLLECTIONS.CREATE_FAILED,
          ERROR_MESSAGES.COLLECTION.SUB_COLLECTION_CREATE_FAILED,
          { ctx, operation: OPERATIONS.SUBCOLLECTIONS.CREATE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subcollection: newSubcollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created subcollection: ${newSubcollection.name}`,
      });

      CacheRevalidationService.revalidateCollectionFeaturedContent(subcollectionData.collectionId);
      CacheRevalidationService.revalidateDashboard({ userId: ctx.userId });

      return {
        data: newSubcollection,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.CREATE_SUB,
        },
        operation: OPERATIONS.SUBCOLLECTIONS.CREATE_ALT,
        userId: ctx.userId,
      });
    }
  });

export const getSubCollectionsByCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.GET_SUB_COLLECTIONS,
  })
  .inputSchema(GetSubCollectionsByCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const subcollectionData = GetSubCollectionsByCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.SUBCOLLECTION_DATA, subcollectionData);

    try {
      const subcollections = await SubcollectionsFacade.getSubCollectionsByCollection(
        subcollectionData.collectionId,
        ctx.userId,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subcollections,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Fetched ${subcollections.length} subcollections`,
      });

      return {
        data: subcollections,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.GET_SUB_COLLECTIONS,
        },
        operation: OPERATIONS.SUBCOLLECTIONS.GET,
        userId: ctx.userId,
      });
    }
  });

export const deleteSubCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.DELETE_SUB,
    isTransactionRequired: true,
  })
  .inputSchema(deleteSubCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const subcollectionData = deleteSubCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.SUBCOLLECTION_DATA, subcollectionData);

    try {
      const deletedSubcollection = await SubcollectionsFacade.deleteAsync(
        subcollectionData,
        ctx.userId,
        dbInstance,
      );

      if (!deletedSubcollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.SUBCOLLECTIONS.DELETE_FAILED,
          ERROR_MESSAGES.COLLECTION.SUB_COLLECTION_DELETE_FAILED,
          { ctx, operation: OPERATIONS.SUBCOLLECTIONS.DELETE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subcollection: deletedSubcollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted subcollection: ${deletedSubcollection.name}`,
      });

      CacheRevalidationService.revalidateCollectionFeaturedContent(deletedSubcollection.collectionId);
      CacheRevalidationService.revalidateDashboard({ userId: ctx.userId });

      return {
        data: null,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.DELETE_SUB,
        },
        operation: OPERATIONS.SUBCOLLECTIONS.DELETE,
        userId: ctx.userId,
      });
    }
  });

export const updateSubCollectionAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.UPDATE_SUB,
    isTransactionRequired: true,
  })
  .inputSchema(updateSubCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const subcollectionData = updateSubCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.SUBCOLLECTION_DATA, subcollectionData);

    try {
      const updatedSubcollection = await SubcollectionsFacade.updateAsync(
        subcollectionData,
        ctx.userId,
        dbInstance,
      );

      if (!updatedSubcollection) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.SUBCOLLECTIONS.UPDATE_FAILED,
          ERROR_MESSAGES.COLLECTION.SUB_COLLECTION_UPDATE_FAILED,
          { ctx, operation: OPERATIONS.SUBCOLLECTIONS.UPDATE },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          subcollection: updatedSubcollection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Updated subcollection: ${updatedSubcollection.name}`,
      });

      CacheRevalidationService.revalidateCollectionFeaturedContent(updatedSubcollection.collectionId);
      CacheRevalidationService.revalidateDashboard({ userId: ctx.userId });

      return {
        data: updatedSubcollection,
        success: true,
      };
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.UPDATE_SUB,
        },
        operation: OPERATIONS.SUBCOLLECTIONS.UPDATE,
        userId: ctx.userId,
      });
    }
  });
