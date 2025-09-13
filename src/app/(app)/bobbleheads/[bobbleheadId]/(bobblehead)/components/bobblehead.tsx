import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadAcquisitionCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-acquisition-card';
import { BobbleheadCustomFieldsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-custom-fields-card';
import { BobbleheadDetailsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-details-card';
import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header';
import { BobbleheadMetrics } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-metrics';
import { BobbleheadPhotoGalleryCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-photo-gallery';
import { BobbleheadSpecificationCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-specification-card';
import { BobbleheadStatusPrivacyCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-status-privacy-card';
import { BobbleheadTimestampsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-timestamps-card';
import { AuthContent } from '@/components/ui/auth';
import { Conditional } from '@/components/ui/conditional';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { checkIsOwner, getOptionalUserId } from '@/utils/optional-auth-utils';

interface BobbleheadProps {
  bobbleheadId: string;
}

export const Bobblehead = async ({ bobbleheadId }: BobbleheadProps) => {
  const currentUserId = await getOptionalUserId();

  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  const isOwner = await checkIsOwner(bobblehead.userId);

  const likeData = await SocialFacade.getContentLikeData(
    bobbleheadId,
    'bobblehead',
    currentUserId || undefined,
  );

  const hasMultiplePhotos = bobblehead.photos.length > 1;

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border bg-muted/75'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <BobbleheadHeader bobblehead={bobblehead} isOwner={isOwner} likeData={likeData} />
        </div>
      </div>

      {/* Metrics Section */}
      <AuthContent>
        <div className={'mx-auto mt-4 max-w-7xl p-2'}>
          <BobbleheadMetrics bobblehead={bobblehead} />
        </div>
      </AuthContent>

      {/* Feature Card Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <BobbleheadFeatureCard bobblehead={bobblehead} likeData={likeData} />
      </div>

      {/* Photo Gallery Section - Only show if multiple photos */}
      <Conditional isCondition={hasMultiplePhotos}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <BobbleheadPhotoGalleryCard bobblehead={bobblehead} />
        </div>
      </Conditional>

      {/* Primary Detail Cards Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          <BobbleheadDetailsCard bobblehead={bobblehead} />
          <BobbleheadSpecificationCard bobblehead={bobblehead} />
          <BobbleheadAcquisitionCard bobblehead={bobblehead} />
        </div>
      </div>

      {/* Secondary Detail Cards Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          <BobbleheadStatusPrivacyCard bobblehead={bobblehead} />
          <BobbleheadTimestampsCard bobblehead={bobblehead} />
          <BobbleheadCustomFieldsCard bobblehead={bobblehead} />
        </div>
      </div>
    </div>
  );
};
