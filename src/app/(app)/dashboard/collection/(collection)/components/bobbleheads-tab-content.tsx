import 'server-only';

import { BobbleheadsEmptyState } from '@/app/(app)/dashboard/collection/(collection)/components/bobbleheads-empty-state';
import { BobbleheadsManagementGrid } from '@/app/(app)/dashboard/collection/(collection)/components/bobbleheads-management-grid';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserId } from '@/utils/user-utils';

export const BobbleheadsTabContent = async () => {
  const userId = await getUserId();
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
