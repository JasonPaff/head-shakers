'use client';

import { PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { SubcollectionData } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-list';

import { SubcollectionActions } from '@/components/feature/subcollections/subcollection-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

type SubcollectionsListItemProps = {
  collection: {
    collectionName: string;
    isCollectionPublic: boolean;
    subcollections: Array<SubcollectionData>;
  };
  collectionId: string;
  searchTerm: string;
};

export const SubcollectionsListItem = ({
  collection,
  collectionId,
  searchTerm,
}: SubcollectionsListItemProps) => {
  const subcollections =
    collection.subcollections.filter(
      (subcollection) =>
        !searchTerm ||
        subcollection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcollection.collectionName.toLowerCase().includes(searchTerm.toLowerCase()),
    ) ?? [];

  return (
    <CardContent className={'pt-0'}>
      <div className={'space-y-2'}>
        {subcollections.map((subcollection) => (
          <div
            className={`group flex items-start justify-between rounded-lg border border-border/50
              bg-card p-4 shadow-sm transition-all hover:border-border hover:shadow-md`}
            key={subcollection.id}
          >
            <div className={'flex min-w-0 flex-1 flex-col gap-2 pr-4'}>
              <div className={'flex items-center gap-3'}>
                {/* Subcollection Link */}
                <Link
                  className={'font-medium text-foreground hover:text-primary'}
                  href={$path({
                    route: '/collections/[collectionId]/subcollections/[subcollectionId]',
                    routeParams: {
                      collectionId: subcollection.collectionId,
                      subcollectionId: subcollection.id,
                    },
                  })}
                >
                  {subcollection.name}
                </Link>

                {/* Bobblehead Count Badge */}
                <Badge variant={'secondary'}>
                  {subcollection.bobbleheadCount} bobblehead
                  {subcollection.bobbleheadCount !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Subcollection Description */}
              <Conditional isCondition={!!subcollection.description}>
                <p className={'line-clamp-2 text-sm text-muted-foreground'}>{subcollection.description}</p>
              </Conditional>
            </div>

            <div
              className={`flex flex-shrink-0 items-center gap-2 opacity-80
                transition-opacity group-hover:opacity-100`}
            >
              {/* Add Bobblehead Button */}
              <Button asChild className={'shadow-sm'} size={'sm'} variant={'outline'}>
                <Link
                  href={$path({
                    route: '/bobbleheads/add',
                    searchParams: {
                      collectionId: subcollection.collectionId,
                      subcollectionId: subcollection.id,
                    },
                  })}
                >
                  <PlusIcon aria-hidden className={'mr-2 size-4'} />
                  Add Bobblehead
                </Link>
              </Button>

              {/* Actions Dropdown */}
              <SubcollectionActions
                subcollection={{
                  description: subcollection.description,
                  id: subcollection.id,
                  name: subcollection.name,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Subcollection Button */}
      <div className={'mt-4 border-t pt-4'}>
        <Button asChild className={'w-full'} size={'sm'} variant={'outline'}>
          <Link
            href={$path({
              route: '/collections/[collectionId]/subcollections/create',
              routeParams: { collectionId: collectionId },
            })}
          >
            <PlusIcon aria-hidden className={'mr-2 size-4'} />
            Add Subcollection to {collection.collectionName}
          </Link>
        </Button>
      </div>
    </CardContent>
  );
};
