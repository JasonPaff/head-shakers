'use client';

import type { ComponentProps } from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { CheckIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & ComponentTestIdProps;

export const Checkbox = ({ className, testId, ...props }: CheckboxProps) => {
  const checkboxTestId = testId || generateTestId('ui', 'checkbox');

  return (
    <CheckboxPrimitive.Root
      className={cn(
        'peer size-4 shrink-0 rounded-sm border border-input shadow-xs',
        'transition-shadow outline-none focus-visible:border-ring focus-visible:ring-[3px]',
        'focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
        'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
        'data-[state=checked]:text-primary-foreground dark:bg-input/30',
        'dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-primary',
        className,
      )}
      data-slot={'checkbox'}
      data-testid={checkboxTestId}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={'flex items-center justify-center text-current transition-none'}
        data-slot={'checkbox-indicator'}
      >
        <CheckIcon aria-hidden className={'size-3.5'} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
};
