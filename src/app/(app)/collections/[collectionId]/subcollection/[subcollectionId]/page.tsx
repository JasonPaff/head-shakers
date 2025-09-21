import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

import { SubcollectionBobbleheadsAsync } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/async/subcollection-bobbleheads-async';
import { SubcollectionHeaderAsync } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/async/subcollection-header-async';
import { SubcollectionMetricsAsync } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/async/subcollection-metrics-async';
import { SubcollectionBobbleheadsSkeleton } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/skeletons/subcollection-bobbleheads-skeleton';
import { SubcollectionHeaderSkeleton } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/skeletons/subcollection-header-skeleton';
import { SubcollectionMetricsSkeleton } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/skeletons/subcollection-metrics-skeleton';
import { SubcollectionErrorBoundary } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-error-boundary';
import { Route } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';
import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { ContentLayout } from '@/components/layout/content-layout';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

type SubcollectionPageProps = PageProps;

export default withParamValidation(SubcollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Subcollection',
  };
}

async function SubcollectionPage({ routeParams, searchParams }: SubcollectionPageProps) {
  const { collectionId, subcollectionId } = await routeParams;
  const resolvedSearchParams = await searchParams;
  const currentUserId = await getOptionalUserId();

  // only fetch basic subcollection info to verify it exists
  const basicSubcollection = await SubcollectionsFacade.getSubCollectionForPublicView(
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  if (!basicSubcollection) {
    notFound();
  }

  return (
    <CollectionViewTracker collectionId={collectionId} subcollectionId={subcollectionId}>
      <div>
        {/* Header Section with Suspense */}
        <div className={'mt-3 border-b border-border'}>
          <ContentLayout>
            <SubcollectionErrorBoundary section={'header'}>
              <Suspense fallback={<SubcollectionHeaderSkeleton />}>
                <SubcollectionHeaderAsync
                  collectionId={collectionId}
                  currentUserId={currentUserId}
                  subcollectionId={subcollectionId}
                />
              </Suspense>
            </SubcollectionErrorBoundary>
          </ContentLayout>
        </div>

        {/* Main Content */}
        <div className={'mt-4'}>
          <ContentLayout>
            <div className={'grid grid-cols-1 gap-8 lg:grid-cols-12'}>
              {/* Main Content Area */}
              <div className={'order-2 lg:order-1 lg:col-span-9'}>
                <SubcollectionErrorBoundary section={'bobbleheads'}>
                  <Suspense fallback={<SubcollectionBobbleheadsSkeleton />}>
                    <SubcollectionBobbleheadsAsync
                      collectionId={collectionId}
                      currentUserId={currentUserId}
                      searchParams={resolvedSearchParams}
                      subcollectionId={subcollectionId}
                    />
                  </Suspense>
                </SubcollectionErrorBoundary>
              </div>

              {/* Sidebar */}
              <aside className={'order-1 flex flex-col gap-6 lg:order-2 lg:col-span-3'}>
                <SubcollectionErrorBoundary section={'metrics'}>
                  <Suspense fallback={<SubcollectionMetricsSkeleton />}>
                    <SubcollectionMetricsAsync
                      collectionId={collectionId}
                      currentUserId={currentUserId}
                      subcollectionId={subcollectionId}
                    />
                  </Suspense>
                </SubcollectionErrorBoundary>
              </aside>
            </div>
          </ContentLayout>
        </div>
      </div>
    </CollectionViewTracker>
  );
}
