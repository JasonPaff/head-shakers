import 'server-only';
import { notFound } from 'next/navigation';

import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

import type { CollectionSearchParams } from '../../route-type';

import { CollectionBobbleheads } from '../collection-bobbleheads';

interface CollectionBobbleheadsAsyncProps {
  collectionId: string;
  searchParams?: CollectionSearchParams;
  subcollections: Array<{ id: string; name: string }>;
}

export const CollectionBobbleheadsAsync = async ({
  collectionId,
  searchParams,
  subcollections,
}: CollectionBobbleheadsAsyncProps) => {
  const currentUserId = await getOptionalUserId();
  const collection = await CollectionsFacade.getCollectionForPublicView(
    collectionId,
    currentUserId || undefined,
  );

  if (!collection) {
    notFound();
  }

  return (
    <CollectionBobbleheads
      collection={collection}
      searchParams={searchParams}
      subcollections={subcollections}
    />
  );
};
