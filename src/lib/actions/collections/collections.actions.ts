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
import { invalidateMetadataCache } from '@/lib/seo/cache.utils';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { browseCategoriesInputSchema } from '@/lib/validations/browse-categories.validation';
import { browseCollectionsInputSchema } from '@/lib/validations/browse-collections.validation';
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

      // invalidate metadata cache for the new collection
      invalidateMetadataCache('collection', newCollection.id);

      CacheRevalidationService.collections.onCreate(newCollection.id, ctx.userId, newCollection.slug);

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

      // invalidate metadata cache for the updated collection
      invalidateMetadataCache('collection', collectionData.collectionId);

      CacheRevalidationService.collections.onUpdate(collectionData.collectionId, ctx.userId);

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

      // invalidate metadata cache for the deleted collection
      invalidateMetadataCache('collection', collectionData.collectionId);

      CacheRevalidationService.collections.onDelete(collectionData.collectionId, ctx.userId);

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

/**
 * Browse collections with filtering, sorting, and pagination (public action)
 */
export const browseCollectionsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.BROWSE,
    isTransactionRequired: false,
  })
  .inputSchema(browseCollectionsInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const browseInput = browseCollectionsInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      filters: browseInput.filters,
      includeSubcollections: browseInput.filters?.includeSubcollections ?? true,
      pagination: browseInput.pagination,
      sort: browseInput.sort,
    });

    try {
      const result = await CollectionsFacade.browseCollections(browseInput, undefined, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          filters: browseInput.filters,
          includeSubcollections: browseInput.filters?.includeSubcollections ?? true,
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Browsed collections with filters`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.BROWSE,
        },
        operation: OPERATIONS.COLLECTIONS.BROWSE,
      });
    }
  });

/**
 * Get all distinct categories (public action)
 */
export const getCategoriesAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.GET_CATEGORIES,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }) => {
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const categories = await CollectionsFacade.getCategories(dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          categoryCount: categories.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Retrieved ${categories.length} categories`,
      });

      return categories;
    } catch (error) {
      return handleActionError(error, {
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.GET_CATEGORIES,
        },
        operation: OPERATIONS.COLLECTIONS.GET_CATEGORIES,
      });
    }
  });

/**
 * Browse collections by category with filtering, sorting, and pagination (public action)
 */
export const browseCategoriesAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.BROWSE_CATEGORIES,
    isTransactionRequired: false,
  })
  .inputSchema(browseCategoriesInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const browseInput = browseCategoriesInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      filters: browseInput.filters,
      pagination: browseInput.pagination,
      sort: browseInput.sort,
    });

    try {
      const result = await CollectionsFacade.browseCategories(browseInput, undefined, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          category: browseInput.filters?.category,
          filters: browseInput.filters,
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Browsed categories with filters`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.BROWSE_CATEGORIES,
        },
        operation: OPERATIONS.COLLECTIONS.BROWSE_CATEGORIES,
      });
    }
  });
