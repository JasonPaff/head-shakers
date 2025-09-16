import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-header';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { checkIsOwner } from '@/utils/optional-auth-utils';

interface BobbleheadHeaderAsyncProps {
  bobbleheadId: string;
  currentUserId?: string;
}

export const BobbleheadHeaderAsync = async ({
  bobbleheadId,
  currentUserId,
}: BobbleheadHeaderAsyncProps) => {
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithRelations(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  const isOwner = await checkIsOwner(bobblehead.userId);

  return <BobbleheadHeader bobblehead={bobblehead} isOwner={isOwner} likeData={likeData} />;
};