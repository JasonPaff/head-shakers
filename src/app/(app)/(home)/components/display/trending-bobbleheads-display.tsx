'use client';

import { EyeIcon, HeartIcon, TrendingUpIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';
import { cn } from '@/utils/tailwind-utils';

export interface TrendingBobblehead {
  badge: 'editor_pick' | 'new_badge' | 'popular' | 'trending';
  category: string;
  characterName: string;
  contentId: string;
  contentSlug: string;
  id: string;
  imageUrl: null | string;
  likeCount: number;
  viewCount: number;
  year: number;
}

export interface TrendingBobbleheadsDisplayProps {
  bobbleheads: Array<TrendingBobblehead>;
}

export const TrendingBobbleheadsDisplay = ({ bobbleheads }: TrendingBobbleheadsDisplayProps) => {
  if (bobbleheads.length === 0) {
    return (
      <div
        className={'py-12 text-center'}
        data-slot={'trending-bobbleheads-empty'}
        data-testid={generateTestId('feature', 'trending-bobbleheads-empty-state')}
      >
        <TrendingUpIcon aria-hidden className={'mx-auto mb-4 size-12 text-muted-foreground/50'} />
        <p className={'text-muted-foreground'}>No trending bobbleheads available at this time.</p>
      </div>
    );
  }

  return (
    <div
      className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6'}
      data-slot={'trending-bobbleheads-grid'}
      data-testid={generateTestId('feature', 'trending-bobbleheads-grid')}
    >
      {bobbleheads.map((bobblehead) => (
        <TrendingBobbleheadCard bobblehead={bobblehead} key={bobblehead.id} />
      ))}
    </div>
  );
};

interface TrendingBobbleheadCardProps {
  bobblehead: TrendingBobblehead;
}

const TrendingBobbleheadCard = ({ bobblehead }: TrendingBobbleheadCardProps) => {
  const _hasImage = Boolean(bobblehead.imageUrl);

  // Extract publicId and generate blur placeholder for progressive loading
  const publicId = bobblehead.imageUrl ? extractPublicIdFromCloudinaryUrl(bobblehead.imageUrl) : '';
  const blurDataUrl = publicId ? generateBlurDataUrl(publicId) : undefined;

  // Map badge value to display text
  const _badgeText =
    bobblehead.badge === 'editor_pick' ? 'Pick'
    : bobblehead.badge === 'new_badge' ? 'New'
    : bobblehead.badge.charAt(0).toUpperCase() + bobblehead.badge.slice(1);

  return (
    <Link
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-md',
        'transition-all duration-300 hover:-translate-y-2 hover:shadow-xl',
        'dark:border-slate-700/50 dark:bg-slate-800',
      )}
      data-slot={'trending-bobblehead-card'}
      data-testid={generateTestId('feature', 'trending-bobblehead-card', bobblehead.id)}
      href={$path({
        route: '/bobbleheads/[bobbleheadSlug]',
        routeParams: { bobbleheadSlug: bobblehead.contentSlug },
      })}
    >
      {/* Image Section */}
      <div
        className={
          'relative aspect-square overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800'
        }
        data-slot={'trending-bobblehead-image-container'}
      >
        <Conditional isCondition={_hasImage}>
          <CldImage
            alt={bobblehead.characterName}
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
          <Badge variant={bobblehead.badge}>{_badgeText}</Badge>
        </div>

        {/* Gradient Overlay */}
        <div
          aria-hidden
          className={
            'absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100'
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
      <div className={'p-3'} data-slot={'trending-bobblehead-footer'}>
        <h3
          className={'line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white'}
          data-slot={'trending-bobblehead-name'}
        >
          {bobblehead.characterName}
        </h3>
        <div
          className={'mt-1 flex items-center justify-between text-xs text-slate-500'}
          data-slot={'trending-bobblehead-meta'}
        >
          <span data-slot={'trending-bobblehead-category'}>{bobblehead.category}</span>
          <span data-slot={'trending-bobblehead-year'}>{bobblehead.year}</span>
        </div>
      </div>
    </Link>
  );
};
