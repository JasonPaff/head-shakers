import { ArrowRightIcon, FlameIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';

import { TrendingBobbleheadsAsync } from '../async/trending-bobbleheads-async';
import { TrendingBobbleheadsSkeleton } from '../skeleton/trending-bobbleheads-skeleton';

export const TrendingBobbleheadsSection = () => {
  return (
    <section
      className={
        'bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/30 py-20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900'
      }
    >
      <div className={'container mx-auto px-6'}>
        {/* Section Header */}
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={
              'mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30'
            }
          >
            <FlameIcon aria-hidden className={'size-8 text-red-600 dark:text-red-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Trending Now
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
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
              'group bg-gradient-to-r from-orange-500 to-red-500 px-8 text-lg font-semibold shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-red-600'
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
