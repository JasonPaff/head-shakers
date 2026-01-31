import { ArrowRightIcon, LayersIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';
import { Suspense } from 'react';

import { FeaturedCollectionsAsync } from '@/app/(app)/(home)/components/async/featured-collections-async';
import { FeaturedCollectionsSkeleton } from '@/app/(app)/(home)/components/skeleton/featured-collections-skeleton';
import { Button } from '@/components/ui/button';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { generateTestId } from '@/lib/test-ids';

export const FeaturedCollectionsSection = () => {
  return (
    <section
      className={'bg-card py-16 sm:py-20 lg:py-24 dark:bg-background'}
      data-testid={generateTestId('layout', 'featured-collections-section')}
    >
      <div className={'container mx-auto px-4 sm:px-6'}>
        <div className={'mb-10 flex flex-col items-center text-center sm:mb-12'}>
          <div
            className={`mb-4 flex size-14 items-center justify-center rounded-full
              bg-gradient-to-br from-orange-100 to-amber-100 shadow-sm
              transition-transform duration-300 hover:scale-110
              sm:size-16
              dark:from-orange-900/30 dark:to-amber-900/30`}
          >
            <LayersIcon aria-hidden className={'size-7 text-primary sm:size-8'} />
          </div>
          <h2
            className={`text-3xl font-bold tracking-tight text-foreground
              sm:text-4xl md:text-5xl`}
          >
            Featured Collections
          </h2>
          <p className={'mt-3 max-w-2xl text-base text-muted-foreground sm:mt-4 sm:text-lg'}>
            Explore curated collections from our most passionate collectors
          </p>
        </div>

        <ErrorBoundary name={'featured-collections'}>
          <Suspense fallback={<FeaturedCollectionsSkeleton />}>
            <FeaturedCollectionsAsync />
          </Suspense>
        </ErrorBoundary>

        {/* View All Button */}
        <div className={'mt-10 text-center sm:mt-12'}>
          <Button
            asChild
            className={`group border-primary/30 px-6 text-primary shadow-sm
              transition-all duration-300
              hover:border-primary/50 hover:bg-accent hover:text-primary hover:shadow-md
              active:scale-[0.98]
              sm:px-8
              dark:hover:bg-secondary`}
            size={'lg'}
            variant={'outline'}
          >
            <Link href={$path({ route: '/browse' })}>
              View All Collections
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
