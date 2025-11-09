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
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient } from '@/lib/utils/next-safe-action';
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';
import { toggleLikeSchema } from '@/lib/validations/like.validation';

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
          commentResult.comment.targetType === 'subcollection' ?
            'collection'
          : commentResult.comment.targetType,
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
