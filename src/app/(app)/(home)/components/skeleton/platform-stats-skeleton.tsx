import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

/**
 * Skeleton loading state for platform statistics in the hero section
 *
 * Displays three skeleton blocks representing platform stats (Bobbleheads, Collectors, Collections)
 * with shimmer animations to indicate the loading state.
 * Matches the layout of HeroPlatformStatsAsync component with light/dark mode support.
 */
export const PlatformStatsSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading platform statistics'}
      className={'flex flex-wrap gap-8 border-t border-orange-200/50 pt-8 dark:border-slate-700/50'}
      data-slot={'hero-stats-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'hero-stats')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading platform statistics...</span>

      {/* Bobbleheads Stat Skeleton */}
      <div data-slot={'hero-stats-skeleton-item'}>
        <Skeleton
          className={'mb-2 h-9 w-24'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-bobbleheads-value')}
        />
        <Skeleton
          className={'h-5 w-28'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-bobbleheads-label')}
        />
      </div>

      {/* Collectors Stat Skeleton */}
      <div data-slot={'hero-stats-skeleton-item'}>
        <Skeleton
          className={'mb-2 h-9 w-24'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-collectors-value')}
        />
        <Skeleton
          className={'h-5 w-24'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-collectors-label')}
        />
      </div>

      {/* Collections Stat Skeleton */}
      <div data-slot={'hero-stats-skeleton-item'}>
        <Skeleton
          className={'mb-2 h-9 w-24'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-collections-value')}
        />
        <Skeleton
          className={'h-5 w-28'}
          testId={generateTestId('ui', 'skeleton', 'hero-stats-collections-label')}
        />
      </div>
    </div>
  );
};
