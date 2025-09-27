'use client';

import type { ComponentProps } from 'react';

import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@/utils/tailwind-utils';

type HoverCardContentProps = ComponentProps<typeof HoverCardPrimitive.Content>;
type HoverCardProps = ComponentProps<typeof HoverCardPrimitive.Root>;
type HoverCardTriggerProps = ComponentProps<typeof HoverCardPrimitive.Trigger>;

export const HoverCard = ({ ...props }: HoverCardProps) => {
  return <HoverCardPrimitive.Root data-slot={'hover-card'} {...props} />;
};

export const HoverCardContent = ({
  align = 'center',
  className,
  sideOffset = 4,
  ...props
}: HoverCardContentProps) => {
  return (
    <HoverCardPrimitive.Portal data-slot={'hover-card-portal'}>
      <HoverCardPrimitive.Content
        align={align}
        className={cn(
          'z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border',
          'bg-popover p-4 text-popover-foreground shadow-md outline-hidden',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:animate-in',
          'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          className,
        )}
        data-slot={'hover-card-content'}
        sideOffset={sideOffset}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
};

export const HoverCardTrigger = ({ ...props }: HoverCardTriggerProps) => {
  return <HoverCardPrimitive.Trigger data-slot={'hover-card-trigger'} {...props} />;
};
