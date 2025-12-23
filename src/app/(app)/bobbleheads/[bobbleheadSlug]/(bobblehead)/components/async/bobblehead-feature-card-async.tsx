import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

interface BobbleheadFeatureCardAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadFeatureCardAsync = async ({ bobbleheadId }: BobbleheadFeatureCardAsyncProps) => {
  const currentUserId = await getUserIdAsync();
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithRelations(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeDataAsync(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  const isOwner = !!currentUserId && currentUserId === bobblehead.userId;

  return <BobbleheadFeatureCard bobblehead={bobblehead} isOwner={isOwner} likeData={likeData} />;
};
