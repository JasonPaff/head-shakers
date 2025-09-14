import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Suspense } from 'react';

import { DashboardHeader } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-header';
import { DashboardTabs } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs';
import { Route } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { ContentLayout } from '@/components/layout/content-layout';
import { Loading } from '@/components/ui/loading';

export default withParamValidation(DashboardCollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}

function DashboardCollectionPage() {
  return (
    <ContentLayout>
      <Suspense fallback={<Loading />}>
        <DashboardHeader />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <DashboardTabs />
      </Suspense>
    </ContentLayout>
  );
}
