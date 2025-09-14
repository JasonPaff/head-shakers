import 'server-only';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobbleheads';
import { CollectionHeader } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-header';
import { CollectionSidebarSubcollections } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-sidebar-subcollections';
import { CollectionStats } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-stats';

interface CollectionProps {
  collection: PublicCollection;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
  searchParams?: CollectionSearchParams;
}

export const Collection = ({ collection, likeData, searchParams }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <CollectionHeader collection={collection} likeData={likeData} />
        </div>
      </div>

      {/* Main Content */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
          {/* Main Content Area */}
          <div className={'lg:col-span-9'}>
            <CollectionBobbleheads collection={collection} searchParams={searchParams} />
          </div>

          {/* Sidebar */}
          <aside className={'flex flex-col gap-6 lg:col-span-3'}>
            <CollectionStats collection={collection} />
            <CollectionSidebarSubcollections collection={collection} />
          </aside>
        </div>
      </div>
    </div>
  );
};
