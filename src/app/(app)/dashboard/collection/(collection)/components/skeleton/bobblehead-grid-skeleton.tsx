import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadGridSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading bobbleheads'}
      className={'flex-1 overflow-y-auto px-4 pb-4'}
      data-slot={'bobblehead-grid-skeleton'}
      role={'status'}
    >
      <span className={'sr-only'}>Loading bobbleheads...</span>

      <div className={'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div className={'overflow-hidden rounded-md border bg-card'} key={index}>
            {/* Image Skeleton */}
            <Skeleton className={'aspect-square w-full rounded-none'} />

            {/* Card Info Skeleton */}
            <div className={'space-y-2 p-2'}>
              <Skeleton className={'h-4 w-full'} />
              <Skeleton className={'h-5 w-16 rounded-sm'} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
