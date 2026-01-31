import type { PlatformStats } from '@/lib/facades/platform/platform-stats.facade';

import { generateTestId } from '@/lib/test-ids';

interface PlatformStatsDisplayProps {
  platformStats: PlatformStats;
}

export const PlatformStatsDisplay = ({ platformStats }: PlatformStatsDisplayProps) => {
  return (
    <dl
      aria-label={'Platform statistics'}
      className={`mt-2 flex flex-wrap gap-6 border-t border-primary/20 pt-6
        sm:gap-8 sm:pt-8
        dark:border-border/50`}
      data-slot={'hero-stats'}
      data-testid={generateTestId('feature', 'hero-stats')}
    >
      {/* Bobbleheads Stat */}
      <div
        className={`group transition-transform duration-300 hover:scale-105`}
        data-slot={'hero-stats-item'}
        data-testid={generateTestId('feature', 'hero-stats', 'bobbleheads')}
      >
        <dt
          className={`text-2xl font-bold tabular-nums text-foreground
            sm:text-3xl`}
        >
          {platformStats.totalBobbleheads.toLocaleString()}
          <span
            aria-label={'and growing'}
            className={'ml-0.5 text-lg text-primary transition-colors group-hover:text-orange-600 sm:text-xl'}
          >
            +
          </span>
        </dt>
        <dd className={'text-xs text-muted-foreground sm:text-sm'}>Bobbleheads</dd>
      </div>

      {/* Collectors Stat */}
      <div
        className={`group transition-transform duration-300 hover:scale-105`}
        data-slot={'hero-stats-item'}
        data-testid={generateTestId('feature', 'hero-stats', 'collectors')}
      >
        <dt
          className={`text-2xl font-bold tabular-nums text-foreground
            sm:text-3xl`}
        >
          {platformStats.totalCollectors.toLocaleString()}
          <span
            aria-label={'and growing'}
            className={'ml-0.5 text-lg text-primary transition-colors group-hover:text-orange-600 sm:text-xl'}
          >
            +
          </span>
        </dt>
        <dd className={'text-xs text-muted-foreground sm:text-sm'}>Collectors</dd>
      </div>

      {/* Collections Stat */}
      <div
        className={`group transition-transform duration-300 hover:scale-105`}
        data-slot={'hero-stats-item'}
        data-testid={generateTestId('feature', 'hero-stats', 'collections')}
      >
        <dt
          className={`text-2xl font-bold tabular-nums text-foreground
            sm:text-3xl`}
        >
          {platformStats.totalCollections.toLocaleString()}
          <span
            aria-label={'and growing'}
            className={'ml-0.5 text-lg text-primary transition-colors group-hover:text-orange-600 sm:text-xl'}
          >
            +
          </span>
        </dt>
        <dd className={'text-xs text-muted-foreground sm:text-sm'}>Collections</dd>
      </div>
    </dl>
  );
};
