'use client';

import type { ComponentProps } from 'react';

import { Arrow, Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type TooltipContentProps = ComponentProps<typeof Content> & ComponentTestIdProps;
type TooltipProps = ComponentProps<typeof Root> & ComponentTestIdProps;
type TooltipProviderProps = ComponentProps<typeof Provider> & ComponentTestIdProps;
type TooltipTriggerProps = ComponentProps<typeof Trigger> & ComponentTestIdProps;

export const Tooltip = ({ testId, ...props }: TooltipProps) => {
  const tooltipTestId = testId || generateTestId('ui', 'tooltip');

  return (
    <TooltipProvider>
      <Root data-slot={'tooltip'} data-testid={tooltipTestId} {...props} />
    </TooltipProvider>
  );
};

export const TooltipContent = ({
  children,
  className,
  sideOffset = 0,
  testId,
  ...props
}: TooltipContentProps) => {
  const contentTestId = testId || generateTestId('ui', 'tooltip', 'content');

  return (
    <Portal>
      <Content
        className={cn(
          'z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md bg-primary',
          'animate-in px-3 py-1.5 text-xs text-balance text-primary-foreground fade-in-0 zoom-in-95',
          'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
          'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
          className,
        )}
        data-slot={'tooltip-content'}
        data-testid={contentTestId}
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

export const TooltipProvider = ({ children, delayDuration = 0, testId, ...props }: TooltipProviderProps) => {
  const providerTestId = testId || generateTestId('ui', 'tooltip', 'provider');

  return (
    <Provider
      data-slot={'tooltip-provider'}
      data-testid={providerTestId}
      delayDuration={delayDuration}
      {...props}
    >
      {children}
    </Provider>
  );
};

export const TooltipTrigger = ({ children, testId, ...props }: TooltipTriggerProps) => {
  const triggerTestId = testId || generateTestId('ui', 'tooltip', 'trigger');

  return (
    <Trigger data-slot={'tooltip-trigger'} data-testid={triggerTestId} {...props}>
      {children}
    </Trigger>
  );
};
