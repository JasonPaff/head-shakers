import { BobbleheadsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/bobbleheads-tab-skeleton';
import { CollectionsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/collections-tab-skeleton';
import { DashboardHeaderSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/dashboard-header-skeleton';
import { SubcollectionsTabSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/subcollections-tab-skeleton';
import { ContentLayout } from '@/components/layout/content-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const DashboardSkeleton = () => {
  return (
    <ContentLayout>
      <DashboardHeaderSkeleton />

      <Tabs className={'mt-6'} defaultValue={'collections'}>
        <TabsList className={'grid w-full grid-cols-3'}>
          <TabsTrigger value={'collections'}>
            <Skeleton className={'h-4 w-20'} />
          </TabsTrigger>
          <TabsTrigger value={'subcollections'}>
            <Skeleton className={'h-4 w-24'} />
          </TabsTrigger>
          <TabsTrigger value={'bobbleheads'}>
            <Skeleton className={'h-4 w-20'} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value={'collections'}>
          <CollectionsTabSkeleton />
        </TabsContent>

        <TabsContent value={'subcollections'}>
          <SubcollectionsTabSkeleton />
        </TabsContent>

        <TabsContent value={'bobbleheads'}>
          <BobbleheadsTabSkeleton />
        </TabsContent>
      </Tabs>
    </ContentLayout>
  );
};