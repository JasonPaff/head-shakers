import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadSecondaryCardsSkeleton = () => (
  <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'size-2 rounded-full'} />
            <Skeleton className={'h-6 w-28'} /> {/* Card title */}
          </div>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {Array.from({ length: 3 }).map((_, j) => (
            <div className={'flex items-start gap-3'} key={j}>
              <Skeleton className={'mt-0.5 size-5 rounded-full'} /> {/* Icon */}
              <div className={'flex-1'}>
                <Skeleton className={'mb-1 h-3 w-20'} /> {/* Label */}
                <Skeleton className={'mb-1 h-4 w-32'} /> {/* Value */}
                <Skeleton className={'h-3 w-24'} /> {/* Relative time */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    ))}
  </div>
);
