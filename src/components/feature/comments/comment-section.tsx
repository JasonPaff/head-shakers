'use client';

import type { ComponentProps } from 'react';

import { MessageSquareTextIcon } from 'lucide-react';
import { useState } from 'react';

import type { CommentWithDepth } from '@/lib/queries/social/social.query';

import { CommentDeleteDialog } from '@/components/feature/comments/comment-delete-dialog';
import { CommentEditDialog } from '@/components/feature/comments/comment-edit-dialog';
import { CommentForm } from '@/components/feature/comments/comment-form';
import { CommentList } from '@/components/feature/comments/comment-list';
import { Conditional } from '@/components/ui/conditional';
import { MAX_COMMENT_NESTING_DEPTH } from '@/lib/constants/enums';
import { cn } from '@/utils/tailwind-utils';

interface CommentSectionProps extends ComponentProps<'div'> {
  comments: Array<CommentWithDepth>;
  currentUserId?: string;
  hasMore?: boolean;
  initialCommentCount?: number;
  isAuthenticated?: boolean;
  isEditable?: boolean;
  isLoading?: boolean;
  onCommentCreate?: (content: string, parentCommentId?: string) => Promise<void> | void;
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
  // 1. useState hooks
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComment, setSelectedComment] = useState<CommentWithDepth | null>(null);
  const [selectedCommentId, setSelectedCommentId] = useState<null | string>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyParentComment, setReplyParentComment] = useState<CommentWithDepth | null>(null);

  // 7. Derived values for conditional rendering
  const _commentCount = comments.length || initialCommentCount;
  const _shouldShowForm = isAuthenticated && !!onCommentCreate;
  const _isProcessing = isSubmitting || isLoading;
  const _isReplyMode = !!replyParentComment;
  const _isAtMaxDepth = _isReplyMode && replyParentComment.depth + 1 >= MAX_COMMENT_NESTING_DEPTH;
  const _parentCommentAuthor =
    replyParentComment?.user?.displayName ?? replyParentComment?.user?.username ?? undefined;
  const _parentCommentContent = replyParentComment?.content ?? undefined;

  // Helper function to find comment by ID in nested tree
  const findCommentById = (commentList: Array<CommentWithDepth>, id: string): CommentWithDepth | null => {
    for (const comment of commentList) {
      if (comment.id === id) return comment;
      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper to count all descendants recursively
  const countTotalReplies = (comment: CommentWithDepth): number => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    return comment.replies.reduce((sum, reply) => sum + 1 + countTotalReplies(reply), 0);
  };

  // Derived values for delete dialog
  const _selectedDeleteComment = selectedCommentId ? findCommentById(comments, selectedCommentId) : null;
  const _hasReplies = !!(_selectedDeleteComment?.replies && _selectedDeleteComment.replies.length > 0);
  const _totalReplyCount = _selectedDeleteComment ? countTotalReplies(_selectedDeleteComment) : 0;

  // 6. Event handlers
  const handleCreateComment = async (content: string, parentCommentId?: string) => {
    if (!onCommentCreate) return;

    setIsSubmitting(true);
    try {
      await onCommentCreate(content, parentCommentId);
      // Clear reply state after successful submission
      if (parentCommentId) {
        setReplyParentComment(null);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (comment: CommentWithDepth) => {
    // Clicking reply on a different comment clears the previous reply state
    setReplyParentComment(comment);
  };

  const handleCancelReply = () => {
    setReplyParentComment(null);
  };

  const handleEditClick = (comment: CommentWithDepth) => {
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
    <div className={cn('space-y-6', className)} id={'comments-section'} {...props}>
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
            isAtMaxDepth={_isAtMaxDepth}
            isDisabled={_isProcessing}
            isSubmitting={isSubmitting}
            onCancelReply={_isReplyMode ? handleCancelReply : undefined}
            onSubmit={handleCreateComment}
            parentCommentAuthor={_parentCommentAuthor}
            parentCommentContent={_parentCommentContent}
            parentCommentId={replyParentComment?.id}
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
        onReply={isAuthenticated ? handleReplyClick : undefined}
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
        hasReplies={_hasReplies}
        isOpen={isDeleteDialogOpen}
        isSubmitting={isSubmitting}
        onClose={handleDeleteClose}
        onConfirm={handleDeleteConfirm}
        replyCount={_totalReplyCount}
      />
    </div>
  );
};
