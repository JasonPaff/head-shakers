'use client';

import { BoxIcon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

interface NoBobbleheadsProps {
  collectionId?: string;
}

export const NoBobbleheads = ({ collectionId }: NoBobbleheadsProps) => {
  return (
    <div
      className={`flex h-full min-h-[400px] w-full flex-col items-center justify-center
        rounded-lg border border-dashed bg-card p-8 text-center`}
      data-slot={'no-bobbleheads'}
    >
      <BoxIcon aria-hidden className={'mb-4 size-12 text-muted-foreground/50'} />
      <h3 className={'mb-2 text-lg font-semibold'}>No Bobbleheads Yet</h3>
      <p className={'mb-4 max-w-sm text-sm text-muted-foreground'}>
        Start building this collection by adding your first bobblehead
      </p>
      <Button asChild>
        <Link href={$path({ route: '/bobbleheads/add', searchParams: { collectionId } })}>
          <PlusIcon aria-hidden className={'size-4'} />
          Add Your First Bobblehead
        </Link>
      </Button>
    </div>
  );
};
