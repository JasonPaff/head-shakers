import 'server-only';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheadControls } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobblehead-controls';
import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface CollectionBobbleheadsProps {
  collection: NonNullable<PublicCollection>;
  searchParams?: CollectionSearchParams;
}

export const CollectionBobbleheads = async ({ collection, searchParams }: CollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(collection.userId);

  const view = searchParams?.view || 'collection';
  const searchTerm = searchParams?.q || undefined;
  const sortBy = searchParams?.sort || 'newest';

  const options = {
    searchTerm,
    sortBy,
  };

  console.log('SEARCHING!!!!!!', searchParams);

  const bobbleheads =
    view === 'collection' ?
      await CollectionsFacade.getCollectionBobbleheadsWithPhotos(
        collection.id,
        currentUserId || undefined,
        options,
      )
    : await CollectionsFacade.getAllCollectionBobbleheadsWithPhotos(
        collection.id,
        currentUserId || undefined,
        options,
      );

  const isEmpty = bobbleheads.length === 0;

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        {/* Section Title */}
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Collection</h2>

        {/* Add Bobblehead Button */}
        <Conditional isCondition={isOwner}>
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
              isOwner ?
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
              isOwner={isOwner}
              key={bobblehead.id}
            />
          ))}
        </div>
      </Conditional>
    </div>
  );
};
