import 'server-only';

import type { CollectionSearchParams } from '@/app/(app)/collections/[collectionSlug]/(collection)/route-type';
import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { CollectionBobbleheads } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-bobbleheads';
import { CollectionHeader } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-header';
import { CollectionSidebarSubcollections } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-sidebar-subcollections';
import { CollectionStats } from '@/app/(app)/collections/[collectionSlug]/(collection)/components/collection-stats';
import { ContentLayout } from '@/components/layout/content-layout';

interface CollectionProps {
  collection: PublicCollection;
  collectionId: string;
  likeData?: {
    isLiked: boolean;
    likeCount: number;
    likeId: null | string;
  };
  searchParams?: CollectionSearchParams;
  subcollections: Array<{ id: string; name: string }>;
}

export const Collection = ({
  collection,
  collectionId,
  likeData,
  searchParams,
  subcollections,
}: CollectionProps) => {
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
              <CollectionBobbleheads
                collection={collection}
                searchParams={searchParams}
                subcollections={subcollections}
              />
            </div>

            {/* Sidebar */}
            <aside className={'flex flex-col gap-6 lg:col-span-3'}>
              <CollectionStats collection={collection} collectionId={collectionId} />
              <CollectionSidebarSubcollections collection={collection} />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
};
