import { CollectionLayout } from './components/layout/collection-layout';
import { MainContentSkeleton } from './components/skeleton/main-content-skeleton';
import { SidebarSkeleton } from './components/skeleton/sidebar-skeleton';

export default function CollectionLoading() {
  return <CollectionLayout main={<MainContentSkeleton />} sidebar={<SidebarSkeleton />} />;
}
