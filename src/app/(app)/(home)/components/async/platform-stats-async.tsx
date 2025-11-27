import 'server-only';

import { PlatformStatsDisplay } from '@/app/(app)/(home)/components/display/platform-stats-display';
import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';

/**
 * Async server component for fetching and displaying platform statistics
 *
 * Fetches platform-wide statistics from the PlatformStatsFacade and displays
 * them in a horizontal layout matching the hero section design.
 * Supports light/dark mode with orange accent colors.
 */
export async function PlatformStatsAsync() {
  const platformStats = await PlatformStatsFacade.getPlatformStatsAsync();

  return <PlatformStatsDisplay platformStats={platformStats} />;
}
