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
