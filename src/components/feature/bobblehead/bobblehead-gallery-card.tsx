'use client';

import type { KeyboardEvent, MouseEvent } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  PencilIcon,
  ShareIcon,
  TrashIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useMemo } from 'react';
import { useState } from 'react';

import type { SelectBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';
import type { ComponentTestIdProps } from '@/lib/test-ids';
import { generateTestId } from '@/lib/test-ids';

import { BobbleheadDeleteDialog } from '@/components/feature/bobblehead/bobblehead-delete-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LikeCompactButton } from '@/components/ui/like-button';
import { Spinner } from '@/components/ui/spinner';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { getBobbleheadPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadCommentsDialog } from './bobblehead-comments-dialog';
import { BobbleheadPhotoGalleryModal } from './bobblehead-photo-gallery-modal';
import { BobbleheadShareMenu } from './bobblehead-share-menu';

interface BobbleheadGalleryCardProps extends ComponentTestIdProps {
  bobblehead: {
    collectionId: string;
    description?: null | string;
    featurePhoto?: null | string;
    id: string;
    likeData?: {
      isLiked: boolean;
      likeCount: number;
      likeId: null | string;
    };
    name: null | string;
    subcollectionId?: null | string;
    subcollectionName?: null | string;
  };
  isOwner: boolean;
}

export const BobbleheadGalleryCard = ({ bobblehead, isOwner, testId }: BobbleheadGalleryCardProps) => {
  // Generate testids for components
  const cardTestId = testId || generateTestId('feature', 'bobblehead-card');
  const photoAreaTestId = generateTestId('feature', 'bobblehead-photo', 'clickable');
  const prevButtonTestId = generateTestId('feature', 'bobblehead-nav', 'prev');
  const nextButtonTestId = generateTestId('feature', 'bobblehead-nav', 'next');
  const likeButtonTestId = generateTestId('feature', 'like-button', 'bobblehead');
  const commentsButtonTestId = generateTestId('feature', 'comments-button', 'bobblehead');
  const shareButtonTestId = generateTestId('feature', 'share-button', 'bobblehead');
  const viewDetailsButtonTestId = generateTestId('feature', 'view-details-button', 'bobblehead');
  const actionMenuTestId = generateTestId('feature', 'action-menu', 'bobblehead');

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [loadedImageUrls, setLoadedImageUrls] = useState<Set<string>>(
    () => new Set(bobblehead.featurePhoto ? [bobblehead.featurePhoto] : []),
  );

  const [hasLoadedPhotos, setHasLoadedPhotos] = useToggle();
  const [isShowPhotoControls, setIsShowPhotoControls] = useToggle();
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useToggle();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useToggle();

  const {
    execute: fetchPhotos,
    isExecuting: isLoadingPhotos,
    result: photosResult,
  } = useServerAction(getBobbleheadPhotosAction, { isDisableToast: true });

  const photos = useMemo(() => {
    const allPhotos =
      photosResult.data?.data?.map((photo: SelectBobbleheadPhoto) => ({
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

  const handlePrevPhoto = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const handleNextPhoto = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handlePhotoClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // ensure photos are loaded before opening the gallery
    if (!hasLoadedPhotos && !isLoadingPhotos) {
      setHasLoadedPhotos.on();
      fetchPhotos({ bobbleheadId: bobblehead.id });
    }

    setIsPhotoGalleryOpen.on();
  };

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

  const handleImageLoad = () => {
    if (!currentPhoto) return;

    setLoadedImageUrls((prev) => {
      if (prev.has(currentPhoto)) return prev;
      const newSet = new Set(prev);
      newSet.add(currentPhoto);
      return newSet;
    });
  };

  const validPhotos = photos.filter(
    (photo): photo is { altText: null | string; url: string } =>
      photo !== undefined && typeof photo.url === 'string',
  );

  const currentPhoto = photos[currentPhotoIndex]?.url || bobblehead.featurePhoto;
  const shouldShowControls = photos.length > 1 && isShowPhotoControls;
  const isCurrentImageLoaded = !currentPhoto || loadedImageUrls.has(currentPhoto ?? '');

  // Check if there are actual photos (not just placeholder)
  const hasActualPhotos =
    validPhotos.length > 0 && validPhotos.some((photo) => photo.url !== '/placeholder.jpg');
  const shouldShowGalleryOverlay = hasActualPhotos && isShowPhotoControls;

  return (
    <Card
      className={'flex h-[580px] flex-col overflow-hidden transition-all duration-200 hover:shadow-lg'}
      testId={cardTestId}
    >
      {/* Name */}
      <CardHeader className={'h-14 flex-shrink-0 pb-2'}>
        <h3 className={'line-clamp-1 text-lg font-semibold'}>{bobblehead.name || 'Unnamed Bobblehead'}</h3>
        <Conditional isCondition={!!bobblehead.subcollectionId && !!bobblehead.subcollectionName}>
          <div className={'flex items-center text-xs text-muted-foreground'}>
            <FolderIcon aria-hidden className={'mr-1.5 size-3.5 flex-shrink-0'} />
            <Link
              className={'truncate hover:underline'}
              href={$path({
                route: '/collections/[collectionId]/subcollection/[subcollectionId]',
                routeParams: {
                  collectionId: bobblehead.collectionId,
                  subcollectionId: bobblehead.subcollectionId!,
                },
              })}
              onClick={(e) => {
                e.stopPropagation();
              }}
              title={bobblehead.subcollectionName ?? ''}
            >
              {bobblehead.subcollectionName}
            </Link>
          </div>
        </Conditional>
      </CardHeader>

      {/* Photo */}
      <div
        className={'group relative h-64 flex-shrink-0 cursor-pointer bg-muted'}
        data-testid={photoAreaTestId}
        onClick={handlePhotoClick}
        onKeyDown={handlePhotoKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={setIsShowPhotoControls.off}
        role={'button'}
        tabIndex={0}
        title={'Click to view in gallery'}
      >
        {/* Photo */}
        <img
          alt={bobblehead.name || 'Bobblehead'}
          className={cn(
            'size-full object-cover transition-all duration-300 group-hover:scale-105',
            !isCurrentImageLoaded && 'opacity-50',
          )}
          onLoad={handleImageLoad}
          sizes={'(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
          src={currentPhoto ?? '/placeholder.jpg'}
        />

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
            className={'absolute top-1/2 left-2 -translate-y-1/2 opacity-80 hover:opacity-100'}
            onClick={handlePrevPhoto}
            size={'icon'}
            testId={prevButtonTestId}
            variant={'secondary'}
          >
            <ChevronLeftIcon aria-hidden className={'size-4'} />
          </Button>

          {/* Next */}
          <Button
            className={'absolute top-1/2 right-2 -translate-y-1/2 opacity-80 hover:opacity-100'}
            onClick={handleNextPhoto}
            size={'icon'}
            testId={nextButtonTestId}
            variant={'secondary'}
          >
            <ChevronRightIcon aria-hidden className={'size-4'} />
          </Button>

          {/* Dots */}
          <div className={'absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'}>
            {photos.map((_, index) => (
              <button
                className={cn(
                  'size-1.5 rounded-full bg-white/50 transition-colors',
                  index === currentPhotoIndex && 'bg-white',
                )}
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentPhotoIndex(index);
                }}
              />
            ))}
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

          {/* Comments */}
          <BobbleheadCommentsDialog>
            <Button
              className={'h-8 px-2'}
              onClick={(e) => {
                e.stopPropagation();
              }}
              size={'sm'}
              testId={commentsButtonTestId}
              variant={'ghost'}
            >
              <MessageCircleIcon aria-hidden className={'size-4'} />
            </Button>
          </BobbleheadCommentsDialog>

          {/* Share */}
          <BobbleheadShareMenu>
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
                route: '/bobbleheads/[bobbleheadId]',
                routeParams: { bobbleheadId: bobblehead.id },
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
                {/* Edit */}
                <DropdownMenuItem>
                  <PencilIcon aria-hidden className={'mr-2 size-4'} />
                  Edit
                </DropdownMenuItem>

                {/* Delete */}
                <DropdownMenuSeparator />
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
          collectionId={bobblehead.collectionId}
          isOpen={isDeleteDialogOpen}
          onClose={setIsDeleteDialogOpen.off}
          subcollectionId={bobblehead.subcollectionId}
        />
      </Conditional>
    </Card>
  );
};
