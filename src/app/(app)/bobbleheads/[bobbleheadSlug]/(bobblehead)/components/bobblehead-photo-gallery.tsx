'use client';

import type { KeyboardEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useState } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadPhotoGalleryCardProps {
  bobblehead: BobbleheadWithRelations;
}

const STAGGER_DELAY_MS = 50;

export const BobbleheadPhotoGalleryCard = ({ bobblehead }: BobbleheadPhotoGalleryCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useToggle();
  const [isPressing, setIsPressing] = useState<null | number>(null);

  const galleryTestId = generateTestId('feature', 'bobblehead-gallery');

  const handlePhotoClick = useCallback(
    (index: number) => {
      setCurrentPhotoIndex(index);
      setIsModalOpen.on();
    },
    [setIsModalOpen],
  );

  const handlePreviousPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => {
      return prev > 0 ? prev - 1 : bobblehead.photos.length - 1;
    });
  }, [bobblehead.photos.length]);

  const handleNextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => {
      return prev < bobblehead.photos.length - 1 ? prev + 1 : 0;
    });
  }, [bobblehead.photos.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePreviousPhoto();
      else if (event.key === 'ArrowRight') handleNextPhoto();
      else if (event.key === 'Escape') setIsModalOpen.off();
    },
    [handleNextPhoto, handlePreviousPhoto, setIsModalOpen],
  );

  const handleMouseDown = useCallback((index: number) => {
    setIsPressing(index);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressing(null);
  }, []);

  const handleTouchStart = useCallback((index: number) => {
    setIsPressing(index);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressing(null);
  }, []);

  const _currentPhoto = bobblehead.photos[currentPhotoIndex];
  const _altText = _currentPhoto?.altText ?? `${bobblehead.name} photo ${currentPhotoIndex + 1}`;
  const _hasValidCurrentPhoto = _currentPhoto?.url && _currentPhoto.url !== '/placeholder.svg';

  return (
    <Conditional isCondition={bobblehead.photos.length !== 0}>
      {/* Photo Gallery Card */}
      <Card data-slot={'bobblehead-photo-gallery-card'} data-testid={galleryTestId}>
        <CardHeader data-slot={'bobblehead-photo-gallery-header'}>
          <CardTitle>Photo Gallery ({bobblehead.photos.length})</CardTitle>
        </CardHeader>
        <CardContent data-slot={'bobblehead-photo-gallery-content'}>
          {/* Photo Grid */}
          <div
            className={'grid grid-cols-2 gap-4 md:grid-cols-4'}
            data-slot={'bobblehead-photo-gallery-grid'}
            data-testid={`${galleryTestId}-grid`}
          >
            {bobblehead.photos.map((photo, index) => {
              const altText = photo.altText ?? `${bobblehead.name} photo ${index + 1}`;
              const _hasValidPhoto = photo.url && photo.url !== '/placeholder.svg';
              const publicId = _hasValidPhoto ? extractPublicIdFromCloudinaryUrl(photo.url) : '';
              const blurDataUrl = _hasValidPhoto ? generateBlurDataUrl(publicId) : '';
              const _isCurrentlyPressing = isPressing === index;

              return (
                <button
                  aria-label={`View ${altText} in lightbox`}
                  className={cn(
                    'group relative aspect-square cursor-pointer overflow-hidden',
                    'rounded-lg bg-muted shadow-sm',
                    'animate-carousel-fade-in',
                    'transition-all duration-200 ease-out',
                    'hover:shadow-lg hover:ring-2 hover:ring-primary/20',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                    _isCurrentlyPressing && 'scale-95',
                  )}
                  data-slot={'bobblehead-photo-gallery-item'}
                  data-testid={`${galleryTestId}-item-${index}`}
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  onMouseDown={() => handleMouseDown(index)}
                  onMouseLeave={handleMouseUp}
                  onMouseUp={handleMouseUp}
                  onTouchEnd={handleTouchEnd}
                  onTouchStart={() => handleTouchStart(index)}
                  style={{ animationDelay: `${index * STAGGER_DELAY_MS}ms` }}
                  type={'button'}
                >
                  {/* Photo Image */}
                  {_hasValidPhoto ?
                    <CldImage
                      alt={altText}
                      blurDataURL={blurDataUrl || undefined}
                      className={cn(
                        'size-full object-cover',
                        'transition-transform duration-300 ease-out',
                        'group-hover:scale-110',
                        _isCurrentlyPressing && 'scale-105',
                      )}
                      crop={'fill'}
                      data-slot={'bobblehead-photo-gallery-image'}
                      format={'auto'}
                      height={400}
                      placeholder={blurDataUrl ? 'blur' : undefined}
                      quality={'auto:good'}
                      src={publicId}
                      width={400}
                    />
                  : <img
                      alt={altText}
                      className={'size-full object-cover'}
                      data-slot={'bobblehead-photo-gallery-placeholder'}
                      src={'/placeholder.svg'}
                    />
                  }

                  {/* Hover Overlay */}
                  <div
                    className={cn(
                      'absolute inset-0 bg-black/0',
                      'transition-colors duration-200 ease-out',
                      'group-hover:bg-black/20',
                      _isCurrentlyPressing && 'bg-black/30',
                    )}
                    data-slot={'bobblehead-photo-gallery-overlay'}
                  />

                  {/* View Indicator */}
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center',
                      'opacity-0 transition-opacity duration-200 ease-out',
                      'group-hover:opacity-100',
                    )}
                    data-slot={'bobblehead-photo-gallery-view-indicator'}
                  >
                    <span
                      className={cn(
                        'rounded-full bg-white/90 px-3 py-1.5',
                        'text-xs font-medium text-gray-900',
                        'shadow-lg backdrop-blur-sm',
                      )}
                    >
                      View
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Modal */}
      <Dialog onOpenChange={setIsModalOpen.update} open={isModalOpen}>
        <DialogContent
          className={cn('max-w-6xl p-0', 'data-[state=open]:animate-carousel-scale-in')}
          data-slot={'bobblehead-photo-gallery-modal'}
          data-testid={`${galleryTestId}-modal`}
          isShowCloseButton={false}
          onKeyDown={handleKeyDown}
        >
          <DialogTitle className={'sr-only'}>{_altText}</DialogTitle>
          <div
            className={'relative flex items-center justify-center bg-black'}
            data-slot={'bobblehead-photo-gallery-modal-container'}
          >
            {/* Close Button */}
            <Button
              aria-label={'Close lightbox'}
              className={cn(
                'absolute top-4 right-4 z-10',
                'bg-black/50 text-white hover:bg-black/70',
                'transition-all duration-200 ease-out',
                'hover:scale-110',
              )}
              data-slot={'bobblehead-photo-gallery-modal-close'}
              onClick={setIsModalOpen.off}
              size={'icon'}
              variant={'ghost'}
            >
              <XIcon aria-hidden className={'size-4'} />
              <span className={'sr-only'}>Close</span>
            </Button>

            {/* Previous Button */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <Button
                aria-label={'Previous photo'}
                className={cn(
                  'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                  'transition-all duration-200 ease-out',
                  'hover:scale-110',
                )}
                data-slot={'bobblehead-photo-gallery-modal-previous'}
                onClick={handlePreviousPhoto}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronLeftIcon aria-hidden className={'size-6'} />
                <span className={'sr-only'}>Previous photo</span>
              </Button>
            </Conditional>

            {/* Main Image */}
            <div
              className={cn(
                'flex max-h-[80vh] w-full items-center justify-center',
                'transition-opacity duration-300 ease-out',
              )}
              data-slot={'bobblehead-photo-gallery-modal-image-container'}
            >
              {_hasValidCurrentPhoto ?
                <CldImage
                  alt={_altText}
                  className={cn(
                    'max-h-full max-w-full object-contain',
                    'transition-transform duration-300 ease-out',
                  )}
                  crop={'pad'}
                  data-slot={'bobblehead-photo-gallery-modal-image'}
                  format={'auto'}
                  height={1200}
                  quality={'auto:best'}
                  src={extractPublicIdFromCloudinaryUrl(_currentPhoto.url)}
                  width={1200}
                />
              : <img
                  alt={_altText}
                  className={'max-h-full max-w-full object-contain'}
                  data-slot={'bobblehead-photo-gallery-modal-placeholder'}
                  src={'/placeholder.svg'}
                />
              }
            </div>

            {/* Next Button */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <Button
                aria-label={'Next photo'}
                className={cn(
                  'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                  'transition-all duration-200 ease-out',
                  'hover:scale-110',
                )}
                data-slot={'bobblehead-photo-gallery-modal-next'}
                onClick={handleNextPhoto}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronRightIcon aria-hidden className={'size-6'} />
                <span className={'sr-only'}>Next photo</span>
              </Button>
            </Conditional>

            {/* Photo Counter */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <div
                className={cn(
                  'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
                  'bg-black/50 px-3 py-1 text-sm text-white',
                )}
                data-slot={'bobblehead-photo-gallery-modal-counter'}
              >
                {currentPhotoIndex + 1} of {bobblehead.photos.length}
              </div>
            </Conditional>
          </div>
        </DialogContent>
      </Dialog>
    </Conditional>
  );
};
