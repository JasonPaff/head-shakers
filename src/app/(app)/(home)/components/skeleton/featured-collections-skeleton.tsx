import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const FeaturedCollectionsSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading featured collections'}
      className={'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'}
      data-slot={'featured-collections-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'featured-collections')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading featured collections...</span>

      {Array.from({ length: 6 }).map((_, index) => (
        <div
          aria-hidden={'true'}
          className={'overflow-hidden rounded-2xl border border-slate-200 shadow-lg dark:border-slate-800'}
          data-slot={'featured-collection-skeleton-card'}
          data-testid={generateTestId('ui', 'skeleton', `collection-${index}`)}
          key={index}
        >
          {/* Image Skeleton */}
          <Skeleton className={'aspect-[4/3] w-full rounded-none'} />

          {/* Footer Skeleton */}
          <div className={'p-5'}>
            {/* Owner Section Skeleton */}
            <div className={'flex items-center justify-between'}>
              <div className={'flex items-center gap-3'}>
                <Skeleton className={'size-9 rounded-full'} />
                <div className={'space-y-2'}>
                  <Skeleton className={'h-4 w-24'} />
                  <Skeleton className={'h-3 w-16'} />
                </div>
              </div>
              <div className={'space-y-2 text-right'}>
                <Skeleton className={'h-4 w-20'} />
                <Skeleton className={'h-3 w-16'} />
              </div>
            </div>

            {/* Stats Row Skeleton */}
            <div className={'mt-4 border-t border-slate-100 pt-4 dark:border-slate-800'}>
              <div className={'flex items-center gap-4'}>
                <Skeleton className={'h-4 w-12'} />
                <Skeleton className={'h-4 w-12'} />
                <Skeleton className={'h-4 w-8'} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
