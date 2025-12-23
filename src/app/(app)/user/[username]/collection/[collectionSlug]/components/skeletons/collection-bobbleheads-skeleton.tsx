import { Skeleton } from '@/components/ui/skeleton';

import { BobbleheadCardSkeleton } from './bobblehead-card-skeleton';

export const CollectionBobbleheadsSkeleton = () => (
  <div>
    <div className={'mb-4 flex items-center justify-between'}>
      {/* Section Title */}
      <Skeleton className={'h-8 w-80'} />

      {/* Add Bobblehead Button */}
      <Skeleton className={'h-10 w-32'} />
    </div>

    {/* Filter Controls */}
    <div className={'mb-4 flex justify-between'}>
      <div className={'flex gap-2'}>
        <Skeleton className={'h-10 w-32'} />
        <Skeleton className={'h-10 w-32'} />
      </div>
      <div className={'flex gap-2'}>
        <Skeleton className={'h-10 w-64'} /> {/* Search */}
        <Skeleton className={'h-10 w-48'} /> {/* Sort */}
      </div>
    </div>

    {/* Bobblehead Grid */}
    <div className={'mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: 6 }).map((_, i) => (
        <BobbleheadCardSkeleton key={i} />
      ))}
    </div>
  </div>
);
