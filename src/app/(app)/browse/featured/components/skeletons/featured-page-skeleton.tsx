import { Skeleton } from '@/components/ui/skeleton';

import { FeaturedHeroSkeleton } from './featured-hero-skeleton';
import { FeaturedTabbedContentSkeleton } from './featured-tabbed-content-skeleton';

export const FeaturedPageSkeleton = () => (
  <div className={'container mx-auto px-4 py-8'}>
    {/* Static Header - renders immediately */}
    <div className={'mb-8'}>
      <h1 className={'text-3xl font-bold tracking-tight'}>Featured Content</h1>
      <p className={'mt-2 text-muted-foreground'}>
        Discover the best collections, bobbleheads, and collectors from our community
      </p>
    </div>

    <div className={'space-y-8'}>
      {/* Hero Banner Skeleton */}
      <FeaturedHeroSkeleton />

      {/* Tabbed Content Skeleton */}
      <FeaturedTabbedContentSkeleton />

      {/* Static Call to Action - renders immediately */}
      <section className={'rounded-lg bg-muted/30 p-8 text-center'}>
        <h3 className={'mb-2 text-xl font-semibold'}>Want to be featured?</h3>
        <p className={'mb-4 text-muted-foreground'}>
          Share your amazing collections and connect with other collectors to get noticed by our community
        </p>
        <div className={'flex justify-center gap-3'}>
          <Skeleton className={'h-10 w-32'} />
          <Skeleton className={'h-10 w-28'} />
        </div>
      </section>
    </div>
  </div>
);
