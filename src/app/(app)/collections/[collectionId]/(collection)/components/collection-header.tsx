import 'server-only';
import { ArrowLeftIcon, CalendarIcon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Fragment } from 'react';

import type { CollectionById } from '@/lib/queries/collections.queries';

import { Button } from '@/components/ui/button';

interface CollectionHeaderProps {
  collection: CollectionById;
}

export const CollectionHeader = ({ collection }: CollectionHeaderProps) => {
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

        <div className={'flex flex-col gap-4 sm:flex-row'}>
          {/* Collection Metadata */}
          <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
            <div className={'flex items-center gap-2'}>
              <CalendarIcon aria-hidden className={'size-4'} />
              Created {collection.createdAt.toLocaleDateString()}
            </div>
            <div>{collection.totalBobbleheadCount} Bobbleheads</div>
          </div>

          {/* Add Bobblehead Button */}
          <Link href={$path({ route: '/items/add', searchParams: { collectionId: collection.id } })}>
            <Button className={'w-full sm:w-auto'}>
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Button>
          </Link>
        </div>
      </div>
    </Fragment>
  );
};
