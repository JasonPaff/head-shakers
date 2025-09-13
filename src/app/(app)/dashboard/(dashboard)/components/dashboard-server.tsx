import 'server-only';

import { DashboardClient } from '@/app/(app)/dashboard/(dashboard)/components/dashboard-client';
import { BobbleheadsFacade } from '@/lib/facades/bobbleheads/bobbleheads.facade';
import { getOptionalUserId } from '@/utils/optional-auth-utils';

export async function DashboardServer() {
  const currentUserId = await getOptionalUserId();

  if (!currentUserId) {
    return <DashboardClient />;
  }

  const stats = await BobbleheadsFacade.getUserDashboardStats(currentUserId);

  return <DashboardClient stats={stats} />;
}
