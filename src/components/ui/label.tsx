'use client';

import type { ComponentProps } from 'react';

import { Root as LabelRoot } from '@radix-ui/react-label';

import { cn } from '@/utils/tailwind-utils';

type LabelProps = ComponentProps<typeof LabelRoot>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <LabelRoot
      className={cn(
        'flex items-center gap-2 text-sm leading-none font-medium select-none',
        'group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50',
        'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      data-slot={'label'}
      {...props}
    />
  );
}
