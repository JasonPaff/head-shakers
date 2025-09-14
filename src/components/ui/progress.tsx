'use client';

import type { ComponentProps } from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/utils/tailwind-utils';

type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root>;

export const Progress = ({ className, value, ...props }: ProgressProps) => {
  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      data-slot={'progress'}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={'h-full w-full flex-1 bg-primary transition-all'}
        data-slot={'progress-indicator'}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
