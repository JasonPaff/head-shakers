import type { Metadata } from 'next';

import { LaunchNotificationsManager } from '@/app/(app)/admin/launch-notifications/components/launch-notifications-manager';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';
import { requireModerator } from '@/lib/utils/admin.utils';

// force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminLaunchNotificationsPage() {
  await requireModerator();
  const [signups, stats] = await Promise.all([
    LaunchNotificationFacade.getAllWaitlistAsync(),
    LaunchNotificationFacade.getStatisticsAsync(),
  ]);

  return (
    <div className={'container mx-auto py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Launch Notifications</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Manage launch notification signups and send launch emails to subscribers.
        </p>
      </div>

      <div className={'space-y-6'}>
        <LaunchNotificationsManager initialSignups={signups} initialStats={stats} />
      </div>
    </div>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage launch notification signups',
    title: 'Launch Notifications - Admin',
  };
}
