import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { redirect } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/dashboard/collection/(collection)/route-type';

import { collectionDashboardSearchParamsCache } from '@/app/(app)/dashboard/collection/(collection)/route-type';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { sortCollections } from '@/lib/utils/collection.utils';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';
import { getUserPreferences } from '@/utils/server-cookies';

import { BobbleheadGridAsync } from './components/async/bobblehead-grid-async';
import { CollectionHeaderAsync } from './components/async/collection-header-async';
import { SidebarAsync } from './components/async/sidebar-async';
import { CollectionLayout } from './components/layout/collection-layout';
import { BobbleheadContentSkeleton } from './components/skeleton/bobblehead-content-skeleton';
import { CollectionHeaderSkeleton } from './components/skeleton/collection-header-skeleton';
import { SidebarSkeleton } from './components/skeleton/sidebar-skeleton';
import { Route } from './route-type';

type CollectionPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your bobblehead collections',
    title: 'My Collection',
  };
}

async function CollectionPage({ searchParams }: CollectionPageProps) {
  const params = await collectionDashboardSearchParamsCache.parse(searchParams);

  // Server-side auto-selection: If no collection is selected, redirect to the first one
  // This respects the user's saved sort preference for consistent behavior
  if (!params.collectionSlug) {
    const [userId, preferences] = await Promise.all([getRequiredUserIdAsync(), getUserPreferences()]);
    const collections = await CollectionsDashboardFacade.getListByUserIdAsync(userId);

    if (collections.length > 0) {
      const sortOption = preferences.collectionSidebarSort ?? 'name-asc';
      const sortedCollections = sortCollections(collections, sortOption);
      const firstCollection = sortedCollections[0]!;

      // Redirect to the first collection, preserving any other search params
      const url = new URL('/dashboard/collection', 'http://localhost');
      url.searchParams.set('collectionSlug', firstCollection.slug);

      // Preserve other params if they differ from defaults
      if (params.search) url.searchParams.set('search', params.search);
      if (params.condition !== 'all') url.searchParams.set('condition', params.condition);
      if (params.featured !== 'all') url.searchParams.set('featured', params.featured);
      if (params.sortBy !== 'newest') url.searchParams.set('sortBy', params.sortBy);

      redirect(`${url.pathname}${url.search}`);
    }
  }

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

export default withParamValidation(CollectionPage, Route);
