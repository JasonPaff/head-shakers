import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadHeader } from '../bobblehead-header';

interface BobbleheadHeaderAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadHeaderAsync = async ({ bobbleheadId }: BobbleheadHeaderAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  return <BobbleheadHeader bobblehead={bobblehead} />;
};
