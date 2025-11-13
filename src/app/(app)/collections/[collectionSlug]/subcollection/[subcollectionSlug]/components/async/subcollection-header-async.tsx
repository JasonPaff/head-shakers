import 'server-only';
import { notFound } from 'next/navigation';

import { SubcollectionHeader } from '@/app/(app)/collections/[collectionSlug]/subcollection/[subcollectionSlug]/components/subcollection-header';
import { SubcollectionsFacade } from '@/lib/facades/collections/subcollections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface SubcollectionHeaderAsyncProps {
  collectionId: string;
  subcollectionId: string;
}

export const SubcollectionHeaderAsync = async ({
  collectionId,
  subcollectionId,
}: SubcollectionHeaderAsyncProps) => {
  const currentUserId = await getOptionalUserId();

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
