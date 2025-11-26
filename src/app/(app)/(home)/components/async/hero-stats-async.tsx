import type { DatabaseExecutor } from '@/lib/utils/next-safe-action';

import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';

export interface HeroStatsAsyncProps {
  dbInstance?: DatabaseExecutor;
}

/**
 * Async server component for fetching and displaying platform statistics
 *
 * Fetches platform-wide statistics from the PlatformStatsFacade and displays
 * them in a horizontal layout matching the hero section demo design.
 */
export async function HeroStatsAsync({ dbInstance }: HeroStatsAsyncProps) {
  // Fetch platform statistics from facade
  const stats = await PlatformStatsFacade.getPlatformStats(dbInstance);

  return (
    <div
      aria-label={'Platform statistics'}
      className={'flex flex-wrap gap-8 border-t border-slate-700/50 pt-8'}
    >
      {/* Bobbleheads Stat */}
      <div>
        <div className={'text-3xl font-bold text-white'}>{stats.totalBobbleheads.toLocaleString()}+</div>
        <div className={'text-sm text-slate-400'}>Bobbleheads</div>
      </div>

      {/* Collectors Stat */}
      <div>
        <div className={'text-3xl font-bold text-white'}>{stats.totalCollectors.toLocaleString()}+</div>
        <div className={'text-sm text-slate-400'}>Collectors</div>
      </div>

      {/* Collections Stat */}
      <div>
        <div className={'text-3xl font-bold text-white'}>{stats.totalCollections.toLocaleString()}+</div>
        <div className={'text-sm text-slate-400'}>Collections</div>
      </div>
    </div>
  );
}
