'use client';

import type { ComponentProps } from 'react';

import { ExternalLinkIcon, HeartIcon, ShareIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { useState } from 'react';

import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type BobbleheadCardProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: BobbleheadListRecord & {
      featurePhoto?: null | string;
      likeData?: { isLiked: boolean; likeCount: number; likeId: null | string };
    };
    collectionSlug: string;
    variant?: 'grid' | 'list';
  };

export const BobbleheadCard = ({ bobblehead, testId, variant = 'grid', ...props }: BobbleheadCardProps) => {
  // 1. useState hooks
  const [isLiked, setIsLiked] = useState(bobblehead.likeData?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(bobblehead.likeData?.likeCount ?? 0);

  // 5. Utility functions
  const getBobbleheadUrl = (): string => {
    return $path({
      route: '/bobbleheads/[bobbleheadSlug]',
      routeParams: { bobbleheadSlug: bobblehead.slug },
    });
  };

  // 6. Event handlers
  const handleLikeToggle = () => {
    setIsLiked((prev) => !prev);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // 7. Derived variables
  const _bobbleheadName = bobblehead.name ?? 'Untitled Bobblehead';
  const _photoUrl = bobblehead.featurePhoto ?? '';

  const cardTestId = testId || generateTestId('feature', 'bobblehead-card', bobblehead.slug);

  // Grid variant - standard card layout
  if (variant === 'grid') {
    return (
      <Card
        className={'group h-120 overflow-hidden transition-all duration-200 hover:shadow-lg'}
        data-slot={'bobblehead-card'}
        data-testid={cardTestId}
        {...props}
      >
        {/* Card Header */}
        <CardHeader className={'h-14 shrink-0'} data-slot={'bobblehead-card-header'}>
          <CardTitle className={'line-clamp-1 text-lg'} data-slot={'bobblehead-card-title'}>
            {_bobbleheadName}
          </CardTitle>
        </CardHeader>

        {/* Photo Container */}
        <div
          className={'relative mx-6 h-64 shrink-0 overflow-hidden rounded-lg bg-muted'}
          data-slot={'photo'}
        >
          <img
            alt={_bobbleheadName}
            className={'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'}
            data-slot={'photo-image'}
            src={_photoUrl}
          />

          {/* Category Badge */}
          {bobblehead.category && (
            <Badge className={'absolute top-2 left-2'} data-slot={'category-badge'} variant={'secondary'}>
              {bobblehead.category}
            </Badge>
          )}
        </div>

        {/* Description */}
        <CardContent className={'h-20 shrink-0 py-3'} data-slot={'bobblehead-card-content'}>
          <p className={'line-clamp-3 text-sm text-muted-foreground'} data-slot={'description'}>
            {bobblehead.description}
          </p>
        </CardContent>

        {/* Separator */}
        <div className={'mx-6 border-t'} data-slot={'separator'} />

        {/* Footer */}
        <CardFooter
          className={'mt-auto flex items-center justify-between pt-4'}
          data-slot={'bobblehead-card-footer'}
        >
          <div className={'flex items-center gap-2'} data-slot={'actions'}>
            {/* Like Button */}
            <button
              className={'inline-flex items-center gap-1.5 text-sm transition-colors hover:text-red-500'}
              data-slot={'like-button'}
              data-testid={`${cardTestId}-like-button`}
              onClick={handleLikeToggle}
            >
              <HeartIcon
                aria-hidden
                className={cn('size-4 transition-colors', isLiked && 'fill-red-500 text-red-500')}
              />
              <span>{likeCount}</span>
            </button>

            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className={'size-8'}
                  data-slot={'share-button'}
                  data-testid={`${cardTestId}-share-button`}
                  size={'icon'}
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

          <Button asChild data-slot={'view-details-button'} size={'sm'} variant={'outline'}>
            <Link href={getBobbleheadUrl()}>
              <ExternalLinkIcon aria-hidden className={'mr-1.5 size-3.5'} />
              View Details
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // List variant - compact horizontal layout
  return (
    <Card
      className={'group flex flex-row overflow-hidden transition-all duration-200 hover:shadow-lg'}
      data-slot={'bobblehead-card'}
      data-testid={cardTestId}
      {...props}
    >
      {/* Photo */}
      <div className={'relative w-32 shrink-0 overflow-hidden sm:w-40'} data-slot={'photo'}>
        <img
          alt={_bobbleheadName}
          className={'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'}
          data-slot={'photo-image'}
          src={_photoUrl}
        />
      </div>

      {/* Content */}
      <div className={'flex flex-1 flex-col justify-between p-4'} data-slot={'content'}>
        <div>
          <div className={'mb-1 flex items-start justify-between'} data-slot={'header'}>
            <h3 className={'font-semibold'} data-slot={'title'}>
              {_bobbleheadName}
            </h3>
            {bobblehead.category && (
              <Badge className={'ml-2 shrink-0'} data-slot={'category-badge'} variant={'secondary'}>
                {bobblehead.category}
              </Badge>
            )}
          </div>

          <p className={'mb-2 line-clamp-2 text-sm text-muted-foreground'} data-slot={'description'}>
            {bobblehead.description}
          </p>

          {/* Metadata */}
          <div
            className={'flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground'}
            data-slot={'metadata'}
          >
            {bobblehead.manufacturer && <span>By {bobblehead.manufacturer}</span>}
            {bobblehead.year && <span>{bobblehead.year}</span>}
            {bobblehead.condition && <span>{bobblehead.condition}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className={'mt-3 flex items-center justify-between'} data-slot={'actions'}>
          <div className={'flex items-center gap-3'} data-slot={'social-actions'}>
            {/* Like Button */}
            <button
              className={'inline-flex items-center gap-1 text-sm transition-colors hover:text-red-500'}
              data-slot={'like-button'}
              data-testid={`${cardTestId}-like-button`}
              onClick={handleLikeToggle}
            >
              <HeartIcon
                aria-hidden
                className={cn('size-4 transition-colors', isLiked && 'fill-red-500 text-red-500')}
              />
              <span>{likeCount}</span>
            </button>

            {/* Share Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={'text-muted-foreground transition-colors hover:text-foreground'}
                  data-slot={'share-button'}
                  data-testid={`${cardTestId}-share-button`}
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

          <Button asChild data-slot={'view-details-button'} size={'sm'} variant={'ghost'}>
            <Link href={getBobbleheadUrl()}>
              View Details
              <ExternalLinkIcon aria-hidden className={'ml-1.5 size-3.5'} />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};
