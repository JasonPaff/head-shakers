import type { ReactNode } from 'react';

import { cn } from '@/utils/tailwind-utils';

import type { CollectionCardStyle } from './sidebar-search';

type SidebarCollectionListProps = {
  cardStyle: CollectionCardStyle;
  children: ReactNode;
};

export const SidebarCollectionList = ({ cardStyle, children }: SidebarCollectionListProps) => {
  return (
    <div
      className={cn('flex-1 overflow-y-auto p-3', cardStyle === 'cover' ? 'space-y-3' : 'space-y-2')}
      data-slot={'sidebar-content'}
    >
      {children}
    </div>
  );
};
