'use client';

import type { ComponentProps } from 'react';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import type { CommentTargetType } from '@/lib/constants';
import type { CommentWithDepth } from '@/lib/queries/social/social.query';

import { CommentSection } from '@/components/feature/comments/comment-section';
import {
  createCommentAction,
  deleteCommentAction,
  getCommentsAction,
  updateCommentAction,
} from '@/lib/actions/social/social.actions';

interface CommentSectionClientProps extends Omit<ComponentProps<'div'>, 'children'> {
  currentUserId?: string;
  hasMore?: boolean;
  initialCommentCount: number;
  initialComments: Array<CommentWithDepth>;
  initialLimit?: number;
  isAuthenticated: boolean;
  targetId: string;
  targetType: CommentTargetType;
}

const DEFAULT_COMMENTS_LIMIT = 10;

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
  ...props
}: CommentSectionClientProps) => {
  const router = useRouter();

  // State for pagination
  const [loadedComments, setLoadedComments] = useState(initialComments);
  const [hasMoreComments, setHasMoreComments] = useState(hasMore);
  const [currentOffset, setCurrentOffset] = useState(initialComments.length);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Sync state when initial props change (e.g., after router.refresh() from mutations)
  useEffect(() => {
    setLoadedComments(initialComments);
    setCurrentOffset(initialComments.length);
    setHasMoreComments(hasMore);
  }, [initialComments, hasMore]);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreComments) return;

    setIsLoadingMore(true);
    try {
      const result = await getCommentsAction({
        pagination: {
          limit: initialLimit,
          offset: currentOffset,
        },
        targetId,
        targetType,
      });

      const responseData = result?.data?.data;
      if (responseData) {
        setLoadedComments((prev) => [...prev, ...responseData.comments]);
        setCurrentOffset((prev) => prev + responseData.comments.length);
        setHasMoreComments(responseData.hasMore);
      }
    } catch (error) {
      console.error('Failed to load more comments:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [targetId, targetType, currentOffset, initialLimit, isLoadingMore, hasMoreComments]);

  const handleCommentCreate = useCallback(
    async (content: string, parentCommentId?: string) => {
      const result = await createCommentAction({
        content,
        parentCommentId,
        targetId,
        targetType,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      // Refresh the page to fetch updated comments from server
      router.refresh();
    },
    [targetId, targetType, router],
  );

  const handleCommentUpdate = useCallback(
    async (commentId: string, content: string) => {
      const result = await updateCommentAction({
        commentId,
        content,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      // Refresh the page to fetch updated comments from server
      router.refresh();
    },
    [router],
  );

  const handleCommentDelete = useCallback(
    async (commentId: string) => {
      const result = await deleteCommentAction({ commentId });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      // Refresh the page to fetch updated comments from server
      router.refresh();
    },
    [router],
  );

  return (
    <CommentSection
      comments={loadedComments}
      currentUserId={currentUserId}
      hasMore={hasMoreComments}
      initialCommentCount={initialCommentCount}
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
