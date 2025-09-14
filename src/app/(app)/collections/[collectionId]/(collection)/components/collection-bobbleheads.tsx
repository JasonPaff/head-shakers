'use client';

import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheadControls } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobblehead-controls';
import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';

interface CollectionBobbleheadsProps {
  collection: NonNullable<PublicCollection>;
}

const viewOptions = ['all', 'collection'] as const;
const sortOptions = ['newest', 'oldest', 'name_asc', 'name_desc'] as const;

export const CollectionBobbleheads = ({ collection }: CollectionBobbleheadsProps) => {
  const { user } = useUser();
  const currentUserId = user?.id;
  const isCurrentUserOwner = collection.userId === currentUserId;

  const [{ q, sort, view }] = useQueryStates({
    q: parseAsString.withDefault(''),
    sort: parseAsStringEnum([...sortOptions]).withDefault('newest'),
    view: parseAsStringEnum([...viewOptions]).withDefault('all'),
  });

  const { data: bobbleheads = [], isLoading } = useQuery({
    queryFn: async () => {
      const options = {
        searchTerm: q || undefined,
        sortBy: sort,
      };

      if (view === 'collection') {
        return CollectionsFacade.getCollectionBobbleheadsWithPhotos(
          collection.id,
          currentUserId || undefined,
          options,
        );
      } else {
        return CollectionsFacade.getAllCollectionBobbleheadsWithPhotos(
          collection.id,
          currentUserId || undefined,
          options,
        );
      }
    },
    queryKey: ['collection-bobbleheads', collection.id, view, q, sort, currentUserId],
  });

  const isEmpty = bobbleheads.length === 0;

  if (isLoading) {
    return (
      <div>
        <div className={'mb-6 flex items-center justify-between'}>
          <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Collection</h2>
          <Conditional isCondition={isCurrentUserOwner}>
            <Button asChild size={'sm'} variant={'outline'}>
              <Link
                href={$path({
                  route: '/bobbleheads/add',
                  searchParams: { collectionId: collection.id },
                })}
              >
                <PlusIcon aria-hidden className={'mr-2 size-4'} />
                Add Bobblehead
              </Link>
            </Button>
          </Conditional>
        </div>

        <CollectionBobbleheadControls />

        <div className={'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div className={'h-80 animate-pulse rounded-lg bg-muted'} key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        {/* Section Title */}
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Collection</h2>

        {/* Add Bobblehead Button */}
        <Conditional isCondition={isCurrentUserOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/add',
                searchParams: { collectionId: collection.id },
              })}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </Conditional>
      </div>

      {/* Filter Controls */}
      <CollectionBobbleheadControls />

      {/* Empty State */}
      <Conditional isCondition={isEmpty}>
        <div className={'mt-6'}>
          <EmptyState
            action={
              isCurrentUserOwner ?
                <Button asChild>
                  <Link
                    href={$path({
                      route: '/bobbleheads/add',
                      searchParams: { collectionId: collection.id },
                    })}
                  >
                    <PlusIcon aria-hidden className={'mr-2 size-4'} />
                    Add First Bobblehead
                  </Link>
                </Button>
              : undefined
            }
            description={
              "This collection doesn't have any bobbleheads. Start building your collection by adding your first bobblehead."
            }
            icon={Package2Icon}
            title={'No Bobbleheads Yet'}
          />
        </div>
      </Conditional>

      {/* Bobblehead Grid */}
      <Conditional isCondition={!isEmpty}>
        <div className={'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadGalleryCard
              bobblehead={{
                ...bobblehead,
                collectionId: collection.id,
              }}
              isOwner={isCurrentUserOwner}
              key={bobblehead.id}
            />
          ))}
        </div>
      </Conditional>
    </div>
  );
};
