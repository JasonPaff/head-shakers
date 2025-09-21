import 'server-only';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheads } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-bobbleheads';
import { CollectionHeader } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-header';
import { CollectionSidebarSubcollections } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-sidebar-subcollections';
import { CollectionStats } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-stats';
import { ContentLayout } from '@/components/layout/content-layout';

interface CollectionProps {
  collection: PublicCollection;
  collectionId: string;
  currentUserId?: string;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
  searchParams?: CollectionSearchParams;
}

export const Collection = ({ collection, collectionId, currentUserId, likeData, searchParams }: CollectionProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div>
      {/* Header Section */}
      <div className={'mt-3 border-b border-border'}>
        <ContentLayout>
          <CollectionHeader collection={collection} likeData={likeData} />
        </ContentLayout>
      </div>

      {/* Main Content */}
      <div className={'mt-4'}>
        <ContentLayout>
          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
            {/* Main Content Area */}
            <div className={'lg:col-span-9'}>
              <CollectionBobbleheads collection={collection} searchParams={searchParams} />
            </div>

            {/* Sidebar */}
            <aside className={'flex flex-col gap-6 lg:col-span-3'}>
              <CollectionStats collection={collection} collectionId={collectionId} currentUserId={currentUserId} />
              <CollectionSidebarSubcollections collection={collection} />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
};
