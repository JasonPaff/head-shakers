import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';

import type { PageProps } from '@/app/(app)/items/add/route-type';

import { AddItemFormServer } from '@/app/(app)/items/add/components/add-item-form-server';
import { AddItemHeader } from '@/app/(app)/items/add/components/add-item-header';
import { Route } from '@/app/(app)/items/add/route-type';
import { PageContent } from '@/components/layout/page-content';

type AddItemPageProps = PageProps;

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Add Bobblehead',
  };
}

async function AddItemPage({ searchParams }: AddItemPageProps) {
  const { collectionId, subcollectionId } = await searchParams;

  return (
    <PageContent>
      <AddItemHeader />
      <AddItemFormServer initialCollectionId={collectionId} initialSubcollectionId={subcollectionId} />
    </PageContent>
  );
}

export default withParamValidation(AddItemPage, Route);
