'use client';

import type { ComponentProps } from 'react';

import { EditIcon, MessageSquareReplyIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import type { CommentWithDepth, CommentWithUser } from '@/lib/queries/social/social.query';

import { ReportButton } from '@/components/feature/content-reports/report-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { MAX_COMMENT_NESTING_DEPTH } from '@/lib/constants/enums';
import { isCommentEditable } from '@/lib/utils/comment.utils';
import { cn } from '@/utils/tailwind-utils';

// Re-export for convenience
export type { CommentWithDepth, CommentWithUser };

interface CommentItemProps extends Omit<ComponentProps<'div'>, 'content'> {
  comment: CommentWithDepth;
  currentUserId?: string;
  depth?: number;
  isAdmin?: boolean;
  isEditable?: boolean;
  onDeleteClick?: (commentId: string) => void;
  onEditClick?: (comment: CommentWithDepth) => void;
  onReply?: (comment: CommentWithDepth) => void;
}

/**
 * Safely converts a date-like value to a Date object
 * Handles both Date objects and ISO date strings (from cache)
 */
const toDate = (value: Date | string): Date => {
  return value instanceof Date ? value : new Date(value);
};

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * Handles both Date objects and date strings for cache compatibility
 */
const getRelativeTime = (date: Date | string) => {
  const dateObj = toDate(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years !== 1 ? 's' : ''} ago`;
  }
};

/**
 * Returns depth-based background classes for visual nesting hierarchy
 * Progressively lighter backgrounds for deeper nesting levels
 */
const getDepthBackgroundClass = (depth: number): string => {
  const depthBackgrounds = [
    'bg-card', // depth 0
    'bg-muted/20', // depth 1
    'bg-muted/30', // depth 2
    'bg-muted/40', // depth 3
    'bg-muted/50', // depth 4
    'bg-muted/60', // depth 5+
  ] as const;

  const clampedDepth = Math.min(depth, MAX_COMMENT_NESTING_DEPTH);
  return depthBackgrounds[clampedDepth] ?? 'bg-muted/60';
};

/**
 * Returns depth-based border accent classes for visual nesting indicators
 * Uses left border with decreasing opacity for deeper levels
 */
const getDepthBorderClass = (depth: number): string => {
  if (depth === 0) return '';

  const depthBorders = [
    '', // depth 0 (not used)
    'border-l-4 border-l-primary/60', // depth 1
    'border-l-4 border-l-primary/45', // depth 2
    'border-l-4 border-l-primary/30', // depth 3
    'border-l-4 border-l-primary/20', // depth 4
    'border-l-4 border-l-primary/10', // depth 5+
  ] as const;

  const clampedDepth = Math.min(depth, MAX_COMMENT_NESTING_DEPTH);
  return depthBorders[clampedDepth] ?? 'border-l-4 border-l-primary/10';
};

/**
 * Individual comment display component with nested reply support
 * Displays comment content, author information, timestamp, action buttons, and reply functionality
 * Supports visual nesting hierarchy through depth-based styling
 */
export const CommentItem = ({
  className,
  comment,
  currentUserId,
  depth = 0,
  isAdmin = false,
  isEditable = true,
  onDeleteClick,
  onEditClick,
  onReply,
  ...props
}: CommentItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Derived conditional rendering variables
  const _isCommentOwner = currentUserId === comment.userId;
  const _isWithinEditWindow = isCommentEditable(comment.createdAt);
  const _canEdit = isEditable && _isCommentOwner && (_isWithinEditWindow || isAdmin);
  const _canDelete = _isCommentOwner;
  const _shouldShowActions = _isCommentOwner && isHovered && (_canEdit || _canDelete);
  const _hasEditedIndicator = !!comment.editedAt;
  const _canReply = depth < MAX_COMMENT_NESTING_DEPTH && !!onReply;
  const _canReport = !!currentUserId && !_isCommentOwner;
  const _isNested = depth > 0;
  const _isDeeplyNested = depth >= 3;

  // Display values
  const _username = comment.user?.username || 'deleted';
  const _avatarUrl = comment.user?.avatarUrl;

  // Event handlers
  const handleEditClick = () => {
    if (onEditClick) {
      onEditClick(comment);
    }
  };

  const handleDeleteClick = () => {
    if (onDeleteClick) {
      onDeleteClick(comment.id);
    }
  };

  const handleReplyClick = () => {
    if (onReply) {
      onReply(comment);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={cn(
        'group relative rounded-lg border transition-colors hover:bg-muted/50',
        _isDeeplyNested ? 'p-3' : 'p-4',
        getDepthBackgroundClass(depth),
        getDepthBorderClass(depth),
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Comment Header */}
      <div className={'mb-3 flex items-start justify-between gap-3'}>
        <div className={'flex items-center gap-3'}>
          {/* Avatar - smaller for deeply nested comments */}
          <Avatar className={_isDeeplyNested ? 'size-6' : 'size-8'}>
            <Conditional isCondition={!!_avatarUrl}>
              <AvatarImage alt={_username} src={_avatarUrl || ''} />
            </Conditional>
            <AvatarFallback className={_isDeeplyNested ? 'text-xs' : 'text-sm'}>
              {_username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <span className={cn('font-semibold', _isDeeplyNested ? 'text-xs' : 'text-sm')}>@{_username}</span>

          {/* Nested Reply Indicator */}
          <Conditional isCondition={_isNested}>
            <span
              className={'ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'}
              title={`Reply at depth ${depth}`}
            >
              Reply
            </span>
          </Conditional>
        </div>

        {/* Action Buttons */}
        <Conditional isCondition={_shouldShowActions}>
          <div className={'flex gap-1'}>
            <Conditional isCondition={_canEdit}>
              <Button aria-label={'Edit comment'} onClick={handleEditClick} size={'sm'} variant={'ghost'}>
                <EditIcon aria-hidden className={'size-4'} />
              </Button>
            </Conditional>
            <Conditional isCondition={_canDelete}>
              <Button aria-label={'Delete comment'} onClick={handleDeleteClick} size={'sm'} variant={'ghost'}>
                <TrashIcon aria-hidden className={'size-4'} />
              </Button>
            </Conditional>
          </div>
        </Conditional>
      </div>

      {/* Comment Content */}
      <p className={cn('mb-2 whitespace-pre-wrap text-foreground', _isDeeplyNested ? 'text-xs' : 'text-sm')}>
        {comment.content}
      </p>

      {/* Comment Footer */}
      <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
        <time dateTime={toDate(comment.createdAt).toISOString()}>{getRelativeTime(comment.createdAt)}</time>

        <Conditional isCondition={_hasEditedIndicator}>
          <span className={'text-xs text-muted-foreground'}>• edited</span>
        </Conditional>

        {/* Reply Button */}
        <Conditional isCondition={_canReply}>
          <Button
            aria-label={'Reply to comment'}
            className={'h-auto p-0 text-xs text-muted-foreground hover:text-foreground'}
            onClick={handleReplyClick}
            variant={'ghost'}
          >
            <MessageSquareReplyIcon aria-hidden className={'mr-1 size-3'} />
            Reply
          </Button>
        </Conditional>

        {/* Report Button */}
        <Conditional isCondition={_canReport}>
          <ReportButton
            className={'h-auto p-0 text-xs text-muted-foreground hover:text-foreground'}
            targetId={comment.id}
            targetType={'comment'}
            variant={'ghost'}
          />
        </Conditional>
      </div>
    </div>
  );
};
