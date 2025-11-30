import type { Metadata } from 'next';

import { CollectionLayout } from './components/layout/collection-layout';
import { MainContent } from './components/main/main-content';
import { SidebarContent } from './components/sidebar/sidebar-content';

export default function CollectionPage() {
  return <CollectionLayout main={<MainContent />} sidebar={<SidebarContent />} />;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your bobblehead collections',
    title: 'My Collection',
  };
}
