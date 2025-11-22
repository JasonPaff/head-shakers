import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const BobbleheadNavigationSkeleton = () => {
  // Test IDs
  const navSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'skeleton');
  const prevButtonSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'previous-skeleton');
  const nextButtonSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'next-skeleton');

  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading navigation'}
      className={'flex items-center justify-between gap-4'}
      data-slot={'bobblehead-navigation-skeleton'}
      data-testid={navSkeletonTestId}
      role={'navigation'}
    >
      {/* Previous Button Skeleton */}
      <Skeleton className={'h-8 w-24 sm:w-28'} testId={prevButtonSkeletonTestId} />

      {/* Next Button Skeleton */}
      <Skeleton className={'h-8 w-24 sm:w-28'} testId={nextButtonSkeletonTestId} />
    </div>
  );
};
