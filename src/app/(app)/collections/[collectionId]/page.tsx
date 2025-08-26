import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/route-type';

import { Route } from '@/app/(app)/collections/[collectionId]/route-type';

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

  return <div>Collection Page - {collectionId}</div>;
}
