import { SignUpButton } from '@clerk/nextjs';
import { ArrowRightIcon, SearchIcon, SparklesIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedBobbleheadAsync } from '@/app/(app)/(home)/components/async/featured-bobblehead-async';
import { PlatformStatsAsync } from '@/app/(app)/(home)/components/async/platform-stats-async';
import { FeaturedBobbleheadSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-bobblehead-skeleton';
import { PlatformStatsSkeleton } from '@/app/(app)/(home)/components/skeleton/platform-stats-skeleton';
import { AuthContent } from '@/components/ui/auth';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

/**
 * Hero section for home page with orange accent color scheme
 *
 * Server-side component that displays:
 * - Animated background with gradient orbs and grid pattern
 * - Main heading and description
 * - CTA buttons with auth-aware rendering
 * - Platform statistics via async component
 * - Featured bobblehead showcase via async component
 * - Wave divider with light/dark mode support
 *
 * Light mode: white/cream background with orange accents
 * Dark mode: dark slate background with orange accents
 */
export const HeroSection = () => {
  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-b from-orange-50 via-white to-orange-50/50
        dark:from-slate-900 dark:via-slate-800 dark:to-slate-900`}
      data-slot={'hero-section'}
      data-testid={generateTestId('feature', 'hero-section')}
    >
      {/* Animated Background Elements */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0
        bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
          from-orange-200/40 via-transparent to-transparent dark:from-orange-900/20`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0
          bg-[linear-gradient(to_right,#f9731620_1px,transparent_1px),linear-gradient(to_bottom,#f9731620_1px,transparent_1px)]
          bg-[size:24px_24px]
          dark:bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute top-20 left-1/4 size-96 rounded-full bg-gradient-to-r
          from-orange-300/40 to-amber-300/40 blur-3xl dark:from-orange-500/30 dark:to-amber-500/30`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute top-60 right-1/4 size-96 rounded-full bg-gradient-to-l
          from-amber-300/30 to-orange-300/30 blur-3xl dark:from-amber-500/20 dark:to-orange-500/20`}
      />

      <div className={'relative container mx-auto px-6 py-20 lg:py-32'}>
        <div className={'grid items-center gap-12 lg:grid-cols-2 lg:gap-16'}>
          {/* Left Content */}
          <div className={'space-y-8'}>
            {/* Badge */}
            <div
              className={`inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100/80
                px-4 py-2 backdrop-blur-sm dark:border-orange-500/30 dark:bg-orange-500/10`}
            >
              <SparklesIcon aria-hidden className={'size-4 text-orange-600 dark:text-orange-400'} />
              <span className={'text-sm font-medium text-orange-700 dark:text-orange-300'}>
                The Premier Bobblehead Community
              </span>
            </div>

            {/* Main Heading */}
            <h1
              className={`text-5xl leading-tight font-extrabold tracking-tight
                text-foreground md:text-6xl lg:text-7xl`}
            >
              Collect, Share, and{' '}
              <span
                className={`bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text
                  text-transparent dark:from-orange-400 dark:via-amber-400 dark:to-yellow-400`}
              >
                Discover
              </span>
              <br />
              Bobbleheads
            </h1>

            {/* Description */}
            <p className={'max-w-xl text-lg text-muted-foreground md:text-xl'}>
              Build your digital bobblehead collection, connect with other collectors, and discover rare finds
              from around the world.
            </p>

            {/* CTA Buttons */}
            <div className={'flex flex-wrap gap-4'}>
              <AuthContent
                fallback={
                  <Button
                    asChild
                    className={`group bg-gradient-to-r from-gradient-from to-gradient-to px-8
                      text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25
                      hover:from-orange-600 hover:to-amber-600`}
                    size={'lg'}
                  >
                    <SignUpButton mode={'modal'}>Start Your Collection</SignUpButton>
                  </Button>
                }
                loadingSkeleton={<Skeleton className={'h-11 w-52 rounded-md'} />}
              >
                <Button
                  asChild
                  className={`group bg-gradient-to-r from-gradient-from to-gradient-to px-8 text-lg
                    font-semibold text-primary-foreground shadow-lg shadow-primary/25
                    hover:from-orange-600 hover:to-amber-600`}
                  size={'lg'}
                >
                  <Link href={$path({ route: '/dashboard/collection' })}>
                    <span>My Collection</span>
                    <ArrowRightIcon
                      className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
                    />
                  </Link>
                </Button>
              </AuthContent>

              <Button
                asChild
                className={`border-primary/30 bg-card/80 px-8 text-lg text-foreground
                  backdrop-blur-sm hover:bg-accent dark:border-border
                  dark:bg-secondary/50 dark:hover:bg-secondary`}
                size={'lg'}
                variant={'outline'}
              >
                <Link href={$path({ route: '/browse' })}>
                  <SearchIcon aria-hidden className={'mr-2 size-5'} />
                  Browse Collections
                </Link>
              </Button>

              <Button
                asChild
                className={`border-primary/30 bg-card/80 px-8 text-lg text-foreground
                  backdrop-blur-sm hover:bg-accent dark:border-border
                  dark:bg-secondary/50 dark:hover:bg-secondary`}
                size={'lg'}
                variant={'outline'}
              >
                <Link href={$path({ route: '/browse/search' })}>Explore Bobbleheads</Link>
              </Button>
            </div>

            {/* Stats Row */}
            <ErrorBoundary name={'hero-platform-stats'}>
              <Suspense fallback={<PlatformStatsSkeleton />}>
                <PlatformStatsAsync />
              </Suspense>
            </ErrorBoundary>
          </div>

          {/* Right Content - Featured Bobblehead Showcase */}
          <ErrorBoundary name={'featured-bobblehead-showcase'}>
            <Suspense fallback={<FeaturedBobbleheadSkeleton />}>
              <FeaturedBobbleheadAsync />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Wave Divider */}
      <div className={'absolute right-0 bottom-0 left-0'}>
        <svg className={'w-full'} fill={'none'} viewBox={'0 0 1440 120'} xmlns={'http://www.w3.org/2000/svg'}>
          <path
            className={'fill-card dark:fill-background'}
            d={`M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960
              60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120
              1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z`}
          />
        </svg>
      </div>
    </section>
  );
};
