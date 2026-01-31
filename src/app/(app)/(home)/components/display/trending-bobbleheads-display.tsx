'use client';

import { EyeIcon, HeartIcon, TrendingUpIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { TrendingBobblehead } from '@/lib/queries/featured-content/featured-content.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

export interface TrendingBobbleheadsDisplayProps extends ComponentTestIdProps {
  bobbleheads: Array<TrendingBobblehead>;
}

export const TrendingBobbleheadsDisplay = ({ bobbleheads, testId }: TrendingBobbleheadsDisplayProps) => {
  const displayTestId = testId || generateTestId('feature', 'trending-bobbleheads-grid');

  if (bobbleheads.length === 0) {
    return (
      <div
        className={'py-12 text-center'}
        data-slot={'trending-bobbleheads-empty'}
        data-testid={displayTestId}
      >
        <TrendingUpIcon aria-hidden className={'mx-auto mb-4 size-12 text-muted-foreground/50'} />
        <p className={'mb-4 text-muted-foreground'}>No trending bobbleheads available at this time.</p>
        <Button asChild variant={'outline'}>
          <Link href={$path({ route: '/browse' })}>Browse All Bobbleheads</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-2 gap-3
        sm:grid-cols-3 sm:gap-4
        md:gap-5
        lg:grid-cols-6 lg:gap-6`}
      data-slot={'trending-bobbleheads-grid'}
      data-testid={displayTestId}
    >
      {bobbleheads.map((bobblehead) => (
        <TrendingBobbleheadCard bobblehead={bobblehead} key={bobblehead.id} />
      ))}
    </div>
  );
};

interface TrendingBobbleheadCardProps extends ComponentTestIdProps {
  bobblehead: TrendingBobblehead;
}

const TrendingBobbleheadCard = ({ bobblehead, testId }: TrendingBobbleheadCardProps) => {
  const _hasImage = Boolean(bobblehead.imageUrl);

  // Extract publicId and generate blur placeholder for progressive loading
  const publicId = bobblehead.imageUrl ? extractPublicIdFromCloudinaryUrl(bobblehead.imageUrl) : '';
  const blurDataUrl = publicId ? generateBlurDataUrl(publicId) : undefined;

  // Map badge value to display text
  const _badgeText =
    bobblehead.featureType === 'editor_pick' ? 'Pick'
    : bobblehead.featureType === 'new_badge' ? 'New'
    : bobblehead.featureType.charAt(0).toUpperCase() + bobblehead.featureType.slice(1);

  const cardTestId = testId || generateTestId('feature', 'trending-bobblehead-card', bobblehead.id);

  return (
    <Link
      className={cn(
        'group relative overflow-hidden rounded-xl border border-border/40 bg-card',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-border/60 hover:shadow-lg',
        'active:scale-[0.98]',
        'sm:rounded-2xl sm:hover:-translate-y-2 sm:hover:shadow-xl',
        'dark:border-border/50 dark:bg-secondary dark:hover:border-border/70',
      )}
      data-slot={'trending-bobblehead-card'}
      data-testid={cardTestId}
      href={$path({
        route: '/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]',
        routeParams: {
          bobbleheadSlug: bobblehead.contentSlug ?? '',
          collectionSlug: bobblehead.collectionSlug ?? '',
          username: bobblehead.ownerUsername ?? '',
        },
        searchParams: {},
      })}
    >
      {/* Image Section */}
      <div
        className={
          'relative aspect-square overflow-hidden bg-linear-to-br from-muted to-secondary dark:from-secondary dark:to-muted'
        }
        data-slot={'trending-bobblehead-image-container'}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={bobblehead.title ?? bobblehead.name ?? 'Bobblehead'}
            blurDataURL={blurDataUrl}
            className={
              'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
            }
            crop={'fill'}
            format={'auto'}
            gravity={'auto'}
            height={300}
            loading={'lazy'}
            placeholder={blurDataUrl ? 'blur' : 'empty'}
            quality={'auto:good'}
            sizes={'(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw'}
            src={publicId}
            width={300}
          />
        </Conditional>

        {/* Badge */}
        <div className={'absolute top-2 left-2'} data-slot={'trending-bobblehead-badge'}>
          <Badge variant={bobblehead.featureType}>{_badgeText}</Badge>
        </div>

        {/* Gradient Overlay */}
        <div
          aria-hidden
          className={
            'absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100'
          }
          data-slot={'trending-bobblehead-overlay'}
        />

        {/* Stats Overlay */}
        <div
          className={
            'absolute right-0 bottom-0 left-0 translate-y-full p-3 transition-transform group-hover:translate-y-0'
          }
          data-slot={'trending-bobblehead-stats-overlay'}
        >
          <div className={'flex items-center justify-center gap-3 text-xs text-white'}>
            <span className={'flex items-center gap-1'} data-slot={'trending-bobblehead-likes'}>
              <HeartIcon aria-hidden className={'size-3'} />
              {bobblehead.likeCount.toLocaleString()}
            </span>
            <span className={'flex items-center gap-1'} data-slot={'trending-bobblehead-views'}>
              <EyeIcon aria-hidden className={'size-3'} />
              {bobblehead.viewCount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className={'p-2.5 sm:p-3'} data-slot={'trending-bobblehead-footer'}>
        <h3
          className={'line-clamp-1 text-xs font-semibold text-foreground sm:text-sm'}
          data-slot={'trending-bobblehead-name'}
        >
          {bobblehead.title ?? bobblehead.name ?? 'Bobblehead'}
        </h3>
        <div
          className={
            'mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground sm:mt-1 sm:text-xs'
          }
          data-slot={'trending-bobblehead-meta'}
        >
          <span className={'truncate'} data-slot={'trending-bobblehead-category'}>
            {bobblehead.category ?? 'Bobblehead'}
          </span>
          <span className={'shrink-0 tabular-nums'} data-slot={'trending-bobblehead-year'}>
            {bobblehead.year ?? new Date().getFullYear()}
          </span>
        </div>
      </div>
    </Link>
  );
};
