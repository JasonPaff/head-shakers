import 'server-only';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadNavigation } from '../bobblehead-navigation';

interface BobbleheadNavigationAsyncProps {
  bobbleheadId: string;
  collectionId: string;
  collectionSlug: string;
  isKeyboardNavigationEnabled?: boolean;
  ownerUsername: string;
}

export const BobbleheadNavigationAsync = async ({
  bobbleheadId,
  collectionId,
  collectionSlug,
  isKeyboardNavigationEnabled,
  ownerUsername,
}: BobbleheadNavigationAsyncProps) => {
  const currentUserId = await getUserIdAsync();

  const navigationData = await BobbleheadsFacade.getBobbleheadNavigationDataAsync(
    bobbleheadId,
    collectionId,
    currentUserId || undefined,
  );

  // Return null if no adjacent bobbleheads exist
  const _hasNavigation = !!navigationData.previousBobblehead || !!navigationData.nextBobblehead;

  if (!_hasNavigation) {
    return null;
  }

  return (
    <BobbleheadNavigation
      collectionSlug={collectionSlug}
      isKeyboardNavigationEnabled={isKeyboardNavigationEnabled}
      navigationData={navigationData}
      ownerUsername={ownerUsername}
    />
  );
};
