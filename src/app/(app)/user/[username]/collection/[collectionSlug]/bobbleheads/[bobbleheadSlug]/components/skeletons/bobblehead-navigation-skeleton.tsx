import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

export const BobbleheadNavigationSkeleton = () => {
  // Test IDs
  const navSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'skeleton');
  const prevButtonSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'previous-skeleton');
  const contextSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'context-skeleton');
  const positionSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'position-skeleton');
  const nextButtonSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'next-skeleton');

  return (
    <div
      aria-busy={'true'}
      aria-label={'Bobblehead navigation'}
      className={'flex items-center justify-between gap-4'}
      data-slot={'bobblehead-navigation-skeleton'}
      data-testid={navSkeletonTestId}
      role={'navigation'}
    >
      {/* Previous Button Skeleton */}
      <Skeleton className={'h-8 w-24 sm:w-28'} testId={prevButtonSkeletonTestId} />

      {/* Center Content Skeleton - Context and Position */}
      <div className={'flex flex-col items-center gap-1'}>
        {/* Collection Context Indicator Skeleton - Hidden on mobile */}
        <Skeleton className={'hidden h-5 w-32 sm:block sm:w-44'} testId={contextSkeletonTestId} />

        {/* Position Indicator Skeleton */}
        <Skeleton className={'h-4 w-12'} testId={positionSkeletonTestId} />
      </div>

      {/* Next Button Skeleton */}
      <Skeleton className={'h-8 w-24 sm:w-28'} testId={nextButtonSkeletonTestId} />
    </div>
  );
};
