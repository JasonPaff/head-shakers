'use client';

import type { ComponentPropsWithRef } from 'react';

import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar/sidebar-provider/use-sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/utils/tailwind-utils';

type SidebarTriggerProps = ComponentPropsWithRef<typeof Button>;

export const SidebarTrigger = ({ className, onClick, ...props }: SidebarTriggerProps) => {
  const { isOpen, toggleOpen } = useSidebar();

  const handleSidebarToggle = (event: ButtonMouseEvent) => {
    onClick?.(event);
    toggleOpen();
  };

  const tooltipText = `${isOpen ? 'Close' : 'Open'} Sidebar`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn('size-6', className)}
          data-sidebar={'trigger'}
          data-slot={'sidebar-trigger'}
          onClick={handleSidebarToggle}
          size={'icon'}
          suppressHydrationWarning
          variant={'ghost'}
          {...props}
        >
          {isOpen ?
            <PanelLeftCloseIcon aria-hidden className={'size-5'} />
          : <PanelLeftOpenIcon aria-hidden className={'size-5'} />}
          <span className={'sr-only'}>{tooltipText}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};
