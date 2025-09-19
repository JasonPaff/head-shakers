import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CollectionCardSkeleton = () => {
  return (
    <Card className={'relative flex flex-col'}>
      <CardHeader className={'pb-3'}>
        {/* Title and Privacy Status */}
        <div className={'flex items-start justify-between'}>
          <Skeleton className={'h-6 w-48'} />
          <Skeleton className={'h-4 w-4'} />
        </div>

        {/* Description */}
        <Skeleton className={'h-4 w-full'} />
        <Skeleton className={'h-4 w-3/4'} />

        {/* Actions Menu */}
        <div className={'absolute top-4 right-4'}>
          <Skeleton className={'h-8 w-8'} />
        </div>
      </CardHeader>

      <CardContent className={'flex flex-1 flex-col'}>
        <div className={'flex-1 space-y-4'}>
          {/* Metrics Badges */}
          <div className={'flex items-center gap-4'}>
            <Skeleton className={'h-6 w-20'} />
            <Skeleton className={'h-6 w-24'} />
          </div>

          {/* Subcollections Section */}
          <div className={'space-y-2'}>
            <Skeleton className={'h-8 w-full'} />
            <div className={'space-y-1'}>
              <Skeleton className={'h-4 w-full'} />
              <Skeleton className={'h-4 w-4/5'} />
              <Skeleton className={'h-4 w-3/4'} />
            </div>
          </div>

          {/* Add Subcollection Button */}
          <Skeleton className={'h-8 w-full'} />
        </div>

        {/* View Collection Button */}
        <Skeleton className={'mt-4 h-10 w-full'} />
      </CardContent>
    </Card>
  );
};
