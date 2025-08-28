'use client';

import type { ComponentProps } from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/utils/tailwind-utils';

type PopoverAnchorProps = ComponentProps<typeof PopoverPrimitive.Anchor>;
type PopoverContentProps = ComponentProps<typeof PopoverPrimitive.Content>;
type PopoverProps = ComponentProps<typeof PopoverPrimitive.Root>;
type PopoverTriggerProps = ComponentProps<typeof PopoverPrimitive.Trigger>;

export const Popover = ({ children, ...props }: PopoverProps) => {
  return (
    <PopoverPrimitive.Root data-slot={'popover'} {...props}>
      {children}
    </PopoverPrimitive.Root>
  );
};

export const PopoverAnchor = ({ children, ...props }: PopoverAnchorProps) => {
  return (
    <PopoverPrimitive.Anchor data-slot={'popover-anchor'} {...props}>
      {children}
    </PopoverPrimitive.Anchor>
  );
};

export const PopoverContent = ({
  align = 'center',
  children,
  className,
  sideOffset = 4,
  ...props
}: PopoverContentProps) => {
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
        sideOffset={sideOffset}
        {...props}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
};

export const PopoverTrigger = ({ children, ...props }: PopoverTriggerProps) => {
  return (
    <PopoverPrimitive.Trigger data-slot={'popover-trigger'} {...props}>
      {children}
    </PopoverPrimitive.Trigger>
  );
};
