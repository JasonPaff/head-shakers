import 'server-only';
import { notFound } from 'next/navigation';

import { ContentLayout } from '@/components/layout/content-layout';
import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadFeatureCard } from './bobblehead-feature-card';
import { BobbleheadHeader } from './bobblehead-header';
import { BobbleheadMetrics } from './bobblehead-metrics';
import { BobbleheadPhotoGalleryCard } from './bobblehead-photo-gallery';

interface BobbleheadProps {
  bobbleheadId: string;
  collectionSlug: string;
  ownerUsername: string;
}

export const Bobblehead = async ({ bobbleheadId, collectionSlug, ownerUsername }: BobbleheadProps) => {
  const currentUserId = await getUserIdAsync();

  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  const isOwner = await getIsOwnerAsync(bobblehead.userId);

  const likeData = await SocialFacade.getContentLikeData(
    bobbleheadId,
    'bobblehead',
    currentUserId || undefined,
  );

  const hasMultiplePhotos = bobblehead.photos.length > 1;

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <ContentLayout>
          <BobbleheadHeader
            bobblehead={bobblehead}
            collectionSlug={collectionSlug}
            currentUserId={currentUserId}
            isOwner={isOwner}
            ownerUsername={ownerUsername}
          />
        </ContentLayout>
      </div>

      {/* Metrics Section */}
      <AuthContent>
        <div className={'mt-4'}>
          <ContentLayout>
            <BobbleheadMetrics bobblehead={bobblehead} bobbleheadId={bobbleheadId} />
          </ContentLayout>
        </div>
      </AuthContent>

      {/* Feature Card Section */}
      <div className={'mt-4'}>
        <ContentLayout>
          <BobbleheadFeatureCard
            bobblehead={bobblehead}
            collectionSlug={collectionSlug}
            likeData={likeData}
            ownerUsername={ownerUsername}
          />
        </ContentLayout>
      </div>

      {/* Photo Gallery Section - Only show if multiple photos */}
      <Conditional isCondition={hasMultiplePhotos}>
        <ContentLayout>
          <BobbleheadPhotoGalleryCard bobblehead={bobblehead} />
        </ContentLayout>
      </Conditional>
    </div>
  );
};
