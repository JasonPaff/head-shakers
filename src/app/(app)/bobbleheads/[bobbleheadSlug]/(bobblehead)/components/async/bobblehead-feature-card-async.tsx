import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadFeatureCard } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-feature-card';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface BobbleheadFeatureCardAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadFeatureCardAsync = async ({ bobbleheadId }: BobbleheadFeatureCardAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const [bobblehead, likeData] = await Promise.all([
    BobbleheadsFacade.getBobbleheadWithRelations(bobbleheadId, currentUserId || undefined),
    SocialFacade.getContentLikeData(bobbleheadId, 'bobblehead', currentUserId || undefined),
  ]);

  if (!bobblehead) {
    notFound();
  }

  return <BobbleheadFeatureCard bobblehead={bobblehead} likeData={likeData} />;
};
