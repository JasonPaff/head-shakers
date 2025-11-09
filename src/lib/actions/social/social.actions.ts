'use server';

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';

import {
  ACTION_NAMES,
  ENUMS,
  ERROR_CODES,
  ERROR_MESSAGES,
  OPERATIONS,
  SENTRY_BREADCRUMB_CATEGORIES,
  SENTRY_CONTEXTS,
  SENTRY_LEVELS,
} from '@/lib/constants';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentByIdSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';
import {
  getBatchLikeDataSchema,
  getLikeStatusSchema,
  toggleLikeSchema,
} from '@/lib/validations/like.validation';

export const toggleLikeAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
    isTransactionRequired: true,
  })
  .inputSchema(toggleLikeSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = toggleLikeSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.LIKE_DATA, {
      targetId: likeData.targetId,
      targetType: likeData.targetType,
      userId: ctx.userId,
    });

    try {
      const result = await SocialFacade.toggleLike(
        likeData.targetId,
        likeData.targetType,
        ctx.userId,
        dbInstance,
      );

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.SOCIAL.LIKE_FAILED,
          ERROR_MESSAGES.SOCIAL.LIKE_FAILED,
          { ctx, operation: OPERATIONS.SOCIAL.TOGGLE_LIKE },
          true, // recoverable
          400,
        );
      }

      const actionType = result.isLiked ? 'liked' : 'unliked';

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          actionType,
          likeCount: result.likeCount,
          targetId: likeData.targetId,
          targetType: likeData.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User ${actionType} ${likeData.targetType} ${likeData.targetId}`,
      });

      CacheRevalidationService.social.onLikeChange(
        likeData.targetType === 'subcollection' ? 'collection' : likeData.targetType,
        likeData.targetId,
        ctx.userId,
        result.isLiked ? 'like' : 'unlike',
      );

      return {
        data: {
          isLiked: result.isLiked,
          likeCount: result.likeCount,
          likeId: result.likeId,
        },
        message:
          result.isLiked ?
            `Added to liked ${likeData.targetType}s`
          : `Removed from liked ${likeData.targetType}s`,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
        userId: ctx.userId,
      });
    }
  });

export const getContentLikeDataAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getLikeStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = getLikeStatusSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const result = await SocialFacade.getContentLikeData(
        likeData.targetId,
        likeData.targetType,
        ctx.userId,
        dbInstance,
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUS,
        userId: ctx.userId,
      });
    }
  });

export const getBatchContentLikeDataAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getBatchLikeDataSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = getBatchLikeDataSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    try {
      const results = await SocialFacade.getBatchContentLikeData(batchData.targets, ctx.userId, dbInstance);

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_USER_LIKE_STATUSES,
        userId: ctx.userId,
      });
    }
  });

export const getPublicLikeCountAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getLikeStatusSchema)
  .action(async ({ ctx, parsedInput }) => {
    const likeData = getLikeStatusSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const likeCount = await SocialFacade.getLikeCount(likeData.targetId, likeData.targetType, dbInstance);

      return {
        data: {
          likeCount,
          targetId: likeData.targetId,
          targetType: likeData.targetType,
        },
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNT,
      });
    }
  });

export const getPublicBatchLikeCountsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(getBatchLikeDataSchema)
  .action(async ({ ctx, parsedInput }) => {
    const batchData = getBatchLikeDataSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getBatchContentLikeData(batchData.targets, undefined, dbInstance);

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_LIKE_COUNTS,
      });
    }
  });

export const getTrendingContentAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.SOCIAL.LIKE,
  })
  .inputSchema(
    z.object({
      limit: z.number().min(1).max(50).default(10),
      targetType: z.enum(ENUMS.LIKE.TARGET_TYPE),
    }),
  )
  .action(async ({ ctx, parsedInput }) => {
    const trendingData = parsedInput;
    const dbInstance = ctx.db;

    try {
      const results = await SocialFacade.getTrendingContent(
        trendingData.targetType,
        { limit: trendingData.limit },
        undefined,
        dbInstance,
      );

      return {
        data: results,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
        },
        operation: OPERATIONS.SOCIAL.GET_TRENDING_CONTENT,
      });
    }
  });

// ==================== Comment Actions ====================

export const createCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(createCommentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const commentData = createCommentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COMMENT_DATA, {
      targetId: commentData.targetId,
      targetType: commentData.targetType,
      userId: ctx.userId,
    });

    try {
      const result = await SocialFacade.createComment(
        {
          content: commentData.content,
          targetId: commentData.targetId,
          targetType: commentData.targetType,
        },
        ctx.userId,
        dbInstance,
      );

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.COMMENTS.COMMENT_FAILED,
          ERROR_MESSAGES.COMMENTS.COMMENT_FAILED,
          { ctx, operation: OPERATIONS.COMMENTS.CREATE_COMMENT },
          true, // recoverable
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          commentId: result.comment?.id,
          targetId: commentData.targetId,
          targetType: commentData.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User created comment on ${commentData.targetType} ${commentData.targetId}`,
      });

      CacheRevalidationService.social.onCommentChange(
        commentData.targetType === 'subcollection' ? 'collection' : commentData.targetType,
        commentData.targetId,
        ctx.userId,
        'add',
      );

      return {
        data: result.comment,
        message: 'Comment added successfully',
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COMMENTS.CREATE,
        },
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId: ctx.userId,
      });
    }
  });

