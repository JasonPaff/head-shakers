import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarGroupProps = ComponentPropsWithRef<'div'>;

export const SidebarGroup = ({ children, className, ...props }: SidebarGroupProps) => {
  return (
    <div className={cn('relative flex w-full min-w-0 flex-col p-2', className)} data-sidebar={'group'} {...props}>
      {children}
    </div>
  );
};
