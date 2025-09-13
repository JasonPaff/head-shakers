'use client';

import type { KeyboardEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon, HeartIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToggle } from '@/hooks/use-toggle';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadFeatureCardProps {
  bobblehead: BobbleheadWithRelations;
}

export const BobbleheadFeatureCard = ({ bobblehead }: BobbleheadFeatureCardProps) => {
  const primaryPhotoIndex =
    bobblehead.photos.findIndex((photo) => photo.isPrimary) !== -1 ?
      bobblehead.photos.findIndex((photo) => photo.isPrimary)
    : 0;

  const [isHoveringImage, setIsHoveringImage] = useState(false);
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useToggle();
  const [mainPhotoIndex, setMainPhotoIndex] = useState(primaryPhotoIndex);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(primaryPhotoIndex);

  const _currentMainPhoto = bobblehead.photos[mainPhotoIndex] || bobblehead.photos[0];
  const _currentModalPhoto = bobblehead.photos[modalPhotoIndex] || bobblehead.photos[0];
  const _hasMoreThanThreeTags = bobblehead.tags.length > 3;
  const _topThreeTags = bobblehead.tags.slice(0, 3);
  const _hasMultiplePhotos = bobblehead.photos.length > 1;

  const handlePreviousMainPhoto = () => {
    setMainPhotoIndex((prev) => {
      return prev > 0 ? prev - 1 : bobblehead.photos.length - 1;
    });
  };

  const handleNextMainPhoto = () => {
    setMainPhotoIndex((prev) => {
      return prev < bobblehead.photos.length - 1 ? prev + 1 : 0;
    });
  };

  const handlePreviousModalPhoto = () => {
    setModalPhotoIndex((prev) => {
      return prev > 0 ? prev - 1 : bobblehead.photos.length - 1;
    });
  };

  const handleNextModalPhoto = () => {
    setModalPhotoIndex((prev) => {
      return prev < bobblehead.photos.length - 1 ? prev + 1 : 0;
    });
  };

  const handleImageClick = () => {
    // set modal index to current main image when opening
    setModalPhotoIndex(mainPhotoIndex);
    setIsPhotoDialogOpen.on();
  };

  const handleModalKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') handlePreviousModalPhoto();
    else if (event.key === 'ArrowRight') handleNextModalPhoto();
    else if (event.key === 'Escape') setIsPhotoDialogOpen.off();
  };

  return (
    <Card className={'overflow-hidden'}>
      <div className={'grid grid-cols-1 lg:grid-cols-2'}>
        {/* Image Section */}
        <div
          className={'relative aspect-[3/4] cursor-pointer lg:aspect-square'}
          onClick={handleImageClick}
          onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
          role={'button'}
          tabIndex={0}
        >
          {/* Featured Image */}
          <img
            alt={_currentMainPhoto?.altText ?? bobblehead.name}
            className={'size-full object-cover'}
            src={_currentMainPhoto?.url || '/placeholder.svg'}
          />

          {/* Navigation Arrows  */}
          <Conditional isCondition={_hasMultiplePhotos && isHoveringImage}>
            <Button
              className={cn(
                'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                'bg-black/50 text-white hover:bg-black/70',
                'transition-opacity duration-200',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handlePreviousMainPhoto();
              }}
              size={'icon'}
              variant={'ghost'}
            >
              <ChevronLeftIcon aria-hidden className={'size-6'} />
              <span className={'sr-only'}>Previous photo</span>
            </Button>

            <Button
              className={cn(
                'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                'bg-black/50 text-white hover:bg-black/70',
                'transition-opacity duration-200',
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleNextMainPhoto();
              }}
              size={'icon'}
              variant={'ghost'}
            >
              <ChevronRightIcon aria-hidden className={'size-6'} />
              <span className={'sr-only'}>Next photo</span>
            </Button>
          </Conditional>

          {/* Photo Counter */}
          <Conditional isCondition={_hasMultiplePhotos && isHoveringImage}>
            <div
              className={cn(
                'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
                'bg-black/50 px-3 py-1 text-sm text-white',
                'transition-opacity duration-200',
              )}
            >
              {mainPhotoIndex + 1} of {bobblehead.photos.length}
            </div>
          </Conditional>

          {/* Featured Badge */}
          <Conditional isCondition={bobblehead.isFeatured}>
            <Badge className={'absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg'}>
              Featured
            </Badge>
          </Conditional>

          {/* Condition Badge */}
          <Conditional isCondition={!!bobblehead.currentCondition}>
            <Badge
              className={'absolute top-4 right-4 shadow-lg'}
              variant={
                bobblehead.currentCondition?.toLowerCase().includes('mint') ? 'default'
                : bobblehead.currentCondition?.toLowerCase().includes('good') ?
                  'secondary'
                : 'outline'
              }
            >
              {bobblehead.currentCondition}
            </Badge>
          </Conditional>
        </div>

        {/* Details Section */}
        <div className={'flex flex-col justify-between p-8'}>
          <div>
            <div className={'mb-4 space-y-1'}>
              {/* Character */}
              <Conditional isCondition={!!bobblehead.characterName}>
                <p className={'text-lg font-medium text-primary'}>{bobblehead.characterName}</p>
              </Conditional>
              {/* Series */}
              <Conditional isCondition={!!bobblehead.series}>
                <p className={'text-sm text-muted-foreground'}>{bobblehead.series}</p>
              </Conditional>
            </div>

            {/* Tags */}
            <div className={'mb-6 flex flex-wrap gap-2'}>
              {_topThreeTags.map((tag) => (
                <Badge key={tag.id} variant={'outline'}>
                  {tag.name}
                </Badge>
              ))}
              <Conditional isCondition={_hasMoreThanThreeTags}>
                <Badge variant={'outline'}>+{bobblehead.tags.length - 3} more</Badge>
              </Conditional>
            </div>

            {/* Key Details */}
            <div className={'space-y-3 border-t pt-6'}>
              {/* Manufacturer */}
              <div className={'flex justify-between'}>
                <span className={'text-sm text-muted-foreground'}>Manufacturer</span>
                <span className={'text-sm font-medium'}>{bobblehead.manufacturer || 'Unknown'}</span>
              </div>

              {/* Year */}
              <div className={'flex justify-between'}>
                <span className={'text-sm text-muted-foreground'}>Year</span>
                <span className={'text-sm font-medium'}>{bobblehead.year || 'Unknown'}</span>
              </div>

              {/* Category */}
              <Conditional isCondition={!!bobblehead.category}>
                <div className={'flex justify-between'}>
                  <span className={'text-sm text-muted-foreground'}>Category</span>
                  <span className={'text-sm font-medium'}>{bobblehead.category}</span>
                </div>
              </Conditional>
            </div>
          </div>

          {/* Like Button */}
          <div className={'mt-6'}>
            <Button className={'w-full'} size={'lg'}>
              <HeartIcon aria-hidden className={'mr-2 size-4'} />
              Like ({bobblehead.likeCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      <Dialog onOpenChange={setIsPhotoDialogOpen.update} open={isPhotoDialogOpen}>
        <DialogContent className={'max-w-6xl p-0'} isShowCloseButton={false} onKeyDown={handleModalKeyDown}>
          <div className={'relative flex items-center justify-center bg-black'}>
            {/* Close button */}
            <Button
              className={'absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70'}
              onClick={setIsPhotoDialogOpen.off}
              size={'icon'}
              variant={'ghost'}
            >
              <XIcon aria-hidden className={'size-4'} />
              <span className={'sr-only'}>Close</span>
            </Button>

            {/* Previous button */}
            <Conditional isCondition={_hasMultiplePhotos}>
              <Button
                className={cn(
                  'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                )}
                onClick={handlePreviousModalPhoto}
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
                alt={_currentModalPhoto?.altText ?? bobblehead.name}
                className={'max-h-full max-w-full object-contain'}
                src={_currentModalPhoto?.url || '/placeholder.svg'}
              />
            </div>

            {/* Next button */}
            <Conditional isCondition={_hasMultiplePhotos}>
              <Button
                className={cn(
                  'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                  'bg-black/50 text-white hover:bg-black/70',
                )}
                onClick={handleNextModalPhoto}
                size={'icon'}
                variant={'ghost'}
              >
                <ChevronRightIcon aria-hidden className={'size-6'} />
                <span className={'sr-only'}>Next photo</span>
              </Button>
            </Conditional>

            {/* Photo counter */}
            <Conditional isCondition={_hasMultiplePhotos}>
              <div
                className={cn(
                  'absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full',
                  'bg-black/50 px-3 py-1 text-sm text-white',
                )}
              >
                {modalPhotoIndex + 1} of {bobblehead.photos.length}
              </div>
            </Conditional>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
