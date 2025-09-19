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

export const ButtonSkeleton = ({ className, testId }: { className?: string; testId?: string }) => {
  const buttonSkeletonTestId = testId || generateTestId('ui', 'skeleton-button');

  return (
    <div className={cn('flex space-x-2', className)} data-testid={buttonSkeletonTestId}>
      <Skeleton className={'h-9 w-16'} />
      <Skeleton className={'h-9 w-16'} />
    </div>
  );
};

export const SidebarSkeleton = ({ className, testId }: { className?: string; testId?: string }) => {
  const sidebarSkeletonTestId = testId || generateTestId('ui', 'skeleton-sidebar');

  return (
    <div
      className={cn(
        'flex h-[calc(100svh-var(--header-height))] w-[--sidebar-width] flex-col',
        'border-r bg-sidebar',
        className,
      )}
      data-testid={sidebarSkeletonTestId}
    >
      <div className={'flex flex-col gap-2 p-2'}>
        <Skeleton className={'h-10 w-full'} />
        <Skeleton className={'h-10 w-full'} />
        <Skeleton className={'h-10 w-full'} />
      </div>
      <div className={'mt-auto flex flex-col gap-2 p-2'}>
        <Skeleton className={'h-10 w-full'} />
        <Skeleton className={'h-10 w-full'} />
      </div>
    </div>
  );
};

export const UserButtonSkeleton = ({ className, testId }: { className?: string; testId?: string }) => {
  const userButtonSkeletonTestId = testId || generateTestId('ui', 'skeleton-user-button');

  return <Skeleton className={cn('h-8 w-8 rounded-full', className)} testId={userButtonSkeletonTestId} />;
};
