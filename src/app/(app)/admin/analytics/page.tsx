import { Suspense } from 'react';

import { AnalyticsDashboardAsync } from '@/app/(app)/admin/analytics/components/async/analytics-dashboard-async';
import AnalyticsLoading from '@/app/(app)/admin/analytics/loading';
import { ErrorBoundary } from '@/components/ui/error-boundary/error-boundary';
import { requireModerator } from '@/lib/utils/admin.utils';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireModerator();

  return (
    <div className={'container mx-auto py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Analytics Dashboard</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Monitor platform usage, engagement, and performance metrics across collections, bobbleheads, and
          user profiles.
        </p>
      </div>

      <ErrorBoundary name={'analytics-dashboard'}>
        <Suspense fallback={<AnalyticsLoading />}>
          <AnalyticsDashboardAsync />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
