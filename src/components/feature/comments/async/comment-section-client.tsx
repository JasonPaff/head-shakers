'use client';

import type { ComponentProps } from 'react';

import { useCallback } from 'react';

import type { CommentWithUser } from '@/components/feature/comments/comment-item';
import type { CommentTargetType } from '@/lib/constants';

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
  initialComments: Array<CommentWithUser>;
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
  const handleCommentCreate = useCallback(
    async (content: string) => {
      const result = await createCommentAction({
        content,
        targetId,
        targetType,
      });

      if (result?.serverError) {
        throw new Error(result.serverError);
      }
      // Page will automatically revalidate via revalidatePath() in the server action
    },
    [targetId, targetType],
  );

  const handleCommentUpdate = useCallback(async (commentId: string, content: string) => {
    const result = await updateCommentAction({
      commentId,
      content,
    });

    if (result?.serverError) {
      throw new Error(result.serverError);
    }
    // Page will automatically revalidate via revalidatePath() in the server action
  }, []);

  const handleCommentDelete = useCallback(async (commentId: string) => {
    const result = await deleteCommentAction({ commentId });

    if (result?.serverError) {
      throw new Error(result.serverError);
    }
    // Page will automatically revalidate via revalidatePath() in the server action
  }, []);

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
