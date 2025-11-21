'use client';

import type { ComponentProps } from 'react';

import { ChevronDownIcon, MessageSquareIcon } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

import type { CommentWithDepth, CommentWithUser } from '@/lib/queries/social/social.query';

import { CommentItem } from '@/components/feature/comments/comment-item';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { MAX_COMMENT_NESTING_DEPTH } from '@/lib/constants/enums';
import { cn } from '@/utils/tailwind-utils';

// Re-export CommentWithDepth for convenience
export type { CommentWithDepth };

/**
 * Type guard to check if a comment has depth information
 */
const isCommentWithDepth = (comment: CommentWithDepth | CommentWithUser): comment is CommentWithDepth => {
  return 'depth' in comment && typeof comment.depth === 'number';
};

/**
 * Normalizes a comment to ensure it has depth information
 * Used to support both CommentWithUser and CommentWithDepth inputs
 */
const normalizeComment = (
  comment: CommentWithDepth | CommentWithUser,
  defaultDepth = 0,
): CommentWithDepth => {
  if (isCommentWithDepth(comment)) {
    return comment;
  }
  return {
    ...comment,
    depth: defaultDepth,
    replies: [],
  };
};

interface CommentListProps extends ComponentProps<'div'> {
  comments: Array<CommentWithDepth | CommentWithUser>;
  currentUserId?: string;
  hasMore?: boolean;
  isEditable?: boolean;
  isLoading?: boolean;
  onDeleteClick?: (commentId: string) => void;
  onEditClick?: (comment: CommentWithDepth) => void;
  onLoadMore?: () => void;
  onReply?: (comment: CommentWithDepth) => void;
}

/**
 * Props for the recursive comment thread renderer
 */
interface CommentThreadProps {
  comment: CommentWithDepth;
  currentUserId?: string;
  isEditable?: boolean;
  onDeleteClick?: (commentId: string) => void;
  onEditClick?: (comment: CommentWithDepth) => void;
  onReply?: (comment: CommentWithDepth) => void;
}

/**
 * Recursive comment thread component that renders a comment and its nested replies
 * Memoized for performance optimization with deeply nested comment trees
 */
const CommentThread = memo(
  ({ comment, currentUserId, isEditable, onDeleteClick, onEditClick, onReply }: CommentThreadProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Derived conditional rendering variables
    const _hasReplies = !!comment.replies && comment.replies.length > 0;
    const _replyCount = comment.replies?.length ?? 0;
    const _isAtMaxDepth = comment.depth >= MAX_COMMENT_NESTING_DEPTH;
    const _shouldShowExpandIndicator = _isAtMaxDepth && (comment.replyCount ?? 0) > 0;
    const _shouldShowExpandedReplies = _hasReplies && !isCollapsed;
    const _shouldShowCollapsedIndicator = _hasReplies && isCollapsed;
    const _shouldShowCollapseButton = _shouldShowExpandedReplies && _replyCount > 0;
    const _additionalReplyCount = comment.replyCount ?? 0;
    const _additionalReplyText = _additionalReplyCount === 1 ? 'reply' : 'replies';

    // Event handlers
    const handleCollapseToggle = useCallback(() => {
      setIsCollapsed((prev) => !prev);
    }, []);

    return (
      <div>
        {/* Comment Item */}
        <CommentItem
          comment={comment}
          currentUserId={currentUserId}
          depth={comment.depth}
          isEditable={isEditable}
          onDeleteClick={onDeleteClick}
          onEditClick={onEditClick}
          onReply={onReply}
        />

        {/* Nested Replies */}
        <Conditional isCondition={_shouldShowExpandedReplies}>
          <div
            className={cn(
              'mt-2 ml-4 space-y-2 border-l-2 border-muted pl-4',
              comment.depth >= 2 && 'ml-2 pl-2',
            )}
          >
            {comment.replies?.map((reply) => (
              <CommentThread
                comment={reply}
                currentUserId={currentUserId}
                isEditable={isEditable}
                key={reply.id}
                onDeleteClick={onDeleteClick}
                onEditClick={onEditClick}
                onReply={onReply}
              />
            ))}
          </div>
        </Conditional>

        {/* Collapsed Replies Indicator */}
        <Conditional isCondition={_shouldShowCollapsedIndicator}>
          <Button
            className={'mt-2 ml-4 h-auto p-1 text-xs text-muted-foreground'}
            onClick={handleCollapseToggle}
            variant={'ghost'}
          >
            <ChevronDownIcon aria-hidden className={'mr-1 size-3'} />
            Show {_replyCount} {_replyCount === 1 ? 'reply' : 'replies'}
          </Button>
        </Conditional>

        {/* Collapse Button for Expanded Replies */}
        <Conditional isCondition={_shouldShowCollapseButton}>
          <Button
            className={'mt-1 ml-4 h-auto p-1 text-xs text-muted-foreground'}
            onClick={handleCollapseToggle}
            variant={'ghost'}
          >
            Hide {_replyCount === 1 ? 'reply' : 'replies'}
          </Button>
        </Conditional>

        {/* Max Depth Indicator */}
        <Conditional isCondition={_shouldShowExpandIndicator}>
          <div className={'mt-2 ml-4 rounded bg-muted/50 p-2 text-xs text-muted-foreground'}>
            {_additionalReplyCount} more {_additionalReplyText} - thread continues
          </div>
        </Conditional>
      </div>
    );
  },
);

CommentThread.displayName = 'CommentThread';

/**
 * Comment list container component with pagination and recursive nesting support
 * Displays a collection of comments with nested reply threads and load more functionality
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
  onReply,
  ...props
}: CommentListProps) => {
  // Normalize comments to ensure they all have depth information
  const _normalizedComments = useMemo(() => comments.map((c) => normalizeComment(c, 0)), [comments]);

  // Derived conditional rendering variables
  const _hasComments = _normalizedComments.length > 0;
  const _shouldShowLoadMore = hasMore && !isLoading && !!onLoadMore;
  const _shouldShowEmptyState = !_hasComments && !isLoading;

  // Event handlers
  const handleLoadMoreClick = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    }
  }, [onLoadMore]);

  return (
    <div className={cn('space-y-4', className)} {...props}>
      {/* Comment List */}
      <Conditional isCondition={_hasComments}>
        <div className={'space-y-3'}>
          {_normalizedComments.map((comment) => (
            <CommentThread
              comment={comment}
              currentUserId={currentUserId}
              isEditable={isEditable}
              key={comment.id}
              onDeleteClick={onDeleteClick}
              onEditClick={onEditClick}
              onReply={onReply}
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
