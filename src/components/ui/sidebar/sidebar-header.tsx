import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarHeaderProps = ComponentPropsWithRef<'div'>;

export const SidebarHeader = ({ children, className, ...props }: SidebarHeaderProps) => {
  return (
    <div className={cn('flex flex-col gap-2 p-2', className)} data-sidebar={'header'} {...props}>
      {children}
    </div>
  );
};
