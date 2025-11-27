import { ArrowRightIcon, LayersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-collections-skeleton';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';

export const FeaturedCollectionsSection = () => {
  return (
    <section className={'bg-white py-20 dark:bg-slate-950'}>
      <div className={'container mx-auto px-6'}>
        <div className={'mb-12 flex flex-col items-center text-center'}>
          <div
            className={`mb-4 flex size-16 items-center justify-center rounded-full bg-gradient-to-br
                from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30`}
          >
            <LayersIcon aria-hidden className={'size-8 text-orange-600 dark:text-orange-400'} />
          </div>
          <h2 className={'text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white'}>
            Featured Collections
          </h2>
          <p className={'mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400'}>
            Explore curated collections from our most passionate collectors
          </p>
        </div>

        <ErrorBoundary name={'featured-collections'}>
          <Suspense fallback={<FeaturedCollectionsSkeleton />}>
            <FeaturedCollectionsAsync />
          </Suspense>
        </ErrorBoundary>

        {/* View All Button */}
        <div className={'mt-12 text-center'}>
          <Button
            asChild
            className={`group border-orange-500/30 text-orange-600 hover:bg-orange-50
                hover:text-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/50`}
            size={'lg'}
            variant={'outline'}
          >
            <Link href={$path({ route: '/browse' })}>
              View All Collections
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
