import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SubcollectionMetricsSkeleton = () => (
  <div className={'mb-8 grid grid-cols-1 gap-6'}>
    {/* Total Items Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-32'} /> {/* Label */}
            <Skeleton className={'h-8 w-12'} /> {/* Count */}
          </div>
          <Skeleton className={'size-8'} /> {/* Icon */}
        </div>
      </CardContent>
    </Card>

    {/* Feature Items Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-28'} /> {/* Label */}
            <Skeleton className={'size-8'} /> {/* Count */}
          </div>
          <Skeleton className={'size-8'} /> {/* Icon */}
        </div>
      </CardContent>
    </Card>

    {/* Last Updated Card */}
    <Card>
      <CardContent className={'p-6'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <Skeleton className={'mb-2 h-4 w-24'} /> {/* Label */}
            <Skeleton className={'h-4 w-20'} /> {/* Date */}
          </div>
          <Skeleton className={'size-8'} /> {/* Icon */}
        </div>
      </CardContent>
    </Card>
  </div>
);
