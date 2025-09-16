import { DashboardStatsSkeleton } from '@/app/(app)/dashboard/collection/(collection)/components/skeletons/dashboard-stats-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardHeaderSkeleton = () => {
  return (
    <div className={'mb-8'}>
      <div className={'mt-4 mb-6 flex items-start justify-between'}>
        <div className={'space-y-2'}>
          <Skeleton className={'h-8 w-80'} />
          <Skeleton className={'h-4 w-96'} />
        </div>
        <Skeleton className={'h-10 w-32'} />
      </div>

      <DashboardStatsSkeleton />
    </div>
  );
};