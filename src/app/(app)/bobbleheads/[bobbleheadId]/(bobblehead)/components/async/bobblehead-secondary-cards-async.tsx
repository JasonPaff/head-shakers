import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadCustomFieldsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-custom-fields-card';
import { BobbleheadStatusPrivacyCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-status-privacy-card';
import { BobbleheadTimestampsCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-timestamps-card';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface BobbleheadSecondaryCardsAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadSecondaryCardsAsync = async ({ bobbleheadId }: BobbleheadSecondaryCardsAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  return (
    <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      <BobbleheadStatusPrivacyCard bobblehead={bobblehead} />
      <BobbleheadTimestampsCard bobblehead={bobblehead} />
      <BobbleheadCustomFieldsCard bobblehead={bobblehead} />
    </div>
  );
};
