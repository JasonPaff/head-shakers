'use client';

import type { ComponentProps } from 'react';

import { MessageSquareIcon } from 'lucide-react';

import type { CommentWithUser } from '@/components/feature/comments/comment-item';

import { CommentItem } from '@/components/feature/comments/comment-item';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

interface CommentListProps extends ComponentProps<'div'> {
  comments: Array<CommentWithUser>;
  currentUserId?: string;
  hasMore?: boolean;
  isEditable?: boolean;
  isLoading?: boolean;
  onDeleteClick?: (commentId: string) => void;
  onEditClick?: (comment: CommentWithUser) => void;
  onLoadMore?: () => void;
}

/**
 * Comment list container component with pagination support
 * Displays a collection of comments with optional load more functionality
 */
export const CommentList = ({
  className,
  comments,
  currentUserId,
  hasMore = false,
  isEditable = true,
  isLoading = false,
  onDeleteClick,
  onEditClick,
  onLoadMore,
  ...props
}: CommentListProps) => {
  const _hasComments = comments.length > 0;
  const _shouldShowLoadMore = hasMore && !isLoading && !!onLoadMore;
  const _shouldShowEmptyState = !_hasComments && !isLoading;

  const handleLoadMoreClick = () => {
    if (onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Comment List */}
      <Conditional isCondition={_hasComments}>
        <div className={'space-y-3'}>
          {comments.map((comment) => (
            <CommentItem
              comment={comment}
              currentUserId={currentUserId}
              isEditable={isEditable}
              key={comment.id}
              onDeleteClick={onDeleteClick}
              onEditClick={onEditClick}
            />
          ))}
        </div>
      </Conditional>

      {/* Empty State */}
      <Conditional isCondition={_shouldShowEmptyState}>
        <div className={'flex flex-col items-center justify-center py-12 text-center'}>
          <MessageSquareIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
          <h3 className={'mb-1 text-lg font-semibold'}>No comments yet</h3>
          <p className={'text-sm text-muted-foreground'}>Be the first to share your thoughts!</p>
        </div>
      </Conditional>

      {/* Loading State */}
      <Conditional isCondition={isLoading}>
        <div className={'space-y-3'}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div className={'animate-pulse rounded-lg border bg-card p-4'} key={index}>
              <div className={'mb-3 flex items-center gap-3'}>
                <div className={'size-8 rounded-full bg-muted'} />
                <div className={'flex-1 space-y-2'}>
                  <div className={'h-4 w-32 rounded bg-muted'} />
                  <div className={'h-3 w-24 rounded bg-muted'} />
                </div>
              </div>
              <div className={'space-y-2'}>
                <div className={'h-3 w-full rounded bg-muted'} />
                <div className={'h-3 w-4/5 rounded bg-muted'} />
              </div>
            </div>
          ))}
        </div>
      </Conditional>

      {/* Load More Button */}
      <Conditional isCondition={_shouldShowLoadMore}>
        <div className={'flex justify-center pt-4'}>
          <Button onClick={handleLoadMoreClick} variant={'outline'}>
            Load More Comments
          </Button>
        </div>
      </Conditional>
    </div>
  );
};
