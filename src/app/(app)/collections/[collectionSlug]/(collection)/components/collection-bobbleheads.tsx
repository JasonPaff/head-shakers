import 'server-only';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';
import type { ComboboxItem } from '@/components/ui/form/field-components/combobox-field';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheadControls } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobblehead-controls';
import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface CollectionBobbleheadsProps {
  collection: NonNullable<PublicCollection>;
  searchParams?: CollectionSearchParams;
  subcollections: Array<{ id: string; name: string }>;
}

export const CollectionBobbleheads = async ({
  collection,
  searchParams,
  subcollections,
}: CollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(collection.userId);

  const view = searchParams?.view || 'all';
  const searchTerm = searchParams?.search || undefined;
  const sortBy = searchParams?.sort || 'newest';
  const subcollectionIdFromParams = searchParams?.subcollectionId;

  // Map view + subcollectionId to facade parameter
  let subcollectionIdForFacade: null | string | undefined = undefined;
  if (view === 'collection') {
    subcollectionIdForFacade = null; // Main collection only
  } else if (view === 'subcollection' && subcollectionIdFromParams) {
    subcollectionIdForFacade = subcollectionIdFromParams; // Specific subcollection
  }
  // else: view === 'all' → subcollectionIdForFacade remains undefined (all bobbleheads)

  const options = {
    searchTerm,
    sortBy,
    subcollectionId: subcollectionIdForFacade,
  };

  const bobbleheads = await CollectionsFacade.getAllCollectionBobbleheadsWithPhotos(
    collection.id,
    currentUserId || undefined,
    options,
  );

  // Fetch user collections for edit dialog (only if owner)
  let collections: Array<ComboboxItem> = [];
  if (isOwner && currentUserId) {
    const userCollections =
      (await CollectionsFacade.getCollectionsByUser(currentUserId, {}, currentUserId)) ?? [];
    collections = userCollections.map((c) => ({
      id: c.id,
      name: c.name,
    }));
  }

  const isEmpty = bobbleheads.length === 0;
  const hasActiveFilters = searchTerm || sortBy !== 'newest' || view !== 'all';
  const _isSubcollectionFilter = view === 'subcollection' || view === 'collection';
  const _selectedSubcollection = subcollections.find((sub) => sub.id === subcollectionIdFromParams);
  const _subcollectionFilterLabel =
    view === 'collection' ? 'Main Collection Only'
    : _selectedSubcollection ? _selectedSubcollection.name
    : '';

  // Context-aware empty state messages
  const _emptyStateTitle =
    _isSubcollectionFilter ? 'No Bobbleheads in This View'
    : hasActiveFilters ? 'No Results Found'
    : 'No Bobbleheads Yet';

  const _emptyStateDescription =
    _isSubcollectionFilter ?
      `No bobbleheads found in ${_subcollectionFilterLabel}. Try selecting a different view or clear the filter to see all bobbleheads.`
    : hasActiveFilters ?
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
      <div className={'mb-4'}>
        <CollectionBobbleheadControls subcollections={subcollections} />
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
                      route: '/bobbleheads/add',
                      searchParams: { collectionId: collection.id },
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
              bobbleheadForEdit={
                isOwner ?
                  {
                    acquisitionDate: bobblehead.acquisitionDate,
                    acquisitionMethod: bobblehead.acquisitionMethod,
                    category: bobblehead.category,
                    characterName: bobblehead.characterName,
                    collectionId: bobblehead.collectionId,
                    currentCondition: bobblehead.condition,
                    customFields: bobblehead.customFields,
                    description: bobblehead.description,
                    height: bobblehead.height,
                    id: bobblehead.id,
                    isFeatured: bobblehead.isFeatured,
                    isPublic: bobblehead.isPublic,
                    manufacturer: bobblehead.manufacturer,
                    material: bobblehead.material,
                    name: bobblehead.name,
                    purchaseLocation: bobblehead.purchaseLocation,
                    purchasePrice: bobblehead.purchasePrice,
                    series: bobblehead.series,
                    status: bobblehead.status,
                    subcollectionId: bobblehead.subcollectionId,
                    weight: bobblehead.weight,
                    year: bobblehead.year,
                  }
                : undefined
              }
              collections={isOwner ? collections : undefined}
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