export const updateCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.UPDATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateCommentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const updateData = updateCommentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COMMENT_DATA, {
      commentId: updateData.commentId,
      userId: ctx.userId,
    });

    try {
      const result = await SocialFacade.updateComment(
        updateData.commentId,
        updateData.content,
        ctx.userId,
        dbInstance,
      );

      if (!result.isSuccessful) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.COMMENTS.COMMENT_UPDATE_FAILED,
          ERROR_MESSAGES.COMMENTS.COMMENT_UPDATE_FAILED,
          { ctx, operation: OPERATIONS.COMMENTS.UPDATE_COMMENT },
          true, // recoverable
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          commentId: updateData.commentId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User updated comment ${updateData.commentId}`,
      });

      if (result.comment) {
        CacheRevalidationService.social.onCommentChange(
          result.comment.targetType === 'subcollection' ? 'collection' : result.comment.targetType,
          result.comment.targetId,
          ctx.userId,
          'update',
        );
      }

      return {
        data: result.comment,
        message: 'Comment updated successfully',
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COMMENTS.UPDATE,
        },
        operation: OPERATIONS.COMMENTS.UPDATE_COMMENT,
        userId: ctx.userId,
      });
    }
  });

export const deleteCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteCommentSchema)
  .action(async ({ ctx, parsedInput }) => {
    const deleteData = deleteCommentSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.tx ?? ctx.db;

    Sentry.setContext(SENTRY_CONTEXTS.COMMENT_DATA, {
      commentId: deleteData.commentId,
      userId: ctx.userId,
    });

    try {
      // Get comment details before deletion for cache invalidation
      const commentResult = await SocialFacade.getCommentById(deleteData.commentId, ctx.userId, dbInstance);

      const result = await SocialFacade.deleteComment(deleteData.commentId, ctx.userId, dbInstance);

      if (!result) {
        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.COMMENTS.COMMENT_DELETE_FAILED,
          ERROR_MESSAGES.COMMENTS.COMMENT_DELETE_FAILED,
          { ctx, operation: OPERATIONS.COMMENTS.DELETE_COMMENT },
          true, // recoverable
          400,
        );
      }

      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          commentId: deleteData.commentId,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User deleted comment ${deleteData.commentId}`,
      });

      if (commentResult?.comment) {
        CacheRevalidationService.social.onCommentChange(
          commentResult.comment.targetType === 'subcollection' ? 'collection' : commentResult.comment.targetType,
          commentResult.comment.targetId,
          ctx.userId,
          'delete',
        );
      }

      return {
        data: { success: true },
        message: 'Comment deleted successfully',
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COMMENTS.DELETE,
        },
        operation: OPERATIONS.COMMENTS.DELETE_COMMENT,
        userId: ctx.userId,
      });
    }
  });

export const getCommentsAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.GET_LIST,
  })
  .inputSchema(getCommentsSchema)
  .action(async ({ ctx, parsedInput }) => {
    const queryData = getCommentsSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const result = await SocialFacade.getComments(
        queryData.targetId,
        queryData.targetType,
        {
          limit: queryData.pagination.limit,
          offset: queryData.pagination.offset,
        },
        ctx.userId,
        dbInstance,
      );

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COMMENTS.GET_LIST,
        },
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: ctx.userId,
      });
    }
  });

export const getCommentByIdAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.GET_BY_ID,
  })
  .inputSchema(getCommentByIdSchema)
  .action(async ({ ctx, parsedInput }) => {
    const queryData = getCommentByIdSchema.parse(ctx.sanitizedInput);
    const dbInstance = ctx.db;

    try {
      const result = await SocialFacade.getCommentById(queryData.commentId, ctx.userId, dbInstance);

      if (!result) {
        throw new ActionError(
          ErrorType.NOT_FOUND,
          ERROR_CODES.COMMENTS.COMMENT_NOT_FOUND,
          ERROR_MESSAGES.COMMENTS.COMMENT_NOT_FOUND,
          { ctx, operation: OPERATIONS.COMMENTS.GET_COMMENTS },
          true, // recoverable
          404,
        );
      }

      return {
        data: result,
        success: true,
      };
    } catch (error) {
      handleActionError(error, {
        input: parsedInput,
        metadata: {
          actionName: ACTION_NAMES.COMMENTS.GET_BY_ID,
        },
        operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        userId: ctx.userId,
      });
    }
  });
