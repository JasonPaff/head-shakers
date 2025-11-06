'use client';

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useCallback, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadPhotoGalleryModalProps {
  bobbleheadName: null | string;
  currentPhotoIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onPhotoChange: (index: number) => void;
  photos: Array<Photo>;
}

interface Photo {
  altText: null | string;
  url: string;
}

export const BobbleheadPhotoGalleryModal = ({
  bobbleheadName,
  currentPhotoIndex,
  isOpen,
  onClose,
  onPhotoChange,
  photos,
}: BobbleheadPhotoGalleryModalProps) => {
  const hasMultiplePhotos = photos.length > 1;
  const currentPhoto = photos[currentPhotoIndex];

  const handlePrevious = useCallback(() => {
    onPhotoChange(currentPhotoIndex > 0 ? currentPhotoIndex - 1 : photos.length - 1);
  }, [currentPhotoIndex, photos.length, onPhotoChange]);

  const handleNext = useCallback(() => {
    onPhotoChange(currentPhotoIndex < photos.length - 1 ? currentPhotoIndex + 1 : 0);
  }, [currentPhotoIndex, photos.length, onPhotoChange]);

  // keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          handlePrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          handleNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevious, handleNext, onClose]);

  if (!currentPhoto) return null;

  const _hasPhoto = currentPhoto.url && currentPhoto.url !== '/placeholder.jpg';

  return (
    <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
      <DialogContent className={'h-[80vh] max-w-4xl border-0 bg-black p-0'} isShowCloseButton={false}>
        <div className={'relative flex h-full flex-col'}>
          {/* Header */}
          <div
            className={'absolute top-0 right-0 left-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4'}
          >
            <div className={'flex items-center justify-between text-white'}>
              <h2 className={'truncate text-lg font-semibold'}>{bobbleheadName || 'Bobblehead Photos'}</h2>
              <Button
                className={'text-white hover:bg-white/20'}
                onClick={onClose}
                size={'icon'}
                variant={'ghost'}
              >
                <XIcon aria-hidden className={'size-5'} />
              </Button>
            </div>
          </div>

          {/* Main photo area */}
          <div className={'relative flex flex-1 items-center justify-center bg-black'}>
            {_hasPhoto ?
              <CldImage
                alt={currentPhoto.altText || bobbleheadName || 'Bobblehead photo'}
                className={'max-h-full max-w-full object-contain'}
                crop={'pad'}
                format={'auto'}
                height={1200}
                quality={'auto:best'}
                src={extractPublicIdFromCloudinaryUrl(currentPhoto.url)}
                width={1200}
              />
            : <img
                alt={bobbleheadName || 'Bobblehead photo'}
                className={'max-h-full max-w-full object-contain'}
                src={'/placeholder.jpg'}
              />
            }

            {/* Navigation arrows */}
            <Conditional isCondition={hasMultiplePhotos}>
              <Button
                className={
                  'absolute top-1/2 left-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70'
                }
                onClick={handlePrevious}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronLeftIcon aria-hidden className={'size-6'} />
              </Button>

              <Button
                className={
                  'absolute top-1/2 right-4 -translate-y-1/2 bg-black/50 text-white hover:bg-black/70'
                }
                onClick={handleNext}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronRightIcon aria-hidden className={'size-6'} />
              </Button>
            </Conditional>
          </div>

          {/* Footer with photo indicators */}
          <Conditional isCondition={hasMultiplePhotos}>
            <div
              className={'absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/50 to-transparent p-4'}
            >
              <div className={'flex items-center justify-center gap-2'}>
                {photos.map((_, index) => (
                  <button
                    className={cn(
                      'size-2 rounded-full bg-white/50 transition-all hover:bg-white/80',
                      index === currentPhotoIndex && 'scale-125 bg-white',
                    )}
                    key={index}
                    onClick={() => {
                      onPhotoChange(index);
                    }}
                    title={`Photo ${index + 1} of ${photos.length}`}
                  />
                ))}
              </div>
              <div className={'mt-2 text-center text-sm text-white/80'}>
                {currentPhotoIndex + 1} of {photos.length}
              </div>
            </div>
          </Conditional>
        </div>
      </DialogContent>
    </Dialog>
  );
};
