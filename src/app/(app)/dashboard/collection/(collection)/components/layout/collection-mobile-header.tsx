'use client';

import { MenuIcon, PlusIcon } from 'lucide-react';
import { useQueryStates } from 'nuqs';

import { Button } from '@/components/ui/button';
import { cn } from '@/utils/tailwind-utils';

import { collectionDashboardParsers } from '../../route-type';

type CollectionMobileHeaderProps = {
  collectionName?: string;
  onMenuClick: () => void;
};

export const CollectionMobileHeader = ({
  collectionName = 'My Collection',
  onMenuClick,
}: CollectionMobileHeaderProps) => {
  const [, setParams] = useQueryStates({ add: collectionDashboardParsers.add }, { shallow: false });

  const handleAddClick = () => {
    void setParams({ add: true });
  };

  return (
    <div
      className={cn(
        'sticky top-[var(--header-height)] z-30 flex items-center gap-3 border-b bg-background/95 p-4 backdrop-blur-sm',
        'lg:hidden',
      )}
      data-slot={'mobile-header'}
    >
      <Button onClick={onMenuClick} size={'icon'} variant={'ghost'}>
        <MenuIcon aria-hidden className={'size-5'} />
        <span className={'sr-only'}>Open menu</span>
      </Button>

      <h1 className={'flex-1 truncate text-lg font-semibold'}>{collectionName}</h1>

      <Button onClick={handleAddClick} size={'sm'}>
        <PlusIcon aria-hidden className={'size-4'} />
        <span className={'sr-only'}>Add bobblehead</span>
      </Button>
    </div>
  );
};
