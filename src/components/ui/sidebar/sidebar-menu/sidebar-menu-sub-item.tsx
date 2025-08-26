import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarMenuSubItemProps = ComponentPropsWithRef<'li'>;

export const SidebarMenuSubItem = ({ children, className, ...props }: SidebarMenuSubItemProps) => {
  return (
    <li
      className={cn('group/menu-sub-item relative', className)}
      data-sidebar={'menu-sub-item'}
      data-slot={'sidebar-menu-sub-item'}
      {...props}
    >
      {children}
    </li>
  );
};
