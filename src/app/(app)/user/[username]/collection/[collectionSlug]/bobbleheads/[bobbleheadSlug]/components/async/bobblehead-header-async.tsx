import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadHeader } from '../bobblehead-header';

interface BobbleheadHeaderAsyncProps {
  bobbleheadId: string;
  collectionSlug: string;
  ownerUsername: string;
}

export const BobbleheadHeaderAsync = async ({
  bobbleheadId,
  collectionSlug,
  ownerUsername,
}: BobbleheadHeaderAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  const isOwner = await getIsOwnerAsync(bobblehead.userId);

  return (
    <BobbleheadHeader
      bobblehead={bobblehead}
      collectionSlug={collectionSlug}
      currentUserId={currentUserId}
      isOwner={isOwner}
      ownerUsername={ownerUsername}
    />
  );
};
