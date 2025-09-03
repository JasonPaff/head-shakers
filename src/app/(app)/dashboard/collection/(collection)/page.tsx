import type { Metadata } from 'next';

import { CollectionList } from '@/app/(app)/dashboard/collection/(collection)/components/collection-list';

export default function DashboardCollectionPage() {
  return <CollectionList />;
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}
