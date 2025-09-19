import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedContentListItemSkeleton = () => (
  <Card>
    <CardContent className={'p-6'}>
      <div className={'flex items-center justify-between'}>
        <div className={'flex-1'}>
          {/* Title and badges */}
          <div className={'mb-2 flex items-center gap-2'}>
            <Skeleton className={'h-6 w-48'} />
            <Skeleton className={'h-5 w-20'} />
            <Skeleton className={'h-5 w-16'} />
          </div>

          {/* Main info */}
          <div className={'mb-1 flex items-center gap-4'}>
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-4 w-20'} />
            <Skeleton className={'h-4 w-28'} />
          </div>

          {/* Dates */}
          <div className={'flex items-center gap-4'}>
            <Skeleton className={'h-3 w-24'} />
            <Skeleton className={'h-3 w-24'} />
            <Skeleton className={'h-3 w-28'} />
          </div>
        </div>

        {/* Action buttons */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-8 w-20'} />
          <Skeleton className={'h-8 w-8'} />
        </div>
      </div>
    </CardContent>
  </Card>
);
