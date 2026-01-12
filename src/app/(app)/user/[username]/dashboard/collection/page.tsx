import type { Metadata } from 'next';

import { $path } from 'next-typesafe-url';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { redirect } from 'next/navigation';
import { Fragment, Suspense } from 'react';

import type { PageProps } from '@/app/(app)/user/[username]/dashboard/collection/route-type';

import { CollectionLayout } from '@/app/(app)/user/[username]/dashboard/collection/components/layout/collection-layout';
import { collectionDashboardSearchParamsCache } from '@/app/(app)/user/[username]/dashboard/collection/route-type';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { CollectionsDashboardFacade } from '@/lib/facades/collections/collections-dashboard.facade';
import { getCurrentUserWithRole } from '@/lib/utils/admin.utils';
import { sortCollections } from '@/lib/utils/collection.utils';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';
import { getUserPreferences } from '@/utils/server-cookies';

import { AddItemFormSkeleton } from './components/add-form/skeletons/add-item-form-skeleton';
import { AddBobbleheadFormAsync } from './components/async/add-bobblehead-form-async';
import { BobbleheadGridAsync } from './components/async/bobblehead-grid-async';
import { CollectionHeaderAsync } from './components/async/collection-header-async';
import { EditBobbleheadFormAsync } from './components/async/edit-bobblehead-form-async';
import { SidebarAsync } from './components/async/sidebar-async';
import { CollectionUrlSync } from './components/collection-url-sync';
import { NoCollectionSelected } from './components/empty-states/no-collection-selected';
import { BobbleheadContentSkeleton } from './components/skeleton/bobblehead-content-skeleton';
import { CollectionHeaderSkeleton } from './components/skeleton/collection-header-skeleton';
import { SidebarSkeleton } from './components/skeleton/sidebar-skeleton';
import { Route } from './route-type';

type CollectionPageProps = PageProps;

type FilterParams = {
  category: string;
  condition: string;
  featured: 'all' | 'featured' | 'not-featured';
  page: number;
  pageSize: number;
  search: string;
  sortBy: string;
};

interface MainContentProps {
  collectionSlug: string;
  filterParams: FilterParams;
  mode: 'add' | 'edit' | null;
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage your bobblehead collections',
    title: 'My Collection',
  };
}

export const dynamic = 'force-dynamic';

async function CollectionPage({ routeParams, searchParams }: CollectionPageProps) {
  const { username } = await routeParams;
  const params = await collectionDashboardSearchParamsCache.parse(searchParams);

  // Authorization: Ensure the current user matches the URL username
  const currentUser = await getCurrentUserWithRole();
  if (!currentUser || currentUser.username !== username) {
    redirect($path({ route: '/' }));
  }

  // Server-side auto-selection: If no collection is selected, render with the first one
  // and sync the URL client-side to avoid blank flash during redirect
  let shouldSyncUrl = false;
  let collectionSlug: string;

  if (!params.collectionSlug) {
    const [userId, preferences] = await Promise.all([getRequiredUserIdAsync(), getUserPreferences()]);
    const collections = await CollectionsDashboardFacade.getListByUserIdAsync(userId);

    if (collections.length === 0) {
      // User has no collections - render empty state
      return (
        <CollectionLayout
          main={<NoCollectionSelected />}
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

    // Auto-select first collection based on user's sort preference
    const sortOption = preferences.collectionSidebarSort ?? 'name-asc';
    const sortedCollections = sortCollections(collections, sortOption);
    collectionSlug = sortedCollections[0]!.slug;
    shouldSyncUrl = true;
  } else {
    collectionSlug = params.collectionSlug;
  }

  // Extract filter params for bobblehead grid
  const filterParams: FilterParams = {
    category: params.category,
    condition: params.condition,
    featured: params.featured,
    page: params.page,
    pageSize: params.pageSize,
    search: params.search,
    sortBy: params.sortBy,
  };

  return (
    <CollectionLayout
      main={
        <Fragment>
          {/* Sync URL when collection was auto-selected */}
          {shouldSyncUrl && <CollectionUrlSync collectionSlug={collectionSlug} />}

          {/* Collection Header - always shown */}
          <ErrorBoundary name={'collection-header'}>
            <Suspense fallback={<CollectionHeaderSkeleton />}>
              <CollectionHeaderAsync collectionSlug={collectionSlug} />
            </Suspense>
          </ErrorBoundary>

          {/* Conditional: Add Form, Edit Form, or Bobblehead Grid */}
          <MainContent
            collectionSlug={collectionSlug}
            filterParams={filterParams}
            mode={
              params.add === true ? 'add'
              : params.edit ?
                'edit'
              : null
            }
          />
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

// Render the appropriate main content based on mode
// Add mode takes precedence over edit mode if both are set
const MainContent = ({ collectionSlug, filterParams, mode }: MainContentProps) => {
  if (mode === 'add') {
    return (
      <ErrorBoundary name={'add-bobblehead-form'}>
        <Suspense fallback={<AddItemFormSkeleton />}>
          <AddBobbleheadFormAsync />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (mode === 'edit') {
    return (
      <ErrorBoundary name={'edit-bobblehead-form'}>
        <Suspense fallback={<AddItemFormSkeleton />}>
          <EditBobbleheadFormAsync />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary name={'collection-bobbleheads'}>
      <Suspense fallback={<BobbleheadContentSkeleton />}>
        <BobbleheadGridAsync collectionSlug={collectionSlug} filterParams={filterParams} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default withParamValidation(CollectionPage, Route);
