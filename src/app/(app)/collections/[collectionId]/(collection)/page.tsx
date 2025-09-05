import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { notFound } from 'next/navigation';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';

import { Collection } from '@/app/(app)/collections/[collectionId]/(collection)/components/collection';
import { Route } from '@/app/(app)/collections/[collectionId]/(collection)/route-type';
import { getCollectionByIdAsync } from '@/lib/queries/collections.queries';
import { getUserId } from '@/utils/user-utils';

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

  const userId = await getUserId();
  const collection = await getCollectionByIdAsync(collectionId, userId);
  if (!collection) notFound();

  return <Collection collection={collection} />;
}
