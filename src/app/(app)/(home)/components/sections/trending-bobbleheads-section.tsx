import { ArrowRightIcon, FlameIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { generateTestId } from '@/lib/test-ids';

import { TrendingBobbleheadsAsync } from '../async/trending-bobbleheads-async';
import { TrendingBobbleheadsSkeleton } from '../skeleton/trending-bobbleheads-skeleton';

export const TrendingBobbleheadsSection = () => {
  return (
    <section
      className={`bg-gradient-to-br from-muted via-background to-background
        py-16 sm:py-20 lg:py-24
        dark:from-secondary dark:via-background dark:to-background`}
      data-slot={'trending-bobbleheads-section'}
      data-testid={generateTestId('layout', 'trending-bobbleheads-section')}
    >
      <div className={'container mx-auto px-4 sm:px-6'}>
        {/* Section Header */}
        <div className={'mb-10 flex flex-col items-center text-center sm:mb-12'}>
          <div
            className={`mb-4 flex size-14 items-center justify-center rounded-full
              bg-gradient-to-br from-red-100 to-orange-100 shadow-sm
              transition-transform duration-300 hover:scale-110
              sm:size-16
              dark:from-red-900/30 dark:to-orange-900/30`}
          >
            <FlameIcon aria-hidden className={'size-7 text-trending sm:size-8'} />
          </div>
          <h2
            className={`text-3xl font-bold tracking-tight text-foreground
              sm:text-4xl md:text-5xl`}
          >
            Trending Now
          </h2>
          <p className={'mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg'}>
            The most popular bobbleheads this week from collectors worldwide
          </p>
        </div>

        {/* Trending Bobbleheads Grid */}
        <ErrorBoundary name={'trending-bobbleheads'}>
          <Suspense fallback={<TrendingBobbleheadsSkeleton />}>
            <TrendingBobbleheadsAsync />
          </Suspense>
        </ErrorBoundary>

        {/* View All Button */}
        <div className={'mt-10 text-center sm:mt-12'}>
          <Button
            asChild
            className={`group bg-gradient-to-r from-gradient-from to-trending px-6 text-base
              font-semibold text-primary-foreground shadow-lg shadow-primary/25
              transition-all duration-300
              hover:scale-[1.02] hover:from-orange-600 hover:to-red-600 hover:shadow-xl hover:shadow-primary/30
              active:scale-[0.98]
              sm:px-8 sm:text-lg`}
            size={'lg'}
          >
            <Link href={$path({ route: '/browse/search' })}>
              Explore All Bobbleheads
              <ArrowRightIcon
                aria-hidden
                className={
                  'ml-2 size-4 transition-transform duration-300 group-hover:translate-x-1 sm:size-5'
                }
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
