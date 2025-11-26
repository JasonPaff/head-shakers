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
import { adminActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  publicSearchInputSchema,
  searchDropdownInputSchema,
} from '@/lib/validations/public-search.validation';

const searchContentSchema = z.object({
  excludeTags: z.array(z.string().uuid()).optional(),
  includeTags: z.array(z.string().uuid()).optional(),
  limit: z
    .number()
    .int()
    .min(1)
    .max(CONFIG.PAGINATION.SEARCH_RESULTS.MAX)
    .default(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
  query: z.string().min(1).max(CONFIG.SEARCH.MAX_QUERY_LENGTH).optional(),
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
    const { excludeTags, includeTags, limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      excludeTags,
      includeTags,
      limit,
      query,
      type: 'collections',
    });

    try {
      const result = await ContentSearchFacade.searchCollectionsForFeaturing(
        query,
        limit,
        ctx.userId,
        dbInstance,
        includeTags,
        excludeTags,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          excludeTags,
          foundCount: result.collections.length,
          includeTags,
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
    const { excludeTags, includeTags, limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      excludeTags,
      includeTags,
      limit,
      query,
      type: 'bobbleheads',
    });

    try {
      const result = await ContentSearchFacade.searchBobbleheadsForFeaturing(
        query,
        limit,
        ctx.userId,
        dbInstance,
        includeTags,
        excludeTags,
      );

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          excludeTags,
          foundCount: result.bobbleheads.length,
          includeTags,
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
    const { excludeTags, includeTags, limit, query } = searchContentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, { excludeTags, includeTags, limit, query, type: 'users' });

    try {
      const result = await ContentSearchFacade.searchUsersForFeaturing(
        query || '',
        limit,
        ctx.userId,
        dbInstance,
      );

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
        message: `Retrieved user for featuring: ${result.user.username}`,
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

/**
 * Search public content with full pagination and filtering (unauthenticated access)
 *
 * Returns paginated search results across collections, subcollections, and bobbleheads
 * with advanced filtering options including entity types, tag filtering, and sorting.
 * Results are cached in Redis with 10-minute TTL for performance optimization.
 *
 * @param input - Search parameters including query, filters, and pagination
 * @returns Paginated search results with counts and metadata
 *
 * @example
 * const result = await searchPublicContentAction({
 *   query: "baseball",
 *   filters: {
 *     entityTypes: ["bobblehead"],
 *     tagIds: ["tag-uuid"],
 *     sortBy: "relevance",
 *     sortOrder: "desc"
 *   },
 *   pagination: { page: 1, pageSize: 20 }
 * });
 *
 * @public
 * @note Rate limiting should be implemented for public search endpoints to prevent abuse
 */
export const searchPublicContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.PUBLIC.SEARCH_CONTENT,
    isTransactionRequired: false,
  })
  .inputSchema(publicSearchInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const input = publicSearchInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      category: input.filters?.category,
      dateFrom: input.filters?.dateFrom,
      dateTo: input.filters?.dateTo,
      entityTypes: input.filters?.entityTypes,
      page: input.pagination?.page,
      pageSize: input.pagination?.pageSize,
      query: input.query,
      sortBy: input.filters?.sortBy,
      sortOrder: input.filters?.sortOrder,
      tagIds: input.filters?.tagIds,
      type: 'public-search',
    });

    try {
      // TODO: Consider implementing rate limiting for public search endpoints
      // to prevent abuse and ensure fair usage across all users
      const result = await ContentSearchFacade.getPublicSearchPageResults(input, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          category: input.filters?.category,
          counts: result.counts,
          dateFrom: input.filters?.dateFrom,
          dateTo: input.filters?.dateTo,
          entityTypes: input.filters?.entityTypes,
          page: input.pagination?.page,
          pageSize: input.pagination?.pageSize,
          query: input.query,
          totalResults: result.counts.total,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Public search executed: "${input.query}" - ${result.counts.total} results`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.PUBLIC.SEARCH_CONTENT },
        operation: OPERATIONS.SEARCH.COLLECTIONS,
      });
    }
  });

/**
 * Get public search dropdown results for header search (unauthenticated access)
 *
 * Returns top 5 consolidated search results across collections, subcollections,
 * and bobbleheads for instant search feedback in the application header.
 * Results are cached in Redis with 10-minute TTL for optimal performance.
 *
 * @param query - Search text to match across entity types
 * @returns Consolidated dropdown results with up to 5 total items
 *
 * @example
 * const result = await getPublicSearchDropdownAction({ query: "baseball" });
 * // Returns: { collections: [...], subcollections: [...], bobbleheads: [...], totalResults: 5 }
 *
 * @public
 * @note Rate limiting should be implemented for dropdown search to prevent abuse
 */
export const getPublicSearchDropdownAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.PUBLIC.GET_SEARCH_DROPDOWN_RESULTS,
    isTransactionRequired: false,
  })
  .inputSchema(searchDropdownInputSchema)
  .action(async ({ ctx, parsedInput }) => {
    const input = searchDropdownInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.INPUT_INFO, {
      query: input.query,
      type: 'dropdown-search',
    });

    try {
      // TODO: Consider implementing rate limiting for dropdown search to prevent
      // excessive requests during rapid typing (debouncing on client side should help)
      const result = await ContentSearchFacade.getPublicSearchDropdownResults(input.query, dbInstance);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadsCount: result.bobbleheads.length,
          collectionsCount: result.collections.length,
          query: input.query,
          subcollectionsCount: result.subcollections.length,
          totalResults: result.totalResults,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Dropdown search executed: "${input.query}" - ${result.totalResults} results`,
      });

      return result;
    } catch (error) {
      return handleActionError(error, {
        input: parsedInput,
        metadata: { actionName: ACTION_NAMES.PUBLIC.GET_SEARCH_DROPDOWN_RESULTS },
        operation: OPERATIONS.SEARCH.COLLECTIONS,
      });
    }
  });
