import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadMetrics } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-metrics';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';

interface BobbleheadMetricsAsyncProps {
  bobbleheadId: string;
  currentUserId?: string;
}

export const BobbleheadMetricsAsync = async ({
  bobbleheadId,
  currentUserId,
}: BobbleheadMetricsAsyncProps) => {
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  return (
    <BobbleheadMetrics bobblehead={bobblehead} bobbleheadId={bobbleheadId} currentUserId={currentUserId} />
  );
};
