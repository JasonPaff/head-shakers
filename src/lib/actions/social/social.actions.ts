'use server';

import 'server-only';

import type { CommentWithDepth, CommentWithUser } from '@/lib/queries/social/social.query';
import type { ActionResponse } from '@/lib/utils/action-response';

import { ACTION_NAMES, ERROR_MESSAGES, OPERATIONS, SENTRY_CONTEXTS } from '@/lib/constants';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { createPublicQueryContext } from '@/lib/queries/base/query-context';
import { BobbleheadsQuery } from '@/lib/queries/bobbleheads/bobbleheads-query';
import { CollectionsQuery } from '@/lib/queries/collections/collections.query';
import { CacheRevalidationService } from '@/lib/services/cache-revalidation.service';
import { actionFailure, actionSuccess } from '@/lib/utils/action-response';
import { authActionClient, type DatabaseExecutor, publicActionClient } from '@/lib/utils/next-safe-action';
import {
  actionBreadcrumb,
  withActionBreadcrumbs,
  withActionErrorHandling,
} from '@/lib/utils/sentry-server/breadcrumbs.server';
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentsSchema,
  updateCommentSchema,
} from '@/lib/validations/comment.validation';
import { toggleLikeSchema } from '@/lib/validations/like.validation';

/**
 * Fetch the slug for an entity based on its type and ID.
 * Used for cache path-based revalidation after comment operations.
 *
 * @param targetType - The type of entity ('bobblehead' | 'collection')
 * @param targetId - The ID of the entity
 * @param dbInstance - Database instance to use for the query
 * @returns The entity slug if found, undefined otherwise
 */
async function getEntitySlugByTypeAndId(
  targetType: 'bobblehead' | 'collection',
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
        const collection = await CollectionsQuery.getByIdAsync(targetId, publicContext);
        return collection?.slug;
      }
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
  .action(
    async ({
      ctx,
      parsedInput,
    }): Promise<ActionResponse<{ isLiked: boolean; likeCount: number; likeId: null | string }>> => {
      const likeData = toggleLikeSchema.parse(ctx.sanitizedInput);

      return withActionErrorHandling(
        {
          actionName: ACTION_NAMES.SOCIAL.LIKE,
          contextData: {
            targetId: likeData.targetId,
            targetType: likeData.targetType,
          },
          contextType: SENTRY_CONTEXTS.LIKE_DATA,
          input: parsedInput,
          operation: OPERATIONS.SOCIAL.TOGGLE_LIKE,
          userId: ctx.userId,
        },
        async () => {
          const result = await SocialFacade.toggleLikeAsync(
            likeData.targetId,
            likeData.targetType,
            ctx.userId,
            ctx.db,
          );

          if (!result.isSuccessful) {
            return actionFailure(ERROR_MESSAGES.SOCIAL.LIKE_FAILED);
          }

          const actionType = result.isLiked ? 'like' : 'unlike';

          CacheRevalidationService.social.onLikeChange(
            likeData.targetType,
            likeData.targetId,
            ctx.userId,
            actionType,
          );

          return actionSuccess(
            {
              isLiked: result.isLiked,
              likeCount: result.likeCount,
              likeId: result.likeId,
            },
            result.isLiked ?
              `Added to liked ${likeData.targetType}s`
            : `Removed from liked ${likeData.targetType}s`,
          );
        },
        {
          includeResultSummary: (r) =>
            r.wasSuccess ?
              {
                isLiked: r.data?.isLiked,
                likeCount: r.data?.likeCount,
                targetId: likeData.targetId,
                targetType: likeData.targetType,
              }
            : {},
        },
      );
    },
  );

// ==================== Comment Actions ====================

