'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import {
  ACTION_NAMES,
  CONFIG,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { ContentSearchFacade } from '@/lib/facades/content-search/content-search.facade';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { adminActionClient } from '@/lib/utils/next-safe-action';

const searchContentSchema = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(CONFIG.PAGINATION.SEARCH_RESULTS.MAX)
    .default(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
  query: z.string().min(1).max(CONFIG.SEARCH.MAX_QUERY_LENGTH),
});

const getCollectionSchema = z.object({ id: z.string().uuid() });

/**
 * search collections for featuring (admin/moderator only)
 */
export const searchCollectionsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_COLLECTIONS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, { limit, query, type: 'collections' });

    try {
      const result = await ContentSearchFacade.searchCollectionsForFeaturing(
        query,
        limit,
        ctx.userId,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          foundCount: result.collections.length,
          limit,
          query,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Searched collections for featuring: "${query}"`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.SEARCH_COLLECTIONS_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.COLLECTIONS,
        userId: ctx.userId,
      });
    }
  });

/**
 * search bobbleheads for featuring (admin/moderator only)
 */
export const searchBobbleheadsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_BOBBLEHEADS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, { limit, query, type: 'bobbleheads' });

    try {
      const result = await ContentSearchFacade.searchBobbleheadsForFeaturing(
        query,
        limit,
        ctx.userId,
        dbInstance,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          foundCount: result.bobbleheads.length,
          limit,
          query,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Searched bobbleheads for featuring: "${query}"`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.SEARCH_BOBBLEHEADS_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.BOBBLEHEADS,
        userId: ctx.userId,
      });
    }
  });

/**
 * search users for featuring (admin/moderator only)
 */
export const searchUsersForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_USERS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, { limit, query, type: 'users' });

    try {
      const result = await ContentSearchFacade.searchUsersForFeaturing(query, limit, ctx.userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          foundCount: result.users.length,
          limit,
          query,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Searched users for featuring: "${query}"`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.SEARCH_USERS_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.USERS,
        userId: ctx.userId,
      });
    }
  });

/**
 * get a specific collection by ID for featuring (admin/moderator only)
 */
export const getCollectionForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_COLLECTION_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(getCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const input = getCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COLLECTION_DATA, { id: input.id });

    try {
      const result = await ContentSearchFacade.getCollectionForFeaturing(input.id, ctx.userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          collection: result.collection,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Retrieved collection for featuring: ${result.collection.name}`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.GET_COLLECTION_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.COLLECTIONS,
        userId: ctx.userId,
      });
    }
  });

/**
 * get specific bobblehead by ID for featuring (admin/moderator only)
 */
export const getBobbleheadForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_BOBBLEHEAD_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(getCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const input = getCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, { id: input.id });

    try {
      const result = await ContentSearchFacade.getBobbleheadForFeaturing(input.id, ctx.userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobblehead: result.bobblehead,
          photoCount: result.bobblehead.photos.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Retrieved bobblehead for featuring: ${result.bobblehead.name}`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.GET_BOBBLEHEAD_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.BOBBLEHEADS,
        userId: ctx.userId,
      });
    }
  });

/**
 * Get a specific user by ID for featuring (admin/moderator only)
 */
export const getUserForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_USER_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(getCollectionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const input = getCollectionSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { id: input.id });

    try {
      const result = await ContentSearchFacade.getUserForFeaturing(input.id, ctx.userId, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          user: result.user,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Retrieved user for featuring: ${result.user.displayName || result.user.username}`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.ADMIN.GET_USER_FOR_FEATURING },
        operation: OPERATIONS.SEARCH.USERS,
        userId: ctx.userId,
      });
    }
  });
