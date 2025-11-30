'use client';

import { MenuIcon, PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

type CollectionMobileHeaderProps = {
  collectionName?: string;
  onAddClick?: () => void;
  onMenuClick: () => void;
};

export const CollectionMobileHeader = ({
  collectionName = 'My Collection',
  onAddClick,
  onMenuClick,
}: CollectionMobileHeaderProps) => {
  return (
    <div
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 p-4 backdrop-blur-sm',
        'lg:hidden',
      )}
      data-slot={'mobile-header'}
    >
      <Button onClick={onMenuClick} size={'icon'} variant={'ghost'}>
        <MenuIcon className={'size-5'} />
        <span className={'sr-only'}>Open menu</span>
      </Button>

      <h1 className={'flex-1 truncate text-lg font-semibold'}>{collectionName}</h1>

      <Button onClick={onAddClick} size={'sm'}>
        <PlusIcon aria-hidden className={'size-4'} />
        <span className={'sr-only'}>Add bobblehead</span>
      </Button>
    </div>
  );
};
