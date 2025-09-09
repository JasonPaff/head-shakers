import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';

import { Collection } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection';
import { Route } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
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

  return <Collection collection={collection} isOwner={isOwner} />;
}
