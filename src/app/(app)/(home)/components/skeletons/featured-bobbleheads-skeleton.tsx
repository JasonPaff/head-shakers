import type { VariantProps } from 'class-variance-authority';

import { Skeleton } from '@/components/ui/skeleton';
import {
  featuredCardSkeletonVariants,
  featuredCardVariants,
} from '@/components/ui/variants/featured-card-variants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

/**
 * Props for FeaturedBobbleheadsSkeleton
 */
export interface FeaturedBobbleheadsSkeletonProps {
  /** Number of skeleton cards to display */
  count?: number;
  /** Size variant for skeleton cards */
  size?: VariantProps<typeof featuredCardSkeletonVariants>['size'];
}

/**
 * Individual skeleton card for featured bobblehead loading state
 */
const FeaturedBobbleheadSkeletonCard = ({
  index,
  size = 'small',
}: {
  index: number;
  size?: VariantProps<typeof featuredCardSkeletonVariants>['size'];
}) => {
  // Stagger animation delay based on index for visual effect
  const _animationDelayClass = index < 8 ? `animation-delay-${(index + 1) * 100}` : '';

  return (
    <div
      aria-hidden={'true'}
      className={cn(
        featuredCardVariants({ size: 'small', state: 'loading' }),
        featuredCardSkeletonVariants({ size }),
        'flex flex-col bg-card',
        _animationDelayClass,
      )}
      data-slot={'featured-bobblehead-skeleton-card'}
      data-testid={generateTestId('ui', 'skeleton', `bobblehead-${index}`)}
    >
      {/* Image Area Skeleton */}
      <div
        className={'relative aspect-square w-full overflow-hidden'}
        data-slot={'featured-bobblehead-skeleton-image'}
      >
        <Skeleton
          className={'h-full w-full rounded-none'}
          testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-image`)}
        />

        {/* Badge Skeleton */}
        <div className={'absolute top-3 left-3 z-10'} data-slot={'featured-bobblehead-skeleton-badge'}>
          <Skeleton
            className={'h-6 w-20 rounded-full'}
            testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-badge`)}
          />
        </div>
      </div>

      {/* Content Area Skeleton */}
      <div className={'flex flex-col gap-2 p-4'} data-slot={'featured-bobblehead-skeleton-content'}>
        {/* Title Skeleton */}
        <Skeleton
          className={'h-5 w-3/4'}
          testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-title`)}
        />

        {/* Owner Skeleton */}
        <Skeleton
          className={'h-4 w-1/2'}
          testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-owner`)}
        />

        {/* Metrics Row Skeleton */}
        <div
          className={'mt-2 flex items-center justify-between'}
          data-slot={'featured-bobblehead-skeleton-metrics'}
        >
          {/* Left: Stats */}
          <div className={'flex items-center gap-3'}>
            <Skeleton
              className={'h-5 w-12'}
              testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-likes`)}
            />
            <Skeleton
              className={'h-5 w-12'}
              testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-comments`)}
            />
            <Skeleton
              className={'h-5 w-12'}
              testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-views`)}
            />
          </div>

          {/* Right: View Link */}
          <Skeleton
            className={'h-5 w-14'}
            testId={generateTestId('ui', 'skeleton', `bobblehead-${index}-view`)}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton loading state for featured bobbleheads grid
 *
 * Displays a grid of skeleton cards with shimmer animations
 * to indicate loading state for the featured bobbleheads section.
 * Matches the layout of FeaturedBobbleheadsDisplay component.
 */
export const FeaturedBobbleheadsSkeleton = ({
  count = 8,
  size = 'small',
}: FeaturedBobbleheadsSkeletonProps) => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading featured bobbleheads'}
      className={'grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4'}
      data-slot={'featured-bobbleheads-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'featured-bobbleheads')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading featured bobbleheads...</span>

      {Array.from({ length: count }).map((_, index) => (
        <FeaturedBobbleheadSkeletonCard index={index} key={index} size={size} />
      ))}
    </div>
  );
};
