 
'use client';

import type { ComponentProps, CSSProperties } from 'react';

import { useState } from 'react';

import type { SidebarContextType } from '@/components/ui/sidebar/sidebar-provider/use-sidebar';
import type { UseSidebarProviderStateProps } from '@/components/ui/sidebar/sidebar-provider/use-sidebar-provider';

import { SidebarContext } from '@/components/ui/sidebar/sidebar-provider/use-sidebar';
import { useSidebarProvider } from '@/components/ui/sidebar/sidebar-provider/use-sidebar-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

const SIDEBAR_WIDTH_ICON = '3rem';

type SidebarProviderProps = ComponentProps<'div'> &
  UseSidebarProviderStateProps & {
    defaultWidth?: string;
  };

export const SidebarProvider = ({
  children,
  className,
  defaultWidth = '16rem',
  isDefaultOpen = true,
  isOpen: isOpenProp,
  onOpenChange,
  style,
  ...props
}: SidebarProviderProps) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isDraggingRail, setIsDraggingRail] = useToggle();

  const { isOpen, setOpen, state, toggleOpen } = useSidebarProvider({
    isDefaultOpen: isDefaultOpen,
    isOpen: isOpenProp,
    onOpenChange,
  });

  const contextValue = {
    isDraggingRail,
    isOpen,
    setIsDraggingRail: setIsDraggingRail.update,
    setOpen,
    setWidth,
    state,
    toggleOpen,
    width,
  } satisfies SidebarContextType;

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider>
        <div
          className={cn(
            'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
            className,
          )}
          data-slot={'sidebar-wrapper'}
          style={
            {
              '--sidebar-width': width,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
};
