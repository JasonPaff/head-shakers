import { Skeleton } from '@/components/ui/skeleton';

import { FeaturedCardSkeleton } from './featured-card-skeleton';

export const FeaturedTabbedContentSkeleton = () => (
  <section>
    <div className={'mb-6 flex items-center justify-between'}>
      {/* Tab navigation */}
      <div className={'flex space-x-1 rounded-lg bg-muted p-1'}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton className={'h-10 w-24'} key={i} />
        ))}
      </div>
    </div>

    {/* Content grid */}
    <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <FeaturedCardSkeleton key={i} />
      ))}
    </div>
  </section>
);