import type { Metadata } from 'next';

import { Suspense } from 'react';

import { DashboardHeader } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-header';
import { DashboardTabs } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-tabs';
import { Loading } from '@/components/ui/loading';

export default function DashboardCollectionPage() {
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

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}
