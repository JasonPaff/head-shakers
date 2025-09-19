import { Skeleton } from '@/components/ui/skeleton';

import { FeaturedCardSkeleton } from './featured-card-skeleton';

export const FeaturedHeroSkeleton = () => (
  <section>
    <div className={'mb-6'}>
      <Skeleton className={'mb-2 h-8 w-48'} /> {/* "Featured This Week" title */}
      <Skeleton className={'h-4 w-96'} /> {/* Description */}
    </div>
    <div className={'grid grid-cols-1 gap-6 lg:grid-cols-3'}>
      {/* Hero banner card (spans 2 columns) */}
      <FeaturedCardSkeleton isHero={true} />
      {/* Collection of week card */}
      <FeaturedCardSkeleton />
    </div>
  </section>
);
