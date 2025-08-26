import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarMenuItemProps = ComponentPropsWithRef<'li'>;

export const SidebarMenuItem = ({ children, className, ...props }: SidebarMenuItemProps) => (
  <li
    className={cn('group/menu-item relative', className)}
    data-sidebar={'menu-item'}
    data-slot={'sidebar-menu-item'}
    {...props}
  >
    {children}
  </li>
);
