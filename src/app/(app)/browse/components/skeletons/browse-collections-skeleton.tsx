import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BrowseCollectionsGridSkeletonProps {
  count?: number;
}

interface BrowseCollectionsSkeletonProps {
  count?: number;
}

export const BrowseCollectionsSkeleton = ({ count = 8 }: BrowseCollectionsSkeletonProps) => {
  return (
    <div className={'space-y-6'}>
      {/* Filter Skeleton */}
      <div className={'space-y-4'}>
        {/* Search Bar */}
        <Skeleton className={'h-10 w-full'} />

        {/* Filter Pills */}
        <div className={'flex flex-wrap gap-2'}>
          <Skeleton className={'h-8 w-24'} />
          <Skeleton className={'h-8 w-32'} />
          <Skeleton className={'h-8 w-28'} />
        </div>
      </div>

      {/* Grid of Collection Cards */}
      <div className={'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {Array.from({ length: count }).map((_, index) => (
          <BrowseCollectionCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-5 w-32'} />
        <div className={'flex gap-2'}>
          <Skeleton className={'size-10'} />
          <Skeleton className={'size-10'} />
          <Skeleton className={'size-10'} />
        </div>
      </div>
    </div>
  );
};

/**
 * Grid-only skeleton for client-side loading states
 * Used when filters are already visible and only the grid content is loading
 */
export const BrowseCollectionsGridSkeleton = ({ count = 8 }: BrowseCollectionsGridSkeletonProps) => {
  return (
    <div className={'space-y-6'}>
      {/* Grid of Collection Cards */}
      <div className={'grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'}>
        {Array.from({ length: count }).map((_, index) => (
          <BrowseCollectionCardSkeleton key={index} />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-5 w-32'} />
        <div className={'flex gap-2'}>
          <Skeleton className={'size-10'} />
          <Skeleton className={'size-10'} />
          <Skeleton className={'size-10'} />
        </div>
      </div>
    </div>
  );
};

export const BrowseCollectionCardSkeleton = () => {
  return (
    <Card className={'h-full'}>
      {/* Image Skeleton */}
      <Skeleton className={'aspect-square w-full rounded-t-lg'} />

      {/* Card Header */}
      <CardHeader className={'space-y-2'}>
        <Skeleton className={'h-6 w-3/4'} /> {/* Title */}
        <Skeleton className={'h-4 w-full'} /> {/* Description line 1 */}
        <Skeleton className={'h-4 w-2/3'} /> {/* Description line 2 */}
      </CardHeader>

      {/* Card Content */}
      <CardContent className={'space-y-4'}>
        {/* Owner */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'size-6 rounded-full'} /> {/* Avatar */}
          <Skeleton className={'h-4 w-24'} /> {/* Username */}
        </div>

        {/* Stats */}
        <div className={'flex items-center justify-between'}>
          <Skeleton className={'h-4 w-12'} /> {/* Item count */}
          <Skeleton className={'h-4 w-12'} /> {/* Like count */}
        </div>
      </CardContent>
    </Card>
  );
};
