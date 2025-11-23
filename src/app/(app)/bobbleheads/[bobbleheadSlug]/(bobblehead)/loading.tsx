import { BobbleheadDetailCardsSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-detail-cards-skeleton';
import { BobbleheadFeatureCardSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-header-skeleton';
import { BobbleheadPhotoGallerySkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-photo-gallery-skeleton';
import { BobbleheadSecondaryCardsSkeleton } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/skeletons/bobblehead-secondary-cards-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';

export default function BobbleheadLoading() {
  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <ContentLayout>
          <BobbleheadHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Feature Card Section */}
      <div className={'mt-4'}>
        <ContentLayout>
          <BobbleheadFeatureCardSkeleton />
        </ContentLayout>
      </div>

      {/* Photo Gallery Section */}
      <ContentLayout>
        <BobbleheadPhotoGallerySkeleton />
      </ContentLayout>

      {/* Primary Detail Cards Section */}
      <ContentLayout>
        <BobbleheadDetailCardsSkeleton />
      </ContentLayout>

      {/* Secondary Detail Cards Section */}
      <ContentLayout>
        <BobbleheadSecondaryCardsSkeleton />
      </ContentLayout>
    </div>
  );
}
