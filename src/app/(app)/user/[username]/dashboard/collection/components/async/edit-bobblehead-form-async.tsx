import 'server-only';

import { Alert } from '@/components/ui/alert';
import { BobbleheadsDashboardFacade } from '@/lib/facades/bobbleheads/bobbleheads-dashboard.facade';
import { getRequiredUserIdAsync } from '@/utils/auth-utils';

import { collectionDashboardSearchParamsCache } from '../../route-type';
import { EditBobbleheadFormClient } from '../client/edit-bobblehead-form-client';

export async function EditBobbleheadFormAsync() {
  const userId = await getRequiredUserIdAsync();
  const bobbleheadId = collectionDashboardSearchParamsCache.get('edit');

  if (!bobbleheadId) {
    return (
      <div className={'p-6'} data-slot={'edit-bobblehead-error'}>
        <Alert variant={'error'}>
          <span className={'font-bold'}>Invalid Request:</span> No bobblehead specified for editing.
        </Alert>
      </div>
    );
  }

  const [bobblehead, userCollections] = await Promise.all([
    BobbleheadsDashboardFacade.getBobbleheadForEditAsync(bobbleheadId, userId),
    BobbleheadsDashboardFacade.getUserCollectionSelectorsAsync(userId),
  ]);

  if (!bobblehead) {
    return (
      <div className={'p-6'} data-slot={'edit-bobblehead-not-found'}>
        <Alert variant={'error'}>
          <strong>Bobblehead Not Found:</strong> The bobblehead you are trying to edit does not exist or you
          do not have permission to edit it.
        </Alert>
      </div>
    );
  }

  return (
    <div className={'p-6'} data-slot={'edit-bobblehead-form-container'}>
      {/* Edit Bobblehead Form */}
      <EditBobbleheadFormClient
        bobblehead={bobblehead}
        collectionId={bobblehead.collectionId}
        collections={userCollections}
      />
    </div>
  );
}
