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
  GetSubCollectionsByCollectionSchema,
  insertSubCollectionSchema,
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
