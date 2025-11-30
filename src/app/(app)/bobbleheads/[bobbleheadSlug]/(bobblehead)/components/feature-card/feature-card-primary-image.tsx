'use client';

import type { ComponentProps, KeyboardEvent, MouseEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

import type { PhotoItem } from './types';

type FeatureCardPrimaryImageProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobbleheadName: string;
    currentCondition?: null | string;
    currentIndex: number;
    isFeatured?: boolean;
    onClick: () => void;
    onNext: () => void;
    onPrevious: () => void;
    photos: Array<PhotoItem>;
  };

export const FeatureCardPrimaryImage = ({
  bobbleheadName,
  className,
  currentCondition,
  currentIndex,
  isFeatured = false,
  onClick,
  onNext,
  onPrevious,
  photos,
  testId,
  ...props
}: FeatureCardPrimaryImageProps) => {
  const [_hasImageError, setHasImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const imageTestId = testId || generateTestId('feature', 'bobblehead-photo', 'primary');

  // Derived variables
  const _currentPhoto = photos[currentIndex] || photos[0];
  const _hasMultiplePhotos = photos.length > 1;
  const _hasImage =
    Boolean(_currentPhoto?.url) && _currentPhoto?.url !== '/placeholder.jpg' && !_hasImageError;
  const _photoCount = photos.length;
  const _currentPhotoNumber = currentIndex + 1;
  const _photoAlt = _currentPhoto?.altText ?? bobbleheadName;

  // Memoized values
  const _publicId = useMemo(
    () => extractPublicIdFromCloudinaryUrl(_currentPhoto?.url ?? ''),
    [_currentPhoto?.url],
  );

  const _blurDataUrl = useMemo(() => generateBlurDataUrl(_publicId), [_publicId]);

  // Condition badge variant helper
  const getConditionVariant = (condition: null | string | undefined) => {
    if (!condition) return 'outline';
    const lowerCondition = condition.toLowerCase();
    if (lowerCondition.includes('mint')) return 'default';
    if (lowerCondition.includes('good')) return 'secondary';
    return 'outline';
  };

  // Event handlers
  const handleClick = () => {
    onClick();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onClick();
    }
  };

  const handlePreviousClick = (event: MouseEvent) => {
    event.stopPropagation();
    onPrevious();
  };

  const handleNextClick = (event: MouseEvent) => {
    event.stopPropagation();
    onNext();
  };

  const handleImageError = () => {
    setHasImageError(true);
  };

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  return (
    <div
      aria-label={`View ${bobbleheadName} image in fullscreen`}
      className={cn('group relative aspect-[3/4] cursor-pointer overflow-hidden lg:aspect-square', className)}
      data-slot={'feature-card-primary-image'}
      data-testid={imageTestId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={'button'}
      tabIndex={0}
      {...props}
    >
      {/* Main Image with Blur Placeholder and Fade-in Transition */}
      <Conditional
        fallback={
          <div
            className={'flex size-full items-center justify-center bg-muted'}
            data-slot={'feature-card-primary-image-placeholder'}
          >
            <span className={'text-sm text-muted-foreground'}>No photo available</span>
          </div>
        }
        isCondition={_hasImage}
      >
        <div
          className={cn('size-full transition-transform duration-300 ease-out', 'group-hover:scale-105')}
          data-slot={'feature-card-primary-image-wrapper'}
        >
          <CldImage
            alt={_photoAlt}
            blurDataURL={_blurDataUrl}
            className={cn(
              'size-full object-cover',
              'transition-opacity duration-500 ease-out',
              isImageLoaded ? 'opacity-100' : 'opacity-0',
            )}
            crop={'fill'}
            format={'auto'}
            height={800}
            onError={handleImageError}
            onLoad={handleImageLoad}
            placeholder={'blur'}
            quality={'auto:good'}
            src={_publicId}
            width={600}
          />
        </div>
      </Conditional>

      {/* Navigation Arrows - Always visible on mobile, hover-fade on desktop */}
      <Conditional isCondition={_hasMultiplePhotos}>
        {/* Previous Button */}
        <Button
          className={cn(
            'absolute top-1/2 left-2 z-10 -translate-y-1/2',
            'bg-black/40 text-white hover:bg-black/70',
            'transition-all duration-200',
            // Mobile: always semi-visible, Desktop: fade on hover
            'opacity-60 md:opacity-0',
            'md:group-hover:opacity-100',
          )}
          data-slot={'feature-card-primary-image-prev'}
          onClick={handlePreviousClick}
          size={'icon'}
          variant={'ghost'}
        >
          <ChevronLeftIcon aria-hidden className={'size-6'} />
          <span className={'sr-only'}>Previous photo</span>
        </Button>

        {/* Next Button */}
        <Button
          className={cn(
            'absolute top-1/2 right-2 z-10 -translate-y-1/2',
            'bg-black/40 text-white hover:bg-black/70',
            'transition-all duration-200',
            // Mobile: always semi-visible, Desktop: fade on hover
            'opacity-60 md:opacity-0',
            'md:group-hover:opacity-100',
          )}
          data-slot={'feature-card-primary-image-next'}
          onClick={handleNextClick}
          size={'icon'}
          variant={'ghost'}
        >
          <ChevronRightIcon aria-hidden className={'size-6'} />
          <span className={'sr-only'}>Next photo</span>
        </Button>
      </Conditional>

      {/* Photo Counter with Backdrop Blur */}
      <Conditional isCondition={_hasMultiplePhotos}>
        <div
          className={cn(
            'absolute bottom-4 left-1/2 z-10 -translate-x-1/2 rounded-full',
            'bg-black/40 px-3 py-1 text-sm font-medium text-white',
            'backdrop-blur-sm',
            'transition-all duration-200',
            // Mobile: always semi-visible, Desktop: fade on hover
            'opacity-60 md:opacity-0',
            'md:group-hover:opacity-100',
          )}
          data-slot={'feature-card-primary-image-counter'}
        >
          {_currentPhotoNumber} / {_photoCount}
        </div>
      </Conditional>

      {/* Featured Badge */}
      <Conditional isCondition={isFeatured}>
        <Badge
          className={'absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg'}
          data-slot={'feature-card-primary-image-featured-badge'}
        >
          Featured
        </Badge>
      </Conditional>

      {/* Condition Badge */}
      <Conditional isCondition={!!currentCondition}>
        <Badge
          className={'absolute top-4 right-4 shadow-lg'}
          data-slot={'feature-card-primary-image-condition-badge'}
          variant={getConditionVariant(currentCondition)}
        >
          {currentCondition}
        </Badge>
      </Conditional>
    </div>
  );
};
