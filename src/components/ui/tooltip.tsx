'use client';

import type { ComponentProps } from 'react';

import { Arrow, Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';

import { cn } from '@/utils/tailwind-utils';

type TooltipContentProps = ComponentProps<typeof Content>;
type TooltipProps = ComponentProps<typeof Root>;
type TooltipProviderProps = ComponentProps<typeof Provider>;
type TooltipTriggerProps = ComponentProps<typeof Trigger>;

export const Tooltip = ({ ...props }: TooltipProps) => {
  return (
    <TooltipProvider>
      <Root data-slot={'tooltip'} {...props} />
    </TooltipProvider>
  );
};

export const TooltipContent = ({ children, className, sideOffset = 0, ...props }: TooltipContentProps) => {
  return (
    <Portal>
      <Content
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-primary',
          'px-3 py-1.5 text-xs text-balance text-primary-foreground animate-in fade-in-0 zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        data-slot={'tooltip-content'}
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <Arrow
          className={
            'z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-primary fill-primary'
          }
        />
      </Content>
    </Portal>
  );
};

export const TooltipProvider = ({ delayDuration = 0, ...props }: TooltipProviderProps) => {
  return <Provider data-slot={'tooltip-provider'} delayDuration={delayDuration} {...props} />;
};

export const TooltipTrigger = ({ ...props }: TooltipTriggerProps) => {
  return <Trigger data-slot={'tooltip-trigger'} {...props} />;
};
