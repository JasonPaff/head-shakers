'use client';

import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants';

interface CollectionCoverPhotoProps {
  collection: PublicCollection;
}

export const CollectionCoverPhoto = ({ collection }: CollectionCoverPhotoProps) => {
  return (
    <div className={'relative mb-6 aspect-[4/1] w-full overflow-hidden rounded-lg bg-muted'}>
      <Conditional isCondition={!!collection?.coverImageUrl}>
        <CldImage
          alt={`${collection?.name} cover photo`}
          className={'object-cover'}
          fill
          preload
          sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'}
          src={collection?.coverImageUrl ?? ''}
        />
      </Conditional>
      <Conditional isCondition={!collection?.coverImageUrl}>
        <Image
          alt={'Collection placeholder'}
          className={'object-cover'}
          fill
          priority
          sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'}
          src={CLOUDINARY_PATHS.PLACEHOLDERS.COLLECTION_COVER}
        />
      </Conditional>
    </div>
  );
};
