import type { ComponentPropsWithRef } from 'react';

import { cn } from '@/utils/tailwind-utils';

type SidebarContentProps = ComponentPropsWithRef<'div'>;

export const SidebarContent = ({ children, className, ...props }: SidebarContentProps) => {
  return (
    <div
      className={cn(
        'flex min-h-0 flex-1 flex-col overflow-auto',
        // group data-collapsible styles
        'group-data-collapsible-icon:overflow-hidden',
        className,
      )}
      data-sidebar={'content'}
      {...props}
    >
      <div className={'mt-2'}>{children}</div>
    </div>
  );
};
