'use client';

import { CrownIcon, EyeIcon, HeartIcon, TrendingUpIcon, TrophyIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { FeaturedBobblehead } from '@/lib/queries/featured-content/featured-content-query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';

interface FeaturedBobbleheadDisplayProps extends ComponentTestIdProps {
  bobblehead: FeaturedBobblehead;
}

export const FeaturedBobbleheadDisplay = ({ bobblehead, testId }: FeaturedBobbleheadDisplayProps) => {
  const _hasPhoto = Boolean(bobblehead.imageUrl);
  const _publicId = _hasPhoto ? extractPublicIdFromCloudinaryUrl(bobblehead.imageUrl ?? '') : null;
  const _blurDataUrl = _publicId ? generateBlurDataUrl(_publicId) : undefined;
  const _hasPhotoAndPublicId = _hasPhoto && Boolean(_publicId);
  const _hasValidRouteParams = Boolean(
    bobblehead.contentSlug && bobblehead.collectionSlug && bobblehead.ownerUsername,
  );

  const heroTestId = testId || generateTestId('feature', 'bobblehead-card');
  const cardTestId = `${heroTestId}-card`;
  const imageTestId = `${heroTestId}-image`;
  const badgeTestId = `${heroTestId}-badge`;
  const topRatedCardTestId = `${heroTestId}-top-rated-card`;
  const valueGrowthCardTestId = `${heroTestId}-value-growth-card`;

  const bobbleheadHref =
    _hasValidRouteParams ?
      $path({
        route: '/user/[username]/collection/[collectionSlug]/bobbleheads/[bobbleheadSlug]',
        routeParams: {
          bobbleheadSlug: bobblehead.contentSlug!,
          collectionSlug: bobblehead.collectionSlug!,
          username: bobblehead.ownerUsername!,
        },
        searchParams: {},
      })
    : '#';

  return (
    <div className={'relative lg:pl-8'} data-slot={'hero-featured-bobblehead'} data-testid={heroTestId}>
      {/* Main Feature Card */}
      <div className={'relative'}>
        <Link
          className={`group relative block overflow-hidden rounded-3xl border border-primary/20
            bg-linear-to-br from-card/80 to-background/50 p-2 shadow-2xl backdrop-blur-sm
            dark:border-border/50 dark:from-secondary/80 dark:to-background/80`}
          data-slot={'hero-featured-card'}
          data-testid={cardTestId}
          href={bobbleheadHref}
        >
          <div className={'relative aspect-square overflow-hidden rounded-2xl'}>
            {/* Bobblehead Image */}
            <Conditional
              fallback={
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-linear-to-br
                    from-orange-100 to-orange-200 dark:from-slate-700 dark:to-slate-800`}
                >
                  <TrophyIcon aria-hidden className={'size-20 text-orange-300 dark:text-slate-600'} />
                </div>
              }
              isCondition={_hasPhotoAndPublicId}
            >
              <CldImage
                alt={bobblehead.contentName ?? 'bobblehead image'}
                blurDataURL={_blurDataUrl}
                className={
                  'absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-110'
                }
                data-slot={'hero-featured-image'}
                data-testid={imageTestId}
                fill
                placeholder={_blurDataUrl ? 'blur' : 'empty'}
                sizes={'(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px'}
                src={_publicId!}
              />
            </Conditional>

            <div className={'absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent'} />

            {/* Overlay Content */}
            <div className={'absolute right-0 bottom-0 left-0 p-6'}>
              {/* Editor's Pick Badge */}
              <Badge
                data-slot={'hero-featured-badge'}
                data-testid={badgeTestId}
                icon={<CrownIcon aria-hidden />}
                variant={'editor_pick'}
              >
                Editor&apos;s Pick
              </Badge>

              <h3 className={'mt-3 text-2xl font-bold text-white drop-shadow-lg'}>
                {bobblehead.contentName}
              </h3>

              {/* Description */}
              <Conditional isCondition={Boolean(bobblehead.description)}>
                <p className={'mt-1 text-slate-300'}>{bobblehead.description}</p>
              </Conditional>

              {/* Stats */}
              <div className={'mt-4 flex items-center gap-4 text-sm text-slate-300'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-4 text-red-400'} />
                  {bobblehead.likes.toLocaleString()}
                </span>
                <span className={'flex items-center gap-1'}>
                  <EyeIcon aria-hidden className={'size-4'} />
                  {bobblehead.viewCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Floating Cards */}
        {/* Top Rated This Week Card */}
        <div
          aria-hidden
          className={`absolute top-8 -left-8 -rotate-12 transform animate-bounce rounded-2xl border
            border-primary/20 bg-card/90 p-3 shadow-xl backdrop-blur-sm motion-reduce:animate-none
            dark:border-border/50 dark:bg-secondary/90`}
          data-slot={'hero-floating-card'}
          data-testid={topRatedCardTestId}
          style={{ animationDuration: '3s' }}
        >
          <div className={'flex items-center gap-3'}>
            <div className={'rounded-xl bg-linear-to-br from-gradient-from to-gradient-to p-2'}>
              <TrophyIcon aria-hidden className={'size-5 text-primary-foreground'} />
            </div>
            <div>
              <div className={'text-sm font-semibold text-foreground'}>Top Rated</div>
              <div className={'text-xs text-muted-foreground'}>This Week</div>
            </div>
          </div>
        </div>

        {/* Value Growth Card */}
        <div
          aria-hidden
          className={`absolute -right-4 bottom-20 rotate-6 transform animate-bounce rounded-2xl border
            border-primary/20 bg-card/90 p-3 shadow-xl backdrop-blur-sm motion-reduce:animate-none
            dark:border-border/50 dark:bg-secondary/90`}
          data-slot={'hero-floating-card'}
          data-testid={valueGrowthCardTestId}
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        >
          <div className={'flex items-center gap-3'}>
            <div className={'rounded-xl bg-linear-to-br from-success to-new p-2'}>
              <TrendingUpIcon aria-hidden className={'size-5 text-success-foreground'} />
            </div>
            <div>
              <div className={'text-sm font-semibold text-foreground'}>+23%</div>
              <div className={'text-xs text-muted-foreground'}>Value Growth</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
