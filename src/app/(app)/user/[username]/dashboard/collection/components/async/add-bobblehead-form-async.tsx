import 'server-only';
import { LayersIcon } from 'lucide-react';

import { Alert } from '@/components/ui/alert';
import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../route-type';
import { AddBobbleheadFormClient } from '../client/add-bobblehead-form-client';

export async function AddBobbleheadFormAsync() {
  const userId = await getRequiredUserIdAsync();
  const collectionSlug = collectionDashboardSearchParamsCache.get('collectionSlug');

  const userCollections = await BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(userId);

  // Derived values
  const _hasCollections = userCollections.length > 0;

  // Handle empty collections case
  if (!_hasCollections) {
    return (
      <div className={'p-6'} data-slot={'add-bobblehead-empty-state'}>
        <Alert variant={'warning'}>
          <div className={'flex flex-col gap-2'}>
            <div className={'flex items-center gap-2'}>
              <LayersIcon aria-hidden className={'size-4'} />
              <span className={'font-semibold'}>No Collections Available</span>
            </div>
            <p>
              You need to create a collection before you can add bobbleheads. Use the &quot;New
              Collection&quot; button in the sidebar to get started.
            </p>
          </div>
        </Alert>
      </div>
    );
  }

  // Find the current collection based on URL parameter for preselection
  const currentCollection = userCollections.find((c) => c.slug === collectionSlug);
  const preselectedCollectionId = currentCollection?.id ?? userCollections[0]!.id;

  return (
    <div className={'p-6'} data-slot={'add-bobblehead-form-container'}>
      {/* Add Bobblehead Form */}
      <AddBobbleheadFormClient collectionId={preselectedCollectionId} collections={userCollections} />
    </div>
  );
}
