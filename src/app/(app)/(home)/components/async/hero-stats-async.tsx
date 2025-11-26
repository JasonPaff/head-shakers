import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';

/**
 * Async server component for fetching and displaying platform statistics
 *
 * Fetches platform-wide statistics from the PlatformStatsFacade and displays
 * them in a horizontal layout matching the hero section design.
 * Supports light/dark mode with orange accent colors.
 */
export async function HeroStatsAsync() {
  const stats = await PlatformStatsFacade.getPlatformStats();

  return (
    <div
      aria-label={'Platform statistics'}
      className={'flex flex-wrap gap-8 border-t border-orange-200/50 pt-8 dark:border-slate-700/50'}
    >
      {/* Bobbleheads Stat */}
      <div>
        <div className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalBobbleheads.toLocaleString()}+
        </div>
        <div className={'text-sm text-slate-600 dark:text-slate-400'}>Bobbleheads</div>
      </div>

      {/* Collectors Stat */}
      <div>
        <div className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalCollectors.toLocaleString()}+
        </div>
        <div className={'text-sm text-slate-600 dark:text-slate-400'}>Collectors</div>
      </div>

      {/* Collections Stat */}
      <div>
        <div className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalCollections.toLocaleString()}+
        </div>
        <div className={'text-sm text-slate-600 dark:text-slate-400'}>Collections</div>
      </div>
    </div>
  );
}