export const createCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.CREATE,
    isTransactionRequired: true,
  })
  .inputSchema(createCommentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CommentWithUser | null>> => {
    const commentData = createCommentSchema.parse(ctx.sanitizedInput);

    // Fetch entity slug BEFORE the mutation using base db connection (not transaction)
    // This ensures we have the slug for cache path revalidation even if transaction-scoped queries fail
    const entitySlug = await getEntitySlugByTypeAndId(commentData.targetType, commentData.targetId, ctx.db);

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COMMENTS.CREATE,
        contextData: {
          parentCommentId: commentData.parentCommentId,
          targetId: commentData.targetId,
          targetType: commentData.targetType,
        },
        contextType: SENTRY_CONTEXTS.COMMENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.COMMENTS.CREATE_COMMENT,
        userId: ctx.userId,
      },
      async () => {
        // Use createCommentReply for nested comments, createComment for top-level
        const result =
          commentData.parentCommentId ?
            await SocialFacade.createCommentReplyAsync(
              {
                content: commentData.content,
                parentCommentId: commentData.parentCommentId,
                targetId: commentData.targetId,
                targetType: commentData.targetType,
              },
              ctx.userId,
              ctx.db,
            )
          : await SocialFacade.createCommentAsync(
              {
                content: commentData.content,
                targetId: commentData.targetId,
                targetType: commentData.targetType,
              },
              ctx.userId,
              ctx.db,
            );

        if (!result.isSuccessful) {
          // Map facade error messages to user-friendly messages
          let errorMessage: string = ERROR_MESSAGES.COMMENTS.COMMENT_FAILED;

          if (result.error && typeof result.error === 'string') {
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

          actionBreadcrumb('Comment creation failed', { error: result.error }, 'warning');
          return actionFailure(errorMessage);
        }

        const isReply = Boolean(commentData.parentCommentId);

        CacheRevalidationService.social.onCommentChange(
          commentData.targetType,
          commentData.targetId,
          ctx.userId,
          'add',
          entitySlug,
          result.comment?.id,
          commentData.parentCommentId,
        );

        return actionSuccess(
          result.comment,
          isReply ? 'Reply added successfully' : 'Comment added successfully',
        );
      },
      {
        includeResultSummary: (r) =>
          r.wasSuccess ?
            {
              commentId: r.data?.id,
              isReply: Boolean(commentData.parentCommentId),
              targetId: commentData.targetId,
              targetType: commentData.targetType,
            }
          : {},
      },
    );
  });

export const updateCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.UPDATE,
    isTransactionRequired: true,
  })
  .inputSchema(updateCommentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<CommentWithUser | null>> => {
    const updateData = updateCommentSchema.parse(ctx.sanitizedInput);

    // Fetch comment details BEFORE the mutation to get targetType/targetId for slug lookup
    // Use base db connection (not transaction) to ensure we can get the slug for cache invalidation
    const existingComment = await SocialFacade.getCommentByIdAsync(updateData.commentId, ctx.userId, ctx.db);
    const entitySlug =
      existingComment?.comment ?
        await getEntitySlugByTypeAndId(
          existingComment.comment.targetType,
          existingComment.comment.targetId,
          ctx.db,
        )
      : undefined;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COMMENTS.UPDATE,
        contextData: {
          commentId: updateData.commentId,
        },
        contextType: SENTRY_CONTEXTS.COMMENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.COMMENTS.UPDATE_COMMENT,
        userId: ctx.userId,
      },
      async () => {
        const result = await SocialFacade.updateCommentAsync(
          updateData.commentId,
          updateData.content,
          ctx.userId,
          ctx.db,
        );

        if (!result.isSuccessful) {
          const isEditWindowExpired = result.error === 'Edit window expired';
          const errorMessage =
            isEditWindowExpired ?
              ERROR_MESSAGES.COMMENTS.COMMENT_EDIT_WINDOW_EXPIRED
            : ERROR_MESSAGES.COMMENTS.COMMENT_UPDATE_FAILED;

          actionBreadcrumb('Comment update failed', { error: result.error }, 'warning');
          return actionFailure(errorMessage);
        }

        if (result.comment) {
          CacheRevalidationService.social.onCommentChange(
            result.comment.targetType,
            result.comment.targetId,
            ctx.userId,
            'update',
            entitySlug,
          );
        }

        return actionSuccess(result.comment, 'Comment updated successfully');
      },
      {
        includeResultSummary: (r) =>
          r.wasSuccess ?
            {
              commentId: updateData.commentId,
            }
          : {},
      },
    );
  });

