import { BobbleheadsTabSkeleton } from '@/app/(app)/dashboard/collection-old/components/skeletons/bobbleheads-tab-skeleton';
import { CollectionsTabSkeleton } from '@/app/(app)/dashboard/collection-old/components/skeletons/collections-tab-skeleton';
import { DashboardHeaderSkeleton } from '@/app/(app)/dashboard/collection-old/components/skeletons/dashboard-header-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardSkeleton = () => {
  return (
    <ContentLayout>
      <DashboardHeaderSkeleton />

      <Tabs className={'mt-6'} defaultValue={'collections'}>
        <TabsList className={'grid w-full grid-cols-2'}>
          <TabsTrigger value={'collections'}>
            <Skeleton className={'h-4 w-20'} />
          </TabsTrigger>
          <TabsTrigger value={'bobbleheads'}>
            <Skeleton className={'h-4 w-20'} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value={'collections'}>
          <CollectionsTabSkeleton />
        </TabsContent>

        <TabsContent value={'bobbleheads'}>
          <BobbleheadsTabSkeleton />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};
