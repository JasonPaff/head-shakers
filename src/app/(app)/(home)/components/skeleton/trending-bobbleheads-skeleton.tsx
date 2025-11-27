import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const TrendingBobbleheadsSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading trending bobbleheads'}
      className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-6'}
      data-slot={'trending-bobbleheads-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'trending-bobbleheads')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading trending bobbleheads...</span>

      {Array.from({ length: 12 }).map((_, index) => (
        <div
          aria-hidden={'true'}
          className={
            'overflow-hidden rounded-2xl border border-slate-200/50 shadow-md dark:border-slate-700/50'
          }
          data-slot={'trending-bobblehead-skeleton-card'}
          data-testid={generateTestId('ui', 'skeleton', `trending-bobblehead-${index}`)}
          key={index}
        >
          {/* Image Skeleton */}
          <Skeleton className={'aspect-square w-full rounded-none'} />

          {/* Footer Skeleton */}
          <div className={'p-3'}>
            {/* Character Name Skeleton */}
            <Skeleton className={'h-4 w-full'} />

            {/* Metadata Row Skeleton */}
            <div className={'mt-1 flex items-center justify-between'}>
              <Skeleton className={'h-3 w-16'} />
              <Skeleton className={'h-3 w-16'} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
