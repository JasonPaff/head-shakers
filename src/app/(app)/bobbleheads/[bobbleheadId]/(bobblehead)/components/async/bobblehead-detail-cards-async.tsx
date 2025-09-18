import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadAcquisitionCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-acquisition-card';
import { BobbleheadDetailsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-details-card';
import { BobbleheadSpecificationCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-specification-card';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';

interface BobbleheadDetailCardsAsyncProps {
  bobbleheadId: string;
  currentUserId?: string;
}

export const BobbleheadDetailCardsAsync = async ({
  bobbleheadId,
  currentUserId,
}: BobbleheadDetailCardsAsyncProps) => {
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  return (
    <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      <BobbleheadDetailsCard bobblehead={bobblehead} />
      <BobbleheadSpecificationCard bobblehead={bobblehead} />
      <BobbleheadAcquisitionCard bobblehead={bobblehead} />
    </div>
  );
};
