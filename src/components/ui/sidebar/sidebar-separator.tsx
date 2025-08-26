import type { ComponentPropsWithRef } from 'react';

import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/tailwind-utils';

type SidebarSeparatorProps = ComponentPropsWithRef<typeof Separator>;

export const SidebarSeparator = ({ children, className, ...props }: SidebarSeparatorProps) => {
  return (
    <Separator
      className={cn('mx-2 w-auto bg-sidebar-border', className)}
      data-sidebar={'separator'}
      data-slot={'sidebar-separator'}
      {...props}
    >
      {children}
    </Separator>
  );
};
