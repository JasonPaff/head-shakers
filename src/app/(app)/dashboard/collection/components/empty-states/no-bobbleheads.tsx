'use client';

import { BoxIcon, PlusIcon } from 'lucide-react';
import { useQueryStates } from 'nuqs';

import { collectionDashboardParsers } from '@/app/(app)/dashboard/collection/route-type';
import { Button } from '@/components/ui/button';

export const NoBobbleheads = () => {
  const [, setParams] = useQueryStates({ add: collectionDashboardParsers.add }, { shallow: false });

  const handleAddClick = () => {
    void setParams({ add: true });
  };

  return (
    <div
      className={`flex h-full min-h-100 w-full flex-col items-center justify-center
        rounded-lg border border-dashed bg-card p-8 text-center`}
      data-slot={'no-bobbleheads'}
    >
      <BoxIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No Bobbleheads Yet</h3>
      <p className={'mb-4 max-w-sm text-sm text-muted-foreground'}>
        Start building this collection by adding your first bobblehead
      </p>
      <Button onClick={handleAddClick}>
        <PlusIcon aria-hidden className={'size-4'} />
        Add Your First Bobblehead
      </Button>
    </div>
  );
};
