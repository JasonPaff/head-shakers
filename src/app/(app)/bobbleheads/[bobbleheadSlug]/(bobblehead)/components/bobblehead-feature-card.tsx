'use client';

import type { KeyboardEvent } from 'react';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { useMemo, useState } from 'react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useToggle } from '@/hooks/use-toggle';
import { extractPublicIdFromCloudinaryUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

import { FeatureCardAcquisition } from './feature-card/feature-card-acquisition';
import { FeatureCardImageGallery } from './feature-card/feature-card-image-gallery';
import { FeatureCardPrimaryImage } from './feature-card/feature-card-primary-image';
import { FeatureCardQuickInfo } from './feature-card/feature-card-quick-info';
import { FeatureCardSocialBar } from './feature-card/feature-card-social-bar';
import { FeatureCardSpecifications } from './feature-card/feature-card-specifications';

const getPrimaryPhotoIndex = (photos: BobbleheadWithRelations['photos']) => {
  const primaryIndex = photos.findIndex((photo) => photo.isPrimary);
  return primaryIndex !== -1 ? primaryIndex : 0;
};

type BobbleheadFeatureCardProps = {
  bobblehead: BobbleheadWithRelations;
  likeData: ContentLikeData;
};

export const BobbleheadFeatureCard = ({ bobblehead, likeData }: BobbleheadFeatureCardProps) => {
  const [isPhotoDialogOpen, setIsPhotoDialogOpen] = useToggle();
  const [mainPhotoIndex, setMainPhotoIndex] = useState(getPrimaryPhotoIndex(bobblehead.photos));
  const [modalPhotoIndex, setModalPhotoIndex] = useState(getPrimaryPhotoIndex(bobblehead.photos));

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
    setModalPhotoIndex(mainPhotoIndex);
    setIsPhotoDialogOpen.on();
  };

  const handleGallerySelect = (index: number) => {
    setMainPhotoIndex(index);
  };

  const handleModalKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft') handlePreviousModalPhoto();
    else if (event.key === 'ArrowRight') handleNextModalPhoto();
  };

  const _currentModalPhoto = bobblehead.photos[modalPhotoIndex] || bobblehead.photos[0];
  const _hasMultiplePhotos = bobblehead.photos.length > 1;
  const _hasModalImage = _currentModalPhoto?.url && _currentModalPhoto.url !== '/placeholder.jpg';

  const _photos = useMemo(
    () =>
      bobblehead.photos.map((photo) => ({
        altText: photo.altText ?? undefined,
        url: photo.url,
      })),
    [bobblehead.photos],
  );

  return (
    <Card className={'overflow-hidden'} data-slot={'bobblehead-feature-card'}>
      {/* Two-column layout on desktop, single column on mobile */}
      <div className={'flex flex-col lg:flex-row'}>
        {/* Left Column: Image Section */}
        <div className={'lg:w-[55%] xl:w-[50%]'}>
          {/* Primary Image Section - constrained height on desktop */}
          <FeatureCardPrimaryImage
            bobbleheadName={bobblehead.name}
            className={'lg:aspect-[4/5] xl:aspect-[3/4]'}
            currentCondition={bobblehead.currentCondition}
            currentIndex={mainPhotoIndex}
            isFeatured={bobblehead.isFeatured}
            onClick={handleImageClick}
            onNext={handleNextMainPhoto}
            onPrevious={handlePreviousMainPhoto}
            photos={_photos}
          />

          {/* Thumbnail Gallery - below image on both layouts */}
          <Conditional isCondition={_hasMultiplePhotos}>
            <FeatureCardImageGallery
              className={'p-4'}
              currentIndex={mainPhotoIndex}
              onImageSelect={handleGallerySelect}
              photos={_photos}
            />
          </Conditional>
        </div>

        {/* Right Column: Info Sidebar (desktop only) */}
        <div
          className={'hidden border-l border-border lg:flex lg:w-[45%] lg:flex-col xl:w-[50%]'}
          data-slot={'bobblehead-feature-card-sidebar'}
        >
          <div className={'flex flex-1 flex-col space-y-6 p-6'}>
            {/* Quick Info */}
            <FeatureCardQuickInfo bobblehead={bobblehead} />

            <Separator />

            {/* Social Actions */}
            <FeatureCardSocialBar bobbleheadId={bobblehead.id} likeData={likeData} />

            <Separator />

            {/* Collapsible Sections */}
            <div className={'flex-1 space-y-4 overflow-y-auto'}>
              <FeatureCardSpecifications bobblehead={bobblehead} />
              <FeatureCardAcquisition bobblehead={bobblehead} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Content Section (hidden on desktop) */}
      <div className={'space-y-6 p-4 lg:hidden'} data-slot={'bobblehead-feature-card-content'}>
        {/* Quick Info */}
        <FeatureCardQuickInfo bobblehead={bobblehead} />

        <Separator />

        {/* Social Actions */}
        <FeatureCardSocialBar bobbleheadId={bobblehead.id} likeData={likeData} />

        <Separator />

        {/* Collapsible Sections */}
        <FeatureCardSpecifications bobblehead={bobblehead} />
        <FeatureCardAcquisition bobblehead={bobblehead} />
      </div>

      {/* Image Modal */}
      <Dialog onOpenChange={setIsPhotoDialogOpen.update} open={isPhotoDialogOpen}>
        <DialogContent className={'max-w-6xl p-0'} onKeyDown={handleModalKeyDown}>
          <DialogHeader className={'p-4'}>
            <DialogTitle>{bobblehead.name} Photos</DialogTitle>
            <DialogDescription>View full-size photos of this bobblehead</DialogDescription>
          </DialogHeader>
          <div className={'flex items-center justify-center bg-black'}>
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
              {_hasModalImage ?
                <CldImage
                  alt={_currentModalPhoto?.altText ?? bobblehead.name}
                  className={'max-h-full max-w-full object-contain'}
                  crop={'pad'}
                  format={'auto'}
                  height={1200}
                  quality={'auto:best'}
                  src={extractPublicIdFromCloudinaryUrl(_currentModalPhoto.url)}
                  width={1200}
                />
              : <img
                  alt={bobblehead.name}
                  className={'max-h-full max-w-full object-contain'}
                  src={'/placeholder.jpg'}
                />
              }
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
