'use server';

import 'server-only';

import type {
  BobbleheadSearchResponse,
  BobbleheadSearchResultWithPhotos,
  CollectionSearchResponse,
  PublicSearchDropdownResponse,
  PublicSearchPageResponse,
  UserSearchResponse,
} from '@/lib/facades/content-search/content-search.facade';
import type {
  CollectionSearchResult,
  UserSearchResult,
} from '@/lib/queries/content-search/content-search.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { ContentSearchFacade } from '@/lib/facades/content-search/content-search.facade';
import { actionSuccess } from '@/lib/utils/action-response';
import { adminActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import { withActionBreadcrumbs } from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  entityByIdSchema,
  searchContentForFeaturingSchema,
} from '@/lib/validations/content-search.validation';
import {
  publicSearchInputSchema,
  searchDropdownInputSchema,
} from '@/lib/validations/public-search.validation';

/**
 * Search collections for featuring (admin/moderator only)
 */
export const searchCollectionsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_COLLECTIONS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentForFeaturingSchema)
  .action(async ({ ctx }): Promise<ActionResponse<CollectionSearchResponse>> => {
    const { excludeTags, includeTags, limit, query } = searchContentForFeaturingSchema.parse(
      ctx.sanitizedInput,
    );
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.SEARCH_COLLECTIONS_FOR_FEATURING,
        contextData: { excludeTags, includeTags, limit, query, type: 'collections' },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.SEARCH.COLLECTIONS_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.searchCollectionsForFeaturingAsync(
          query,
          limit,
          ctx.userId,
          dbInstance,
          includeTags,
          excludeTags,
        );
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({ foundCount: r.data?.collections?.length ?? 0 }),
      },
    );
  });

/**
 * Search bobbleheads for featuring (admin/moderator only)
 */
export const searchBobbleheadsForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_BOBBLEHEADS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentForFeaturingSchema)
  .action(async ({ ctx }): Promise<ActionResponse<BobbleheadSearchResponse>> => {
    const { excludeTags, includeTags, limit, query } = searchContentForFeaturingSchema.parse(
      ctx.sanitizedInput,
    );
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.SEARCH_BOBBLEHEADS_FOR_FEATURING,
        contextData: { excludeTags, includeTags, limit, query, type: 'bobbleheads' },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.SEARCH.BOBBLEHEADS_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.searchBobbleheadsForFeaturingAsync(
          query,
          limit,
          ctx.userId,
          dbInstance,
          includeTags,
          excludeTags,
        );
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({ foundCount: r.data?.bobbleheads?.length ?? 0 }),
      },
    );
  });

/**
 * Search users for featuring (admin/moderator only)
 */
export const searchUsersForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.SEARCH_USERS_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(searchContentForFeaturingSchema)
  .action(async ({ ctx }): Promise<ActionResponse<UserSearchResponse>> => {
    const { limit, query } = searchContentForFeaturingSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.SEARCH_USERS_FOR_FEATURING,
        contextData: { limit, query, type: 'users' },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.SEARCH.USERS_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.searchUsersForFeaturingAsync(
          query || '',
          limit,
          ctx.userId,
          dbInstance,
        );
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({ foundCount: r.data?.users?.length ?? 0 }),
      },
    );
  });

/**
 * Get a specific collection by ID for featuring (admin/moderator only)
 */
export const getCollectionForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_COLLECTION_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(entityByIdSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ collection: CollectionSearchResult }>> => {
    const input = entityByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.GET_COLLECTION_FOR_FEATURING,
        contextData: { collectionId: input.id },
        contextType: SENTRY_CONTEXTS.COLLECTION_DATA,
        operation: OPERATIONS.SEARCH.GET_COLLECTION_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.getCollectionForFeaturingAsync(
          input.id,
          ctx.userId,
          dbInstance,
        );
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({ collectionName: r.data?.collection?.name }),
      },
    );
  });

/**
 * Get specific bobblehead by ID for featuring (admin/moderator only)
 */
export const getBobbleheadForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_BOBBLEHEAD_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(entityByIdSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ bobblehead: BobbleheadSearchResultWithPhotos }>> => {
    const input = entityByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.GET_BOBBLEHEAD_FOR_FEATURING,
        contextData: { bobbleheadId: input.id },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        operation: OPERATIONS.SEARCH.GET_BOBBLEHEAD_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.getBobbleheadForFeaturingAsync(
          input.id,
          ctx.userId,
          dbInstance,
        );
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({
          bobbleheadName: r.data?.bobblehead?.name,
          photoCount: r.data?.bobblehead?.photos?.length ?? 0,
        }),
      },
    );
  });

/**
 * Get a specific user by ID for featuring (admin/moderator only)
 */
export const getUserForFeaturingAction = adminActionClient
  .metadata({
    actionName: ACTION_NAMES.ADMIN.GET_USER_FOR_FEATURING,
    isTransactionRequired: false,
  })
  .inputSchema(entityByIdSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ user: UserSearchResult }>> => {
    const input = entityByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.ADMIN.GET_USER_FOR_FEATURING,
        contextData: { targetUserId: input.id },
        contextType: SENTRY_CONTEXTS.USER_DATA,
        operation: OPERATIONS.SEARCH.GET_USER_FOR_FEATURING,
        userId: ctx.userId,
      },
      async () => {
        const result = await ContentSearchFacade.getUserForFeaturingAsync(input.id, ctx.userId, dbInstance);
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({ username: r.data?.user?.username }),
      },
    );
  });

/**
 * Search public content with full pagination and filtering (unauthenticated access)
 *
 * Returns paginated search results across collections and bobbleheads
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
  .action(async ({ ctx }): Promise<ActionResponse<PublicSearchPageResponse>> => {
    const input = publicSearchInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.PUBLIC.SEARCH_CONTENT,
        contextData: {
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
        },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.SEARCH.PUBLIC_PAGE,
      },
      async () => {
        // TODO: Consider implementing rate limiting for public search endpoints
        // to prevent abuse and ensure fair usage across all users
        const result = await ContentSearchFacade.getPublicSearchPageResultsAsync(input, dbInstance);
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({
          counts: r.data?.counts,
          totalResults: r.data?.counts?.total ?? 0,
        }),
      },
    );
  });

/**
 * Get public search dropdown results for header search (unauthenticated access)
 *
 * Returns top 5 consolidated search results across collections and bobbleheads
 * for instant search feedback in the application header.
 * Results are cached in Redis with 10-minute TTL for optimal performance.
 *
 * @param query - Search text to match across entity types
 * @returns Consolidated dropdown results with up to 5 total items
 *
 * @example
 * const result = await getPublicSearchDropdownAction({ query: "baseball" });
 * // Returns: { collections: [...], bobbleheads: [...], totalResults: 5 }
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
  .action(async ({ ctx }): Promise<ActionResponse<PublicSearchDropdownResponse>> => {
    const input = searchDropdownInputSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.PUBLIC.GET_SEARCH_DROPDOWN_RESULTS,
        contextData: { query: input.query },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.SEARCH.PUBLIC_DROPDOWN,
      },
      async () => {
        // TODO: Consider implementing rate limiting for dropdown search to prevent
        // excessive requests during rapid typing (debouncing on client side should help)
        const result = await ContentSearchFacade.getPublicSearchDropdownResultsAsync(input.query, dbInstance);
        return actionSuccess(result);
      },
      {
        includeResultSummary: (r) => ({
          bobbleheadsCount: r.data?.bobbleheads?.length ?? 0,
          collectionsCount: r.data?.collections?.length ?? 0,
          totalResults: r.data?.totalResults ?? 0,
        }),
      },
    );
  });
