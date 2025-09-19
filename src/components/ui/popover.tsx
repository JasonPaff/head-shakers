'use client';

import type { ComponentProps } from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type PopoverAnchorProps = ComponentProps<typeof PopoverPrimitive.Anchor> & ComponentTestIdProps;
type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content> & ComponentTestIdProps;
type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root> & ComponentTestIdProps;
type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger> & ComponentTestIdProps;

export const Popover = ({ children, testId, ...props }: PopoverProps) => {
  const popoverTestId = testId || generateTestId('ui', 'popover');

  return (
    <PopoverPrimitive.Root data-slot={'popover'} data-testid={popoverTestId} {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
};

export const PopoverAnchor = ({ children, testId, ...props }: PopoverAnchorProps) => {
  const popoverAnchorTestId = testId || generateTestId('ui', 'popover', 'anchor');

  return (
    <PopoverPrimitive.Anchor data-slot={'popover-anchor'} data-testid={popoverAnchorTestId} {...props}>
      {children}
    </PopoverPrimitive.Anchor>
  );
};

export const PopoverContent = ({
  align = 'center',
  children,
  className,
  sideOffset = 4,
  testId,
  ...props
}: PopoverContentProps) => {
  const popoverContentTestId = testId || generateTestId('ui', 'popover', 'content');

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(
          'z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border',
          'bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:animate-in',
          'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        data-slot={'popover-content'}
        data-testid={popoverContentTestId}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

export const PopoverTrigger = ({ children, testId, ...props }: PopoverTriggerProps) => {
  const popoverTriggerTestId = testId || generateTestId('ui', 'popover', 'trigger');

  return (
    <PopoverPrimitive.Trigger data-slot={'popover-trigger'} data-testid={popoverTriggerTestId} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
};
