'use client';

import type { ComponentProps } from 'react';

import {
  ActivityIcon,
  CheckCircle2Icon,
  MailCheckIcon,
  MailIcon,
  TrendingUpIcon,
  UserCheckIcon,
  UserMinusIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect } from 'react';

import type { NewsletterStats as NewsletterStatsData } from '@/lib/facades/newsletter/newsletter.facade';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Skeleton } from '@/components/ui/skeleton';
import { useServerAction } from '@/hooks/use-server-action';
import { getNewsletterStatsAction } from '@/lib/actions/newsletter/newsletter-admin.actions';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

type NewsletterStatsProps = ComponentProps<'div'> & ComponentTestIdProps;

export const NewsletterStats = ({ className, testId, ...props }: NewsletterStatsProps) => {
  const statsTestId = testId || generateTestId('feature', 'newsletter-stats');

  // 1. useState hooks
  // (none needed - useServerAction handles state)

  // 2. Other hooks
  const { executeAsync, isExecuting, result } = useServerAction(getNewsletterStatsAction, {
    toastMessages: {
      error: 'Failed to load newsletter statistics',
    },
  });

  // 3. useMemo hooks
  // (none needed)

  // 4. useEffect hooks
  useEffect(() => {
    // Initial fetch
    void executeAsync();

    // Auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      void executeAsync();
    }, 30 * 1000);

    return () => clearInterval(intervalId);
  }, [executeAsync]);

  // 5. Utility functions
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatPercentage = (num: number): string => {
    return `${num.toFixed(1)}%`;
  };

  const isNewsletterStatsData = (
    result: unknown,
  ): result is { data: NewsletterStatsData; message: string; success: true } => {
    return (
      typeof result === 'object' &&
      result !== null &&
      'success' in result &&
      result.success === true &&
      'data' in result &&
      typeof result.data === 'object' &&
      result.data !== null
    );
  };

  const getRecentActivityCount = (stats: NewsletterStatsData | undefined): number => {
    if (!stats) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return stats.recentActivity.filter((activity) => new Date(activity.createdAt) >= sevenDaysAgo).length;
  };

  const getRecentSendsCount = (stats: NewsletterStatsData | undefined): number => {
    if (!stats) return 0;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return stats.sendHistory.filter((send) => new Date(send.sentAt) >= sevenDaysAgo).length;
  };

  // 6. Event handlers
  // (none needed)

  // 7. Derived variables
  const _isLoading = isExecuting && !result;
  const _hasData = isNewsletterStatsData(result);
  const _stats = _hasData ? result.data : undefined;

  return (
    <div
      className={cn('space-y-6', className)}
      data-slot={'newsletter-stats'}
      data-testid={statsTestId}
      {...props}
    >
      {/* Subscriber Statistics Section */}
      <div>
        <h3 className={'mb-4 text-lg font-semibold'}>Subscriber Statistics</h3>
        <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
          {/* Total Subscribers Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <UsersIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>
                  Total Subscribers
                </CardTitle>
                <UsersIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(_stats?.subscriberCounts.totalCount ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>All time subscribers</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Active Subscribers Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <UserCheckIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>
                  Active Subscribers
                </CardTitle>
                <UserCheckIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(_stats?.subscriberCounts.activeCount ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>Currently subscribed</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Total Unsubscribed Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <UserMinusIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>
                  Total Unsubscribed
                </CardTitle>
                <UserMinusIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(_stats?.subscriberCounts.unsubscribedCount ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>No longer subscribed</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Recent Activity Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <ActivityIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>Recent Activity</CardTitle>
                <ActivityIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(getRecentActivityCount(_stats))}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>Last 7 days</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>
        </div>
      </div>

      {/* Email Send Statistics Section */}
      <div>
        <h3 className={'mb-4 text-lg font-semibold'}>Email Send Statistics</h3>
        <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
          {/* Total Emails Sent Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <MailIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>
                  Total Emails Sent
                </CardTitle>
                <MailIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(_stats?.sendStats.totalRecipients ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>
                    {formatNumber(_stats?.sendStats.totalSends ?? 0)} campaigns
                  </div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Average Success Rate Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <CheckCircle2Icon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>
                  Average Success Rate
                </CardTitle>
                <CheckCircle2Icon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatPercentage(_stats?.sendStats.averageSuccessRate ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>
                    {_stats ? formatNumber(_stats.sendStats.totalSucceeded) : '0'} successful
                  </div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Recent Sends Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <TrendingUpIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>Recent Sends</CardTitle>
                <TrendingUpIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(getRecentSendsCount(_stats))}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>Last 7 days</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>

          {/* Failed Sends Card */}
          <Conditional isCondition={_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <Skeleton className={'h-4 w-24'} />
                <MailCheckIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <Skeleton className={'mb-1 h-8 w-16'} />
                <Skeleton className={'h-3 w-20'} />
              </CardContent>
            </Card>
          </Conditional>

          <Conditional isCondition={_hasData && !_isLoading}>
            <Card>
              <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
                <CardTitle className={'text-sm font-medium text-muted-foreground'}>Failed Sends</CardTitle>
                <MailCheckIcon aria-hidden className={'size-4 text-muted-foreground'} />
              </CardHeader>
              <CardContent>
                <div className={'space-y-1'}>
                  <div className={'text-2xl font-bold tracking-tight'}>
                    {formatNumber(_stats?.sendStats.totalFailed ?? 0)}
                  </div>
                  <div className={'text-xs text-muted-foreground'}>Delivery failures</div>
                </div>
              </CardContent>
            </Card>
          </Conditional>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className={'text-center text-xs text-muted-foreground'}>
        <Conditional isCondition={isExecuting && _hasData}>Refreshing...</Conditional>
        <Conditional isCondition={!isExecuting && _hasData}>Auto-refreshes every 30 seconds</Conditional>
      </div>
    </div>
  );
};
