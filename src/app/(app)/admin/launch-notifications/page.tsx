import type { Metadata } from 'next';

import { LaunchNotificationsManager } from '@/app/(app)/admin/launch-notifications/components/launch-notifications-manager';
import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { LaunchNotificationFacade } from '@/lib/facades/launch-notifications/launch-notification.facade';

export default async function AdminLaunchNotificationsPage() {
  const [signups, stats] = await Promise.all([
    LaunchNotificationFacade.getAllWaitlistAsync(),
    LaunchNotificationFacade.getStatisticsAsync(),
  ]);

  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'space-y-6'}>
        {/* Header */}
        <div className={'flex items-center justify-between'}>
          <div>
            <h2 className={'text-2xl font-bold tracking-tight'}>Launch Notifications</h2>
            <p className={'text-muted-foreground'}>
              Manage launch notification signups and send launch emails to subscribers
            </p>
          </div>
        </div>

        {/* Launch Notifications Manager */}
        <LaunchNotificationsManager initialSignups={signups} initialStats={stats} />
      </div>
    </AdminLayout>
  );
}

export function generateMetadata(): Metadata {
  return {
    description: 'Manage launch notification signups',
    title: 'Launch Notifications - Admin',
  };
}
