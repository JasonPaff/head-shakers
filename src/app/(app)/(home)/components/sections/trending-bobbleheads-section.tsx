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
      className={
        'bg-gradient-to-br from-muted via-background to-background py-20 dark:from-secondary dark:via-background dark:to-background'
      }
      data-slot={'trending-bobbleheads-section'}
      data-testid={generateTestId('layout', 'trending-bobbleheads-section')}
    >
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'
            }
          >
            <FlameIcon aria-hidden className={'size-8 text-trending'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-foreground md:text-5xl'}>Trending Now</h2>
          <p className={'mt-4 max-w-2xl text-lg text-muted-foreground'}>
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
        <div className={'mt-12 text-center'}>
          <Button
            asChild
            className={
              'group bg-gradient-to-r from-gradient-from to-trending px-8 text-lg font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:from-orange-600 hover:to-red-600'
            }
            size={'lg'}
          >
            <Link href={$path({ route: '/browse/search' })}>
              Explore All Bobbleheads
              <ArrowRightIcon
                aria-hidden
                className={'ml-2 size-5 transition-transform group-hover:translate-x-1'}
              />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
