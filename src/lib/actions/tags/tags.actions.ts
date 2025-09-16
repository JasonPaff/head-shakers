'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';

import {
  ACTION_NAMES,
  CONFIG,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { TagsFacade } from '@/lib/facades/tags/tags.facade';
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit.middleware';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  attachTagsSchema,
  bulkDeleteTagsSchema,
  deleteTagSchema,
  detachTagsSchema,
  getTagSuggestionsSchema,
  insertTagSchema,
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
  .action(async ({ ctx, parsedInput }) => {
    const tagData = insertTagSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, tagData);

    try {
      const newTag = await TagsFacade.createTag(tagData, userId, ctx.db);

      if (!newTag) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.TAGS.CREATE_FAILED,
          ERROR_MESSAGES.TAG.CREATE_FAILED,
          { ctx, operation: OPERATIONS.TAGS.CREATE },
          false,
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          tag: newTag,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Created tag: ${newTag.name}`,
      });

      return {
        data: newTag,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.CREATE,
        },
        operation: OPERATIONS.TAGS.CREATE,
        userId: ctx.userId,
      });
    }
  });

export const updateTagAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.UPDATE,
    isTransactionRequired: false,
  })
  .inputSchema(updateTagActionSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { tagId, ...updateData } = updateTagActionSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, { tagId, ...updateData });

    try {
      const updatedTag = await TagsFacade.updateTag(tagId, updateData, userId, ctx.db);

      if (!updatedTag) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.TAGS.UPDATE_FAILED,
          ERROR_MESSAGES.TAG.UPDATE_FAILED,
          { ctx, operation: OPERATIONS.TAGS.UPDATE },
          false,
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          tag: updatedTag,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Updated tag: ${updatedTag.name}`,
      });

      return {
        data: updatedTag,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.UPDATE,
        },
        operation: OPERATIONS.TAGS.UPDATE,
        userId: ctx.userId,
      });
    }
  });

export const deleteTagAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.TAGS.DELETE,
    isTransactionRequired: false,
  })
  .inputSchema(deleteTagSchema)
  .action(async ({ ctx, parsedInput }) => {
    const { tagId } = deleteTagSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, { tagId });

    try {
      const deleted = await TagsFacade.deleteTag(tagId, userId, ctx.db);

      if (!deleted) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.TAGS.DELETE_FAILED,
          ERROR_MESSAGES.TAG.DELETE_FAILED,
          { ctx, operation: OPERATIONS.TAGS.DELETE },
          false,
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          tagId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Deleted tag: ${tagId}`,
      });

      return {
        data: { deleted: true },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.DELETE,
        },
        operation: OPERATIONS.TAGS.DELETE,
        userId: ctx.userId,
      });
    }
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
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId, tagIds } = attachTagsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, { bobbleheadId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, { tagIds });

    try {
      const validation = await TagsFacade.validateTagsForBobblehead(bobbleheadId, tagIds, userId, dbInstance);

      if (!validation.canCreate) {
        throw new ActionError(
          ErrorType.VALIDATION,
          ERROR_CODES.TAGS.ATTACH_FAILED,
          validation.errors.join(', '),
          { ctx, operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD },
          false,
          400,
        );
      }

      const success = await TagsFacade.attachToBobblehead(bobbleheadId, tagIds, userId, dbInstance);

      if (!success) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.TAGS.ATTACH_FAILED,
          ERROR_MESSAGES.TAG.ATTACH_FAILED,
          { ctx, operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadId,
          tagIds,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Attached ${tagIds.length} tags to bobblehead`,
      });

      CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'add');

      return {
        data: { attached: tagIds.length, warnings: validation.warnings },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.ATTACH_TO_BOBBLEHEAD,
        },
        operation: OPERATIONS.TAGS.ATTACH_TO_BOBBLEHEAD,
        userId: ctx.userId,
      });
    }
  });

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
  .action(async ({ ctx, parsedInput }) => {
    const { bobbleheadId, tagIds } = detachTagsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.BOBBLEHEAD_DATA, { bobbleheadId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, { tagIds });

    try {
      const success = await TagsFacade.detachFromBobblehead(bobbleheadId, tagIds, userId, dbInstance);

      if (!success) {
        throw new ActionError(
          ErrorType.INTERNAL,
          ERROR_CODES.TAGS.DETACH_FAILED,
          ERROR_MESSAGES.TAG.DETACH_FAILED,
          { ctx, operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD },
          false,
          500,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          bobbleheadId,
          tagIds,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Detached ${tagIds.length} tags from bobblehead`,
      });

      CacheRevalidationService.bobbleheads.onTagChange(bobbleheadId, userId, 'remove');

      return {
        data: { detached: tagIds.length },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.DETACH_FROM_BOBBLEHEAD,
        },
        operation: OPERATIONS.TAGS.DETACH_FROM_BOBBLEHEAD,
        userId: ctx.userId,
      });
    }
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
  .action(async ({ ctx, parsedInput }) => {
    const { query } = getTagSuggestionsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.SEARCH_DATA, { query });

    try {
      const suggestions = await TagsFacade.getSuggestionsForUser(query, userId);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          query,
          resultCount: suggestions.length,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Retrieved ${suggestions.length} tag suggestions`,
      });

      return {
        data: { suggestions },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.GET_SUGGESTIONS,
        },
        operation: OPERATIONS.TAGS.SEARCH,
        userId: ctx.userId,
      });
    }
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
  .action(async ({ ctx, parsedInput }) => {
    const { tagIds } = bulkDeleteTagsSchema.parse(ctx.sanitizedInput);
    const userId = ctx.userId;

    Sentry.setContext(SENTRY_CONTEXTS.USER_DATA, { userId });
    Sentry.setContext(SENTRY_CONTEXTS.TAG_DATA, { count: tagIds.length, tagIds });

    try {
      const result = await TagsFacade.bulkDelete(tagIds, userId, ctx.db);

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          deletedCount: result.deletedCount,
          skippedCount: result.skippedCount,
          tagIds,
        },
        level: SENTRY_LEVELS.INFO,
        message: `Bulk deleted ${result.deletedCount} tags`,
      });

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.TAGS.BULK_DELETE,
        },
        operation: OPERATIONS.TAGS.BULK_DELETE,
        userId: ctx.userId,
      });
    }
  });
