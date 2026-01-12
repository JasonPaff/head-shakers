import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getUserIdAsync } from '@/utils/auth-utils';

import { BobbleheadPhotoGalleryCard } from '../bobblehead-photo-gallery';

interface BobbleheadPhotoGalleryAsyncProps {
  bobbleheadId: string;
}

export const BobbleheadPhotoGalleryAsync = async ({ bobbleheadId }: BobbleheadPhotoGalleryAsyncProps) => {
  const currentUserId = await getUserIdAsync();
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelationsAsync(
    bobbleheadId,
    currentUserId || undefined,
  );

  if (!bobblehead) {
    notFound();
  }

  const hasMultiplePhotos = bobblehead.photos.length > 1;

  // only render the gallery if there are multiple photos
  if (!hasMultiplePhotos) {
    return null;
  }

  return <BobbleheadPhotoGalleryCard bobblehead={bobblehead} />;
};
