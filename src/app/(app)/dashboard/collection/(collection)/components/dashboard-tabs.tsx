import 'server-only';
import { Suspense } from 'react';

import { BobbleheadsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/bobbleheads-tab-content';
import { CollectionsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/collections-tab-content';
import { DashboardTabsClient } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs-client';
import { SubcollectionsTabContent } from '@/app/(app)/dashboard/collection/(collection)/components/subcollections-tab-content';
import { Loading } from '@/components/ui/loading';

export const DashboardTabs = () => {
  return (
    <DashboardTabsClient>
      <div data-tab={'collections'}>
        <Suspense fallback={<Loading />}>
          <CollectionsTabContent />
        </Suspense>
      </div>

      <div data-tab={'subcollections'}>
        <Suspense fallback={<Loading />}>
          <SubcollectionsTabContent />
        </Suspense>
      </div>

      <div data-tab={'bobbleheads'}>
        <Suspense fallback={<Loading />}>
          <BobbleheadsTabContent />
        </Suspense>
      </div>
    </DashboardTabsClient>
  );
};
