'use client';

import { useMemo, useState } from 'react';

import type { ContentLikeData } from '@/lib/facades/social/social.facade';
import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Separator } from '@/components/ui/separator';
import { useToggle } from '@/hooks/use-toggle';

import { FeatureCardAcquisition } from './feature-card/feature-card-acquisition';
import { FeatureCardCustomFields } from './feature-card/feature-card-custom-fields';
import { FeatureCardDescription } from './feature-card/feature-card-description';
import { FeatureCardImageGallery } from './feature-card/feature-card-image-gallery';
import { FeatureCardLightboxModal } from './feature-card/feature-card-lightbox-modal';
import { FeatureCardPrimaryImage } from './feature-card/feature-card-primary-image';
import { FeatureCardQuickInfo } from './feature-card/feature-card-quick-info';
import { FeatureCardSocialBar } from './feature-card/feature-card-social-bar';
import { FeatureCardSpecifications } from './feature-card/feature-card-specifications';
import { FeatureCardStatus } from './feature-card/feature-card-status';

const getPrimaryPhotoIndex = (photos: BobbleheadWithRelations['photos']) => {
  const primaryIndex = photos.findIndex((photo) => photo.isPrimary);
  return primaryIndex !== -1 ? primaryIndex : 0;
};

type BobbleheadFeatureCardProps = {
  bobblehead: BobbleheadWithRelations;
  collectionSlug: string;
  isOwner?: boolean;
  likeData: ContentLikeData;
  ownerUsername: string;
};

export const BobbleheadFeatureCard = ({
  bobblehead,
  collectionSlug,
  isOwner = false,
  likeData,
  ownerUsername,
}: BobbleheadFeatureCardProps) => {
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

  const handleImageClick = () => {
    setModalPhotoIndex(mainPhotoIndex);
    setIsPhotoDialogOpen.on();
  };

  const handleGallerySelect = (index: number) => {
    setMainPhotoIndex(index);
  };

  const handleModalIndexChange = (index: number) => {
    setModalPhotoIndex(index);
  };

  const handleModalClose = () => {
    setIsPhotoDialogOpen.off();
  };

  const _hasMultiplePhotos = bobblehead.photos.length > 1;

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
            <FeatureCardSocialBar
              bobbleheadId={bobblehead.id}
              bobbleheadSlug={bobblehead.slug}
              collectionSlug={collectionSlug}
              commentCount={bobblehead.commentCount}
              isOwner={isOwner}
              likeData={likeData}
              ownerUsername={ownerUsername}
            />

            <Separator />

            {/* Collapsible Sections */}
            <div className={'flex-1 space-y-4 overflow-y-auto'}>
              <FeatureCardDescription bobblehead={bobblehead} />
              <FeatureCardSpecifications bobblehead={bobblehead} />
              <FeatureCardAcquisition bobblehead={bobblehead} />
              <FeatureCardStatus bobblehead={bobblehead} />
              <FeatureCardCustomFields bobblehead={bobblehead} />
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
        <FeatureCardSocialBar
          bobbleheadId={bobblehead.id}
          bobbleheadSlug={bobblehead.slug}
          collectionSlug={collectionSlug}
          commentCount={bobblehead.commentCount}
          isOwner={isOwner}
          likeData={likeData}
          ownerUsername={ownerUsername}
        />

        <Separator />

        {/* Collapsible Sections */}
        <FeatureCardDescription bobblehead={bobblehead} />
        <FeatureCardSpecifications bobblehead={bobblehead} />
        <FeatureCardAcquisition bobblehead={bobblehead} />
        <FeatureCardStatus bobblehead={bobblehead} />
        <FeatureCardCustomFields bobblehead={bobblehead} />
      </div>

      {/* Image Lightbox Modal */}
      <FeatureCardLightboxModal
        bobbleheadName={bobblehead.name}
        currentIndex={modalPhotoIndex}
        isOpen={isPhotoDialogOpen}
        onClose={handleModalClose}
        onIndexChange={handleModalIndexChange}
        photos={_photos}
      />
    </Card>
  );
};
