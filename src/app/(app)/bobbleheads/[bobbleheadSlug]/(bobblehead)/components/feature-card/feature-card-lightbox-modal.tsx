'use client';

import type { KeyboardEvent, TouchEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

type FeatureCardLightboxModalProps = ComponentTestIdProps & {
  bobbleheadName: string;
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  photos: Array<Photo>;
};

type Photo = {
  altText?: string;
  url: string;
};

const SWIPE_THRESHOLD = 50;

export const FeatureCardLightboxModal = ({
  bobbleheadName,
  currentIndex,
  isOpen,
  onClose,
  onIndexChange,
  photos,
  testId,
}: FeatureCardLightboxModalProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  const lightboxTestId = testId || generateTestId('feature', 'bobblehead-gallery', 'lightbox');

  const _currentPhoto = photos[currentIndex] || photos[0];
  const _hasMultiplePhotos = photos.length > 1;
  const _hasImage = _currentPhoto?.url && _currentPhoto.url !== '/placeholder.jpg';

  const handlePrevious = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    onIndexChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning, onIndexChange, photos.length]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    const newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(newIndex);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [currentIndex, isTransitioning, onIndexChange, photos.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    },
    [handleNext, handlePrevious],
  );

  const handleTouchStart = useCallback((event: TouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0;
    touchEndX.current = event.touches[0]?.clientX ?? 0;
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    touchEndX.current = event.touches[0]?.clientX ?? 0;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchStartX.current - touchEndX.current;

    if (Math.abs(swipeDistance) > SWIPE_THRESHOLD) {
      if (swipeDistance > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
  }, [handleNext, handlePrevious]);

  const handleDotClick = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      onIndexChange(index);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [currentIndex, isTransitioning, onIndexChange],
  );

  const handleDotKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleDotClick(index);
      }
    },
    [handleDotClick],
  );

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogContent
        className={cn('max-w-6xl p-0', 'data-[state=open]:animate-carousel-scale-in')}
        data-slot={'feature-card-lightbox-modal'}
        data-testid={lightboxTestId}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className={'p-4'} data-slot={'feature-card-lightbox-header'}>
          <DialogTitle>{bobbleheadName} Photos</DialogTitle>
          <DialogDescription>View full-size photos of this bobblehead</DialogDescription>
        </DialogHeader>

        {/* Image Container */}
        <div
          className={'relative flex items-center justify-center bg-black'}
          data-slot={'feature-card-lightbox-image-container'}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
        >
          {/* Previous Button */}
          <Conditional isCondition={_hasMultiplePhotos}>
            <Button
              aria-label={'Previous photo'}
              className={cn(
                'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                'bg-black/50 text-white hover:bg-black/70',
                'transition-all duration-200 ease-out',
                'hover:scale-110',
              )}
              data-slot={'feature-card-lightbox-previous'}
              onClick={handlePrevious}
              size={'icon'}
              variant={'ghost'}
            >
              <ChevronLeftIcon aria-hidden className={'size-6'} />
            </Button>
          </Conditional>

          {/* Main Image */}
          <div
            className={cn(
              'flex max-h-[80vh] w-full items-center justify-center',
              'transition-opacity duration-300 ease-out',
              isTransitioning && 'opacity-50',
            )}
            data-slot={'feature-card-lightbox-image-wrapper'}
          >
            {_hasImage ?
              <CldImage
                alt={_currentPhoto?.altText ?? bobbleheadName}
                className={cn(
                  'max-h-full max-w-full object-contain',
                  'transition-transform duration-300 ease-out',
                )}
                crop={'pad'}
                data-slot={'feature-card-lightbox-image'}
                format={'auto'}
                height={1200}
                quality={'auto:best'}
                src={extractPublicIdFromCloudinaryUrl(_currentPhoto.url)}
                width={1200}
              />
            : <img
                alt={bobbleheadName}
                className={'max-h-full max-w-full object-contain'}
                data-slot={'feature-card-lightbox-placeholder'}
                src={'/placeholder.jpg'}
              />
            }
          </div>

          {/* Next Button */}
          <Conditional isCondition={_hasMultiplePhotos}>
            <Button
              aria-label={'Next photo'}
              className={cn(
                'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                'bg-black/50 text-white hover:bg-black/70',
                'transition-all duration-200 ease-out',
                'hover:scale-110',
              )}
              data-slot={'feature-card-lightbox-next'}
              onClick={handleNext}
              size={'icon'}
              variant={'ghost'}
            >
              <ChevronRightIcon aria-hidden className={'size-6'} />
            </Button>
          </Conditional>

          {/* Dot Indicators */}
          <Conditional isCondition={_hasMultiplePhotos}>
            <div
              aria-label={'Photo navigation'}
              className={cn(
                'absolute bottom-4 left-1/2 -translate-x-1/2',
                'flex items-center gap-2 rounded-full',
                'bg-black/50 px-3 py-2',
              )}
              data-slot={'feature-card-lightbox-dots'}
              role={'tablist'}
            >
              {photos.map((_, index) => {
                const _isActive = index === currentIndex;

                return (
                  <button
                    aria-label={`Go to photo ${index + 1}`}
                    aria-selected={_isActive}
                    className={cn(
                      'size-2 cursor-pointer rounded-full',
                      'transition-all duration-200 ease-out',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                      _isActive ? 'scale-125 bg-white' : 'bg-white/40 hover:bg-white/60',
                    )}
                    data-active={_isActive || undefined}
                    data-slot={'feature-card-lightbox-dot'}
                    key={index}
                    onClick={() => handleDotClick(index)}
                    onKeyDown={(e) => handleDotKeyDown(e, index)}
                    role={'tab'}
                    tabIndex={_isActive ? 0 : -1}
                    type={'button'}
                  />
                );
              })}
            </div>
          </Conditional>
        </div>
      </DialogContent>
    </Dialog>
  );
};
