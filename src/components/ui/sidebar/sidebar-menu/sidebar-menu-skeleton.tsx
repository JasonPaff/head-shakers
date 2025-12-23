'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { useState } from 'react';

import { Conditional } from '@/components/ui/conditional';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/tailwind-utils';

interface SidebarMenuSkeletonProps extends ComponentPropsWithRef<'div'> {
  isShowIcon?: boolean;
}

export const SidebarMenuSkeleton = ({
  className,
  isShowIcon = false,
  ...props
}: SidebarMenuSkeletonProps) => {
  const [width] = useState(() => `${Math.floor(Math.random() * 40) + 50}%`);

  return (
    <div
      className={cn('flex h-8 items-center gap-2 rounded-sm px-2', className)}
      data-sidebar={'menu-skeleton'}
      data-slot={'sidebar-menu-skeleton'}
      {...props}
    >
      <Conditional isCondition={isShowIcon}>
        <Skeleton className={'size-4 rounded-sm'} data-sidebar={'menu-skeleton-icon'} />
      </Conditional>
      <Skeleton
        className={'h-4 flex-1'}
        data-sidebar={'menu-skeleton-text'}
        style={
          {
            '--skeleton-width': width,
          } as CSSProperties
        }
      />
    </div>
  );
};
