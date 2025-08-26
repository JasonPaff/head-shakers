import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarMenuProps = ComponentPropsWithRef<'ul'>;

export const SidebarMenu = ({ children, className, ...props }: SidebarMenuProps) => (
  <ul
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    data-sidebar={'menu'}
    data-slot={'sidebar-menu'}
    {...props}
  >
    {children}
  </ul>
);
