import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/route-type';

import { BobbleheadDetailCardsAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-detail-cards-async';
import { BobbleheadFeatureCardAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-feature-card-async';
import { BobbleheadHeaderAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-header-async';
import { BobbleheadMetricsAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-metrics-async';
import { BobbleheadPhotoGalleryAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-photo-gallery-async';
import { BobbleheadSecondaryCardsAsync } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/async/bobblehead-secondary-cards-async';
import { BobbleheadErrorBoundary } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-error-boundary';
import { BobbleheadDetailCardsSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-detail-cards-skeleton';
import { BobbleheadFeatureCardSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-header-skeleton';
import { BobbleheadMetricsSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-metrics-skeleton';
import { BobbleheadPhotoGallerySkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-photo-gallery-skeleton';
import { BobbleheadSecondaryCardsSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/skeletons/bobblehead-secondary-cards-skeleton';
import { Route } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/route-type';
import { ContentLayout } from '@/components/layout/content-layout';
import { AuthContent } from '@/components/ui/auth';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

type ItemPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Bobblehead Details',
  };
}

async function ItemPage({ routeParams }: ItemPageProps) {
  const { bobbleheadId } = await routeParams;
  const currentUserId = await getOptionalUserId();

  // Only fetch basic info to verify existence
  const basicBobblehead = await BobbleheadsFacade.getBobbleheadById(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!basicBobblehead) {
    notFound();
  }

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <ContentLayout>
          <BobbleheadErrorBoundary section={"header"}>
            <Suspense fallback={<BobbleheadHeaderSkeleton />}>
              <BobbleheadHeaderAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
            </Suspense>
          </BobbleheadErrorBoundary>
        </ContentLayout>
      </div>

      {/* Metrics Section */}
      <AuthContent>
        <div className={'mt-4'}>
          <ContentLayout>
            <BobbleheadErrorBoundary section={"metrics"}>
              <Suspense fallback={<BobbleheadMetricsSkeleton />}>
                <BobbleheadMetricsAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
              </Suspense>
            </BobbleheadErrorBoundary>
          </ContentLayout>
        </div>
      </AuthContent>

      {/* Feature Card Section */}
      <div className={'mt-4'}>
        <ContentLayout>
          <BobbleheadErrorBoundary section={"feature"}>
            <Suspense fallback={<BobbleheadFeatureCardSkeleton />}>
              <BobbleheadFeatureCardAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
            </Suspense>
          </BobbleheadErrorBoundary>
        </ContentLayout>
      </div>

      {/* Photo Gallery Section */}
      <ContentLayout>
        <BobbleheadErrorBoundary section={"gallery"}>
          <Suspense fallback={<BobbleheadPhotoGallerySkeleton />}>
            <BobbleheadPhotoGalleryAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>

      {/* Primary Detail Cards Section */}
      <ContentLayout>
        <BobbleheadErrorBoundary section={"details"}>
          <Suspense fallback={<BobbleheadDetailCardsSkeleton />}>
            <BobbleheadDetailCardsAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>

      {/* Secondary Detail Cards Section */}
      <ContentLayout>
        <BobbleheadErrorBoundary section={"secondary"}>
          <Suspense fallback={<BobbleheadSecondaryCardsSkeleton />}>
            <BobbleheadSecondaryCardsAsync bobbleheadId={bobbleheadId} currentUserId={currentUserId || undefined} />
          </Suspense>
        </BobbleheadErrorBoundary>
      </ContentLayout>
    </div>
  );
}

export default withParamValidation(ItemPage, Route);
