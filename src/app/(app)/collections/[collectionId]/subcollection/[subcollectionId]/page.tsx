import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

import { Route } from '@/app/(app)/collections/[collectionId]/subcollection/[subcollectionId]/route-type';

type SubcollectionPageProps = PageProps;

export default withParamValidation(SubcollectionPage, Route);

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Subcollection',
  };
}

async function SubcollectionPage({ routeParams }: SubcollectionPageProps) {
  console.log(await routeParams);
  return <div>subcollection page</div>;
}
