import 'server-only';

import { BobbleheadNavigation } from '@/app/(app)/bobbleheads/[bobbleheadSlug]/(bobblehead)/components/bobblehead-navigation';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

interface BobbleheadNavigationAsyncProps {
  bobbleheadId: string;
  collectionId: null | string;
  subcollectionId?: null | string;
}

export const BobbleheadNavigationAsync = async ({
  bobbleheadId,
  collectionId,
  subcollectionId,
}: BobbleheadNavigationAsyncProps) => {
  // Navigation only applies within collection context
  if (!collectionId) {
    return null;
  }

  const currentUserId = await getOptionalUserId();

  const navigationData = await BobbleheadsFacade.getBobbleheadNavigationData(
    bobbleheadId,
    collectionId,
    subcollectionId,
    currentUserId || undefined,
  );

  // Return null if no adjacent bobbleheads exist
  const _hasNavigation = !!navigationData.previousBobblehead || !!navigationData.nextBobblehead;

  if (!_hasNavigation) {
    return null;
  }

  return <BobbleheadNavigation navigationData={navigationData} />;
};
