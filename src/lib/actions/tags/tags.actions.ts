'use server';

import 'server-only';

import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, CONFIG, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { TagsFacade, type TagSuggestion } from '@/lib/facades/tags/tags.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { actionSuccess } from '@/lib/utils/action-response';
import { createInternalError, createValidationError } from '@/lib/utils/error-builders';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  trackCacheInvalidation,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  attachTagsSchema,
  bulkDeleteTagsSchema,
  deleteTagSchema,
  detachTagsSchema,
  getTagSuggestionsSchema,
  insertTagSchema,
  type SelectTag,
  updateTagActionSchema,
} from '@/lib/validations/tags.validation';

export const createTagAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.CREATE,
    isTransactionRequired: false,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_ADD.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_ADD.WINDOW,
    ),
  )
  .inputSchema(insertTagSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectTag>> => {
    const tagData = insertTagSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.TAGS.CREATE,
        contextData: { name: tagData.name },
        contextType: SENTRY_CONTEXTS.TAG_DATA,
        input: parsedInput,
        operation: OPERATIONS.TAGS.CREATE,
        userId,
      },
      async () => {
        const newTag = await TagsFacade.createTagAsync(tagData, userId, ctx.db);

        if (!newTag) {
          throw createInternalError(ERROR_MESSAGES.TAG.CREATE_FAILED, {
            operation: OPERATIONS.TAGS.CREATE,
            userId,
          });
        }

        trackCacheInvalidation(
          {
            entityId: newTag.id,
            entityType: 'tag',
            operation: 'create',
            userId,
          },
          CacheRevalidationService.admin.onSystemChange(
            'Tag created - invalidating search and user tag caches',
          ),
        );

        return actionSuccess(newTag, 'Tag created successfully');
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { tagId: result.data?.id, tagName: result.data?.name } : {},
      },
    );
  });

export const updateTagAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.UPDATE,
    isTransactionRequired: false,
  })
  .inputSchema(updateTagActionSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<SelectTag>> => {
    const { tagId, ...updateData } = updateTagActionSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.TAGS.UPDATE,
        contextData: { tagId, ...updateData },
        contextType: SENTRY_CONTEXTS.TAG_DATA,
        input: parsedInput,
        operation: OPERATIONS.TAGS.UPDATE,
        userId,
      },
      async () => {
        const updatedTag = await TagsFacade.updateTagAsync(tagId, updateData, userId, ctx.db);

        if (!updatedTag) {
          throw createInternalError(ERROR_MESSAGES.TAG.UPDATE_FAILED, {
            operation: OPERATIONS.TAGS.UPDATE,
            tagId,
            userId,
          });
        }

        trackCacheInvalidation(
          {
            entityId: updatedTag.id,
            entityType: 'tag',
            operation: 'update',
            userId,
          },
          CacheRevalidationService.admin.onSystemChange(
            'Tag updated - invalidating search and user tag caches',
          ),
        );

        return actionSuccess(updatedTag, 'Tag updated successfully');
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { tagId: result.data?.id, tagName: result.data?.name } : {},
      },
    );
  });

export const deleteTagAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.DELETE,
    isTransactionRequired: false,
  })
  .inputSchema(deleteTagSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ deleted: boolean }>> => {
    const { tagId } = deleteTagSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.TAGS.DELETE,
        contextData: { tagId },
        contextType: SENTRY_CONTEXTS.TAG_DATA,
        input: parsedInput,
        operation: OPERATIONS.TAGS.DELETE,
        userId,
      },
      async () => {
        const deleted = await TagsFacade.deleteTagAsync(tagId, userId, ctx.db);

        if (!deleted) {
          throw createInternalError(ERROR_MESSAGES.TAG.DELETE_FAILED, {
            operation: OPERATIONS.TAGS.DELETE,
            tagId,
            userId,
          });
        }

        trackCacheInvalidation(
          {
            entityId: tagId,
            entityType: 'tag',
            operation: 'delete',
            userId,
          },
          CacheRevalidationService.admin.onSystemChange(
            'Tag deleted - invalidating search and user tag caches',
          ),
        );

        return actionSuccess({ deleted: true }, 'Tag deleted successfully');
      },
      {
        includeResultSummary: (result) => (result.wasSuccess ? { deleted: result.data?.deleted, tagId } : {}),
      },
    );
  });

