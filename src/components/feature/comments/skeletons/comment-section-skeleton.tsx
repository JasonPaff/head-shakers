import type { ComponentProps } from 'react';

import { MessageSquareTextIcon } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/tailwind-utils';

interface CommentSectionSkeletonProps extends ComponentProps<'div'> {
  /**
   * Number of comment item skeletons to display
   * @default 3
   */
  commentCount?: number;
  /**
   * Whether to show the form skeleton (for authenticated users)
   * @default true
   */
  shouldShowForm?: boolean;
  /**
   * Whether to show nested reply skeletons
   * @default true
   */
  shouldShowNestedReplies?: boolean;
}

/**
 * Loading skeleton for comment section
 * Matches the layout of CommentSection for smooth loading transitions
 */
export const CommentSectionSkeleton = ({
  className,
  commentCount = 3,
  shouldShowForm = true,
  shouldShowNestedReplies = true,
  ...props
}: CommentSectionSkeletonProps) => {
  return (
    <div className={cn('space-y-6', className)} {...props}>
      {/* Section Header Skeleton */}
      <div className={'flex items-center gap-2'}>
        <MessageSquareTextIcon aria-hidden className={'size-5 text-muted-foreground'} />
        <div className={'flex items-baseline gap-2'}>
          <Skeleton className={'h-7 w-28'} />
          <Skeleton className={'h-5 w-12'} />
        </div>
      </div>

      {/* Comment Form Skeleton */}
      {shouldShowForm && (
        <div className={'rounded-lg border bg-card p-4'}>
          <div className={'space-y-4'}>
            <Skeleton className={'h-24 w-full'} />
            <div className={'flex items-center justify-between'}>
              <Skeleton className={'h-4 w-16'} />
              <Skeleton className={'h-10 w-32'} />
            </div>
          </div>
        </div>
      )}

      {/* Comment List Skeleton */}
      <div className={'space-y-4'}>
        {Array.from({ length: commentCount }).map((_, index) => (
          <CommentThreadSkeleton key={index} shouldShowReplies={shouldShowNestedReplies && index === 0} />
        ))}
      </div>
    </div>
  );
};

interface CommentItemSkeletonProps {
  /**
   * Nesting depth level - affects sizing and background
   * @default 0
   */
  depth?: number;
}

/**
 * Loading skeleton for individual comment item
 * Matches the layout of CommentItem component with depth-based styling
 */
const CommentItemSkeleton = ({ depth = 0 }: CommentItemSkeletonProps) => {
  // Derived conditional rendering variables
  const _isDeeplyNested = depth >= 3;
  const _avatarSize = _isDeeplyNested ? 'size-6' : 'size-8';
  const _padding = _isDeeplyNested ? 'p-3' : 'p-4';

  // Background classes matching CommentItem depth styling
  const _depthBackgrounds = [
    'bg-card', // depth 0
    'bg-muted/20', // depth 1
    'bg-muted/30', // depth 2
    'bg-muted/40', // depth 3+
  ] as const;

  // Border classes for nested comments
  const _depthBorders = [
    '', // depth 0
    'border-l-4 border-l-primary/60', // depth 1
    'border-l-4 border-l-primary/45', // depth 2
    'border-l-4 border-l-primary/30', // depth 3+
  ] as const;

  const _backgroundClass = _depthBackgrounds[Math.min(depth, 3)] ?? 'bg-muted/40';
  const _borderClass = depth > 0 ? (_depthBorders[Math.min(depth, 3)] ?? 'border-l-4 border-l-primary/30') : '';

  return (
    <div className={cn('rounded-lg border', _padding, _backgroundClass, _borderClass)}>
      <div className={'space-y-3'}>
        {/* User info skeleton */}
        <div className={'flex items-center gap-3'}>
          <Skeleton className={cn('rounded-full', _avatarSize)} />
          <div className={'flex-1 space-y-2'}>
            <Skeleton className={_isDeeplyNested ? 'h-3 w-24' : 'h-4 w-32'} />
            <Skeleton className={_isDeeplyNested ? 'h-2 w-16' : 'h-3 w-24'} />
          </div>
        </div>

        {/* Comment content skeleton */}
        <div className={'space-y-2'}>
          <Skeleton className={_isDeeplyNested ? 'h-3 w-full' : 'h-4 w-full'} />
          <Skeleton className={_isDeeplyNested ? 'h-3 w-5/6' : 'h-4 w-5/6'} />
          <Skeleton className={_isDeeplyNested ? 'h-3 w-4/6' : 'h-4 w-4/6'} />
        </div>

        {/* Footer skeleton - timestamp and reply button */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-3 w-16'} />
          <Skeleton className={'h-3 w-12'} />
        </div>
      </div>
    </div>
  );
};

interface CommentThreadSkeletonProps {
  /**
   * Current nesting depth
   * @default 0
   */
  depth?: number;
  /**
   * Whether to show nested reply skeletons
   * @default false
   */
  shouldShowReplies?: boolean;
}

/**
 * Loading skeleton for a comment thread with nested replies
 * Matches the layout of CommentThread component for visual consistency
 */
const CommentThreadSkeleton = ({ depth = 0, shouldShowReplies = false }: CommentThreadSkeletonProps) => {
  // Derived conditional rendering variables
  const _shouldShowNestedReplies = shouldShowReplies && depth < 3;
  const _nextDepth = depth + 1;
  const _indentClass = depth >= 2 ? 'ml-2 pl-2' : 'ml-4 pl-4';

  return (
    <div>
      {/* Parent Comment Skeleton */}
      <CommentItemSkeleton depth={depth} />

      {/* Nested Replies Skeleton */}
      {_shouldShowNestedReplies && (
        <div className={cn('mt-2 space-y-2 border-l-2 border-muted', _indentClass)}>
          {/* First level reply */}
          <CommentThreadSkeleton depth={_nextDepth} shouldShowReplies={depth < 1} />

          {/* Second level reply - only show on first thread */}
          {depth === 0 && <CommentItemSkeleton depth={_nextDepth} />}
        </div>
      )}
    </div>
  );
};
