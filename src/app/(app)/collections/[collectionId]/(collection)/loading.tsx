import { ContentLayout } from '@/components/layout/content-layout';

import { CollectionBobbleheadsSkeleton } from './components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from './components/skeletons/collection-header-skeleton';
import { CollectionStatsSkeleton } from './components/skeletons/collection-stats-skeleton';
import { SubcollectionsSkeleton } from './components/skeletons/subcollections-skeleton';

export default function CollectionLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className={'mt-3 border-b border-border'}>
        <ContentLayout>
          <CollectionHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Main Content Skeleton */}
      <div className={'mt-4'}>
        <ContentLayout>
          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
            {/* Main Content Area */}
            <div className={'lg:col-span-9'}>
              <CollectionBobbleheadsSkeleton />
            </div>

            {/* Sidebar */}
            <aside className={'flex flex-col gap-6 lg:col-span-3'}>
              <CollectionStatsSkeleton />
              <SubcollectionsSkeleton />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
}
