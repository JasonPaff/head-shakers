import { ContentLayout } from '@/components/layout/content-layout';

import { SubcollectionBobbleheadsSkeleton } from './components/skeletons/subcollection-bobbleheads-skeleton';
import { SubcollectionHeaderSkeleton } from './components/skeletons/subcollection-header-skeleton';
import { SubcollectionMetricsSkeleton } from './components/skeletons/subcollection-metrics-skeleton';

export default function SubcollectionLoading() {
  return (
    <div>
      {/* Header Skeleton */}
      <div className={'mt-3 border-b border-border'}>
        <ContentLayout>
          <SubcollectionHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Main Content Skeleton */}
      <div className={'mt-4'}>
        <ContentLayout>
          <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
            {/* Main Content Area */}
            <div className={'order-2 lg:order-1 lg:col-span-9'}>
              <SubcollectionBobbleheadsSkeleton />
            </div>

            {/* Sidebar */}
            <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
              <SubcollectionMetricsSkeleton />
            </aside>
          </div>
        </ContentLayout>
      </div>
    </div>
  );
}
