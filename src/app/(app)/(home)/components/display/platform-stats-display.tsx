import type { PlatformStats } from '@/lib/facades/platform/platform-stats.facade';

import { generateTestId } from '@/lib/test-ids';

interface PlatformStatsDisplayProps {
  platformStats: PlatformStats;
}

export const PlatformStatsDisplay = ({ platformStats }: PlatformStatsDisplayProps) => {
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
          {platformStats.totalBobbleheads.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Bobbleheads</dd>
      </div>

      {/* Collectors Stat */}
      <div data-slot={'hero-stats-item'} data-testid={generateTestId('feature', 'hero-stats', 'collectors')}>
        <dt className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {platformStats.totalCollectors.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Collectors</dd>
      </div>

      {/* Collections Stat */}
      <div data-slot={'hero-stats-item'} data-testid={generateTestId('feature', 'hero-stats', 'collections')}>
        <dt className={'text-3xl font-bold text-slate-900 dark:text-white'}>
          {platformStats.totalCollections.toLocaleString()}
          <span aria-label={'and growing'}>+</span>
        </dt>
        <dd className={'text-sm text-slate-600 dark:text-slate-400'}>Collections</dd>
      </div>
    </dl>
  );
};
