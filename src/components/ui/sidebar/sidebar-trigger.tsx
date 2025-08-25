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

  const tooltipText = `${isOpen ? 'Close' : 'Open'} Sidebar`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn('size-7', className)}
          data-sidebar={'trigger'}
          onClick={(event) => {
            onClick?.(event);
            toggleOpen();
          }}
          size={'icon'}
          variant={'ghost'}
          {...props}
        >
          {isOpen ?
            <PanelLeftCloseIcon />
          : <PanelLeftOpenIcon />}
          <span className={'sr-only'}>{tooltipText}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltipText}</TooltipContent>
    </Tooltip>
  );
};
