import type { ComponentProps, CSSProperties } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SkeletonProps = ComponentProps<'div'> & {
  width?: string;
};

export const Skeleton = ({ children, className, width, ...props }: SkeletonProps) => {
  return (
    <div
      className={cn('max-w-[--skeleton-width] animate-pulse rounded-md bg-accent', className)}
      data-slot={'skeleton'}
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

export const ButtonSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className={cn('flex space-x-2', className)}>
      <Skeleton className={'h-9 w-16'} />
      <Skeleton className={'h-9 w-16'} />
    </div>
  );
};

export const SidebarSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'flex h-[calc(100svh-var(--header-height))] w-[--sidebar-width] flex-col',
        'border-r bg-sidebar',
        className,
      )}
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

export const UserButtonSkeleton = ({ className }: { className?: string }) => {
  return <Skeleton className={cn('h-8 w-8 rounded-full', className)} />;
};
