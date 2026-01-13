'use server';

import 'server-only';

import type {
  BrowseCategoriesResult,
  BrowseCollectionsResult,
  CategoryRecord,
} from '@/lib/queries/collections/collections.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { publicActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs } from '@/lib/utils/sentry-server/breadcrumbs.server';
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
  .action(async ({ ctx }): Promise<ActionResponse<BrowseCollectionsResult>> => {
    const browseInput = browseCollectionsInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.COLLECTIONS.BROWSE,
        contextData: {
          filters: browseInput.filters,
          pagination: browseInput.pagination,
          sort: browseInput.sort,
        },
        contextType: SENTRY_CONTEXTS.INPUT_INFO,
        operation: OPERATIONS.COLLECTIONS.BROWSE,
      },
      async () => {
        const result = await CollectionsFacade.browseCollectionsAsync(browseInput, undefined, dbInstance);
        return actionSuccess(result, 'Collections retrieved successfully');
      },
      {
        includeResultSummary: (response) =>
          response.wasSuccess ?
            {
              resultCount: response.data?.collections.length,
              totalCount: response.data?.pagination.totalCount,
            }
          : {},
      },
    );
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
  .action(async ({ ctx }): Promise<ActionResponse<BrowseCategoriesResult>> => {
    const browseInput = browseCategoriesInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.COLLECTIONS.BROWSE_CATEGORIES,
        contextData: {
          category: browseInput.filters?.category,
          filters: browseInput.filters,
          pagination: browseInput.pagination,
          sort: browseInput.sort,
        },
        contextType: SENTRY_CONTEXTS.INPUT_INFO,
        operation: OPERATIONS.COLLECTIONS.BROWSE_CATEGORIES,
      },
      async () => {
        const result = await CollectionsFacade.browseCategoriesAsync(browseInput, undefined, dbInstance);
        return actionSuccess(result, 'Categories retrieved successfully');
      },
      {
        includeResultSummary: (response) =>
          response.wasSuccess ?
            {
              resultCount: response.data?.collections.length,
              totalCount: response.data?.pagination.totalCount,
            }
          : {},
      },
    );
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

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.COLLECTIONS.GET_CATEGORIES,
        operation: OPERATIONS.COLLECTIONS.GET_CATEGORIES,
      },
      async () => {
        const categories = await CollectionsFacade.getCategoriesAsync(dbInstance);
        return actionSuccess(categories, 'Categories retrieved successfully');
      },
      {
        includeResultSummary: (response) =>
          response.wasSuccess ? { categoryCount: response.data?.length } : {},
      },
    );
  });
