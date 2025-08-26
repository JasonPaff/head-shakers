'use client';

import type { ComponentPropsWithRef } from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva([
  'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70',
  'ring-sidebar-ring outline-hidden transition-[margin,opacity] duration-200 ease-linear',
  'focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
  'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
]);

interface SidebarGroupLabelProps extends ComponentPropsWithRef<'div'> {
  asChild?: boolean;
}

export const SidebarGroupLabel = ({ asChild = false, className, ...props }: SidebarGroupLabelProps) => {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      className={cn(styles(), className)}
      data-sidebar={'group-label'}
      data-slot={'sidebar-group-label'}
      {...props}
    />
  );
};
