'use client';

import type { ComponentProps } from 'react';

import * as ProgressPrimitive from '@radix-ui/react-progress';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root> & ComponentTestIdProps;

export const Progress = ({ className, testId, value, ...props }: ProgressProps) => {
  const progressTestId = testId || generateTestId('ui', 'progress');

  return (
    <ProgressPrimitive.Root
      className={cn('relative h-2 w-full overflow-hidden rounded-full bg-primary/20', className)}
      data-slot={'progress'}
      data-testid={progressTestId}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={'size-full flex-1 bg-primary transition-all'}
        data-slot={'progress-indicator'}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
};
