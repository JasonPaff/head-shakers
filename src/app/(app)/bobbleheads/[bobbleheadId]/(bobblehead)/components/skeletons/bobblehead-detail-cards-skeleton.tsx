import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadDetailCardsSkeleton = () => (
  <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Card key={i}>
        <CardHeader>
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'size-2 rounded-full'} />
            <Skeleton className={'h-6 w-32'} /> {/* Card title */}
          </div>
        </CardHeader>
        <CardContent className={'space-y-4'}>
          {Array.from({ length: 5 }).map((_, j) => (
            <div className={'flex items-center gap-3'} key={j}>
              <Skeleton className={'size-4'} /> {/* Icon */}
              <div className={'flex-1'}>
                <Skeleton className={'mb-1 h-3 w-20'} /> {/* Label */}
                <Skeleton className={'h-4 w-24'} /> {/* Value */}
              </div>
            </div>
          ))}

          {/* Tags section for some cards */}
          {i === 0 && (
            <div className={'pt-2'}>
              <Skeleton className={'mb-2 h-3 w-16'} /> {/* Tags label */}
              <div className={'flex flex-wrap gap-2'}>
                <Skeleton className={'h-5 w-12 rounded-full'} />
                <Skeleton className={'h-5 w-16 rounded-full'} />
                <Skeleton className={'h-5 w-14 rounded-full'} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
);
