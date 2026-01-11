import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

/**
 * Navigation preview card skeleton for desktop layout.
 * Matches the structure of BobbleheadNavigationPreview with variant="card".
 */
const NavigationPreviewCardSkeleton = ({ direction }: { direction: 'next' | 'previous' }) => {
  const _isPrevious = direction === 'previous';

  return (
    <div className={`flex items-center gap-3 p-3 ${_isPrevious ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Chevron Icon Placeholder */}
      <Skeleton className={'size-5 shrink-0 rounded'} />

      {/* Image Placeholder */}
      <Skeleton className={'size-14 shrink-0 rounded-md'} />

      {/* Text Content */}
      <div className={`flex min-w-0 flex-col gap-1 ${_isPrevious ? 'items-start' : 'items-end'}`}>
        {/* Direction Label */}
        <Skeleton className={'h-3 w-12'} />
        {/* Name */}
        <Skeleton className={'h-4 w-24'} />
      </div>
    </div>
  );
};

/**
 * Navigation preview compact skeleton for mobile layout.
 * Matches the structure of BobbleheadNavigationPreview with variant="compact".
 */
const NavigationPreviewCompactSkeleton = ({ direction }: { direction: 'next' | 'previous' }) => {
  const _isPrevious = direction === 'previous';

  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 ${_isPrevious ? 'flex-row' : 'flex-row-reverse'}`}>
      {/* Chevron Icon Placeholder */}
      <Skeleton className={'size-4 shrink-0 rounded'} />

      {/* Image Placeholder */}
      <Skeleton className={'size-8 shrink-0 rounded'} />

      {/* Name */}
      <Skeleton className={'h-3 w-16'} />
    </div>
  );
};

export const BobbleheadNavigationSkeleton = () => {
  // Test IDs
  const navSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'skeleton');
  const prevCardSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'previous-skeleton');
  const contextSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'context-skeleton');
  const positionSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'position-skeleton');
  const nextCardSkeletonTestId = generateTestId('feature', 'bobblehead-nav', 'next-skeleton');

  return (
    <nav
      aria-busy={'true'}
      aria-label={'Loading bobblehead navigation'}
      className={'flex flex-col gap-4'}
      data-slot={'bobblehead-navigation-skeleton'}
      data-testid={navSkeletonTestId}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading bobblehead navigation...</span>

      {/* Desktop Layout - Card Style */}
      <div className={'hidden items-stretch justify-between gap-4 sm:flex'}>
        {/* Previous Card Skeleton */}
        <div
          className={'flex flex-1 justify-start rounded-lg border bg-card'}
          data-testid={prevCardSkeletonTestId}
        >
          <NavigationPreviewCardSkeleton direction={'previous'} />
        </div>

        {/* Center Content - Context and Position */}
        <div className={'flex flex-col items-center justify-center gap-1'}>
          {/* Collection Context Badge Skeleton */}
          <Skeleton className={'h-6 w-36 rounded-full'} testId={contextSkeletonTestId} />

          {/* Position Indicator Skeleton */}
          <Skeleton className={'h-4 w-12'} testId={positionSkeletonTestId} />
        </div>

        {/* Next Card Skeleton */}
        <div
          className={'flex flex-1 justify-end rounded-lg border bg-card'}
          data-testid={nextCardSkeletonTestId}
        >
          <NavigationPreviewCardSkeleton direction={'next'} />
        </div>
      </div>

      {/* Mobile Layout - Compact Horizontal */}
      <div className={'flex items-center gap-2 sm:hidden'}>
        {/* Previous Compact Skeleton */}
        <div className={'flex flex-1 rounded-md border bg-card'}>
          <NavigationPreviewCompactSkeleton direction={'previous'} />
        </div>

        {/* Position Indicator - Mobile */}
        <Skeleton className={'h-3 w-8 shrink-0'} />

        {/* Next Compact Skeleton */}
        <div className={'flex flex-1 rounded-md border bg-card'}>
          <NavigationPreviewCompactSkeleton direction={'next'} />
        </div>
      </div>
    </nav>
  );
};
