import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

import { Subcollection } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/components/subcollection';
import { Route } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

type SubcollectionPageProps = PageProps;

export default withParamValidation(SubcollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Subcollection',
  };
}

async function SubcollectionPage({ routeParams, searchParams }: SubcollectionPageProps) {
  const { collectionId, subcollectionId } = await routeParams;
  const resolvedSearchParams = await searchParams;

  return <Subcollection collectionId={collectionId} searchParams={resolvedSearchParams} subcollectionId={subcollectionId} />;
}
