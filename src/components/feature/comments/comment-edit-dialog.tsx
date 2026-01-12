'use client';

import type { ComponentProps } from 'react';

import { useCallback, useState } from 'react';

import type { CommentWithUser } from '@/components/feature/comments/comment-item';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { CommentForm } from '@/components/feature/comments/comment-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateTestId } from '@/lib/test-ids';

type CommentEditDialogProps = ComponentProps<typeof Dialog> &
  ComponentTestIdProps & {
    comment: CommentWithUser | null;
    isOpen: boolean;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (commentId: string, content: string) => Promise<void> | void;
  };

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
  testId,
  ...props
}: CommentEditDialogProps) => {
  // 1. useState hooks
  const [isProcessing, setIsProcessing] = useState(false);

  // 6. Event handlers
  const handleSubmit = useCallback(
    async (content: string) => {
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
    },
    [comment, onSubmit, onClose],
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isSubmitting && !isProcessing) {
        onClose();
      }
    },
    [isSubmitting, isProcessing, onClose],
  );

  // 7. Derived values for conditional rendering
  const _isDialogOpen = isOpen && comment !== null;
  const _isLoading = isSubmitting || isProcessing;

  const componentTestId = testId ?? generateTestId('feature', 'comment-edit-dialog');

  return (
    <Dialog onOpenChange={handleOpenChange} open={_isDialogOpen} {...props}>
      <DialogContent
        className={'sm:max-w-[600px]'}
        data-slot={'comment-edit-dialog'}
        data-testid={componentTestId}
      >
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
