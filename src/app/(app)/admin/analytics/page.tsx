import { requireModerator } from '@/lib/utils/admin.utils';

// Force dynamic rendering for admin pages
export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireModerator();

  return (
    <div className={'container mx-auto py-8'}>
      <div className={'mb-8'}>
        <h1 className={'text-3xl font-bold'}>Analytics Dashboard</h1>
        <p className={'mt-2 text-muted-foreground'}>
          Monitor platform usage, engagement, and performance metrics.
        </p>
      </div>

      <div className={'space-y-6'}>
        <div className={'rounded-lg border p-6'}>
          <h2 className={'mb-4 text-xl font-semibold'}>Platform Analytics</h2>
          <div className={'py-12 text-center text-muted-foreground'}>
            <p>Analytics dashboard coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
