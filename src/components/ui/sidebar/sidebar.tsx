/* eslint-disable react-snob/no-inline-styles */
'use client';

import type { ComponentPropsWithRef, CSSProperties } from 'react';

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useSidebar } from '@/components/ui/sidebar/sidebar-provider/use-sidebar';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/utils/tailwind-utils';

const SIDEBAR_WIDTH_MOBILE = '18rem';

interface SidebarProps extends ComponentPropsWithRef<'div'> {
  collapsible?: 'icon' | 'none' | 'offcanvas';
  side?: 'left' | 'right';
  variant?: 'floating' | 'inset' | 'sidebar';
}

export const Sidebar = ({
  children,
  className,
  collapsible = 'offcanvas',
  side = 'left',
  variant = 'sidebar',
  ...props
}: SidebarProps) => {
  const { isMobile } = useBreakpoint();
  const { isDraggingRail, isOpen, setOpen, state } = useSidebar();

  if (collapsible === 'none') {
    return (
      <div
        className={cn('flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground', className)}
        {...props}
      >
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet onOpenChange={setOpen} open={isOpen} {...props}>
        <SheetContent
          className={'w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden'}
          data-mobile={'true'}
          data-sidebar={'sidebar'}
          data-slot={'sidebar'}
          side={side}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as CSSProperties
          }
        >
          <SheetHeader className={'sr-only'}>
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className={'flex h-full w-full flex-col'}>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className={'group peer block text-sidebar-foreground'}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-dragging={isDraggingRail}
      data-side={side}
      data-state={state}
      data-variant={variant}
    >
      {/* this is what handles the sidebar gap on desktop */}
      <div
        className={cn(
          'relative h-svh w-[--sidebar-width] bg-transparent',
          // animation styles
          'transition-[width] duration-200 ease-linear',
          // group side-right styles
          'group-rdx-side-right:rotate-180',
          // group data-collapsible styles
          'group-data-collapsible-offcanvas:w-0',
          // adjust the width for floating and inset variants
          variant === 'floating' || variant === 'inset' ?
            'group-data-collapsible-icon:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]'
          : 'group-data-collapsible-icon:w-[--sidebar-width-icon]',
          // set duration to 0 for all elements when dragging.
          'group-data-[dragging=true]_*:!duration-0 group-data-[dragging=true]:!duration-0',
        )}
      />
      <div
        className={cn(
          'fixed inset-y-0 z-10 h-svh w-[--sidebar-width]',
          'flex bg-muted/50 transition-[left,right,width] duration-200 ease-linear',
          side === 'left' ?
            'left-0 group-data-collapsible-offcanvas:left-[calc(var(--sidebar-width)*-1)]'
          : 'right-0 group-data-collapsible-offcanvas:right-[calc(var(--sidebar-width)*-1)]',
          // adjust the padding for floating and inset variants
          variant === 'floating' || variant === 'inset' ?
            'p-2 group-data-collapsible-icon:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]'
          : [
              'group-data-collapsible-icon:w-[--sidebar-width-icon]',
              'group-data-side-right:border-l group-rdx-side-left:border-r',
            ],
          // set duration to 0 for all elements when dragging.
          'group-data-[dragging=true]_*:!duration-0 group-data-[dragging=true]:!duration-0',
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'flex size-full flex-col bg-sidebar',
            // group variant styles
            'group-data-variant-floating:rounded-lg group-data-variant-floating:border',
            'group-data-variant-floating:border-sidebar-border group-data-variant-floating:shadow',
          )}
          data-sidebar={'sidebar'}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
