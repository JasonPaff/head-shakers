import type { Metadata } from 'next';

import { OffCanvasDrawerDashboard } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-mock-up';

export default function DashboardCollectionPage() {
  return <OffCanvasDrawerDashboard />;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}