export const deleteCommentAction = authActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.DELETE,
    isTransactionRequired: true,
  })
  .inputSchema(deleteCommentSchema)
  .action(async ({ ctx, parsedInput }): Promise<ActionResponse<{ success: boolean }>> => {
    const deleteData = deleteCommentSchema.parse(ctx.sanitizedInput);

    // Get comment details BEFORE deletion using base db connection (not transaction)
    // This ensures we have the data needed for cache invalidation
    const commentResult = await SocialFacade.getCommentByIdAsync(deleteData.commentId, ctx.userId, ctx.db);
    const entitySlug =
      commentResult?.comment ?
        await getEntitySlugByTypeAndId(
          commentResult.comment.targetType,
          commentResult.comment.targetId,
          ctx.db,
        )
      : undefined;

    return withActionErrorHandling(
      {
        actionName: ACTION_NAMES.COMMENTS.DELETE,
        contextData: {
          commentId: deleteData.commentId,
        },
        contextType: SENTRY_CONTEXTS.COMMENT_DATA,
        input: parsedInput,
        operation: OPERATIONS.COMMENTS.DELETE_COMMENT,
        userId: ctx.userId,
      },
      async () => {
        const result = await SocialFacade.deleteCommentAsync(deleteData.commentId, ctx.userId, ctx.db);

        if (!result) {
          actionBreadcrumb('Comment deletion failed', { commentId: deleteData.commentId }, 'warning');
          return actionFailure(ERROR_MESSAGES.COMMENTS.COMMENT_DELETE_FAILED);
        }

        if (commentResult?.comment) {
          CacheRevalidationService.social.onCommentChange(
            commentResult.comment.targetType,
            commentResult.comment.targetId,
            ctx.userId,
            'delete',
            entitySlug,
          );
        }

        return actionSuccess({ success: true }, 'Comment deleted successfully');
      },
      {
        includeResultSummary: (r) =>
          r.wasSuccess ?
            {
              commentId: deleteData.commentId,
            }
          : {},
      },
    );
  });

// ==================== Get Comments Action ====================

/**
 * Public action to fetch comments with pagination
 * Does not require authentication since comments are publicly viewable
 */
export const getCommentsAction = publicActionClient
  .metadata({
    actionName: ACTION_NAMES.COMMENTS.GET_LIST,
    isTransactionRequired: false,
  })
  .inputSchema(getCommentsSchema)
  .action(
    async ({
      ctx,
    }): Promise<ActionResponse<{ comments: Array<CommentWithDepth>; hasMore: boolean; total: number }>> => {
      const input = getCommentsSchema.parse(ctx.sanitizedInput);

      return withActionBreadcrumbs(
        {
          actionName: ACTION_NAMES.COMMENTS.GET_LIST,
          operation: OPERATIONS.COMMENTS.GET_COMMENTS,
        },
        async () => {
          const result = await SocialFacade.getCommentsWithRepliesAsync(
            input.targetId,
            input.targetType,
            {
              limit: input.pagination?.limit,
              offset: input.pagination?.offset,
            },
            undefined, // viewerUserId - public access
            ctx.db,
          );

          return actionSuccess({
            comments: result.comments,
            hasMore: result.hasMore,
            total: result.total,
          });
        },
        {
          includeResultSummary: (r) =>
            r.wasSuccess ?
              {
                count: r.data?.comments.length,
                hasMore: r.data?.hasMore,
                targetId: input.targetId,
                targetType: input.targetType,
                total: r.data?.total,
              }
            : {},
        },
      );
    },
  );
