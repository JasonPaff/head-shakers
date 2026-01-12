import { CommentSectionSkeleton } from '@/components/feature/comments/skeletons/comment-section-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';

import { BobbleheadFeatureCardSkeleton } from './components/skeletons/bobblehead-feature-card-skeleton';
import { BobbleheadHeaderSkeleton } from './components/skeletons/bobblehead-header-skeleton';
import { BobbleheadNavigationSkeleton } from './components/skeletons/bobblehead-navigation-skeleton';
import { BobbleheadPhotoGallerySkeleton } from './components/skeletons/bobblehead-photo-gallery-skeleton';

export default function BobbleheadLoading() {
  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <ContentLayout>
          <BobbleheadHeaderSkeleton />
        </ContentLayout>
      </div>

      {/* Navigation Section */}
      <div className={'mt-4'}>
        <ContentLayout>
          <BobbleheadNavigationSkeleton />
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

      {/* Comments Section */}
      <div className={'mt-8'}>
        <ContentLayout>
          <CommentSectionSkeleton />
        </ContentLayout>
      </div>
    </div>
  );
}
