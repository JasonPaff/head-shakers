import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadFeatureCard } from '../bobblehead-feature-card';

interface BobbleheadFeatureCardAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadFeatureCardAsync = async ({ bobbleheadId }: BobbleheadFeatureCardAsyncProps) => {
  const currentUserId = await getUserIdAsync();
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  const isOwner = !!currentUserId && currentUserId === bobblehead.userId;

  return (
    <BobbleheadFeatureCard
      bobblehead={bobblehead}
      collectionSlug={bobblehead.collectionSlug ?? ''}
      isOwner={isOwner}
      ownerUsername={bobblehead.ownerUsername ?? ''}
    />
  );
};
