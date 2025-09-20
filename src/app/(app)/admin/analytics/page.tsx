import { Suspense } from 'react';

import { AnalyticsLoading } from '@/app/(app)/admin/analytics/loading';
import { ViewAnalyticsDashboard } from '@/components/admin/analytics/view-analytics-dashboard';
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

      <Suspense fallback={<AnalyticsLoading />}>
        <ViewAnalyticsDashboard />
      </Suspense>
    </div>
  );
}
