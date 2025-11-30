import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import { OffCanvasDrawerDashboard } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-mock-up';
import { Route } from '@/app/(app)/dashboard/collection/(collection)/route-type';

export default withParamValidation(DashboardCollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}

function DashboardCollectionPage() {
  return <OffCanvasDrawerDashboard />;
}
