'use client';

import type { ComponentProps } from 'react';

import { LoaderIcon, TriangleAlertIcon } from 'lucide-react';

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
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

interface CommentDeleteDialogProps extends ComponentProps<typeof AlertDialog> {
  commentId: null | string;
  hasReplies?: boolean;
  isOpen: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (commentId: string) => Promise<void> | void;
  replyCount?: number;
}

/**
 * Confirmation dialog for deleting comments
 * Provides a warning message and requires explicit confirmation before deletion
 * Warns users about cascade deletion when the comment has replies
 */
export const CommentDeleteDialog = ({
  commentId,
  hasReplies = false,
  isOpen,
  isSubmitting = false,
  onClose,
  onConfirm,
  replyCount = 0,
  ...props
}: CommentDeleteDialogProps) => {
  const [isProcessing, setIsProcessing] = useToggle();

  const _isDialogOpen = isOpen && commentId !== null;
  const _isLoading = isSubmitting || isProcessing;
  const _hasMultipleReplies = replyCount > 1;
  const _hasManyReplies = replyCount >= 5;

  const handleConfirm = async () => {
    if (!commentId) return;

    setIsProcessing.on();
    try {
      await onConfirm(commentId);
      onClose();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsProcessing.off();
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
          <AlertDialogDescription asChild>
            <div className={'space-y-3'}>
              <p>
                Are you sure you want to delete this comment? This action cannot be undone and the comment
                will be permanently removed.
              </p>

              {/* Reply Cascade Warning */}
              <Conditional isCondition={hasReplies}>
                <div
                  className={cn(
                    'rounded-sm border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
                    _hasManyReplies &&
                      'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/50 dark:text-red-200',
                  )}
                >
                  <p className={'font-medium'}>
                    {_hasManyReplies ? 'Warning: This will delete many replies!' : 'This comment has replies'}
                  </p>
                  <p className={'mt-1 text-sm'}>
                    {_hasMultipleReplies ?
                      `Deleting this comment will also permanently delete ${replyCount} replies.`
                    : 'Deleting this comment will also permanently delete 1 reply.'}
                  </p>
                </div>
              </Conditional>
            </div>
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
            {hasReplies ? 'Delete Comment & Replies' : 'Delete Comment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
