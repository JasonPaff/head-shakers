'use client';

import type { ComponentProps } from 'react';

import { CldImage } from 'next-cloudinary';
import { useCallback } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

export type PhotoItem = {
  altText?: null | string;
  url: string;
};

type FeatureCardImageGalleryProps = ComponentTestIdProps &
  Omit<ComponentProps<'div'>, 'onSelect'> & {
    currentIndex: number;
    onSelect: (index: number) => void;
    photos: Array<PhotoItem>;
  };

export const FeatureCardImageGallery = ({
  className,
  currentIndex,
  onSelect,
  photos,
  testId,
  ...props
}: FeatureCardImageGalleryProps) => {
  const galleryTestId = testId || generateTestId('feature', 'bobblehead-gallery', 'thumbnails');

  const _hasPhotos = photos.length > 0;

  const handleThumbnailClick = useCallback(
    (index: number) => {
      onSelect(index);
    },
    [onSelect],
  );

  const handleKeyDown = useCallback(
    (index: number, event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onSelect(index);
      }
    },
    [onSelect],
  );

  return (
    <div
      className={cn('w-full', className)}
      data-slot={'feature-card-image-gallery'}
      data-testid={galleryTestId}
      {...props}
    >
      <Conditional
        fallback={
          <div
            className={'flex h-16 items-center justify-center text-sm text-muted-foreground'}
            data-slot={'feature-card-image-gallery-empty'}
          >
            No photos available
          </div>
        }
        isCondition={_hasPhotos}
      >
        {/* Horizontal Scrollable Thumbnail Strip */}
        <div
          className={'flex gap-2 overflow-x-auto pb-2'}
          data-slot={'feature-card-image-gallery-strip'}
          role={'listbox'}
        >
          {photos.map((photo, index) => {
            const _isSelected = index === currentIndex;
            const thumbnailTestId = `${galleryTestId}-thumbnail-${index}`;
            const _photoLabel = photo.altText ?? `Select photo ${index + 1}`;
            const _photoAlt = photo.altText ?? `Photo ${index + 1}`;

            return (
              <button
                aria-label={_photoLabel}
                aria-selected={_isSelected}
                className={cn(
                  'relative size-16 shrink-0 overflow-hidden rounded-md transition-all',
                  'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                  _isSelected ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100',
                )}
                data-slot={'feature-card-image-gallery-thumbnail'}
                data-testid={thumbnailTestId}
                key={photo.url}
                onClick={() => handleThumbnailClick(index)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                role={'option'}
                type={'button'}
              >
                <CldImage
                  alt={_photoAlt}
                  className={'size-full object-cover'}
                  crop={'fill'}
                  format={'auto'}
                  gravity={'auto'}
                  height={64}
                  quality={'auto:low'}
                  src={photo.url}
                  width={64}
                />
              </button>
            );
          })}
        </div>
      </Conditional>
    </div>
  );
};
