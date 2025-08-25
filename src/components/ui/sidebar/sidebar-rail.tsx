'use client';

import type { ComponentPropsWithRef } from 'react';

import { cva } from 'class-variance-authority';
import { useMemo } from 'react';

import type { Button } from '@/components/ui/button';

import { useSidebar } from '@/components/ui/sidebar/sidebar-provider/use-sidebar';
import { useSidebarResize } from '@/components/ui/sidebar/use-sidebar-resize';
import { mergeButtonRefs } from '@/utils/ref-utils';
import { cn } from '@/utils/tailwind-utils';

const sidebarRailVariants = cva([
  'absolute inset-y-0 z-20 hidden w-4',
  // animation styles
  '-translate-x-1/2 transition-all ease-linear',
  // after styles
  'after:absolute after:inset-y-0 after:left-1/2 after:w-[2px]',
  // hover styles
  'hover:after:bg-sidebar-border',
  // group side styles
  'group-rdx-side-left:-right-4 group-rdx-side-right:left-0',
  // sm breakpoint styles
  'sm:flex',
  // data-side left styles
  '[[data-side=left]_&]:cursor-w-resize',
  '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize',
  // data-side right styles
  '[[data-side=right]_&]:cursor-e-resize',
  '[[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
  // group data-collapsible styles
  'group-data-collapsible-offcanvas:translate-x-0',
  'group-data-collapsible-offcanvas:after:left-full',
  'group-data-collapsible-offcanvas:hover:bg-sidebar',
  // data-side data-collapsible styles
  '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
  '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
]);

type SidebarRailProps = ComponentPropsWithRef<typeof Button> & {
  isDragEnabled?: boolean;
};

export const SidebarRail = ({ children, className, isDragEnabled, ref, ...props }: SidebarRailProps) => {
  const { setIsDraggingRail, setWidth, state, toggleOpen, width } = useSidebar();

  const { dragRef, handleMouseDown } = useSidebarResize({
    currentWidth: width,
    isCollapsed: state === 'collapsed',
    isEnableDrag: isDragEnabled,
    maxResizeWidth: '28rem',
    minResizeWidth: '10rem',
    onResize: setWidth,
    onToggle: toggleOpen,
    setIsDraggingRail,
  });

  const combinedRef = useMemo(() => {
    if (!ref) return dragRef;
    return mergeButtonRefs([ref, dragRef]);
  }, [ref, dragRef]);

  return (
    <button
      aria-label={'Toggle Sidebar'}
      className={cn(sidebarRailVariants(), className)}
      data-sidebar={'rail'}
      onMouseDown={(e) => {
        handleMouseDown(e);
      }}
      ref={combinedRef}
      tabIndex={-1}
      title={'Toggle Sidebar'}
      {...props}
    >
      {children}
    </button>
  );
};
