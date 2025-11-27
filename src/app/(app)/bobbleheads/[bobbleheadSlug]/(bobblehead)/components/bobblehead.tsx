import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header';
import { BobbleheadMetrics } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-metrics';
import { BobbleheadPhotoGalleryCard } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-photo-gallery';
import { ContentLayout } from '@/components/layout/content-layout';
import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

interface BobbleheadProps {
  bobbleheadId: string;
}

export const Bobblehead = async ({ bobbleheadId }: BobbleheadProps) => {
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

  let collections: Array<{ id: string; name: string }> = [];
  if (isOwner && currentUserId) {
    const userCollections =
      (await CollectionsFacade.getCollectionsByUser(currentUserId, {}, currentUserId)) ?? [];
    collections = userCollections.map((collection) => ({
      id: collection.id,
      name: collection.name,
    }));
  }

  const hasMultiplePhotos = bobblehead.photos.length > 1;

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <ContentLayout>
          <BobbleheadHeader
            bobblehead={bobblehead}
            collections={collections}
            currentUserId={currentUserId}
            isOwner={isOwner}
            likeData={likeData}
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
          <BobbleheadFeatureCard bobblehead={bobblehead} likeData={likeData} />
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
