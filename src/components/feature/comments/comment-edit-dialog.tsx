'use client';

import type { ComponentProps } from 'react';

import { useState } from 'react';

import type { CommentWithUser } from '@/components/feature/comments/comment-item';

import { CommentForm } from '@/components/feature/comments/comment-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CommentEditDialogProps extends ComponentProps<typeof Dialog> {
  comment: CommentWithUser | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (commentId: string, content: string) => Promise<void> | void;
}

/**
 * Dialog component for editing existing comments
 * Provides a modal interface with comment form pre-populated with existing content
 */
export const CommentEditDialog = ({
  comment,
  isOpen,
  isSubmitting = false,
  onClose,
  onSubmit,
  ...props
}: CommentEditDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const _isDialogOpen = isOpen && comment !== null;
  const _isLoading = isSubmitting || isProcessing;

  const handleSubmit = async (content: string) => {
    if (!comment) return;

    setIsProcessing(true);
    try {
      await onSubmit(comment.id, content);
      onClose();
    } catch (error) {
      console.error('Failed to update comment:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !_isLoading) {
      onClose();
    }
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={_isDialogOpen} {...props}>
      <DialogContent className={'sm:max-w-[600px]'}>
        {/* Dialog Header */}
        <DialogHeader>
          <DialogTitle>Edit Comment</DialogTitle>
          <DialogDescription>
            Make changes to your comment. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {/* Comment Form */}
        <CommentForm
          initialContent={comment?.content || ''}
          isDisabled={_isLoading}
          isSubmitting={_isLoading}
          onCancel={onClose}
          onSubmit={handleSubmit}
          placeholder={'Edit your comment...'}
          submitButtonText={'Save Changes'}
        />
      </DialogContent>
    </Dialog>
  );
};
