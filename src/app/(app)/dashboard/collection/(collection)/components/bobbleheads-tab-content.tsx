import 'server-only';

import { BobbleheadsManagementGrid } from '@/app/(app)/dashboard/collection/(collection)/components/bobbleheads-management-grid';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserId } from '@/utils/user-utils';

export const BobbleheadsTabContent = async () => {
  const userId = await getUserId();
  const bobbleheads = await BobbleheadsFacade.getBobbleheadsByUser(userId, {}, userId);

  if (bobbleheads.length === 0) {
    return (
      <div className={'py-16 text-center'}>
        <h3 className={'text-lg font-medium text-muted-foreground'}>No bobbleheads yet</h3>
        <p className={'mt-2 text-sm text-muted-foreground'}>
          Start building your collection by adding your first bobblehead.
        </p>
      </div>
    );
  }

  return (
    <div className={'mt-6'}>
      <BobbleheadsManagementGrid bobbleheads={bobbleheads} />
    </div>
  );
};
