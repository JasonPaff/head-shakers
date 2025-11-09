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
}

/**
 * Loading skeleton for comment section
 * Matches the layout of CommentSection for smooth loading transitions
 */
export const CommentSectionSkeleton = ({
  className,
  commentCount = 3,
  shouldShowForm = true,
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
          <CommentItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for individual comment item
 * Matches the layout of CommentItem component
 */
const CommentItemSkeleton = () => {
  return (
    <div className={'rounded-lg border bg-card p-4'}>
      <div className={'space-y-3'}>
        {/* User info skeleton */}
        <div className={'flex items-center gap-3'}>
          <Skeleton className={'size-10 rounded-full'} />
          <div className={'flex-1 space-y-2'}>
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-3 w-24'} />
          </div>
        </div>

        {/* Comment content skeleton */}
        <div className={'space-y-2'}>
          <Skeleton className={'h-4 w-full'} />
          <Skeleton className={'h-4 w-5/6'} />
          <Skeleton className={'h-4 w-4/6'} />
        </div>
      </div>
    </div>
  );
};
