import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Suspense } from 'react';

import { DashboardHeader } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-header';
import { DashboardTabs } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs';
import { Route } from '@/app/(app)/dashboard/collection/(collection)/route-type';
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
    <div className={'container mx-auto max-w-7xl px-4 py-8'}>
      <Suspense fallback={<Loading />}>
        <DashboardHeader />
      </Suspense>
      <Suspense fallback={<Loading />}>
        <DashboardTabs />
      </Suspense>
    </div>
  );
}
