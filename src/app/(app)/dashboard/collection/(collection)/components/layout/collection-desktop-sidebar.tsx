import type { ReactNode } from 'react';

import { cn } from '@/utils/tailwind-utils';

type CollectionDesktopSidebarProps = {
  children: ReactNode;
};

export const CollectionDesktopSidebar = ({ children }: CollectionDesktopSidebarProps) => {
  return (
    <div
      className={cn(
        'hidden flex-col border-r lg:flex lg:w-80',
        'bg-gradient-to-br from-muted/50 via-background/80 to-muted/30',
        'backdrop-blur-sm',
      )}
      data-slot={'desktop-sidebar'}
    >
      {children}
    </div>
  );
};
