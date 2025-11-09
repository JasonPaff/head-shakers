'use client';

import type { ComponentProps } from 'react';

import { MessageSquareTextIcon } from 'lucide-react';
import { useState } from 'react';

import type { CommentWithUser } from '@/components/feature/comments/comment-item';

import { CommentDeleteDialog } from '@/components/feature/comments/comment-delete-dialog';
import { CommentEditDialog } from '@/components/feature/comments/comment-edit-dialog';
import { CommentForm } from '@/components/feature/comments/comment-form';
import { CommentList } from '@/components/feature/comments/comment-list';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface CommentSectionProps extends ComponentProps<'div'> {
  comments: Array<CommentWithUser>;
  currentUserId?: string;
  hasMore?: boolean;
  initialCommentCount?: number;
  isAuthenticated?: boolean;
  isEditable?: boolean;
  isLoading?: boolean;
  onCommentCreate?: (content: string) => Promise<void> | void;
  onCommentDelete?: (commentId: string) => Promise<void> | void;
  onCommentUpdate?: (commentId: string, content: string) => Promise<void> | void;
  onLoadMore?: () => void;
}

/**
 * Main comment section orchestrator component
 * Integrates comment form, list, and action dialogs with state management
 */
export const CommentSection = ({
  className,
  comments,
  currentUserId,
  hasMore = false,
  initialCommentCount = 0,
  isAuthenticated = false,
  isEditable = true,
  isLoading = false,
  onCommentCreate,
  onCommentDelete,
  onCommentUpdate,
  onLoadMore,
  ...props
}: CommentSectionProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentWithUser | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const _commentCount = comments.length || initialCommentCount;
  const _shouldShowForm = isAuthenticated && !!onCommentCreate;
  const _isProcessing = isSubmitting || isLoading;

  const handleCreateComment = async (content: string) => {
    if (!onCommentCreate) return;

    setIsSubmitting(true);
    try {
      await onCommentCreate(content);
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (comment: CommentWithUser) => {
    setSelectedComment(comment);
    setIsEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setIsEditDialogOpen(false);
    setSelectedComment(null);
  };

  const handleEditSubmit = async (commentId: string, content: string) => {
    if (!onCommentUpdate) return;

    setIsSubmitting(true);
    try {
      await onCommentUpdate(commentId, content);
      handleEditClose();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (commentId: string) => {
    setSelectedCommentId(commentId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
    setSelectedCommentId(null);
  };

  const handleDeleteConfirm = async (commentId: string) => {
    if (!onCommentDelete) return;

    setIsSubmitting(true);
    try {
      await onCommentDelete(commentId);
      handleDeleteClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Section Header */}
      <div className={'flex items-center gap-2'}>
        <MessageSquareTextIcon aria-hidden className={'size-5 text-muted-foreground'} />
        <h2 className={'text-xl font-semibold'}>
          Comments
          <span className={'ml-2 text-sm font-normal text-muted-foreground'}>({_commentCount})</span>
        </h2>
      </div>

      {/* Comment Form */}
      <Conditional isCondition={_shouldShowForm}>
        <div className={'rounded-lg border bg-card p-4'}>
          <CommentForm
            isDisabled={_isProcessing}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateComment}
            placeholder={'Share your thoughts...'}
            submitButtonText={'Post Comment'}
          />
        </div>
      </Conditional>

      {/* Unauthenticated Message */}
      <Conditional isCondition={!isAuthenticated}>
        <div className={'rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground'}>
          Sign in to leave a comment
        </div>
      </Conditional>

      {/* Comment List */}
      <CommentList
        comments={comments}
        currentUserId={currentUserId}
        hasMore={hasMore}
        isEditable={isEditable}
        isLoading={isLoading}
        onDeleteClick={handleDeleteClick}
        onEditClick={handleEditClick}
        onLoadMore={onLoadMore}
      />

      {/* Edit Dialog */}
      <CommentEditDialog
        comment={selectedComment}
        isOpen={isEditDialogOpen}
        isSubmitting={isSubmitting}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Dialog */}
      <CommentDeleteDialog
        commentId={selectedCommentId}
        isOpen={isDeleteDialogOpen}
        isSubmitting={isSubmitting}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
