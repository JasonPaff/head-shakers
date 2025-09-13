import 'server-only';
import { Package2Icon, PlusIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { BobbleheadGalleryCard } from '@/components/feature/bobblehead/bobblehead-gallery-card';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { EmptyState } from '@/components/ui/empty-state';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionBobbleheadsProps {
  collectionId: string;
  isOwner?: boolean;
  subcollectionId: string;
}

export const SubcollectionBobbleheads = async ({
  collectionId,
  isOwner = false,
  subcollectionId,
}: SubcollectionBobbleheadsProps) => {
  const currentUserId = await getOptionalUserId();

  const bobbleheads = await SubcollectionsFacade.getSubcollectionBobbleheadsWithPhotos(
    subcollectionId,
    currentUserId || undefined,
  );

  const hasNoBobbleheads = bobbleheads.length === 0;

  return (
    <div>
      <div className={'mb-6 flex items-center justify-between'}>
        <h2 className={'text-2xl font-bold text-foreground'}>Bobbleheads in this Subcollection</h2>
        <Conditional isCondition={isOwner}>
          <Button asChild size={'sm'} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/add',
                searchParams: { collectionId, subcollectionId },
              })}
            >
              <PlusIcon aria-hidden className={'mr-2 size-4'} />
              Add Bobblehead
            </Link>
          </Button>
        </Conditional>
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
                    searchParams: { collectionId, subcollectionId },
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
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
          {bobbleheads.map((bobblehead) => (
            <BobbleheadGalleryCard
              bobblehead={{
                ...bobblehead,
                collectionId,
                subcollectionId,
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
