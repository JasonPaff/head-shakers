import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
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
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithRelations(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

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
      likeData={likeData}
      ownerUsername={ownerUsername}
    />
  );
};
