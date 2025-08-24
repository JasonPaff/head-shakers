'use client';

import type { ComponentProps } from 'react';

import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/utils/tailwind-utils';

type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root>;

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'peer inline-flex h-6 w-10 shrink-0 items-center rounded-full border-2 border-transparent',
        'transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary',
        'data-[state=unchecked]:bg-input',
        className,
      )}
      data-slot={'switch'}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'pointer-events-none block size-5 rounded-full bg-background shadow-xs ring-0',
          'transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
          'data-[state=checked]:rtl:-translate-x-4',
        )}
        data-slot={'switch-thumb'}
      />
    </SwitchPrimitive.Root>
  );
}
