'use client';

import type { KeyboardEvent, MouseEvent, TouchEvent } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ChevronLeftIcon, ChevronRightIcon, MoreVerticalIcon, ShareIcon, TrashIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';
import type { SelectBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

import { BobbleheadDeleteDialog } from '@/components/feature/bobblehead/bobblehead-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LikeCompactButton } from '@/components/ui/like-button';
import { Spinner } from '@/components/ui/spinner';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { getBobbleheadPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadPhotoGalleryModal } from './bobblehead-photo-gallery-modal';
import { BobbleheadShareMenu } from './bobblehead-share-menu';

interface BobbleheadGalleryCardProps extends ComponentTestIdProps {
  bobblehead: {
    collectionId: string;
    collectionSlug: null | string;
    description?: null | string;
    featurePhoto?: null | string;
    id: string;
    likeData?: {
      isLiked: boolean;
      likeCount: number;
      likeId: null | string;
    };
    name: null | string;
    slug: string;
  };
  isOwner: boolean;
  navigationContext?: {
    collectionId?: string;
  };
}

export const BobbleheadGalleryCard = ({
  bobblehead,
  isOwner,
  navigationContext,
  testId,
}: BobbleheadGalleryCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'bobblehead-card');
  const photoAreaTestId = generateTestId('feature', 'bobblehead-photo', 'clickable');
  const prevButtonTestId = generateTestId('feature', 'bobblehead-nav', 'prev');
  const nextButtonTestId = generateTestId('feature', 'bobblehead-nav', 'next');
  const likeButtonTestId = generateTestId('feature', 'like-button', 'bobblehead');
  const shareButtonTestId = generateTestId('feature', 'share-button', 'bobblehead');
  const viewDetailsButtonTestId = generateTestId('feature', 'view-details-button', 'bobblehead');
  const actionMenuTestId = generateTestId('feature', 'action-menu', 'bobblehead');

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImageUrls, setLoadedImageUrls] = useState<Set<string>>(
    () => new Set(bobblehead.featurePhoto ? [bobblehead.featurePhoto] : []),
  );
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [hasLoadedPhotos, setHasLoadedPhotos] = useToggle();
  const [isShowPhotoControls, setIsShowPhotoControls] = useToggle();
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();

  // Touch swipe refs
  const touchStartXRef = useRef<number>(0);
  const isTouchMoveRef = useRef<boolean>(false);

  const {
    execute: fetchPhotos,
    isExecuting: isLoadingPhotos,
    result: photosResult,
  } = useServerAction(getBobbleheadPhotosAction, { isDisableToast: true });

  const photos = useMemo(() => {
    const allPhotos =
      (photosResult.data?.data as Array<SelectBobbleheadPhoto> | undefined)?.map((photo) => ({
        altText: photo.altText,
        url: photo.url,
      })) ?? [];

    // if we have photos and a featured photo, reorder to put the featured photo first
    if (allPhotos.length > 0 && bobblehead.featurePhoto) {
      const featuredPhotoIndex = allPhotos.findIndex((photo) => photo.url === bobblehead.featurePhoto);
      if (featuredPhotoIndex > 0) {
        const featuredPhoto = allPhotos[featuredPhotoIndex];
        const otherPhotos = allPhotos.filter((_, index) => index !== featuredPhotoIndex);
        return [featuredPhoto, ...otherPhotos];
      }
    }

    return allPhotos;
  }, [photosResult, bobblehead.featurePhoto]);

  const handleMouseEnter = () => {
    setIsShowPhotoControls.on();
    if (hasLoadedPhotos || isLoadingPhotos) return;

    setHasLoadedPhotos.on();
    fetchPhotos({ bobbleheadId: bobblehead.id });
  };

  const handlePrevPhoto = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsImageLoaded(false);
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    },
    [photos.length],
  );

  const handleNextPhoto = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsImageLoaded(false);
      setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    },
    [photos.length],
  );

  const handlePhotoClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Ignore click if this was a swipe gesture
      if (isTouchMoveRef.current) {
        isTouchMoveRef.current = false;
        return;
      }

      // ensure photos are loaded before opening the gallery
      if (!hasLoadedPhotos && !isLoadingPhotos) {
        setHasLoadedPhotos.on();
        fetchPhotos({ bobbleheadId: bobblehead.id });
      }

      setIsPhotoGalleryOpen.on();
    },
    [hasLoadedPhotos, isLoadingPhotos, setHasLoadedPhotos, fetchPhotos, bobblehead.id, setIsPhotoGalleryOpen],
  );

  const handlePhotoKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();

      // ensure photos are loaded before opening the gallery
      if (!hasLoadedPhotos && !isLoadingPhotos) {
        setHasLoadedPhotos.on();
        fetchPhotos({ bobbleheadId: bobblehead.id });
      }

      setIsPhotoGalleryOpen.on();
    }
  };

  const validPhotos = photos.filter(
    (photo): photo is { altText: null | string; url: string } =>
      photo !== undefined && typeof photo.url === 'string',
  );

  const currentPhoto = photos[currentPhotoIndex]?.url || bobblehead.featurePhoto;

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    if (!currentPhoto) return;

    setLoadedImageUrls((prev) => {
      if (prev.has(currentPhoto)) return prev;
      const newSet = new Set(prev);
      newSet.add(currentPhoto);
      return newSet;
    });
  }, [currentPhoto]);

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartXRef.current = touch.clientX;
    }
    isTouchMoveRef.current = false;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      const touchDiff = Math.abs(touch.clientX - touchStartXRef.current);
      if (touchDiff > 10) {
        isTouchMoveRef.current = true;
      }
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEndX = touch.clientX;
      const diff = touchStartXRef.current - touchEndX;
      const threshold = 50;

      if (Math.abs(diff) > threshold && photos.length > 1) {
        setIsImageLoaded(false);
        if (diff > 0) {
          // Swipe left - next
          setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
        } else {
          // Swipe right - prev
          setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
        }
      }
    },
    [photos.length],
  );
  const shouldShowControls = photos.length > 1 && isShowPhotoControls;
  const isCurrentImageLoaded = !currentPhoto || loadedImageUrls.has(currentPhoto ?? '');

  // Generate blur placeholder for current photo
  const _currentPublicId = currentPhoto ? extractPublicIdFromCloudinaryUrl(currentPhoto) : null;
  const _blurDataUrl = useMemo(
    () => (_currentPublicId ? generateBlurDataUrl(_currentPublicId) : undefined),
    [_currentPublicId],
  );

  // Check if there are actual photos (not just placeholder)
  const hasActualPhotos =
    validPhotos.length > 0 && validPhotos.some((photo) => photo.url !== '/placeholder.jpg');
  const shouldShowGalleryOverlay = hasActualPhotos && isShowPhotoControls;
  const hasImage = currentPhoto && currentPhoto !== '/placeholder.jpg';

  return (
    <Card
      className={'flex h-[580px] flex-col overflow-hidden transition-all duration-200 hover:shadow-lg'}
      testId={cardTestId}
    >
      {/* Name */}
      <CardHeader className={'h-14 flex-shrink-0 pb-2'}>
        <h3 className={'line-clamp-1 text-lg font-semibold'}>{bobblehead.name || 'Unnamed Bobblehead'}</h3>
      </CardHeader>

      {/* Photo */}
      <div
        className={'group relative h-64 flex-shrink-0 cursor-pointer overflow-hidden bg-muted'}
        data-slot={'photo-container'}
        data-testid={photoAreaTestId}
        onClick={handlePhotoClick}
        onKeyDown={handlePhotoKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={setIsShowPhotoControls.off}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        role={'button'}
        tabIndex={0}
        title={'Click to view in gallery'}
      >
        {/* Photo */}
        {hasImage ?
          <CldImage
            alt={bobblehead.name || 'Bobblehead'}
            blurDataURL={_blurDataUrl}
            className={cn(
              'size-full object-cover transition-all duration-500 ease-out group-hover:scale-105',
              isImageLoaded ? 'animate-carousel-fade-in opacity-100' : 'opacity-0',
            )}
            crop={'fill'}
            format={'auto'}
            height={400}
            onLoad={handleImageLoad}
            placeholder={'blur'}
            quality={'auto:good'}
            src={extractPublicIdFromCloudinaryUrl(currentPhoto)}
            width={400}
          />
        : <img
            alt={bobblehead.name || 'Bobblehead'}
            className={cn(
              'size-full object-cover transition-all duration-300',
              !isCurrentImageLoaded && 'opacity-50',
            )}
            onLoad={handleImageLoad}
            src={'/placeholder.jpg'}
          />
        }

        {/* Overlay */}
        <Conditional isCondition={shouldShowGalleryOverlay}>
          <div
            className={`absolute inset-0 flex items-start justify-center bg-black/0 pt-4
               transition-all duration-300 group-hover:bg-black/10`}
          >
            <div
              className={`rounded-md bg-black/50 px-3 py-1 text-sm font-medium text-white
                opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
            >
              View Gallery
            </div>
          </div>
        </Conditional>

        <Conditional isCondition={!isCurrentImageLoaded}>
          <div className={'absolute inset-0 flex items-center justify-center bg-black/10'}>
            <Spinner className={'size-8'} />
          </div>
        </Conditional>

        {/* Controls */}
        <Conditional isCondition={shouldShowControls}>
          {/* Previous */}
          <Button
            aria-label={'Previous photo'}
            className={
              'absolute top-1/2 left-2 z-10 -translate-y-1/2 opacity-80 transition-all duration-200 hover:scale-110 hover:opacity-100'
            }
            onClick={handlePrevPhoto}
            size={'icon'}
            testId={prevButtonTestId}
            variant={'secondary'}
          >
            <ChevronLeftIcon aria-hidden className={'size-4'} />
          </Button>

          {/* Next */}
          <Button
            aria-label={'Next photo'}
            className={
              'absolute top-1/2 right-2 z-10 -translate-y-1/2 opacity-80 transition-all duration-200 hover:scale-110 hover:opacity-100'
            }
            onClick={handleNextPhoto}
            size={'icon'}
            testId={nextButtonTestId}
            variant={'secondary'}
          >
            <ChevronRightIcon aria-hidden className={'size-4'} />
          </Button>

          {/* Dots */}
          <div
            className={'absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5'}
            data-slot={'dot-indicators'}
          >
            {photos.map((_, index) => {
              const _isActive = index === currentPhotoIndex;
              return (
                <button
                  aria-label={`Go to photo ${index + 1}`}
                  className={cn(
                    'size-2 rounded-full transition-all duration-200',
                    _isActive ? 'scale-125 animate-dot-pulse bg-white' : 'bg-white/50 hover:bg-white/70',
                  )}
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsImageLoaded(false);
                    setCurrentPhotoIndex(index);
                  }}
                  type={'button'}
                />
              );
            })}
          </div>
        </Conditional>
      </div>

      {/* Description */}
      <CardContent className={'h-20 flex-shrink-0 pt-3 pb-2'}>
        <p className={'line-clamp-3 text-sm text-muted-foreground'}>{bobblehead.description || ''}</p>
      </CardContent>

      {/* Visual Separator */}
      <div className={'border-t border-border'} />

      <CardFooter className={'mt-auto flex items-center justify-between pt-4'}>
        <div className={'flex items-center gap-2'}>
          {/* Like Button */}
          <LikeCompactButton
            initialLikeCount={bobblehead.likeData?.likeCount || 0}
            isInitiallyLiked={bobblehead.likeData?.isLiked || false}
            targetId={bobblehead.id}
            targetType={'bobblehead'}
            testId={likeButtonTestId}
          />

          {/* Share */}
          <BobbleheadShareMenu bobbleheadSlug={bobblehead.slug}>
            <Button
              className={'h-8 px-2'}
              onClick={(e) => {
                e.stopPropagation();
              }}
              size={'sm'}
              testId={shareButtonTestId}
              variant={'ghost'}
            >
              <ShareIcon aria-hidden className={'size-4'} />
            </Button>
          </BobbleheadShareMenu>
        </div>

        <div className={'flex items-center gap-2'}>
          {/* View Details */}
          <Button asChild size={'sm'} testId={viewDetailsButtonTestId} variant={'outline'}>
            <Link
              href={$path({
                route: '/bobbleheads/[bobbleheadSlug]',
                routeParams: { bobbleheadSlug: bobblehead.slug },
                searchParams: {
                  collectionId: navigationContext?.collectionId,
                },
              })}
            >
              View Details
            </Link>
          </Button>

          {/* Action Menu */}
          <Conditional isCondition={isOwner}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={'size-8 p-0'} size={'sm'} testId={actionMenuTestId} variant={'ghost'}>
                  <MoreVerticalIcon aria-hidden className={'size-4'} />
                  <VisuallyHidden>Open menu</VisuallyHidden>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align={'end'}>
                {/* Delete */}
                <DropdownMenuItem onClick={setIsDeleteDialogOpen.on} variant={'destructive'}>
                  <TrashIcon aria-hidden className={'mr-2 size-4'} />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Conditional>
        </div>
      </CardFooter>

      {/* Photo Gallery Modal */}
      <BobbleheadPhotoGalleryModal
        bobbleheadName={bobblehead.name}
        currentPhotoIndex={currentPhotoIndex}
        isOpen={isPhotoGalleryOpen}
        onClose={setIsPhotoGalleryOpen.off}
        onPhotoChange={setCurrentPhotoIndex}
        photos={validPhotos}
      />

      {/* Delete Dialog */}
      <Conditional isCondition={isDeleteDialogOpen}>
        <BobbleheadDeleteDialog
          bobbleheadId={bobblehead.id}
          collectionSlug={bobblehead.collectionSlug!}
          isOpen={isDeleteDialogOpen}
          onClose={setIsDeleteDialogOpen.off}
        />
      </Conditional>
    </Card>
  );
};
