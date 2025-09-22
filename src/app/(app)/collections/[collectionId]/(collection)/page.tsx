import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';

import { CollectionBobbleheadsAsync } from '@/app/(app)/collections/[collectionId]/(collection)/components/async/collection-bobbleheads-async';
import { CollectionHeaderAsync } from '@/app/(app)/collections/[collectionId]/(collection)/components/async/collection-header-async';
import { CollectionSidebarSubcollectionsAsync } from '@/app/(app)/collections/[collectionId]/(collection)/components/async/collection-sidebar-subcollections-async';
import { CollectionStatsAsync } from '@/app/(app)/collections/[collectionId]/(collection)/components/async/collection-stats-async';
import { CollectionErrorBoundary } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection-error-boundary';
import { CollectionBobbleheadsSkeleton } from '@/app/(app)/collections/[collectionId]/(collection)/components/skeletons/collection-bobbleheads-skeleton';
import { CollectionHeaderSkeleton } from '@/app/(app)/collections/[collectionId]/(collection)/components/skeletons/collection-header-skeleton';
import { CollectionStatsSkeleton } from '@/app/(app)/collections/[collectionId]/(collection)/components/skeletons/collection-stats-skeleton';
import { SubcollectionsSkeleton } from '@/app/(app)/collections/[collectionId]/(collection)/components/skeletons/subcollections-skeleton';
import { Route } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { ContentLayout } from '@/components/layout/content-layout';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

type CollectionPageProps = PageProps;

export default withParamValidation(CollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}

async function CollectionPage({ routeParams, searchParams }: CollectionPageProps) {
  const { collectionId } = await routeParams;
  const resolvedSearchParams = await searchParams;
  const currentUserId = await getOptionalUserId();

  // only fetch basic collection info for the initial render to verify it exists
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return (
    <CollectionViewTracker collectionId={collectionId}>
      <div>
        {/* Header Section with Suspense */}
        <div className={'mt-3 border-b border-border'}>
          <ContentLayout>
            <CollectionErrorBoundary section={'header'}>
              <Suspense fallback={<CollectionHeaderSkeleton />}>
                <CollectionHeaderAsync collectionId={collectionId} />
              </Suspense>
            </CollectionErrorBoundary>
          </ContentLayout>
        </div>

        {/* Main Content */}
        <div className={'mt-4'}>
          <ContentLayout>
            <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
              {/* Main Content Area */}
              <div className={'lg:col-span-9'}>
                <CollectionErrorBoundary section={'bobbleheads'}>
                  <Suspense fallback={<CollectionBobbleheadsSkeleton />}>
                    <CollectionBobbleheadsAsync
                      collectionId={collectionId}
                      searchParams={resolvedSearchParams}
                    />
                  </Suspense>
                </CollectionErrorBoundary>
              </div>

              {/* Sidebar */}
              <aside className={'flex flex-col gap-6 lg:col-span-3'}>
                <CollectionErrorBoundary section={'stats'}>
                  <Suspense fallback={<CollectionStatsSkeleton />}>
                    <CollectionStatsAsync collectionId={collectionId} />
                  </Suspense>
                </CollectionErrorBoundary>

                <CollectionErrorBoundary section={'subcollections'}>
                  <Suspense fallback={<SubcollectionsSkeleton />}>
                    <CollectionSidebarSubcollectionsAsync collectionId={collectionId} />
                  </Suspense>
                </CollectionErrorBoundary>
              </aside>
            </div>
          </ContentLayout>
        </div>
      </div>
    </CollectionViewTracker>
  );
}
