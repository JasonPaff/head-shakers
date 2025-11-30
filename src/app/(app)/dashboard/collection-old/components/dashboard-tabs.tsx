import 'server-only';
import { Suspense } from 'react';

import { BobbleheadsTabContent } from '@/app/(app)/dashboard/collection-old/components/bobbleheads-tab-content';
import { CollectionsTabContent } from '@/app/(app)/dashboard/collection-old/components/collections-tab-content';
import { DashboardTabsClient } from '@/app/(app)/dashboard/collection-old/components/dashboard-tabs-client';
import { BobbleheadsTabSkeleton } from '@/app/(app)/dashboard/collection-old/components/skeletons/bobbleheads-tab-skeleton';
import { CollectionsTabSkeleton } from '@/app/(app)/dashboard/collection-old/components/skeletons/collections-tab-skeleton';

export const DashboardTabs = () => {
  return (
    <DashboardTabsClient>
      <div data-tab={'collections'}>
        <Suspense fallback={<CollectionsTabSkeleton />}>
          <CollectionsTabContent />
        </Suspense>
      </div>

      <div data-tab={'bobbleheads'}>
        <Suspense fallback={<BobbleheadsTabSkeleton />}>
          <BobbleheadsTabContent />
        </Suspense>
      </div>
    </DashboardTabsClient>
  );
};
