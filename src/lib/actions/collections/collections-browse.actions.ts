'use server';

import * as Sentry from '@sentry/nextjs';

import type {
  BrowseCategoriesResult,
  BrowseCollectionsResult,
  CategoryRecord,
} from '@/lib/queries/collections/collections.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import {
  ACTION_NAMES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { actionSuccess } from '@/lib/utils/action-response';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { browseCategoriesInputSchema } from '@/lib/validations/browse-categories.validation';
import { browseCollectionsInputSchema } from '@/lib/validations/browse-collections.validation';

/**
 * Browse collections with filtering, sorting, and pagination (public action)
 */
export const browseCollectionsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.BROWSE,
    isTransactionRequired: false,
  })
  .inputSchema(browseCollectionsInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<BrowseCollectionsResult>> => {
    const browseInput = browseCollectionsInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      filters: browseInput.filters,
      pagination: browseInput.pagination,
      sort: browseInput.sort,
    });

    try {
      const result = await CollectionsFacade.browseCollections(browseInput, undefined, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          filters: browseInput.filters,
          resultCount: result.collections.length,
          totalCount: result.pagination.totalCount,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Browsed collections with filters`,
      });

      return actionSuccess(result);
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
 * Browse collections by category with filtering, sorting, and pagination (public action)
 */
export const browseCategoriesAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.BROWSE_CATEGORIES,
    isTransactionRequired: false,
  })
  .inputSchema(browseCategoriesInputSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<BrowseCategoriesResult>> => {
    const browseInput = browseCategoriesInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

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

      return actionSuccess(result);
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

/**
 * Get all distinct categories (public action)
 */
export const getCategoriesAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COLLECTIONS.GET_CATEGORIES,
    isTransactionRequired: false,
  })
  .action(async ({ ctx }): Promise<ActionResponse<Array<CategoryRecord>>> => {
    const dbInstance = ctx.db;

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

      return actionSuccess(categories);
    } catch (error) {
      return handleActionError(error, {
        metadata: {
          actionName: ACTION_NAMES.COLLECTIONS.GET_CATEGORIES,
        },
        operation: OPERATIONS.COLLECTIONS.GET_CATEGORIES,
      });
    }
  });
