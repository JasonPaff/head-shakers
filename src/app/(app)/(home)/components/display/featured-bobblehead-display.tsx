'use client';

import { CrownIcon, EyeIcon, HeartIcon, TrendingUpIcon, TrophyIcon } from 'lucide-react';
import { CldImage } from 'next-cloudinary';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { generateTestId } from '@/lib/test-ids';
import { extractPublicIdFromCloudinaryUrl, generateBlurDataUrl } from '@/lib/utils/cloudinary.utils';

interface FeaturedBobbleheadDisplayProps extends ComponentTestIdProps {
  bobblehead: {
    description: null | string;
    id: string;
    likeCount: number;
    name: string;
    photoUrl: null | string;
    userId: string;
    viewCount: number;
  };
}

export const FeaturedBobbleheadDisplay = ({ bobblehead, testId }: FeaturedBobbleheadDisplayProps) => {
  const _hasPhoto = Boolean(bobblehead.photoUrl);
  const _publicId = _hasPhoto ? extractPublicIdFromCloudinaryUrl(bobblehead.photoUrl!) : null;
  const _blurDataUrl = _publicId ? generateBlurDataUrl(_publicId) : undefined;
  const _hasPhotoAndPublicId = _hasPhoto && Boolean(_publicId);

  const heroTestId = testId || generateTestId('feature', 'bobblehead-card');
  const cardTestId = `${heroTestId}-card`;
  const imageTestId = `${heroTestId}-image`;
  const badgeTestId = `${heroTestId}-badge`;
  const topRatedCardTestId = `${heroTestId}-top-rated-card`;
  const valueGrowthCardTestId = `${heroTestId}-value-growth-card`;

  return (
    <div className={'relative lg:pl-8'} data-slot={'hero-featured-bobblehead'} data-testid={heroTestId}>
      {/* Main Feature Card */}
      <div className={'relative'}>
        <Link
          className={`group relative block overflow-hidden rounded-3xl border border-orange-200/50
            bg-gradient-to-br from-white/80 to-orange-50/50 p-2 shadow-2xl backdrop-blur-sm
            dark:border-slate-700/50 dark:from-slate-800/80 dark:to-slate-900/80`}
          data-slot={'hero-featured-card'}
          data-testid={cardTestId}
          href={$path({
            route: '/bobbleheads/[bobbleheadSlug]',
            routeParams: { bobbleheadSlug: bobblehead.id },
          })}
        >
          <div className={'relative aspect-square overflow-hidden rounded-2xl'}>
            {/* Bobblehead Image */}
            <Conditional
              fallback={
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br
                    from-orange-100 to-orange-200 dark:from-slate-700 dark:to-slate-800`}
                >
                  <TrophyIcon aria-hidden className={'size-20 text-orange-300 dark:text-slate-600'} />
                </div>
              }
              isCondition={_hasPhotoAndPublicId}
            >
              <CldImage
                alt={bobblehead.name}
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

            <div className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent'} />

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

              <h3 className={'mt-3 text-2xl font-bold text-white drop-shadow-lg'}>{bobblehead.name}</h3>

              {/* Description */}
              <Conditional isCondition={Boolean(bobblehead.description)}>
                <p className={'mt-1 text-slate-300'}>{bobblehead.description}</p>
              </Conditional>

              {/* Stats */}
              <div className={'mt-4 flex items-center gap-4 text-sm text-slate-300'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-4 text-red-400'} />
                  {bobblehead.likeCount.toLocaleString()}
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
            border-orange-200/50 bg-white/90 p-3 shadow-xl backdrop-blur-sm dark:border-slate-600/50
            dark:bg-slate-800/90`}
          data-slot={'hero-floating-card'}
          data-testid={topRatedCardTestId}
          style={{ animationDuration: '3s' }}
        >
          <div className={'flex items-center gap-3'}>
            <div className={'rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2'}>
              <TrophyIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <div className={'text-sm font-semibold text-slate-900 dark:text-white'}>Top Rated</div>
              <div className={'text-xs text-slate-500 dark:text-slate-400'}>This Week</div>
            </div>
          </div>
        </div>

        {/* Value Growth Card */}
        <div
          aria-hidden
          className={`absolute -right-4 bottom-20 rotate-6 transform animate-bounce rounded-2xl border
            border-orange-200/50 bg-white/90 p-3 shadow-xl backdrop-blur-sm dark:border-slate-600/50
            dark:bg-slate-800/90`}
          data-slot={'hero-floating-card'}
          data-testid={valueGrowthCardTestId}
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        >
          <div className={'flex items-center gap-3'}>
            <div className={'rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-2'}>
              <TrendingUpIcon aria-hidden className={'size-5 text-white'} />
            </div>
            <div>
              <div className={'text-sm font-semibold text-slate-900 dark:text-white'}>+23%</div>
              <div className={'text-xs text-slate-500 dark:text-slate-400'}>Value Growth</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
