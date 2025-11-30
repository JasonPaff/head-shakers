import type { Metadata } from 'next';

import { OffCanvasDrawerDashboard } from '@/app/(app)/dashboard/collection-demo/dashboard-mock-up';

export default function CollectionPage() {
  // The key insight: Suspense boundaries are at the SERVER level (in page.tsx)
  // The async components fetch data and render display components
  // The layout is a client component that receives the rendered output

  return <OffCanvasDrawerDashboard />;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your bobblehead collections',
    title: 'My Collection',
  };
}
