'use client';

import type { ComponentProps } from 'react';

import { LoaderIcon, TriangleAlertIcon } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Conditional } from '@/components/ui/conditional';

interface CommentDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  commentId: null | string;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (commentId: string) => Promise<void> | void;
}

/**
 * Confirmation dialog for deleting comments
 * Provides a warning message and requires explicit confirmation before deletion
 */
export const CommentDeleteDialog = ({
  commentId,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  ...props
}: CommentDeleteDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const _isDialogOpen = isOpen && commentId !== null;
  const _isLoading = isSubmitting || isProcessing;

  const handleConfirm = async () => {
    if (!commentId) return;

    setIsProcessing(true);
    try {
      await onConfirm(commentId);
      onClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
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
    <AlertDialog onOpenChange={handleOpenChange} open={_isDialogOpen} {...props}>
      <AlertDialogContent>
        {/* Dialog Header */}
        <AlertDialogHeader>
          <div className={'flex items-center gap-3'}>
            <TriangleAlertIcon aria-hidden className={'size-6 text-destructive'} />
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            Are you sure you want to delete this comment? This action cannot be undone and the comment will be
            permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Dialog Footer */}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={_isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            aria-busy={_isLoading}
            className={'bg-destructive hover:bg-destructive/90'}
            disabled={_isLoading}
            onClick={handleConfirm}
          >
            <Conditional isCondition={_isLoading}>
              <LoaderIcon aria-hidden className={'mr-2 size-4 animate-spin'} />
            </Conditional>
            Delete Comment
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
