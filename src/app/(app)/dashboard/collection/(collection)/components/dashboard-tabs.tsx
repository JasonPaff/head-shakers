import 'server-only';
import { Suspense } from 'react';

import { BobbleheadsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/bobbleheads-tab-content';
import { CollectionsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/collections-tab-content';
import { DashboardTabsClient } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs-client';
import { BobbleheadsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/bobbleheads-tab-skeleton';
import { CollectionsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/collections-tab-skeleton';
import { SubcollectionsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/subcollections-tab-skeleton';
import { SubcollectionsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-tab-content';

export const DashboardTabs = () => {
  return (
    <DashboardTabsClient>
      <div data-tab={'collections'}>
        <Suspense fallback={<CollectionsTabSkeleton />}>
          <CollectionsTabContent />
        </Suspense>
      </div>

      <div data-tab={'subcollections'}>
        <Suspense fallback={<SubcollectionsTabSkeleton />}>
          <SubcollectionsTabContent />
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
