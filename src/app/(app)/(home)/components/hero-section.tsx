import { SignUpButton } from '@clerk/nextjs';
import { ArrowRight, Search, Sparkles } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { HeroFeaturedBobbleheadAsync } from '@/app/(app)/(home)/components/async/hero-featured-bobblehead-async';
import { HeroStatsAsync } from '@/app/(app)/(home)/components/async/hero-stats-async';
import { HeroFeaturedBobbleheadSkeleton } from '@/app/(app)/(home)/components/skeletons/hero-featured-bobblehead-skeleton';
import { HeroStatsSkeleton } from '@/app/(app)/(home)/components/skeletons/hero-stats-skeleton';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface HeroSectionProps {
  currentUserId: null | string;
}

/**
 * Hero section for home page with modern dark theme design
 *
 * Server-side component that displays:
 * - Animated background with gradient orbs and grid pattern
 * - Main heading and description
 * - CTA buttons with auth-aware rendering
 * - Platform statistics via async component
 * - Featured bobblehead showcase via async component
 * - Wave divider with dark mode support
 */
export const HeroSection = ({ currentUserId }: HeroSectionProps) => {
  return (
    <section
      className={
        'relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900'
      }
      data-slot={'hero-section'}
    >
      {/* Animated Background Elements */}
      <div
        aria-hidden={'true'}
        className={
          'pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-transparent to-transparent'
        }
      />
      <div
        aria-hidden={'true'}
        className={
          'pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'
        }
      />
      <div
        aria-hidden={'true'}
        className={
          'pointer-events-none absolute top-20 left-1/4 size-96 rounded-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 blur-3xl'
        }
      />
      <div
        aria-hidden={'true'}
        className={
          'pointer-events-none absolute top-60 right-1/4 size-96 rounded-full bg-gradient-to-l from-amber-500/20 to-orange-500/20 blur-3xl'
        }
      />

      <div className={'relative container mx-auto px-6 py-20 lg:py-32'}>
        <div className={'grid items-center gap-12 lg:grid-cols-2 lg:gap-16'}>
          {/* Left Content */}
          <div className={'space-y-8'}>
            {/* Badge */}
            <div
              className={
                'inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 backdrop-blur-sm'
              }
            >
              <Sparkles className={'size-4 text-orange-400'} />
              <span className={'text-sm font-medium text-orange-300'}>
                The Premier Bobblehead Community
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className={
                'text-5xl leading-tight font-extrabold tracking-tight text-white md:text-6xl lg:text-7xl'
              }
            >
              Collect, Share, and{' '}
              <span
                className={
                  'bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent'
                }
              >
                Discover
              </span>
              <br />
              Bobbleheads
            </h1>

            {/* Description */}
            <p className={'max-w-xl text-lg text-slate-300 md:text-xl'}>
              Build your digital bobblehead collection, connect with other collectors, and discover
              rare finds from around the world.
            </p>

            {/* CTA Buttons */}
            <div className={'flex flex-wrap gap-4'}>
              <AuthContent
                fallback={
                  <Button
                    asChild
                    className={
                      'group bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600'
                    }
                    size={'lg'}
                  >
                    <SignUpButton mode={'modal'}>
                      <span>Start Your Collection</span>
                      <ArrowRight
                        className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                      />
                    </SignUpButton>
                  </Button>
                }
                loadingSkeleton={<Skeleton className={'h-11 w-52 rounded-md'} />}
              >
                <Button
                  asChild
                  className={
                    'group bg-gradient-to-r from-orange-500 to-amber-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-600'
                  }
                  size={'lg'}
                >
                  <Link href={$path({ route: '/dashboard/collection' })}>
                    <span>My Collection</span>
                    <ArrowRight
                      className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                    />
                  </Link>
                </Button>
              </AuthContent>

              <Button
                asChild
                className={
                  'border-slate-600 bg-slate-800/50 px-8 text-lg text-white backdrop-blur-sm hover:bg-slate-700/50'
                }
                size={'lg'}
                variant={'outline'}
              >
                <Link href={$path({ route: '/browse' })}>
                  <Search className={'mr-2 size-5'} />
                  Browse Collections
                </Link>
              </Button>

              <Button
                asChild
                className={
                  'border-slate-600 bg-slate-800/50 px-8 text-lg text-white backdrop-blur-sm hover:bg-slate-700/50'
                }
                size={'lg'}
                variant={'outline'}
              >
                <Link href={$path({ route: '/browse/search' })}>Explore Bobbleheads</Link>
              </Button>
            </div>

            {/* Stats Row */}
            <Suspense fallback={<HeroStatsSkeleton />}>
              <HeroStatsAsync />
            </Suspense>
          </div>

          {/* Right Content - Featured Bobblehead Showcase */}
          <Suspense fallback={<HeroFeaturedBobbleheadSkeleton />}>
            <HeroFeaturedBobbleheadAsync currentUserId={currentUserId} />
          </Suspense>
        </div>
      </div>

      {/* Wave Divider */}
      <div className={'absolute right-0 bottom-0 left-0'}>
        <svg className={'w-full'} fill={'none'} viewBox={'0 0 1440 120'} xmlns={'http://www.w3.org/2000/svg'}>
          <path
            className={'fill-white dark:fill-slate-950'}
            d={
              'M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z'
            }
          />
        </svg>
      </div>
    </section>
  );
};
