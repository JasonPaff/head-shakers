import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadHeader } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-header';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
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

  // Fetch user collections for edit dialog (only if owner)
  let collections: Array<{ id: string; name: string }> = [];
  if (isOwner && currentUserId) {
    const userCollections =
      (await CollectionsFacade.getCollectionsByUser(currentUserId, {}, currentUserId)) ?? [];
    collections = userCollections.map((collection) => ({
      id: collection.id,
      name: collection.name,
    }));
  }

  return (
    <BobbleheadHeader
      bobblehead={bobblehead}
      collections={collections}
      currentUserId={currentUserId}
      isOwner={isOwner}
      likeData={likeData}
    />
  );
};
