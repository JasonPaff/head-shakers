import type { Metadata } from 'next';

import { Fragment, Suspense } from 'react';

import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';

import { BobbleheadGridAsync } from './components/async/bobblehead-grid-async';
import { CollectionHeaderAsync } from './components/async/collection-header-async';
import { SidebarAsync } from './components/async/sidebar-async';
import { CollectionLayout } from './components/layout/collection-layout';
import { BobbleheadContentSkeleton } from './components/skeleton/bobblehead-content-skeleton';
import { CollectionHeaderSkeleton } from './components/skeleton/collection-header-skeleton';
import { SidebarSkeleton } from './components/skeleton/sidebar-skeleton';
import { collectionDashboardSearchParamsCache } from './search-params';

type CollectionPageProps = {
  searchParams: Promise<Record<string, Array<string> | string | undefined>>;
};

export default async function CollectionPage({ searchParams }: CollectionPageProps) {
  await collectionDashboardSearchParamsCache.parse(searchParams);

  return (
    <CollectionLayout
      main={
        <Fragment>
          {/* Collection Header */}
          <ErrorBoundary name={'collection-header'}>
            <Suspense fallback={<CollectionHeaderSkeleton />}>
              <CollectionHeaderAsync />
            </Suspense>
          </ErrorBoundary>

          {/* Bobblehead Grid */}
          <ErrorBoundary name={'collection-bobbleheads'}>
            <Suspense fallback={<BobbleheadContentSkeleton />}>
              <BobbleheadGridAsync />
            </Suspense>
          </ErrorBoundary>
        </Fragment>
      }
      sidebar={
        <ErrorBoundary name={'collection-sidebar'}>
          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarAsync />
          </Suspense>
        </ErrorBoundary>
      }
    />
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your bobblehead collections',
    title: 'My Collection',
  };
}
