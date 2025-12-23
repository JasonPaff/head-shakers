'use client';

import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { Fragment, type MouseEvent, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/tailwind-utils';

import type { MockBobblehead } from '../mock-data';

interface BobbleheadCardProps {
  bobblehead: MockBobblehead;
  variant?: 'gallery' | 'grid' | 'list';
}

export const BobbleheadCard = ({ bobblehead, variant = 'grid' }: BobbleheadCardProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(bobblehead.isLiked);
  const [likeCount, setLikeCount] = useState(bobblehead.likeCount);
  const [isHovering, setIsHovering] = useState(false);

  const photos = bobblehead.photos.length > 0 ? bobblehead.photos : [bobblehead.featurePhoto];
  const currentPhoto = photos[currentPhotoIndex] || bobblehead.featurePhoto;
  const _hasMultiplePhotos = photos.length > 1;

  const handlePrevPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNextPhoto = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Grid variant - standard card layout
  if (variant === 'grid') {
    return (
      <Card className={'group h-[480px] overflow-hidden transition-all duration-200 hover:shadow-lg'}>
        <CardHeader className={'h-14 flex-shrink-0'}>
          <CardTitle className={'line-clamp-1 text-lg'}>{bobblehead.name}</CardTitle>
        </CardHeader>

        {/* Photo Container */}
        <div
          className={'relative mx-6 h-64 flex-shrink-0 overflow-hidden rounded-md bg-muted'}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <img
            alt={bobblehead.name}
            className={'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'}
            src={currentPhoto ?? ''}
          />

          {/* Photo Navigation (shown on hover) */}
          {isHovering && _hasMultiplePhotos && (
            <Fragment>
              <button
                className={
                  'absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition-opacity hover:bg-black/80'
                }
                onClick={handlePrevPhoto}
              >
                <ChevronLeftIcon className={'size-4'} />
              </button>
              <button
                className={
                  'absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition-opacity hover:bg-black/80'
                }
                onClick={handleNextPhoto}
              >
                <ChevronRightIcon className={'size-4'} />
              </button>

              {/* Photo Indicators */}
              <div className={'absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'}>
                {photos.map((_, index) => (
                  <div
                    className={cn(
                      'size-1.5 rounded-full transition-colors',
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50',
                    )}
                    key={index}
                  />
                ))}
              </div>
            </Fragment>
          )}

          {/* Category Badge */}
          {bobblehead.category && (
            <Badge className={'absolute top-2 left-2'} variant={'secondary'}>
              {bobblehead.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        <CardContent className={'h-20 flex-shrink-0 py-3'}>
          <p className={'line-clamp-3 text-sm text-muted-foreground'}>{bobblehead.description}</p>
        </CardContent>

        {/* Separator */}
        <div className={'mx-6 border-t'} />

        {/* Footer */}
        <CardFooter className={'mt-auto flex items-center justify-between pt-4'}>
          <div className={'flex items-center gap-2'}>
            {/* Like Button */}
            <button
              className={'inline-flex items-center gap-1.5 text-sm transition-colors hover:text-red-500'}
              onClick={handleLikeToggle}
            >
              <HeartIcon className={cn('size-4 transition-colors', isLiked && 'fill-red-500 text-red-500')} />
              <span>{likeCount}</span>
            </button>

            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className={'size-8'} size={'icon'} variant={'ghost'}>
                  <ShareIcon className={'size-4'} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'start'}>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
                <DropdownMenuItem>Share on Twitter</DropdownMenuItem>
                <DropdownMenuItem>Share on Facebook</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button size={'sm'} variant={'outline'}>
            <ExternalLinkIcon className={'mr-1.5 size-3.5'} />
            View Details
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
          'group relative overflow-hidden rounded-lg bg-card shadow-sm transition-all duration-300 hover:shadow-xl'
        }
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Photo Container */}
        <div className={'relative aspect-[3/4] overflow-hidden'}>
          <img
            alt={bobblehead.name}
            className={'h-full w-full object-cover transition-transform duration-500 group-hover:scale-110'}
            src={currentPhoto ?? ''}
          />

          {/* Gradient overlay on hover */}
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300',
              isHovering ? 'opacity-100' : 'opacity-0',
            )}
          />

          {/* Photo Navigation */}
          {isHovering && _hasMultiplePhotos && (
            <Fragment>
              <button
                className={
                  'absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30'
                }
                onClick={handlePrevPhoto}
              >
                <ChevronLeftIcon className={'size-5'} />
              </button>
              <button
                className={
                  'absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30'
                }
                onClick={handleNextPhoto}
              >
                <ChevronRightIcon className={'size-5'} />
              </button>
            </Fragment>
          )}

          {/* Like Button - Top Right */}
          <button
            className={cn(
              'absolute top-3 right-3 rounded-full p-2 transition-all',
              isLiked ? 'bg-red-500 text-white' : 'bg-black/40 text-white backdrop-blur-sm hover:bg-black/60',
            )}
            onClick={handleLikeToggle}
          >
            <HeartIcon className={cn('size-5', isLiked && 'fill-current')} />
          </button>

          {/* Content overlay on hover */}
          <div
            className={cn(
              'absolute inset-x-0 bottom-0 p-4 transition-all duration-300',
              isHovering ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
            )}
          >
            <h3 className={'mb-1 text-lg font-semibold text-white'}>{bobblehead.name}</h3>
            <p className={'line-clamp-2 text-sm text-white/80'}>{bobblehead.description}</p>

            <div className={'mt-3 flex items-center justify-between'}>
              <div className={'flex items-center gap-3 text-sm text-white/70'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon className={'size-3.5'} />
                  {likeCount}
                </span>
                {bobblehead.year && <span>{bobblehead.year}</span>}
              </div>

              <Button className={'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'} size={'sm'}>
                View
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Indicators */}
        {_hasMultiplePhotos && (
          <div className={'absolute bottom-16 left-1/2 flex -translate-x-1/2 gap-1.5'}>
            {photos.map((_, index) => (
              <div
                className={cn(
                  'size-1.5 rounded-full transition-colors',
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/40',
                )}
                key={index}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // List variant - compact horizontal layout
  return (
    <Card className={'group flex flex-row overflow-hidden transition-all duration-200 hover:shadow-lg'}>
      {/* Photo */}
      <div
        className={'relative w-32 flex-shrink-0 overflow-hidden sm:w-40'}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <img
          alt={bobblehead.name}
          className={'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'}
          src={currentPhoto ?? ''}
        />

        {/* Photo Navigation */}
        {isHovering && _hasMultiplePhotos && (
          <div className={'absolute inset-x-0 bottom-2 flex justify-center gap-1'}>
            {photos.map((_, index) => (
              <button
                className={cn(
                  'size-1.5 rounded-full transition-colors',
                  index === currentPhotoIndex ? 'bg-white' : 'bg-white/50',
                )}
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(index);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className={'flex flex-1 flex-col justify-between p-4'}>
        <div>
          <div className={'mb-1 flex items-start justify-between'}>
            <h3 className={'font-semibold'}>{bobblehead.name}</h3>
            {bobblehead.category && (
              <Badge className={'ml-2 flex-shrink-0'} variant={'secondary'}>
                {bobblehead.category}
              </Badge>
            )}
          </div>

          <p className={'mb-2 line-clamp-2 text-sm text-muted-foreground'}>{bobblehead.description}</p>

          {/* Metadata */}
          <div className={'flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'}>
            {bobblehead.manufacturer && <span>By {bobblehead.manufacturer}</span>}
            {bobblehead.year && <span>{bobblehead.year}</span>}
            {bobblehead.condition && <span>{bobblehead.condition}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className={'mt-3 flex items-center justify-between'}>
          <div className={'flex items-center gap-3'}>
            <button
              className={'inline-flex items-center gap-1 text-sm transition-colors hover:text-red-500'}
              onClick={handleLikeToggle}
            >
              <HeartIcon className={cn('size-4 transition-colors', isLiked && 'fill-red-500 text-red-500')} />
              <span>{likeCount}</span>
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={'text-muted-foreground transition-colors hover:text-foreground'}>
                  <ShareIcon className={'size-4'} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Copy Link</DropdownMenuItem>
                <DropdownMenuItem>Share on Twitter</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button size={'sm'} variant={'ghost'}>
            View Details
            <ExternalLinkIcon className={'ml-1.5 size-3.5'} />
          </Button>
        </div>
      </div>
    </Card>
  );
};
