import 'server-only';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheadControls } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls';
import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

interface CollectionBobbleheadsProps {
  collection: NonNullable<PublicCollection>;
  searchParams?: CollectionSearchParams;
}

export const CollectionBobbleheads = async ({ collection, searchParams }: CollectionBobbleheadsProps) => {
  const currentUserId = await getUserIdAsync();
  const isOwner = await getIsOwnerAsync(collection.userId);

  const searchTerm = searchParams?.search || undefined;
  const sortBy = searchParams?.sort || 'newest';

  const options = {
    searchTerm,
    sortBy,
  };

  const bobbleheads = await CollectionsFacade.getAllCollectionBobbleheadsWithPhotos(
    collection.id,
    currentUserId || undefined,
    options,
  );

  const isEmpty = bobbleheads.length === 0;
  const hasActiveFilters = searchTerm || sortBy !== 'newest';

  // Context-aware empty state messages
  const _emptyStateTitle = hasActiveFilters ? 'No Results Found' : 'No Bobbleheads Yet';

  const _emptyStateDescription =
    hasActiveFilters ?
      'No bobbleheads match your current search or filter criteria. Try adjusting your search terms or clearing filters.'
    : "This collection doesn't have any bobbleheads. Start building your collection by adding your first bobblehead.";

  return (
    <div>
      <div className={'mb-4 flex items-center justify-between'}>
        {/* Section Title */}
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Collection</h2>

        {/* Add Bobblehead Button */}
        <Conditional isCondition={isOwner}>
          <Button asChild variant={'outline'}>
            <Link
              href={$path({
                route: '/dashboard/collection',
                searchParams: { add: true },
              })}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </Conditional>
      </div>

      {/* Filter Controls */}
      <div className={'mb-4'}>
        <CollectionBobbleheadControls />
      </div>

      {/* Empty State */}
      <Conditional isCondition={isEmpty}>
        <EmptyState
          action={
            hasActiveFilters ?
              <Button asChild variant={'outline'}>
                <Link
                  href={$path({
                    route: '/collections/[collectionSlug]',
                    routeParams: { collectionSlug: collection.slug },
                  })}
                >
                  Clear All Filters
                </Link>
              </Button>
            : <Conditional isCondition={isOwner}>
                <Button asChild>
                  <Link
                    href={$path({
                      route: '/dashboard/collection',
                      searchParams: { add: true },
                    })}
                  >
                    <PlusIcon aria-hidden className={'mr-2 size-4'} />
                    Add First Bobblehead
                  </Link>
                </Button>
              </Conditional>
          }
          description={_emptyStateDescription}
          icon={Package2Icon}
          title={_emptyStateTitle}
        />
      </Conditional>

      {/* Bobblehead Grid */}
      <Conditional isCondition={!isEmpty}>
        <div className={'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadGalleryCard
              bobblehead={bobblehead}
              isOwner={isOwner}
              key={bobblehead.id}
              navigationContext={{ collectionId: collection.id }}
            />
          ))}
        </div>
      </Conditional>
    </div>
  );
};
