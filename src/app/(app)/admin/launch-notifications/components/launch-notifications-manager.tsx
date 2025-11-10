'use client';

import { MailCheckIcon, MailIcon, UserIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import type { SelectLaunchNotification } from '@/lib/validations/launch-notification.validations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useServerAction } from '@/hooks/use-server-action';
import { getLaunchNotificationStatsAction, sendLaunchNotificationsAction } from '@/lib/actions/launch-notifications/admin.actions';

interface LaunchNotificationsManagerProps {
  initialSignups: Array<SelectLaunchNotification>;
  initialStats: {
    notifiedCount: number;
    totalCount: number;
    unnotifiedCount: number;
  };
}

export function LaunchNotificationsManager({
  initialSignups,
  initialStats,
}: LaunchNotificationsManagerProps) {
  const [stats, setStats] = useState(initialStats);

  const { executeAsync: sendNotificationsAsync, isExecuting: isSendingNotifications } = useServerAction(
    sendLaunchNotificationsAction,
    {
      onSuccess: async () => {
        // Refresh stats after sending
        const result = await getLaunchNotificationStatsAction();
        if (result && 'data' in result && result.data) {
          const newStats = (result.data) as typeof initialStats;
          setStats(newStats);
        }
      },
      toastMessages: {
        error: 'Failed to send launch notifications',
        loading: 'Sending launch notifications...',
        success: 'Launch notifications sent successfully!',
      },
    },
  );

  const handleSendNotifications = useCallback(async () => {
    if (stats.unnotifiedCount === 0) {
      return;
    }

    if (!confirm(`Send launch notification emails to ${stats.unnotifiedCount} subscribers?`)) {
      return;
    }

    await sendNotificationsAsync();
  }, [stats.unnotifiedCount, sendNotificationsAsync]);

  const sortedSignups = useMemo(() => {
    return [...initialSignups].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [initialSignups]);

  return (
    <div className={'space-y-6'}>
      {/* Statistics Cards */}
      <div className={'grid gap-4 md:grid-cols-3'}>
        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Total Signups</CardTitle>
            <UserIcon className={'size-4 text-muted-foreground'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{stats.totalCount}</div>
            <p className={'text-xs text-muted-foreground'}>people on the waitlist</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Unnotified</CardTitle>
            <MailIcon className={'size-4 text-yellow-600'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{stats.unnotifiedCount}</div>
            <p className={'text-xs text-muted-foreground'}>waiting for launch email</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <CardTitle className={'text-sm font-medium'}>Notified</CardTitle>
            <MailCheckIcon className={'size-4 text-green-600'} />
          </CardHeader>
          <CardContent>
            <div className={'text-2xl font-bold'}>{stats.notifiedCount}</div>
            <p className={'text-xs text-muted-foreground'}>already sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Send Launch Notifications</CardTitle>
          <CardDescription>
            Send the launch notification email to all {stats.unnotifiedCount} unnotified subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            disabled={stats.unnotifiedCount === 0 || isSendingNotifications}
            onClick={handleSendNotifications}
            size={"lg"}
            variant={stats.unnotifiedCount === 0 ? 'secondary' : 'default'}
          >
            {isSendingNotifications ? 'Sending...' : `Send to ${stats.unnotifiedCount} Subscribers`}
          </Button>
          {stats.unnotifiedCount === 0 && (
            <p className={'mt-2 text-sm text-muted-foreground'}>
              All subscribers have already been notified!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Signups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Signups</CardTitle>
          <CardDescription>
            All {initialSignups.length} email addresses signed up for launch notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {initialSignups.length === 0 ? (
            <div className={'py-8 text-center'}>
              <p className={'text-muted-foreground'}>No signups yet</p>
            </div>
          ) : (
            <div className={'overflow-x-auto'}>
              <table className={'w-full text-sm'}>
                <thead>
                  <tr className={'border-b'}>
                    <th className={'py-3 text-left font-semibold'}>Email</th>
                    <th className={'py-3 text-left font-semibold'}>Signed Up</th>
                    <th className={'py-3 text-left font-semibold'}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedSignups.map((signup) => (
                    <tr className={'border-b hover:bg-muted/50'} key={signup.id}>
                      <td className={'py-3'}>{signup.email}</td>
                      <td className={'py-3 text-muted-foreground'}>
                        {new Date(signup.createdAt).toLocaleDateString()}
                      </td>
                      <td className={'py-3'}>
                        {signup.notifiedAt ? (
                          <span className={'inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800'}>
                            <MailCheckIcon className={'size-3'} />
                            Notified
                          </span>
                        ) : (
                          <span className={'inline-flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800'}>
                            <MailIcon className={'size-3'} />
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
