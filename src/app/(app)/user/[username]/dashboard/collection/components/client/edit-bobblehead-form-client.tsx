'use client';

import { useRouter } from 'next/navigation';
import { useQueryStates } from 'nuqs';

import type {
  BobbleheadForUpsert,
  CollectionSelectorRecord,
} from '@/components/feature/bobblehead/bobblehead-upsert-form.types';

import { BobbleheadUpsertForm } from '@/components/feature/bobblehead/bobblehead-upsert-form';

import { collectionDashboardParsers } from '../../route-type';

interface EditBobbleheadFormClientProps {
  bobblehead: BobbleheadForUpsert;
  collectionId: string;
  collections: Array<CollectionSelectorRecord>;
}

export function EditBobbleheadFormClient({
  bobblehead,
  collectionId,
  collections,
}: EditBobbleheadFormClientProps) {
  const router = useRouter();
  const [, setParams] = useQueryStates(
    { add: collectionDashboardParsers.add, edit: collectionDashboardParsers.edit },
    { shallow: false },
  );

  const handleCancel = () => {
    void setParams({ edit: null });
  };

  const handleSuccess = () => {
    void setParams({ edit: null });
    router.refresh();
  };

  return (
    <BobbleheadUpsertForm
      bobblehead={bobblehead}
      collectionId={collectionId}
      collections={collections}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
      testId={'bobblehead-edit-form'}
    />
  );
}
