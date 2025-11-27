import 'server-only';

import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';
import { generateTestId } from '@/lib/test-ids';

/**
 * Async server component for fetching and displaying platform statistics
 *
 * Fetches platform-wide statistics from the PlatformStatsFacade and displays
 * them in a horizontal layout matching the hero section design.
 * Supports light/dark mode with orange accent colors.
 */
export async function HeroPlatformStatsAsync() {
  const stats = await PlatformStatsFacade.getHomePageHeroPlatformStatsAsync();

  return (
    <dl
      aria-label={'Platform statistics'}
      className={'flex flex-wrap gap-8 border-t border-orange-200/50 pt-8 dark:border-slate-700/50'}
      data-slot={'hero-stats'}
      data-testid={generateTestId('feature', 'hero-stats')}
    >
      {/* Bobbleheads Stat */}
      <div data-slot={'hero-stats-item'} data-testid={generateTestId('feature', 'hero-stats', 'bobbleheads')}>
        <dt className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalBobbleheads.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Bobbleheads</dd>
      </div>

      {/* Collectors Stat */}
      <div data-slot={'hero-stats-item'} data-testid={generateTestId('feature', 'hero-stats', 'collectors')}>
        <dt className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalCollectors.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Collectors</dd>
      </div>

      {/* Collections Stat */}
      <div data-slot={'hero-stats-item'} data-testid={generateTestId('feature', 'hero-stats', 'collections')}>
        <dt className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {stats.totalCollections.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Collections</dd>
      </div>
    </dl>
  );
}
