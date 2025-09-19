import type { Metadata } from 'next';

import { withParamValidation } from 'next-typesafe-url/app/hoc';
import { Suspense } from 'react';

import type { PageProps } from '@/app/(app)/bobbleheads/add/route-type';

import { AddItemFormServer } from '@/app/(app)/bobbleheads/add/components/add-item-form-server';
import { AddItemHeader } from '@/app/(app)/bobbleheads/add/components/add-item-header';
import { AddItemFormSkeleton } from '@/app/(app)/bobbleheads/add/components/skeletons/add-item-form-skeleton';
import { Route } from '@/app/(app)/bobbleheads/add/route-type';
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
      {/* Header Section - No suspense needed (static) */}
      <AddItemHeader />

      {/* Form Section with Suspense */}
      <Suspense fallback={<AddItemFormSkeleton />}>
        <AddItemFormServer initialCollectionId={collectionId} initialSubcollectionId={subcollectionId} />
      </Suspense>
    </PageContent>
  );
}

export default withParamValidation(AddItemPage, Route);
