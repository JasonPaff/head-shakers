import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarFooterProps = ComponentPropsWithRef<'div'>;

export const SidebarFooter = ({ children, className, ...props }: SidebarFooterProps) => {
  return (
    <div className={cn('flex flex-col gap-2 p-2', className)} data-sidebar={'footer'} {...props}>
      {children}
    </div>
  );
};
