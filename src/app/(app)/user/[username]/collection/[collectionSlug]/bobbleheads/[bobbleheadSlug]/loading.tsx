import { ContentLayout } from '@/components/layout/content-layout';

import { BobbleheadDetailCardsSkeleton } from './components/skeletons/bobblehead-detail-cards-skeleton';
import { BobbleheadFeatureCardSkeleton } from './components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from './components/skeletons/bobblehead-header-skeleton';
import { BobbleheadPhotoGallerySkeleton } from './components/skeletons/bobblehead-photo-gallery-skeleton';
import { BobbleheadSecondaryCardsSkeleton } from './components/skeletons/bobblehead-secondary-cards-skeleton';

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
