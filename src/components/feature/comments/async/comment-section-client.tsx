'use client';

import type { ComponentProps } from 'react';

import { useCallback, useEffect, useState } from 'react';

import type { CommentTargetType } from '@/lib/constants';
import type { CommentWithDepth, CommentWithUser } from '@/lib/queries/social/social.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CommentSection } from '@/components/feature/comments/comment-section';
import { useAdminRole } from '@/hooks/use-admin-role';
import { useServerAction } from '@/hooks/use-server-action';
import {
  createCommentAction,
  deleteCommentAction,
  getCommentsAction,
  updateCommentAction,
} from '@/lib/actions/social/social.actions';

type CommentSectionClientProps = ComponentTestIdProps &
  Omit<ComponentProps<'div'>, 'children'> & {
    currentUserId?: string;
    hasMore?: boolean;
    initialCommentCount: number;
    initialComments: Array<CommentWithDepth>;
    initialLimit?: number;
    isAuthenticated: boolean;
    targetId: string;
    targetType: CommentTargetType;
  };

const DEFAULT_COMMENTS_LIMIT = 10;

/**
 * Helper function to insert a reply into the correct position in the nested comment tree
 */
const addReplyToComment = (
  comments: Array<CommentWithDepth>,
  parentCommentId: string,
  newComment: CommentWithUser,
): Array<CommentWithDepth> => {
  return comments.map((comment) => {
    if (comment.id === parentCommentId) {
      // Found the parent, add reply to its replies array
      const newReply: CommentWithDepth = {
        ...newComment,
        depth: comment.depth + 1,
        replies: [],
      };
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply],
      };
    }
    // Recursively search in replies
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: addReplyToComment(comment.replies, parentCommentId, newComment),
      };
    }
    return comment;
  });
};

/**
 * Client wrapper for CommentSection that wires up server actions
 * Handles mutations, pagination, and manages optimistic updates
 */
export const CommentSectionClient = ({
  currentUserId,
  hasMore = false,
  initialCommentCount,
  initialComments,
  initialLimit = DEFAULT_COMMENTS_LIMIT,
  isAuthenticated,
  targetId,
  targetType,
  testId,
  ...props
}: CommentSectionClientProps) => {
  // 1. useState hooks
  const [loadedComments, setLoadedComments] = useState(initialComments);
  const [hasMoreComments, setHasMoreComments] = useState(hasMore);
  const [currentOffset, setCurrentOffset] = useState(initialComments.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 2. Other hooks
  const { isAdmin } = useAdminRole();

  const { executeAsync: executeGetComments } = useServerAction(getCommentsAction, {
    breadcrumbContext: {
      action: 'load-more-comments',
      component: 'comment-section-client',
    },
    isDisableToast: true,
  });

  const { executeAsync: executeCreateComment } = useServerAction(createCommentAction, {
    breadcrumbContext: {
      action: 'create-comment',
      component: 'comment-section-client',
    },
    loadingMessage: 'Posting comment...',
  });

  const { executeAsync: executeUpdateComment } = useServerAction(updateCommentAction, {
    breadcrumbContext: {
      action: 'update-comment',
      component: 'comment-section-client',
    },
    loadingMessage: 'Updating comment...',
  });

  const { executeAsync: executeDeleteComment } = useServerAction(deleteCommentAction, {
    breadcrumbContext: {
      action: 'delete-comment',
      component: 'comment-section-client',
    },
    loadingMessage: 'Deleting comment...',
  });

  // 4. useEffect hooks - Sync state when initial props change
  useEffect(() => {
    setLoadedComments(initialComments);
    setCurrentOffset(initialComments.length);
    setHasMoreComments(hasMore);
  }, [initialComments, hasMore]);

  // 6. Event handlers
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreComments) return;

    setIsLoadingMore(true);
    try {
      const responseData = await executeGetComments({
        pagination: {
          limit: initialLimit,
          offset: currentOffset,
        },
        targetId,
        targetType,
      });

      if (responseData) {
        setLoadedComments((prev) => [...prev, ...responseData.comments]);
        setCurrentOffset((prev) => prev + responseData.comments.length);
        setHasMoreComments(responseData.hasMore);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [targetId, targetType, currentOffset, initialLimit, isLoadingMore, hasMoreComments, executeGetComments]);

  const handleCommentCreate = useCallback(
    async (content: string, parentCommentId?: string) => {
      const createdComment = await executeCreateComment({
        content,
        parentCommentId,
        targetId,
        targetType,
      });

      if (createdComment) {
        // Optimistically add the new comment to local state
        if (parentCommentId) {
          // For replies, insert into the correct parent in the nested structure
          setLoadedComments((prev) => addReplyToComment(prev, parentCommentId, createdComment));
        } else {
          // For top-level comments, prepend to the list
          setLoadedComments((prev) => [{ ...createdComment, depth: 0, replies: [] }, ...prev]);
        }
      }
    },
    [targetId, targetType, executeCreateComment],
  );

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string) => {
      await executeUpdateComment({
        commentId,
        content,
      });
    },
    [executeUpdateComment],
  );

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      await executeDeleteComment({ commentId });
    },
    [executeDeleteComment],
  );

  // 7. Derived variables
  const componentTestId = testId ?? 'feature-comment-section-client';

  return (
    <CommentSection
      comments={loadedComments}
      currentUserId={currentUserId}
      data-slot={'comment-section-client'}
      data-testid={componentTestId}
      hasMore={hasMoreComments}
      initialCommentCount={initialCommentCount}
      isAdmin={isAdmin}
      isAuthenticated={isAuthenticated}
      isLoading={isLoadingMore}
      onCommentCreate={handleCommentCreate}
      onCommentDelete={handleCommentDelete}
      onCommentUpdate={handleCommentUpdate}
      onLoadMore={handleLoadMore}
      {...props}
    />
  );
};
