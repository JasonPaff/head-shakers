import { Fragment } from 'react';

import { CollectionLayout } from '@/app/(app)/dashboard/collection/components/layout/collection-layout';

import { BobbleheadContentSkeleton } from './components/skeleton/bobblehead-content-skeleton';
import { CollectionHeaderSkeleton } from './components/skeleton/collection-header-skeleton';
import { SidebarSkeleton } from './components/skeleton/sidebar-skeleton';

export default function CollectionLoading() {
  return (
    <CollectionLayout
      main={
        <Fragment>
          <CollectionHeaderSkeleton />
          <BobbleheadContentSkeleton />
        </Fragment>
      }
      sidebar={<SidebarSkeleton />}
    />
  );
}
