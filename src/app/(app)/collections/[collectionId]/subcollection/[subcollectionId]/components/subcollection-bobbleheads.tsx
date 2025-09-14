import 'server-only';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { SubcollectionSearchParams } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';
import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { SubcollectionControls } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-controls';
import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionBobbleheadsProps {
  collectionId: string;
  searchParams?: SubcollectionSearchParams;
  subcollection: NonNullable<PublicSubcollection>;
}

export const SubcollectionBobbleheads = async ({
  collectionId,
  searchParams,
  subcollection,
}: SubcollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();
  const isOwner = await checkIsOwner(subcollection.userId);

  const searchTerm = searchParams?.search || undefined;
  const sortBy = searchParams?.sort || 'newest';

  const options = {
    searchTerm,
    sortBy,
  };

  const bobbleheads = await SubcollectionsFacade.getSubcollectionBobbleheadsWithPhotos(
    subcollection.id,
    currentUserId || undefined,
    options,
  );

  const hasNoBobbleheads = bobbleheads.length === 0;

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Subcollection</h2>
        {/* Add Bobblehead Button */}
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/add',
                searchParams: { collectionId, subcollectionId: subcollection.id },
              })}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </Conditional>
      </div>

      {/* Search and Sort Controls */}
      <div className={'mb-6'}>
        <SubcollectionControls />
      </div>

      {/* Empty State */}
      <Conditional isCondition={hasNoBobbleheads}>
        <EmptyState
          action={
            <Conditional isCondition={isOwner}>
              <Button asChild>
                <Link
                  href={$path({
                    route: '/bobbleheads/add',
                    searchParams: { collectionId, subcollectionId: subcollection.id },
                  })}
                >
                  <PlusIcon className={'mr-2 h-4 w-4'} />
                  Add First Bobblehead
                </Link>
              </Button>
            </Conditional>
          }
          description={
            "This subcollection doesn't have any bobbleheads. Start adding bobbleheads to organize your collection."
          }
          icon={Package2Icon}
          title={'No Bobbleheads Yet'}
        />
      </Conditional>

      {/* Bobblehead Grid */}
      <Conditional isCondition={!hasNoBobbleheads}>
        <div className={'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadGalleryCard
              bobblehead={{
                ...bobblehead,
                collectionId,
                subcollectionId: subcollection.id,
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
