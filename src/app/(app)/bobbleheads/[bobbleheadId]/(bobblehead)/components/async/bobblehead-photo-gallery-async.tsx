import 'server-only';
import { notFound } from 'next/navigation';

import { BobbleheadPhotoGalleryCard } from '@/app/(app)/bobbleheads/[bobbleheadId]/(bobblehead)/components/bobblehead-photo-gallery';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';

interface BobbleheadPhotoGalleryAsyncProps {
  bobbleheadId: string;
  currentUserId?: string;
}

export const BobbleheadPhotoGalleryAsync = async ({
  bobbleheadId,
  currentUserId,
}: BobbleheadPhotoGalleryAsyncProps) => {
  const bobblehead = await BobbleheadsFacade.getBobbleheadWithRelations(
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
