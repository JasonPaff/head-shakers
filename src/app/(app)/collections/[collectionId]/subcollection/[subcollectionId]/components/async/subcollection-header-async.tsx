import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionHeader } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection-header';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';

interface SubcollectionHeaderAsyncProps {
  collectionId: string;
  currentUserId: null | string;
  subcollectionId: string;
}

export const SubcollectionHeaderAsync = async ({
  collectionId,
  currentUserId,
  subcollectionId,
}: SubcollectionHeaderAsyncProps) => {
  const [subcollection, likeData] = await Promise.all([
    SubcollectionsFacade.getSubCollectionForPublicView(
      collectionId,
      subcollectionId,
      currentUserId || undefined,
    ),
    SocialFacade.getContentLikeData(subcollectionId, 'subcollection', currentUserId || undefined),
  ]);

  if (!subcollection) {
    notFound();
  }

  return <SubcollectionHeader likeData={likeData} subcollection={subcollection} />;
};
