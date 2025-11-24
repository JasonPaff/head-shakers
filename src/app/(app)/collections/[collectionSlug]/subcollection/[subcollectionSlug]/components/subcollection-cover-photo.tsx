'use client';

import { CldImage } from 'next-cloudinary';
import Image from 'next/image';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { Conditional } from '@/components/ui/conditional';
import { CLOUDINARY_PATHS } from '@/lib/constants';

interface SubCollectionCoverPhotoProps {
  subcollection: PublicSubcollection;
}

export const SubCollectionCoverPhoto = ({ subcollection }: SubCollectionCoverPhotoProps) => {
  return (
    <div className={'relative mb-6 aspect-[4/1] w-full overflow-hidden rounded-lg bg-muted'}>
      <Conditional isCondition={!!subcollection?.coverImageUrl}>
        <CldImage
          alt={`${subcollection?.name} cover photo`}
          className={'object-cover'}
          fill
          loading={'eager'}
          preload
          sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'}
          src={subcollection?.coverImageUrl ?? ''}
        />
      </Conditional>
      <Conditional isCondition={!subcollection?.coverImageUrl}>
        <Image
          alt={'Subcollection placeholder'}
          className={'object-cover'}
          fill
          priority
          sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px'}
          src={CLOUDINARY_PATHS.PLACEHOLDERS.SUBCOLLECTION_COVER}
        />
      </Conditional>
    </div>
  );
};
