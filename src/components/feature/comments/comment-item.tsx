'use client';

import type { ComponentProps } from 'react';

import { EditIcon, TrashIcon } from 'lucide-react';
import { useState } from 'react';

import type { CommentWithUser } from '@/lib/queries/social/social.query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

// Re-export for convenience
export type { CommentWithUser };

interface CommentItemProps extends Omit<ComponentProps<'div'>, 'content'> {
  comment: CommentWithUser;
  currentUserId?: string;
  isEditable?: boolean;
  onDeleteClick?: (commentId: string) => void;
  onEditClick?: (comment: CommentWithUser) => void;
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 */
const getRelativeTime = (date: Date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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
 * Individual comment display component
 * Displays comment content, author information, timestamp, and action buttons
 */
export const CommentItem = ({
  className,
  comment,
  currentUserId,
  isEditable = true,
  onDeleteClick,
  onEditClick,
  ...props
}: CommentItemProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const _isCommentOwner = currentUserId === comment.userId;
  const _shouldShowActions = isEditable && _isCommentOwner && isHovered;
  const _hasEditedIndicator = comment.isEdited && !!comment.editedAt;
  const _displayName = comment.user?.displayName || 'Deleted User';
  const _username = comment.user?.username || 'deleted';
  const _avatarUrl = comment.user?.avatarUrl;

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

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={cn('group relative rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {/* Comment Header */}
      <div className={'mb-3 flex items-start justify-between gap-3'}>
        <div className={'flex items-center gap-3'}>
          <Avatar className={'size-8'}>
            <Conditional isCondition={!!_avatarUrl}>
              <AvatarImage alt={_displayName} src={_avatarUrl || ''} />
            </Conditional>
            <AvatarFallback>
              {_displayName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className={'flex flex-col'}>
            <span className={'text-sm font-semibold'}>{_displayName}</span>
            <span className={'text-xs text-muted-foreground'}>@{_username}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <Conditional isCondition={_shouldShowActions}>
          <div className={'flex gap-1'}>
            <Button
              aria-label={'Edit comment'}
              onClick={handleEditClick}
              size={'sm'}
              variant={'ghost'}
            >
              <EditIcon aria-hidden className={'size-4'} />
            </Button>
            <Button
              aria-label={'Delete comment'}
              onClick={handleDeleteClick}
              size={'sm'}
              variant={'ghost'}
            >
              <TrashIcon aria-hidden className={'size-4'} />
            </Button>
          </div>
        </Conditional>
      </div>

      {/* Comment Content */}
      <p className={'mb-2 text-sm whitespace-pre-wrap text-foreground'}>{comment.content}</p>

      {/* Comment Footer */}
      <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
        <time dateTime={comment.createdAt.toISOString()}>
          {getRelativeTime(comment.createdAt)}
        </time>

        <Conditional isCondition={_hasEditedIndicator}>
          <span className={'text-xs text-muted-foreground'}>• edited</span>
        </Conditional>
      </div>
    </div>
  );
};
