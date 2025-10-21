import type { ComponentProps, CSSProperties } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type SkeletonProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    width?: string;
  };

export const Skeleton = ({ children, className, testId, width, ...props }: SkeletonProps) => {
  const skeletonTestId = testId || generateTestId('ui', 'skeleton');

  return (
    <div
      className={cn('max-w-[--skeleton-width] animate-pulse rounded-md bg-accent', className)}
      data-slot={'skeleton'}
      data-testid={skeletonTestId}
      style={
        {
          '--skeleton-width': width,
        } as CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
};

export const UserButtonSkeleton = ({ className, testId }: { className?: string; testId?: string }) => {
  const userButtonSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'user-button');

  return (
    <Skeleton className={cn('h-[35px] w-7 rounded-full', className)} testId={userButtonSkeletonTestId} />
  );
};

export const NotificationBellSkeleton = ({ className, testId }: { className?: string; testId?: string }) => {
  const notificationBellSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'notification-bell');

  return <Skeleton className={cn('size-5 rounded-sm', className)} testId={notificationBellSkeletonTestId} />;
};
