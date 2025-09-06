import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadAcquisitionCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-acquisition-card';
import { BobbleheadDetailsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-details-card';
import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadSpecificationCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-specification-card';
import { getBobbleheadByIdAsync } from '@/lib/queries/bobbleheads.queries';

interface BobbleheadProps {
  bobbleheadId: string;
}

export const Bobblehead = async ({ bobbleheadId }: BobbleheadProps) => {
  const bobblehead = await getBobbleheadByIdAsync(bobbleheadId);

  if (!bobblehead) {
    notFound();
  }

  return (
    <div className={'mx-auto max-w-7xl space-y-6 p-2'}>
      <BobbleheadFeatureCard bobblehead={bobblehead} />
      <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
        <BobbleheadDetailsCard bobblehead={bobblehead} />
        <BobbleheadSpecificationCard bobblehead={bobblehead} />
        <BobbleheadAcquisitionCard bobblehead={bobblehead} />
      </div>
    </div>
  );
};
