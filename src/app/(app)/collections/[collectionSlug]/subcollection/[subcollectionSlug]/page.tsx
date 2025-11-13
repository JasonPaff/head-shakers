import type { Metadata } from 'next';

import { eq } from 'drizzle-orm';
import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type';

import { SubcollectionBobbleheadsAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-bobbleheads-async';
import { SubcollectionHeaderAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-header-async';
import { SubcollectionMetricsAsync } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/async/subcollection-metrics-async';
import { SubcollectionBobbleheadsSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-bobbleheads-skeleton';
import { SubcollectionHeaderSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-header-skeleton';
import { SubcollectionMetricsSkeleton } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/skeletons/subcollection-metrics-skeleton';
import { SubcollectionErrorBoundary } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-error-boundary';
import { Route } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/route-type';
import { CollectionViewTracker } from '@/components/analytics/collection-view-tracker';
import { CommentSectionAsync } from '@/components/feature/comments/async/comment-section-async';
import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { db } from '@/lib/db';
import { subCollections } from '@/lib/db/schema';

type SubcollectionPageProps = PageProps;

export default withParamValidation(SubcollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Subcollection',
  };
}

async function SubcollectionPage({ routeParams, searchParams }: SubcollectionPageProps) {
  const { collectionSlug, subcollectionSlug } = await routeParams;
  const resolvedSearchParams = await searchParams;

  // TODO: Add SubcollectionsFacade.getSubcollectionBySlug method
  // For now, query subcollection directly by slug since slugs are globally unique
  const results = await db
    .select()
    .from(subCollections)
    .where(eq(subCollections.slug, subcollectionSlug))
    .limit(1);
  const basicSubcollection = results[0];

  if (!basicSubcollection) {
    notFound();
  }

  const subcollectionId = basicSubcollection.id;
  const collectionId = basicSubcollection.collectionId;

  return (
    <CollectionViewTracker
      collectionId={collectionId}
      collectionSlug={collectionSlug}
      subcollectionId={subcollectionId}
      subcollectionSlug={subcollectionSlug}
    >
      <div>
        {/* Header Section with Suspense */}
        <div className={'mt-3 border-b border-border'}>
          <ContentLayout>
            <SubcollectionErrorBoundary section={'header'}>
              <Suspense fallback={<SubcollectionHeaderSkeleton />}>
                <SubcollectionHeaderAsync collectionId={collectionId} subcollectionId={subcollectionId} />
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
                      subcollectionId={subcollectionId}
                    />
                  </Suspense>
                </SubcollectionErrorBoundary>
              </aside>
            </div>
          </ContentLayout>
        </div>

        {/* Comments Section */}
        <div className={'mt-8'}>
          <ContentLayout>
            <SubcollectionErrorBoundary section={'comments'}>
              <Suspense fallback={<CommentSectionSkeleton />}>
                <CommentSectionAsync targetId={subcollectionId} targetType={'subcollection'} />
              </Suspense>
            </SubcollectionErrorBoundary>
          </ContentLayout>
        </div>
      </div>
    </CollectionViewTracker>
  );
}
