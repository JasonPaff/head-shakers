import 'server-only';
import { ArrowLeftIcon, CalendarIcon, EyeIcon, PlusIcon, StarIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { CollectionById } from '@/lib/queries/collections.queries';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CollectionProps {
  collection: CollectionById;
}

export const Collection = ({ collection }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      <div>
        {/* Header Section */}
        <div className={'border-b border-border'}>
          <div className={'mx-auto max-w-7xl p-2'}>
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
                <p className={'max-w-3xl text-lg text-pretty text-muted-foreground'}>
                  {collection.description}
                </p>
              </div>

              <div className={'flex flex-col gap-4 sm:flex-row'}>
                {/* Collection Metadata */}
                <div className={'flex flex-wrap items-center gap-4 text-sm text-muted-foreground'}>
                  <div className={'flex items-center gap-2'}>
                    <CalendarIcon aria-hidden className={'size-4'} />
                    Created {collection.createdAt.toLocaleDateString()}
                  </div>
                  <div>{collection.totalItems} Bobbleheads</div>
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
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <div className={'mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'}>
          {/* Total Items Card */}
          <Card>
            <CardContent className={'p-6'}>
              <div className={'flex items-center justify-between'}>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Total Items</p>
                  <p className={'text-2xl font-bold text-primary'}>{collection.totalItems}</p>
                </div>
                <StarIcon aria-hidden className={'size-8 text-muted-foreground'} />
              </div>
            </CardContent>
          </Card>

          {/* Example Metric Card */}
          <Card>
            <CardContent className={'p-6'}>
              <div className={'flex items-center justify-between'}>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Subcollections</p>
                  <p className={'text-2xl font-bold text-primary'}>test</p>
                </div>
                <EyeIcon aria-hidden className={'size-8 text-muted-foreground'} />
              </div>
            </CardContent>
          </Card>

          {/* Last Updated Card */}
          <Card>
            <CardContent className={'p-6'}>
              <div className={'flex items-center justify-between'}>
                <div>
                  <p className={'text-sm text-muted-foreground'}>Last Updated</p>
                  <p className={'text-sm font-medium text-foreground'}>
                    {collection.lastItemAddedAt?.toLocaleDateString() ?? 'N/A'}
                  </p>
                </div>
                <CalendarIcon aria-hidden className={'size-8 text-muted-foreground'} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
