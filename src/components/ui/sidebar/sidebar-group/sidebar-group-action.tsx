'use client';

import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

interface SidebarGroupActionProps extends ComponentPropsWithRef<'button'> {
  asChild?: boolean;
}

const styles = cva([
  'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center',
  'rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-none',
  // animation styles
  'transition-transform',
  // hove styles
  'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
  // focus-visible styles
  'focus-visible:ring-2',
  // svg styles
  '[&>svg]:size-4 [&>svg]:shrink-0',
  // after styles - increases the hit area of the button on mobile.
  'after:absolute after:-inset-2 after:md:hidden',
  // group styles
  'group-data-collapsible-icon:hidden',
]);

export const SidebarGroupAction = ({ asChild = false, className, ...props }: SidebarGroupActionProps) => {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(styles(), className)} data-sidebar={'group-action'} {...props} />;
};
