'use client';

import type { MouseEvent } from 'react';

import { ExternalLinkIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LikeCompactButton } from '@/components/ui/like-button';
import { useLike } from '@/hooks/use-like';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

import type { BobbleheadViewData } from '../types';

type BobbleheadCardProps = ComponentTestIdProps & {
  bobblehead: BobbleheadViewData;
  collectionSlug: string;
  ownerUsername: string;
  variant?: 'gallery' | 'grid' | 'list';
};

export const BobbleheadCard = ({
  bobblehead,
  collectionSlug,
  ownerUsername,
  testId,
  variant = 'grid',
}: BobbleheadCardProps) => {
  // 1. useState hooks
  const [isHovering, setIsHovering] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // 2. Other hooks
  const { isLiked, likeCount, toggleLike } = useLike({
    initialLikeCount: bobblehead.likeCount,
    isInitiallyLiked: bobblehead.isLiked,
    targetId: bobblehead.id,
    targetType: 'bobblehead',
  });

  // 3. useMemo hooks
  const _hasImage = useMemo(
    () => bobblehead.featurePhoto !== null && bobblehead.featurePhoto.length > 0,
    [bobblehead.featurePhoto],
  );

  const _publicId = useMemo(
    () => (_hasImage ? extractPublicIdFromCloudinaryUrl(bobblehead.featurePhoto!) : null),
    [_hasImage, bobblehead.featurePhoto],
  );

  const _blurDataUrl = useMemo(() => (_publicId ? generateBlurDataUrl(_publicId) : undefined), [_publicId]);

  const bobbleheadDetailHref = useMemo(
    () =>
      $path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: bobblehead.slug },
        searchParams: {
          fromCollection: collectionSlug,
          fromUser: ownerUsername,
        },
      }),
    [bobblehead.slug, collectionSlug, ownerUsername],
  );

  // Test IDs
  const cardTestId = testId || generateTestId('feature', 'bobblehead-card', bobblehead.slug);
  const likeButtonTestId = generateTestId('feature', 'like-button', bobblehead.slug);
  const shareButtonTestId = generateTestId('feature', 'share-button', bobblehead.slug);
  const viewDetailsTestId = generateTestId('feature', 'view-details-button', bobblehead.slug);

  // 5. Utility functions
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  // 6. Event handlers
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const handleLikeClick = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleLike();
    },
    [toggleLike],
  );

  // 7. Derived variables
  const _isImageReady = _hasImage && isImageLoaded;

  // Grid variant - standard card layout
  if (variant === 'grid') {
    return (
      <Card
        className={'group h-[480px] overflow-hidden transition-all duration-200 hover:shadow-lg'}
        data-slot={'bobblehead-card'}
        data-testid={cardTestId}
      >
        {/* Header */}
        <CardHeader className={'h-14 flex-shrink-0'} data-slot={'bobblehead-card-header'}>
          <CardTitle className={'line-clamp-1 text-lg'}>{bobblehead.name}</CardTitle>
        </CardHeader>

        {/* Photo Container */}
        <div
          className={'relative mx-6 h-64 flex-shrink-0 overflow-hidden rounded-lg bg-muted'}
          data-slot={'bobblehead-card-photo'}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Conditional isCondition={_hasImage}>
            <CldImage
              alt={bobblehead.name}
              blurDataURL={_blurDataUrl}
              className={cn(
                'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
                _isImageReady ? 'opacity-100' : 'opacity-0',
              )}
              crop={'fill'}
              format={'auto'}
              height={256}
              onLoad={handleImageLoad}
              placeholder={'blur'}
              quality={'auto:good'}
              src={_publicId!}
              width={400}
            />
          </Conditional>

          <Conditional isCondition={!_hasImage}>
            <div
              className={'flex h-full w-full items-center justify-center bg-muted text-muted-foreground'}
              data-slot={'bobblehead-card-placeholder'}
            >
              <span className={'text-sm'}>No image</span>
            </div>
          </Conditional>

          {/* Category Badge */}
          <Conditional isCondition={bobblehead.category !== null}>
            <Badge className={'absolute top-2 left-2'} variant={'secondary'}>
              {bobblehead.category}
            </Badge>
          </Conditional>
        </div>

        {/* Description */}
        <CardContent className={'h-20 flex-shrink-0 py-3'} data-slot={'bobblehead-card-content'}>
          <p className={'line-clamp-3 text-sm text-muted-foreground'}>
            {bobblehead.description || 'No description available.'}
          </p>
        </CardContent>

        {/* Separator */}
        <div className={'mx-6 border-t'} data-slot={'bobblehead-card-separator'} />

        {/* Footer */}
        <CardFooter
          className={'mt-auto flex items-center justify-between pt-4'}
          data-slot={'bobblehead-card-footer'}
        >
          <div className={'flex items-center gap-2'}>
            {/* Like Button */}
            <LikeCompactButton
              initialLikeCount={bobblehead.likeCount}
              isInitiallyLiked={bobblehead.isLiked}
              targetId={bobblehead.id}
              targetType={'bobblehead'}
              testId={likeButtonTestId}
            />

            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={'Share bobblehead'}
                  className={'size-8'}
                  size={'icon'}
                  testId={shareButtonTestId}
                  variant={'ghost'}
                >
                  <ShareIcon aria-hidden className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'start'}>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
                <DropdownMenuItem>Share on Twitter</DropdownMenuItem>
                <DropdownMenuItem>Share on Facebook</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Details */}
          <Button asChild size={'sm'} testId={viewDetailsTestId} variant={'outline'}>
            <Link href={bobbleheadDetailHref}>
              <ExternalLinkIcon aria-hidden className={'mr-1.5 size-3.5'} />
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Gallery variant - larger image, minimal text
  if (variant === 'gallery') {
    return (
      <div
        className={
          'group relative overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-300 hover:shadow-xl'
        }
        data-slot={'bobblehead-card'}
        data-testid={cardTestId}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Photo Container */}
        <div className={'relative aspect-[3/4] overflow-hidden'} data-slot={'bobblehead-card-photo'}>
          <Conditional isCondition={_hasImage}>
            <CldImage
              alt={bobblehead.name}
              blurDataURL={_blurDataUrl}
              className={cn(
                'h-full w-full object-cover transition-all duration-500 group-hover:scale-110',
                _isImageReady ? 'opacity-100' : 'opacity-0',
              )}
              crop={'fill'}
              fill
              format={'auto'}
              onLoad={handleImageLoad}
              placeholder={'blur'}
              quality={'auto:good'}
              sizes={'(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
              src={_publicId!}
            />
          </Conditional>

          <Conditional isCondition={!_hasImage}>
            <div
              className={'flex h-full w-full items-center justify-center bg-muted text-muted-foreground'}
              data-slot={'bobblehead-card-placeholder'}
            >
              <span className={'text-sm'}>No image</span>
            </div>
          </Conditional>

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
              isHovering ? 'opacity-100' : 'opacity-0',
            )}
            data-slot={'bobblehead-card-overlay'}
          />

          {/* Like Button - Top Right */}
          <button
            aria-label={isLiked ? 'Unlike this bobblehead' : 'Like this bobblehead'}
            aria-pressed={isLiked}
            className={cn(
              'absolute top-3 right-3 rounded-full p-2 transition-all',
              isLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white backdrop-blur-sm hover:bg-black/60',
            )}
            data-slot={'bobblehead-card-like'}
            data-testid={likeButtonTestId}
            onClick={handleLikeClick}
            type={'button'}
          >
            <HeartIcon aria-hidden className={cn('size-5', isLiked && 'fill-current')} />
          </button>

          {/* Content overlay on hover */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 p-4 transition-all duration-300',
              isHovering ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
            data-slot={'bobblehead-card-content'}
          >
            <h3 className={'mb-1 text-lg font-semibold text-white'}>{bobblehead.name}</h3>
            <p className={'line-clamp-2 text-sm text-white/80'}>
              {bobblehead.description || 'No description available.'}
            </p>

            <div className={'mt-3 flex items-center justify-between'}>
              <div className={'flex items-center gap-3 text-sm text-white/70'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-3.5'} />
                  {likeCount}
                </span>
                <Conditional isCondition={bobblehead.year !== null}>
                  <span>{bobblehead.year}</span>
                </Conditional>
              </div>

              <Button
                asChild
                className={'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'}
                size={'sm'}
                testId={viewDetailsTestId}
              >
                <Link href={bobbleheadDetailHref}>View</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // List variant - compact horizontal layout
  return (
    <Card
      className={'group flex flex-row overflow-hidden transition-all duration-200 hover:shadow-lg'}
      data-slot={'bobblehead-card'}
      data-testid={cardTestId}
    >
      {/* Photo */}
      <div
        className={'relative w-32 flex-shrink-0 overflow-hidden sm:w-40'}
        data-slot={'bobblehead-card-photo'}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={bobblehead.name}
            blurDataURL={_blurDataUrl}
            className={cn(
              'h-full w-full object-cover transition-all duration-300 group-hover:scale-105',
              _isImageReady ? 'opacity-100' : 'opacity-0',
            )}
            crop={'fill'}
            fill
            format={'auto'}
            onLoad={handleImageLoad}
            placeholder={'blur'}
            quality={'auto:good'}
            sizes={'160px'}
            src={_publicId!}
          />
        </Conditional>

        <Conditional isCondition={!_hasImage}>
          <div
            className={'flex h-full w-full items-center justify-center bg-muted text-muted-foreground'}
            data-slot={'bobblehead-card-placeholder'}
          >
            <span className={'text-xs'}>No image</span>
          </div>
        </Conditional>
      </div>

      {/* Content */}
      <div className={'flex flex-1 flex-col justify-between p-4'} data-slot={'bobblehead-card-content'}>
        <div>
          <div className={'mb-1 flex items-start justify-between'}>
            <h3 className={'font-semibold'}>{bobblehead.name}</h3>
            <Conditional isCondition={bobblehead.category !== null}>
              <Badge className={'ml-2 flex-shrink-0'} variant={'secondary'}>
                {bobblehead.category}
              </Badge>
            </Conditional>
          </div>

          <p className={'mb-2 line-clamp-2 text-sm text-muted-foreground'}>
            {bobblehead.description || 'No description available.'}
          </p>

          {/* Metadata */}
          <div className={'flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'}>
            <Conditional isCondition={bobblehead.manufacturer !== null}>
              <span>By {bobblehead.manufacturer}</span>
            </Conditional>
            <Conditional isCondition={bobblehead.year !== null}>
              <span>{bobblehead.year}</span>
            </Conditional>
            <Conditional isCondition={bobblehead.condition !== null}>
              <span>{bobblehead.condition}</span>
            </Conditional>
          </div>
        </div>

        {/* Actions */}
        <div className={'mt-3 flex items-center justify-between'} data-slot={'bobblehead-card-footer'}>
          <div className={'flex items-center gap-3'}>
            {/* Like Button */}
            <LikeCompactButton
              initialLikeCount={bobblehead.likeCount}
              isInitiallyLiked={bobblehead.isLiked}
              targetId={bobblehead.id}
              targetType={'bobblehead'}
              testId={likeButtonTestId}
            />

            {/* Share */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label={'Share bobblehead'}
                  className={'text-muted-foreground transition-colors hover:text-foreground'}
                  data-testid={shareButtonTestId}
                  type={'button'}
                >
                  <ShareIcon aria-hidden className={'size-4'} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
                <DropdownMenuItem>Share on Twitter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* View Details */}
          <Button asChild size={'sm'} testId={viewDetailsTestId} variant={'ghost'}>
            <Link href={bobbleheadDetailHref}>
              View Details
              <ExternalLinkIcon aria-hidden className={'ml-1.5 size-3.5'} />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
