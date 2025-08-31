import type { Metadata } from 'next';

import { AddItemFormServer } from '@/app/(app)/items/add/components/add-item-form-server';
import { AddItemHeader } from '@/app/(app)/items/add/components/add-item-header';
import { PageContent } from '@/components/layout/page-content';

export default function AddItemPage() {
  return (
    <PageContent>
      <AddItemHeader />
      <AddItemFormServer />
    </PageContent>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: '',
    title: 'Add Bobblehead',
  };
}
