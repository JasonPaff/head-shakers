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
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { handleActionError } from '@/lib/utils/action-error-handler';
import { ActionError, ErrorType } from '@/lib/utils/errors';
import { authActionClient, type DatabaseExecutor } from '@/lib/utils/next-safe-action';
import {
  createCommentSchema,
  deleteCommentSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';
import { toggleLikeSchema } from '@/lib/validations/like.validation';

/**
 * Fetch the slug for an entity based on its type and ID.
 * Used for cache path-based revalidation after comment operations.
 *
 * @param targetType - The type of entity ('bobblehead' | 'collection' | 'subcollection')
 * @param targetId - The ID of the entity
 * @param dbInstance - Database instance to use for the query
 * @returns The entity slug if found, undefined otherwise
 */
async function getEntitySlugByTypeAndId(
  targetType: 'bobblehead' | 'collection' | 'subcollection',
  targetId: string,
  dbInstance: DatabaseExecutor,
): Promise<string | undefined> {
  const publicContext = createPublicQueryContext({ dbInstance });

  try {
    switch (targetType) {
      case 'bobblehead': {
        const bobblehead = await BobbleheadsQuery.findByIdAsync(targetId, publicContext);
        return bobblehead?.slug;
      }
      case 'collection': {
        const collection = await CollectionsQuery.findByIdAsync(targetId, publicContext);
        return collection?.slug;
      }
      case 'subcollection':
        // Subcollections use layout-based revalidation, no specific slug needed
        return undefined;
      default:
        return undefined;
    }
  } catch {
    // Silently fail - slug lookup failure should not block the main operation
    return undefined;
  }
}

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

      // Perform cache invalidation synchronously and check result
      const revalidationResult = CacheRevalidationService.social.onLikeChange(
        likeData.targetType === 'subcollection' ? 'collection' : likeData.targetType,
        likeData.targetId,
        ctx.userId,
        result.isLiked ? 'like' : 'unlike',
      );

      // Log cache invalidation failures to Sentry but don't fail the request
      if (!revalidationResult.isSuccess) {
        Sentry.captureException(new Error('Cache invalidation failed for like action'), {
          extra: {
            entityId: likeData.targetId,
            entityType: likeData.targetType,
            error: revalidationResult.error,
            operation: actionType,
            tagsAttempted: revalidationResult.tagsInvalidated,
            userId: ctx.userId,
          },
          level: 'warning',
        });
      }

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
      parentCommentId: commentData.parentCommentId,
      targetId: commentData.targetId,
      targetType: commentData.targetType,
      userId: ctx.userId,
    });

    // Fetch entity slug BEFORE the mutation using base db connection (not transaction)
    // This ensures we have the slug for cache path revalidation even if transaction-scoped queries fail
    const entitySlug = await getEntitySlugByTypeAndId(commentData.targetType, commentData.targetId, ctx.db);

    try {
      // Use createCommentReply for nested comments, createComment for top-level
      const result =
        commentData.parentCommentId ?
          await SocialFacade.createCommentReply(
            {
              content: commentData.content,
              parentCommentId: commentData.parentCommentId,
              targetId: commentData.targetId,
              targetType: commentData.targetType,
            },
            ctx.userId,
            dbInstance,
          )
        : await SocialFacade.createComment(
            {
              content: commentData.content,
              targetId: commentData.targetId,
              targetType: commentData.targetType,
            },
            ctx.userId,
            dbInstance,
          );

      if (!result.isSuccessful) {
        // Provide user-friendly error messages based on error type from facade
        let errorMessage: string = ERROR_MESSAGES.COMMENTS.COMMENT_FAILED;

        if (result.error && typeof result.error === 'string') {
          // Map facade error messages to user-friendly messages
          if (result.error.includes('Parent comment not found')) {
            errorMessage = 'The comment you are replying to no longer exists.';
          } else if (result.error.includes('deleted')) {
            errorMessage = 'Cannot reply to a deleted comment.';
          } else if (result.error.includes('same target')) {
            errorMessage = 'Cannot reply to this comment. Please refresh and try again.';
          } else if (result.error.includes('Maximum nesting depth')) {
            errorMessage =
              'Cannot reply to this comment. The conversation thread has reached its maximum depth.';
          }
        }

        throw new ActionError(
          ErrorType.BUSINESS_RULE,
          ERROR_CODES.COMMENTS.COMMENT_FAILED,
          errorMessage,
          { ctx, operation: OPERATIONS.COMMENTS.CREATE_COMMENT },
          true, // recoverable
          400,
        );
      }

      const isReply = Boolean(commentData.parentCommentId);
      Sentry.addBreadcrumb({
        category: SENTRY_BREADCRUMB_CATEGORIES.BUSINESS_LOGIC,
        data: {
          commentId: result.comment?.id,
          isReply,
          parentCommentId: commentData.parentCommentId,
          targetId: commentData.targetId,
          targetType: commentData.targetType,
        },
        level: SENTRY_LEVELS.INFO,
        message: `User created ${isReply ? 'reply' : 'comment'} on ${commentData.targetType} ${commentData.targetId}`,
      });

      CacheRevalidationService.social.onCommentChange(
        commentData.targetType === 'subcollection' ? 'collection' : commentData.targetType,
        commentData.targetId,
        ctx.userId,
        'add',
        entitySlug,
        result.comment?.id,
        commentData.parentCommentId,
      );

      return {
        data: result.comment,
        message: isReply ? 'Reply added successfully' : 'Comment added successfully',
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

    // Fetch comment details BEFORE the mutation to get targetType/targetId for slug lookup
    // Use base db connection (not transaction) to ensure we can get the slug for cache invalidation
    const existingComment = await SocialFacade.getCommentById(updateData.commentId, ctx.userId, ctx.db);
    const entitySlug =
      existingComment?.comment ?
        await getEntitySlugByTypeAndId(
          existingComment.comment.targetType,
          existingComment.comment.targetId,
          ctx.db,
        )
      : undefined;

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
          entitySlug,
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

    // Get comment details BEFORE deletion using base db connection (not transaction)
    // This ensures we have the data needed for cache invalidation
    const commentResult = await SocialFacade.getCommentById(deleteData.commentId, ctx.userId, ctx.db);
    const entitySlug =
      commentResult?.comment ?
        await getEntitySlugByTypeAndId(
          commentResult.comment.targetType,
          commentResult.comment.targetId,
          ctx.db,
        )
      : undefined;

    try {
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
          entitySlug,
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
