import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadMetrics } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-metrics';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface BobbleheadMetricsAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadMetricsAsync = async ({ bobbleheadId }: BobbleheadMetricsAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  return <BobbleheadMetrics bobblehead={bobblehead} bobbleheadId={bobbleheadId} />;
};
