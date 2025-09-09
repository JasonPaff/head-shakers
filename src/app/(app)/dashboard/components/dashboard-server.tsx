import 'server-only';

import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

import { DashboardClient } from './dashboard-client';

export async function DashboardServer() {
  const currentUserId = await getOptionalUserId();

  if (!currentUserId) {
    return <DashboardClient />;
  }

  const stats = await BobbleheadsFacade.getUserDashboardStats(currentUserId);

  return <DashboardClient stats={stats} />;
}
