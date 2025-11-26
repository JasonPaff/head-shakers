import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';

/**
 * Skeleton loading state for featured bobblehead showcase in hero section
 *
 * Displays skeleton blocks matching the HeroFeaturedBobblehead component layout
 * including main card with image, badge, title, description, stats, and two floating cards
 * with shimmer animations to indicate loading state.
 */
export const HeroFeaturedBobbleheadSkeleton = () => {
  return (
    <div
      aria-busy={'true'}
      aria-label={'Loading featured bobblehead showcase'}
      className={'relative lg:pl-8'}
      data-slot={'hero-featured-bobblehead-skeleton'}
      data-testid={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead')}
      role={'status'}
    >
      {/* Screen reader announcement */}
      <span className={'sr-only'}>Loading featured bobblehead showcase...</span>

      {/* Main Featured Card Container */}
      <div className={'relative'}>
        <div
          className={
            'relative overflow-hidden rounded-3xl border border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-2 shadow-2xl backdrop-blur-sm'
          }
          data-slot={'hero-featured-bobblehead-skeleton-card'}
        >
          {/* Main Image Area Skeleton */}
          <div className={'relative aspect-square overflow-hidden rounded-2xl'}>
            <Skeleton
              className={'absolute inset-0 size-full rounded-2xl'}
              testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-image')}
            />

            {/* Overlay Content Skeletons */}
            <div className={'absolute right-0 bottom-0 left-0 p-6'}>
              {/* Badge Skeleton */}
              <Skeleton
                className={'mb-3 h-6 w-32'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-badge')}
              />

              {/* Title Skeleton */}
              <Skeleton
                className={'mb-2 h-8 w-4/5'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-title')}
              />

              {/* Description Skeleton */}
              <Skeleton
                className={'mb-4 h-5 w-3/5'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-description')}
              />

              {/* Stats Row Skeleton */}
              <div className={'flex items-center gap-4'}>
                <Skeleton
                  className={'h-5 w-16'}
                  testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-likes')}
                />
                <Skeleton
                  className={'h-5 w-20'}
                  testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-views')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Card Skeleton - Top Left */}
        <div
          aria-hidden={'true'}
          className={
            'absolute top-8 -left-8 -rotate-12 transform animate-bounce rounded-2xl border border-slate-600/50 bg-slate-800/90 p-3 shadow-xl backdrop-blur-sm'
          }
          data-slot={'hero-featured-bobblehead-skeleton-float-card'}
          style={{ animationDuration: '3s' }}
        >
          <div className={'flex items-center gap-3'}>
            <Skeleton
              className={'size-9 rounded-xl'}
              testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-icon-1')}
            />
            <div>
              <Skeleton
                className={'mb-1 h-4 w-20'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-text-1')}
              />
              <Skeleton
                className={'h-3 w-16'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-subtext-1')}
              />
            </div>
          </div>
        </div>

        {/* Floating Card Skeleton - Bottom Right */}
        <div
          aria-hidden={'true'}
          className={
            'absolute -right-4 bottom-20 rotate-6 transform animate-bounce rounded-2xl border border-slate-600/50 bg-slate-800/90 p-3 shadow-xl backdrop-blur-sm'
          }
          data-slot={'hero-featured-bobblehead-skeleton-float-card'}
          style={{ animationDelay: '1s', animationDuration: '4s' }}
        >
          <div className={'flex items-center gap-3'}>
            <Skeleton
              className={'size-9 rounded-xl'}
              testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-icon-2')}
            />
            <div>
              <Skeleton
                className={'mb-1 h-4 w-16'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-text-2')}
              />
              <Skeleton
                className={'h-3 w-20'}
                testId={generateTestId('ui', 'skeleton', 'hero-featured-bobblehead-float-subtext-2')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
