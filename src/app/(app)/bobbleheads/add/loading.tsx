import { PageContent } from '@/components/layout/page-content';

import { AddItemFormSkeleton } from './components/skeletons/add-item-form-skeleton';
import { AddItemHeaderSkeleton } from './components/skeletons/add-item-header-skeleton';

export default function AddBobbleheadLoading() {
  return (
    <PageContent>
      <AddItemHeaderSkeleton />
      <AddItemFormSkeleton />
    </PageContent>
  );
}
