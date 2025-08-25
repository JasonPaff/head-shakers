import type { ComponentPropsWithRef } from 'react';

import { cva } from 'class-variance-authority';

import { cn } from '@/utils/tailwind-utils';

const styles = cva([
  'mx-3.5 flex min-w-0 flex-col gap-1 border-l',
  'border-sidebar-border px-2.5 py-0.5',
  // animation styles
  'translate-x-px',
  // group styles
  'group-data-collapsible-icon:hidden',
]);

type SidebarMenuSubProps = ComponentPropsWithRef<'ul'>;

export const SidebarMenuSub = ({ children, className, ...props }: SidebarMenuSubProps) => (
  <ul className={cn(styles(), className)} data-sidebar={'menu-sub'} {...props}>
    {children}
  </ul>
);
