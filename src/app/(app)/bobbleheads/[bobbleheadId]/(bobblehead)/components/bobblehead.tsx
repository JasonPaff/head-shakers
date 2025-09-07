import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadAcquisitionCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-acquisition-card';
import { BobbleheadDetailsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-details-card';
import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header';
import { BobbleheadMetrics } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-metrics';
import { BobbleheadPhotoGalleryCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-photo-gallery';
import { BobbleheadSpecificationCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-specification-card';
import { Conditional } from '@/components/ui/conditional';
import { getBobbleheadByIdAsync } from '@/lib/queries/bobbleheads.queries';

interface BobbleheadProps {
  bobbleheadId: string;
}

export const Bobblehead = async ({ bobbleheadId }: BobbleheadProps) => {
  const bobblehead = await getBobbleheadByIdAsync(bobbleheadId);

  if (!bobblehead) {
    notFound();
  }

  const hasMultiplePhotos = bobblehead.photos.length > 1;

  return (
    <div>
      {/* Header Section */}
      <div className={'border-b border-border'}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <BobbleheadHeader bobblehead={bobblehead} />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={'mx-auto mt-4 max-w-7xl p-2'}>
        <BobbleheadMetrics bobblehead={bobblehead} />
      </div>

      {/* Feature Card Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <BobbleheadFeatureCard bobblehead={bobblehead} />
      </div>

      {/* Photo Gallery Section - Only show if multiple photos */}
      <Conditional isCondition={hasMultiplePhotos}>
        <div className={'mx-auto max-w-7xl p-2'}>
          <BobbleheadPhotoGalleryCard bobblehead={bobblehead} />
        </div>
      </Conditional>

      {/* Detail Cards Section */}
      <div className={'mx-auto max-w-7xl p-2'}>
        <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
          <BobbleheadDetailsCard bobblehead={bobblehead} />
          <BobbleheadSpecificationCard bobblehead={bobblehead} />
          <BobbleheadAcquisitionCard bobblehead={bobblehead} />
        </div>
      </div>
    </div>
  );
};
