import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton loading state for CollectionHeader component
 * Matches layout dimensions: cover image, title, collector byline, description, stats, and action buttons
 */
export const CollectionHeaderSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading collection header'}
      className={'mb-8'}
      data-slot={'collection-header-skeleton'}
    >
      {/* Cover Image Skeleton */}
      <div
        className={'relative mb-6 h-40 overflow-hidden rounded-xl sm:h-56 lg:h-64'}
        data-slot={'collection-header-skeleton-cover'}
      >
        <Skeleton className={'h-full w-full'} />
      </div>

      {/* Header Content */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'}>
        <div className={'flex-1'}>
          {/* Collection Title Skeleton */}
          <Skeleton className={'mb-2 h-8 w-64 sm:h-10 sm:w-80'} />

          {/* Collector Byline Skeleton */}
          <div className={'mb-3 flex items-center gap-2'} data-slot={'collection-header-skeleton-byline'}>
            {/* Avatar */}
            <Skeleton className={'size-6 rounded-full'} />
            {/* "by" text and name */}
            <Skeleton className={'h-4 w-32'} />
          </div>

          {/* Description Skeleton */}
          <div className={'mb-4 space-y-2'} data-slot={'collection-header-skeleton-description'}>
            <Skeleton className={'h-4 w-full max-w-2xl'} />
            <Skeleton className={'h-4 w-3/4 max-w-xl'} />
          </div>

          {/* Stats Skeleton */}
          <div className={'flex flex-wrap items-center gap-4'} data-slot={'collection-header-skeleton-stats'}>
            {/* Items count */}
            <div className={'flex items-center gap-1.5'}>
              <Skeleton className={'size-4'} />
              <Skeleton className={'h-4 w-16'} />
            </div>
            {/* Views count */}
            <div className={'flex items-center gap-1.5'}>
              <Skeleton className={'size-4'} />
              <Skeleton className={'h-4 w-20'} />
            </div>
            {/* Likes count */}
            <div className={'flex items-center gap-1.5'}>
              <Skeleton className={'size-4'} />
              <Skeleton className={'h-4 w-14'} />
            </div>
            {/* Updated date */}
            <div className={'flex items-center gap-1.5'}>
              <Skeleton className={'size-4'} />
              <Skeleton className={'h-4 w-28'} />
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div
          className={'flex items-center gap-2 sm:flex-shrink-0'}
          data-slot={'collection-header-skeleton-actions'}
        >
          {/* Like Button */}
          <Skeleton className={'h-9 w-28'} />
          {/* Share Button */}
          <Skeleton className={'size-9'} />
        </div>
      </div>
    </div>
  );
};
