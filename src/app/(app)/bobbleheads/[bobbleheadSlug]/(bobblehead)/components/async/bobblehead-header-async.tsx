import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getIsOwnerAsync, getUserIdAsync } from '@/utils/auth-utils';

interface BobbleheadHeaderAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadHeaderAsync = async ({ bobbleheadId }: BobbleheadHeaderAsyncProps) => {
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
      currentUserId={currentUserId}
      isOwner={isOwner}
      likeData={likeData}
    />
  );
};
