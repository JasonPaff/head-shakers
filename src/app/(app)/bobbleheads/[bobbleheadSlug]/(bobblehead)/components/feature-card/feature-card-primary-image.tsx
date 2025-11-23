'use client';

import type { ComponentProps, KeyboardEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
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
  const [isHovering, setIsHovering] = useToggle();
  const [_hasImageError, setHasImageError] = useState(false);

  const imageTestId = testId || generateTestId('feature', 'bobblehead-photo', 'primary');

  // Derived variables
  const _currentPhoto = photos[currentIndex] || photos[0];
  const _hasMultiplePhotos = photos.length > 1;
  const _hasImage =
    Boolean(_currentPhoto?.url) && _currentPhoto?.url !== '/placeholder.jpg' && !_hasImageError;
  const _photoCount = photos.length;
  const _currentPhotoNumber = currentIndex + 1;
  const _photoAlt = _currentPhoto?.altText ?? bobbleheadName;

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

  const handlePreviousClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onPrevious();
  };

  const handleNextClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onNext();
  };

  const handleImageError = () => {
    setHasImageError(true);
  };

  return (
    <div
      aria-label={`View ${bobbleheadName} image in fullscreen`}
      className={cn('relative aspect-[3/4] cursor-pointer lg:aspect-square', className)}
      data-slot={'feature-card-primary-image'}
      data-testid={imageTestId}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={setIsHovering.on}
      onMouseLeave={setIsHovering.off}
      role={'button'}
      tabIndex={0}
      {...props}
    >
      {/* Main Image */}
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
        <CldImage
          alt={_photoAlt}
          className={'size-full object-cover'}
          crop={'fill'}
          format={'auto'}
          height={800}
          onError={handleImageError}
          quality={'auto:good'}
          src={extractPublicIdFromCloudinaryUrl(_currentPhoto?.url ?? '')}
          width={600}
        />
      </Conditional>

      {/* Navigation Arrows */}
      <Conditional isCondition={_hasMultiplePhotos && isHovering}>
        {/* Previous Button */}
        <Button
          className={cn(
            'absolute top-1/2 left-4 z-10 -translate-y-1/2',
            'bg-black/50 text-white hover:bg-black/70',
            'transition-opacity duration-200',
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
            'absolute top-1/2 right-4 z-10 -translate-y-1/2',
            'bg-black/50 text-white hover:bg-black/70',
            'transition-opacity duration-200',
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

      {/* Photo Counter */}
      <Conditional isCondition={_hasMultiplePhotos && isHovering}>
        <div
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
            'bg-black/50 px-3 py-1 text-sm text-white',
            'transition-opacity duration-200',
          )}
          data-slot={'feature-card-primary-image-counter'}
        >
          {_currentPhotoNumber} of {_photoCount}
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
