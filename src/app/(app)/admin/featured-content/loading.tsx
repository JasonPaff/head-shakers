import { FeaturedContentListSkeleton } from '@/app/(app)/admin/featured-content/components/skeletons/featured-content-list-skeleton';
import { QuickStatsSkeleton } from '@/app/(app)/admin/featured-content/components/skeletons/quick-stats-skeleton';
import { AdminLayout } from '@/components/layout/admin/admin-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function FeaturedContentLoading() {
  return (
    <AdminLayout isAdminRequired={false}>
      <div className={'space-y-6'}>
        {/* Static Header */}
        <div className={'flex items-center justify-between'}>
          <div>
            <h2 className={'text-2xl font-bold tracking-tight'}>Featured Content Management</h2>
            <p className={'text-muted-foreground'}>
              Manage featured collections, bobbleheads, and user spotlights displayed across the platform
            </p>
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <QuickStatsSkeleton />

        {/* Main Content Skeleton */}
        <div className={'space-y-6'}>
          <Tabs defaultValue={'list'}>
            <div className={'flex items-center justify-between'}>
              <TabsList>
                <TabsTrigger value={'list'}>Featured Content</TabsTrigger>
                <TabsTrigger value={'suggestions'}>Suggestions</TabsTrigger>
                <TabsTrigger value={'analytics'}>Analytics</TabsTrigger>
              </TabsList>
              <Skeleton className={'h-10 w-48'} />
            </div>

            <TabsContent className={'space-y-4'} value={'list'}>
              <FeaturedContentListSkeleton />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
