'use client';

import type { MouseEvent } from 'react';

import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  ShareIcon,
} from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useState } from 'react';

import type { SelectBobbleheadPhoto } from '@/lib/validations/bobbleheads.validation';

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
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import { useToggle } from '@/hooks/use-toggle';
import { getBobbleheadPhotosAction } from '@/lib/actions/bobbleheads/bobbleheads.actions';
import { cn } from '@/utils/tailwind-utils';

import { BobbleheadCommentsDialog } from './bobblehead-comments-dialog';
import { BobbleheadDelete } from './bobblehead-delete';
import { BobbleheadShareMenu } from './bobblehead-share-menu';

interface BobbleheadGalleryCardProps {
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
  };
  isOwner: boolean;
}

export const BobbleheadGalleryCard = ({ bobblehead, isOwner }: BobbleheadGalleryCardProps) => {
  const [photos, setPhotos] = useState<Array<{ altText?: null | string; url: string }>>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const [hasLoadedPhotos, setHasLoadedPhotos] = useToggle();
  const [isShowPhotoControls, setIsShowPhotoControls] = useToggle();

  const { executeAsync: fetchPhotos, isExecuting: isLoadingPhotos } = useServerAction(
    getBobbleheadPhotosAction,
    { isDisableToast: true },
  );

  const handleMouseEnter = async () => {
    setIsShowPhotoControls.on();
    if (!hasLoadedPhotos && !isLoadingPhotos) {
      setHasLoadedPhotos.on();
      const result = await fetchPhotos({ bobbleheadId: bobblehead.id });
      if (result && 'data' in result && result.data && Array.isArray(result.data)) {
        setPhotos(
          result.data.map((photo: SelectBobbleheadPhoto) => ({
            altText: photo.altText,
            url: photo.url,
          })),
        );
      }
    }
  };

  const handleMouseLeave = () => {
    setIsShowPhotoControls.off();
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

  const _currentPhoto = photos[currentPhotoIndex]?.url || bobblehead.featurePhoto;
  const _shouldShowControls = photos.length > 1 && isShowPhotoControls;

  return (
    <Card className={'overflow-hidden transition-shadow hover:shadow-lg'}>
      <div
        className={'relative aspect-square bg-muted'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Photo */}
        <Conditional fallback={<Skeleton className={'size-full'} />} isCondition={!!_currentPhoto}>
          <img
            alt={bobblehead.name || 'Bobblehead'}
            className={'object-cover'}
            sizes={'(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            src={_currentPhoto ?? undefined}
          />
        </Conditional>

        {/* Controls */}
        <Conditional isCondition={_shouldShowControls}>
          {/* Previous */}
          <Button
            className={'absolute top-1/2 left-2 -translate-y-1/2 opacity-80 hover:opacity-100'}
            onClick={handlePrevPhoto}
            size={'icon'}
            variant={'secondary'}
          >
            <ChevronLeftIcon aria-hidden className={'size-4'} />
          </Button>

          {/* Next */}
          <Button
            className={'absolute top-1/2 right-2 -translate-y-1/2 opacity-80 hover:opacity-100'}
            onClick={handleNextPhoto}
            size={'icon'}
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

      <Link
        className={'block'}
        href={$path({
          route: '/bobbleheads/[bobbleheadId]',
          routeParams: { bobbleheadId: bobblehead.id },
        })}
      >
        {/* Name */}
        <CardHeader>
          <h3 className={'line-clamp-1 text-lg font-semibold'}>{bobblehead.name || 'Unnamed Bobblehead'}</h3>
        </CardHeader>

        {/* Description */}
        <Conditional isCondition={!!bobblehead.description}>
          <CardContent>
            <p className={'line-clamp-2 text-sm text-muted-foreground'}>{bobblehead.description}</p>
          </CardContent>
        </Conditional>
      </Link>

      <CardFooter className={'flex items-center justify-between'}>
        <div className={'flex items-center gap-2'}>
          {/* Like Button */}
          <LikeCompactButton
            initialLikeCount={bobblehead.likeData?.likeCount || 0}
            isInitiallyLiked={bobblehead.likeData?.isLiked || false}
            targetId={bobblehead.id}
            targetType={'bobblehead'}
          />

          {/* Comments */}
          <BobbleheadCommentsDialog>
            <Button
              className={'h-8 px-2'}
              onClick={(e) => {
                e.stopPropagation();
              }}
              size={'sm'}
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
              variant={'ghost'}
            >
              <ShareIcon aria-hidden className={'size-4'} />
            </Button>
          </BobbleheadShareMenu>
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={'size-8 p-0'}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                size={'sm'}
                variant={'ghost'}
              >
                <MoreVerticalIcon aria-hidden className={'size-4'} />
                <VisuallyHidden>Open menu</VisuallyHidden>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'end'}>
              <DropdownMenuItem asChild>
                <Link
                  href={$path({
                    route: '/bobbleheads/[bobbleheadId]/edit',
                    routeParams: { bobbleheadId: bobblehead.id },
                  })}
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                }}
              >
                <BobbleheadDelete
                  bobbleheadId={bobblehead.id}
                  collectionId={bobblehead.collectionId}
                  subcollectionId={bobblehead.subcollectionId}
                >
                  Delete
                </BobbleheadDelete>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardFooter>
    </Card>
  );
};
