'use client';

import type { ComponentProps } from 'react';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import type { CommentTargetType } from '@/lib/constants';
import type { CommentWithDepth } from '@/lib/queries/social/social.query';

import { CommentSection } from '@/components/feature/comments/comment-section';
import {
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
} from '@/lib/actions/social/social.actions';

interface CommentSectionClientProps extends Omit<ComponentProps<'div'>, 'children'> {
  currentUserId?: string;
  hasMore?: boolean;
  initialCommentCount: number;
  initialComments: Array<CommentWithDepth>;
  isAuthenticated: boolean;
  targetId: string;
  targetType: CommentTargetType;
}

/**
 * Client wrapper for CommentSection that wires up server actions
 * Handles mutations and manages optimistic updates
 */
export const CommentSectionClient = ({
  currentUserId,
  hasMore = false,
  initialCommentCount,
  initialComments,
  isAuthenticated,
  targetId,
  targetType,
  ...props
}: CommentSectionClientProps) => {
  const router = useRouter();

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
      comments={initialComments}
      currentUserId={currentUserId}
      hasMore={hasMore}
      initialCommentCount={initialCommentCount}
      isAuthenticated={isAuthenticated}
      onCommentCreate={handleCommentCreate}
      onCommentDelete={handleCommentDelete}
      onCommentUpdate={handleCommentUpdate}
      {...props}
    />
  );
};
