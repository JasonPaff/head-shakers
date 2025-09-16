import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadMetricsSkeleton = () => (
  <div className={'mb-8 grid grid-cols-1 gap-6 md:grid-cols-4'}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div className={'flex-1'}>
              <Skeleton className={'mb-2 h-4 w-20'} /> {/* Label */}
              <Skeleton className={'h-6 w-24'} /> {/* Value */}
            </div>
            <Skeleton className={'size-8 rounded-full'} /> {/* Icon */}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);
