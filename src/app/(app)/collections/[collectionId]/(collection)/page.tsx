import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';

import { Collection } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection';
import { Route } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { SocialFacade } from '@/lib/facades/social/social.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

type CollectionPageProps = PageProps;

export default withParamValidation(CollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Collection',
  };
}

async function CollectionPage({ routeParams }: CollectionPageProps) {
  const { collectionId } = await routeParams;

  const currentUserId = await getOptionalUserId();
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );
  if (!collection) notFound();

  const isOwner = !!(currentUserId && currentUserId === collection.userId);

  // fetch like data for the collection
  let likeData: { isLiked: boolean; likeCount: number; likeId: null | string } = {
    isLiked: false,
    likeCount: 0,
    likeId: null,
  };

  if (currentUserId) {
    try {
      const likeResult = await SocialFacade.getContentLikeData(collectionId, 'collection', currentUserId);
      likeData = likeResult;
    } catch (error) {
      console.error('Failed to fetch like data for collection:', error);
    }
  } else {
    // for non-authenticated users, get just the like count
    try {
      const likeResult = await SocialFacade.getContentLikeData(collectionId, 'collection');
      likeData = { isLiked: false, likeCount: likeResult.likeCount, likeId: null };
    } catch (error) {
      console.error('Failed to fetch like count for collection:', error);
    }
  }

  return <Collection collection={collection} isOwner={isOwner} likeData={likeData} />;
}
