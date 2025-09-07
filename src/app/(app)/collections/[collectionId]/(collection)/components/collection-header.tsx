import 'server-only';
import { ArrowLeftIcon, CalendarIcon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { CollectionByIdPublic } from '@/lib/queries/collections.queries';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';

interface CollectionHeaderProps {
  collection: CollectionByIdPublic;
  isOwner?: boolean;
}

export const CollectionHeader = ({ collection, isOwner = false }: CollectionHeaderProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <Fragment>
      {/* Back to Collections Button */}
      <div className={'mb-6 flex items-center gap-4'}>
        <Button asChild size={'sm'} variant={'outline'}>
          <Link href={$path({ route: '/dashboard/collection' })}>
            <ArrowLeftIcon aria-hidden className={'mr-2 size-4'} />
            Back to Collections
          </Link>
        </Button>
      </div>

      <div className={'flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'}>
        {/* Collection Info */}
        <div className={'flex-1'}>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{collection.name}</h1>
          <p className={'max-w-3xl text-lg text-pretty text-muted-foreground'}>{collection.description}</p>
        </div>

        <div className={'flex flex-col justify-between gap-4 sm:flex-row lg:justify-normal'}>
          {/* Collection Metadata */}
          <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {collection.createdAt.toLocaleDateString()}
            </div>
            <div>{collection.totalBobbleheadCount} Bobbleheads</div>
          </div>

          {/* Add Bobblehead Button - Only show to owners */}
          <Conditional isCondition={isOwner}>
            <Button asChild className={'w-full sm:w-auto'}>
              <Link
                href={$path({ route: '/bobbleheads/add', searchParams: { collectionId: collection.id } })}
              >
                <PlusIcon aria-hidden className={'mr-2 size-4'} />
                Add Bobblehead
              </Link>
            </Button>
          </Conditional>
        </div>
      </div>
    </Fragment>
  );
};
