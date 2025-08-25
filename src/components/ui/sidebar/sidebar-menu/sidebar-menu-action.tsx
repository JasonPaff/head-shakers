'use client';

import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva([
  'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center',
  'rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-none',
  // animation styles
  'transition-transform',
  // hover styles
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  'peer-hover/menu-button:text-sidebar-accent-foreground',
  // focus-visible styles
  'focus-visible:ring-2',
  // child svg styles
  '[&>svg]:size-4 [&>svg]:shrink-0',
  // after styles - increases the hit area of the button on mobile.
  'after:absolute after:-inset-2 after:md:hidden',
  // peer active styles
  'peer-data-active/menu-button:text-sidebar-accent-foreground',
  // peer size styles
  'peer-data-size-sm/menu-button:top-1',
  'peer-data-size-default/menu-button:top-1.5',
  'peer-data-size-lg/menu-button:top-2.5',
  // group styles
  'group-data-collapsible-icon:hidden',
  // open state styles
  'rdx-state-open:opacity-100',
  // md breakpoint styles
  'md:opacity-0',
]);

const hoverStyles = cva('group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100');

interface SidebarMenuActionProps extends ComponentPropsWithRef<'button'> {
  asChild?: boolean;
  isShowOnHover?: boolean;
}

export const SidebarMenuAction = ({
  asChild = false,
  className,
  isShowOnHover = false,
  ...props
}: SidebarMenuActionProps) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(styles(), isShowOnHover && hoverStyles(), className)}
      data-sidebar={'menu-action'}
      {...props}
    />
  );
};
