'use client';

import type { KeyboardEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import type { BobbleheadWithCollections } from '@/lib/queries/bobbleheads/bobbleheads-facade';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadPhotoGalleryCardProps {
  bobblehead: BobbleheadWithCollections;
}

export const BobbleheadPhotoGalleryCard = ({ bobblehead }: BobbleheadPhotoGalleryCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useToggle();

  const handlePhotoClick = (index: number) => {
    setCurrentPhotoIndex(index);
    setIsModalOpen.on();
  };

  const handlePreviousPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      return prev > 0 ? prev - 1 : bobblehead.photos.length - 1;
    });
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) => {
      return prev < bobblehead.photos.length - 1 ? prev + 1 : 0;
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') handlePreviousPhoto();
    else if (event.key === 'ArrowRight') handleNextPhoto();
    else if (event.key === 'Escape') setIsModalOpen.off();
  };

  const _currentPhoto = bobblehead.photos[currentPhotoIndex];
  const _altText = _currentPhoto?.altText ?? `${bobblehead.name} photo ${currentPhotoIndex + 1}`;

  return (
    <Conditional isCondition={bobblehead.photos.length !== 0}>
      <Card>
        <CardHeader>
          <CardTitle>Photo Gallery ({bobblehead.photos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={'grid grid-cols-2 gap-4 md:grid-cols-4'}>
            {bobblehead.photos.map((photo, index) => {
              const altText = photo.altText ?? `${bobblehead.name} photo ${index + 1}`;
              return (
                <div
                  className={cn(
                    'group relative aspect-square cursor-pointer overflow-hidden',
                    'rounded-lg bg-muted transition-all hover:opacity-90 hover:shadow-md',
                  )}
                  key={photo.id}
                  onClick={() => handlePhotoClick(index)}
                  onKeyDown={(e) => e.key === 'Enter' && handlePhotoClick(index)}
                  role={'button'}
                  tabIndex={0}
                >
                  <img
                    alt={altText}
                    className={'size-full object-cover transition-transform group-hover:scale-105'}
                    src={photo.url || '/placeholder.svg'}
                  />
                  <div className={'absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10'} />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog onOpenChange={setIsModalOpen.update} open={isModalOpen}>
        <DialogContent className={'max-w-6xl p-0'} isShowCloseButton={false} onKeyDown={handleKeyDown}>
          <div className={'relative flex items-center justify-center bg-black'}>
            {/* Close button */}
            <Button
              className={'absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70'}
              onClick={setIsModalOpen.off}
              size={'icon'}
              variant={'ghost'}
            >
              <XIcon aria-hidden className={'size-4'} />
              <span className={'sr-only'}>Close</span>
            </Button>

            {/* Previous button */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <Button
                className={cn(
                  'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                )}
                onClick={handlePreviousPhoto}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronLeftIcon aria-hidden className={'size-6'} />
                <span className={'sr-only'}>Previous photo</span>
              </Button>
            </Conditional>

            {/* Main image */}
            <div className={'flex max-h-[80vh] w-full items-center justify-center'}>
              <img
                alt={_altText}
                className={'max-h-full max-w-full object-contain'}
                src={_currentPhoto?.url || '/placeholder.svg'}
              />
            </div>

            {/* Next button */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <Button
                className={cn(
                  'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                )}
                onClick={handleNextPhoto}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronRightIcon aria-hidden className={'size-6'} />
                <span className={'sr-only'}>Next photo</span>
              </Button>
            </Conditional>

            {/* Photo counter */}
            <Conditional isCondition={bobblehead.photos.length > 1}>
              <div
                className={cn(
                  'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
                  'bg-black/50 px-3 py-1 text-sm text-white',
                )}
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
