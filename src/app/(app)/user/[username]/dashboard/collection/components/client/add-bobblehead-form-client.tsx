'use client';

import { useRouter } from 'next/navigation';
import { useQueryStates } from 'nuqs';

import type { CollectionSelectorRecord } from '@/components/feature/bobblehead/bobblehead-upsert-form.types';

import { BobbleheadUpsertForm } from '@/components/feature/bobblehead/bobblehead-upsert-form';

import { collectionDashboardParsers } from '../../route-type';

interface AddBobbleheadFormClientProps {
  collectionId: string;
  collections: Array<CollectionSelectorRecord>;
}

export function AddBobbleheadFormClient({ collectionId, collections }: AddBobbleheadFormClientProps) {
  const router = useRouter();
  const [, setParams] = useQueryStates(
    { add: collectionDashboardParsers.add, edit: collectionDashboardParsers.edit },
    { shallow: false },
  );

  const handleCancel = () => {
    void setParams({ add: null });
  };

  const handleSuccess = () => {
    void setParams({ add: null });
    router.refresh();
  };

  return (
    <BobbleheadUpsertForm
      collectionId={collectionId}
      collections={collections}
      onCancel={handleCancel}
      onSuccess={handleSuccess}
      testId={'bobblehead-create-form'}
    />
  );
}
