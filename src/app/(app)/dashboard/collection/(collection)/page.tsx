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

export default function CollectionPage() {
  return (
    <CollectionLayout
      main={<MainContentWrapper />}
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

/**
 * Wrapper component for the main content area with two separate suspense boundaries:
 * 1. Collection header - loads collection metadata
 * 2. Bobblehead grid - loads bobblehead items with toolbar
 */
function MainContentWrapper() {
  return (
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
  );
}