export const attachTagsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.ATTACH_TO_BOBBLEHEAD,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_ADD.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_ADD.WINDOW,
    ),
  )
  .inputSchema(attachTagsSchema)
  .action(
    async ({ ctx, parsedInput }): Promise<ActionResponse<{ attached: number; warnings: Array<string> }>> => {
      const { bobbleheadId, tagIds } = attachTagsSchema.parse(ctx.sanitizedInput);
      const userId = ctx.userId;
      const dbInstance = ctx.db;

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.TAGS.ATTACH_TO_BOBBLEHEAD,
          contextData: { bobbleheadId, tagCount: tagIds.length },
          contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
          input: parsedInput,
          operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
          userId,
        },
        async () => {
          const validation = await TagsFacade.validateTagsForBobbleheadAsync(
            bobbleheadId,
            tagIds,
            userId,
            dbInstance,
          );

          if (!validation.canCreate) {
            throw createValidationError('TAG_VALIDATION_FAILED', validation.errors.join(', '), {
              bobbleheadId,
              operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
              tagIds,
            });
          }

          const success = await TagsFacade.attachToBobbleheadAsync(bobbleheadId, tagIds, userId, dbInstance);

          if (!success) {
            throw createInternalError(ERROR_MESSAGES.TAG.ATTACH_FAILED, {
              bobbleheadId,
              operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
              tagIds,
            });
          }

          trackCacheInvalidation(
            {
              entityId: bobbleheadId,
              entityType: 'bobblehead',
              operation: 'tagAttach',
              userId,
            },
            CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'add'),
          );

          return actionSuccess(
            { attached: tagIds.length, warnings: validation.warnings },
            `${tagIds.length} tag(s) attached successfully`,
          );
        },
        {
          includeResultSummary: (result) =>
            result.wasSuccess ?
              {
                attachedCount: result.data?.attached,
                bobbleheadId,
                warningCount: result.data?.warnings.length,
              }
            : {},
        },
      );
    },
  );

export const detachTagsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.DETACH_FROM_BOBBLEHEAD,
    isTransactionRequired: true,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_REMOVE.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.TAG_REMOVE.WINDOW,
    ),
  )
  .inputSchema(detachTagsSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ detached: number }>> => {
    const { bobbleheadId, tagIds } = detachTagsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;
    const dbInstance = ctx.db;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.TAGS.DETACH_FROM_BOBBLEHEAD,
        contextData: { bobbleheadId, tagCount: tagIds.length },
        contextType: SENTRY_CONTEXTS.BOBBLEHEAD_DATA,
        input: parsedInput,
        operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD,
        userId,
      },
      async () => {
        const success = await TagsFacade.detachFromBobbleheadAsync(bobbleheadId, tagIds, userId, dbInstance);

        if (!success) {
          throw createInternalError(ERROR_MESSAGES.TAG.DETACH_FAILED, {
            bobbleheadId,
            operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD,
            tagIds,
          });
        }

        trackCacheInvalidation(
          {
            entityId: bobbleheadId,
            entityType: 'bobblehead',
            operation: 'tagDetach',
            userId,
          },
          CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'remove'),
        );

        return actionSuccess({ detached: tagIds.length }, `${tagIds.length} tag(s) detached successfully`);
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { bobbleheadId, detachedCount: result.data?.detached } : {},
      },
    );
  });

export const getTagSuggestionsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.GET_SUGGESTIONS,
    isTransactionRequired: false,
  })
  .use(
    createRateLimitMiddleware(
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.SEARCH.REQUESTS,
      CONFIG.RATE_LIMITING.ACTION_SPECIFIC.SEARCH.WINDOW,
    ),
  )
  .inputSchema(getTagSuggestionsSchema)
  .action(async ({ ctx }): Promise<ActionResponse<{ suggestions: Array<TagSuggestion> }>> => {
    const { query } = getTagSuggestionsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    return withActionBreadcrumbs(
      {
        actionName: ACTION_NAMES.TAGS.GET_SUGGESTIONS,
        contextData: { query },
        contextType: SENTRY_CONTEXTS.SEARCH_DATA,
        operation: OPERATIONS.TAGS.SEARCH,
        userId,
      },
      async () => {
        const suggestions = await TagsFacade.getSuggestionsForUserAsync(query, userId);

        return actionSuccess({ suggestions });
      },
      {
        includeResultSummary: (result) =>
          result.wasSuccess ? { query, suggestionCount: result.data?.suggestions.length } : {},
      },
    );
  });

export const bulkDeleteTagsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.BULK_DELETE,
    isTransactionRequired: false,
  })
  .use(
    createRateLimitMiddleware(1, 60), // 1 bulk operation per minute
  )
  .inputSchema(bulkDeleteTagsSchema)
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<ActionResponse<{ deletedCount: number; errors: Array<string>; skippedCount: number }>> => {
      const { tagIds } = bulkDeleteTagsSchema.parse(ctx.sanitizedInput);
      const userId = ctx.userId;

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.TAGS.BULK_DELETE,
          contextData: { count: tagIds.length, tagIds },
          contextType: SENTRY_CONTEXTS.TAG_DATA,
          input: parsedInput,
          operation: OPERATIONS.TAGS.BULK_DELETE,
          userId,
        },
        async () => {
          const result = await TagsFacade.bulkDeleteAsync(tagIds, userId, ctx.db);

          trackCacheInvalidation(
            {
              entityId: `bulk-${tagIds.length}`,
              entityType: 'tag',
              operation: 'bulkDelete',
              userId,
            },
            CacheRevalidationService.admin.onSystemChange(
              'Tags bulk deleted - invalidating search and user tag caches',
            ),
          );

          return actionSuccess(result, `Deleted ${result.deletedCount} tag(s)`);
        },
        {
          includeResultSummary: (result) =>
            result.wasSuccess ?
              {
                deletedCount: result.data?.deletedCount,
                errorCount: result.data?.errors.length,
                skippedCount: result.data?.skippedCount,
              }
            : {},
        },
      );
    },
  );
