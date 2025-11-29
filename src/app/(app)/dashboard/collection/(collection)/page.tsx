import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import { BobbleheadManagementDashboard } from '@/app/(app)/dashboard/collection/(collection)/mockups/bobblehead-mgmt-1';
import { Mockup1 } from '@/app/(app)/dashboard/collection/(collection)/mockups/mockup-1';
import { Route } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { ContentLayout } from '@/components/layout/content-layout';

export default withParamValidation(DashboardCollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}

export const dynamic = 'force-dynamic';

function DashboardCollectionPage() {
  return (
    <ContentLayout>
      <Mockup1 />
      <BobbleheadManagementDashboard />
    </ContentLayout>
  );
}
