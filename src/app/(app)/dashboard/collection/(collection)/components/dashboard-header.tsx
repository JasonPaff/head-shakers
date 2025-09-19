import 'server-only';

import { CollectionCreateButton } from '@/app/(app)/dashboard/collection/(collection)/components/collection-create-button';
import { DashboardStats } from '@/app/(app)/dashboard/collection/(collection)/components/dashboard-stats';
import { CollectionsFacade } from '@/lib/facades/collections/collections.facade';
import { generateTestId } from '@/lib/test-ids';
import { getUserId } from '@/utils/user-utils';

export const DashboardHeader = async () => {
  const userId = await getUserId();
  const collections = await CollectionsFacade.getUserCollectionsForDashboard(userId);

  const totalCollections = collections.length;
  const totalSubcollections = collections.reduce((acc, col) => acc + col.subCollections.length, 0);
  const totalBobbleheads = collections.reduce((acc, col) => acc + col.metrics.totalBobbleheads, 0);

  const stats = {
    bobbleheads: totalBobbleheads,
    collections: totalCollections,
    subcollections: totalSubcollections,
  };

  const dataTestId = generateTestId('layout', 'app-header', 'dashboard');

  return (
    <div className={'mb-8'}>
      <div className={'mt-4 mb-6 flex items-start justify-between'}>
        <div>
          <h1 className={'text-2xl font-bold text-foreground'} data-testid={dataTestId}>
            My Collections Dashboard
          </h1>
          <p className={'text-muted-foreground'}>Manage your collections, subcollections, and bobbleheads</p>
        </div>
        <CollectionCreateButton />
      </div>

      <DashboardStats stats={stats} />
    </div>
  );
};
