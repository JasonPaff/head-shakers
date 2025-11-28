import 'server-only';

import { PlatformStatsDisplay } from '@/app/(app)/(home)/components/display/platform-stats-display';
import { PlatformStatsFacade } from '@/lib/facades/platform/platform-stats.facade';

export async function PlatformStatsAsync() {
  const platformStats = await PlatformStatsFacade.getPlatformStatsAsync();

  return <PlatformStatsDisplay platformStats={platformStats} />;
}
