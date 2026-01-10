import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading state for BobbleheadCard component
 * Matches grid variant layout: header, 256px photo, content, and footer
 */
const BobbleheadCardSkeleton = () => (
  <Card className={'h-[480px] overflow-hidden'} data-slot={'bobblehead-card-skeleton'}>
    {/* Header */}
    <CardHeader className={'h-14 flex-shrink-0'} data-slot={'bobblehead-card-skeleton-header'}>
      <Skeleton className={'h-6 w-3/4'} />
    </CardHeader>

    {/* Photo Container - matches mx-6 h-64 from BobbleheadCard */}
    <div className={'mx-6 h-64 flex-shrink-0 overflow-hidden rounded-lg'}>
      <Skeleton className={'h-full w-full'} />
    </div>

    {/* Description */}
    <CardContent className={'h-20 flex-shrink-0 py-3'} data-slot={'bobblehead-card-skeleton-content'}>
      <Skeleton className={'mb-2 h-4 w-full'} />
      <Skeleton className={'mb-2 h-4 w-5/6'} />
      <Skeleton className={'h-4 w-3/4'} />
    </CardContent>

    {/* Separator */}
    <div className={'mx-6 border-t'} />

    {/* Footer */}
    <CardFooter
      className={'mt-auto flex items-center justify-between pt-4'}
      data-slot={'bobblehead-card-skeleton-footer'}
    >
      <div className={'flex items-center gap-2'}>
        {/* Like Button */}
        <Skeleton className={'h-8 w-12'} />
        {/* Share Button */}
        <Skeleton className={'size-8'} />
      </div>

      {/* View Details Button */}
      <Skeleton className={'h-8 w-28'} />
    </CardFooter>
  </Card>
);

/**
 * Skeleton loading state for CollectionBobbleheads/BobbleheadGrid component
 * Matches layout: search controls bar, results count, and 6-card grid
 */
export const CollectionBobbleheadsSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading bobbleheads'}
      data-slot={'collection-bobbleheads-skeleton'}
    >
      {/* Search and Sort Controls - matches SearchControls layout */}
      <div
        className={'mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}
        data-slot={'collection-bobbleheads-skeleton-controls'}
      >
        {/* Search Input */}
        <Skeleton className={'h-10 w-full sm:w-80'} />

        {/* Right side controls: Sort and Layout */}
        <div className={'flex items-center gap-2'}>
          {/* Sort Dropdown */}
          <Skeleton className={'h-10 w-36'} />
          {/* Layout Switcher */}
          <Skeleton className={'h-10 w-28'} />
        </div>
      </div>

      {/* Results Count */}
      <Skeleton className={'mb-4 h-4 w-28'} />

      {/* Bobblehead Grid - 6 cards in responsive grid */}
      <div
        className={'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'}
        data-slot={'collection-bobbleheads-skeleton-grid'}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <BobbleheadCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};
