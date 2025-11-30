import 'server-only';

import { BobbleheadsEmptyState } from '@/app/(app)/dashboard/collection-old/components/bobbleheads-empty-state';
import { BobbleheadsManagementGrid } from '@/app/(app)/dashboard/collection-old/components/bobbleheads-management-grid';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

export const BobbleheadsTabContent = async () => {
  const userId = await getRequiredUserIdAsync();
  const bobbleheads = await BobbleheadsFacade.getBobbleheadsByUser(userId, {}, userId);

  if (bobbleheads.length === 0) {
    return <BobbleheadsEmptyState />;
  }

  return (
    <div className={'mt-6'}>
      <BobbleheadsManagementGrid bobbleheads={bobbleheads} />
    </div>
  );
};
