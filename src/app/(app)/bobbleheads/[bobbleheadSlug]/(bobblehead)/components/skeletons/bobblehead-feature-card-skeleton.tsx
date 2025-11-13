import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadFeatureCardSkeleton = () => (
  <Card className={'overflow-hidden'}>
    <div className={'grid grid-cols-1 lg:grid-cols-2'}>
      {/* Image Section */}
      <div className={'relative aspect-[3/4] lg:aspect-square'}>
        <Skeleton className={'size-full'} />

        {/* Featured Badge */}
        <Skeleton className={'absolute top-4 left-4 h-6 w-20 rounded-full'} />

        {/* Condition Badge */}
        <Skeleton className={'absolute top-4 right-4 h-6 w-16 rounded-full'} />
      </div>

      {/* Details Section */}
      <div className={'flex flex-col justify-between px-4 py-6'}>
        <div>
          <div className={'mb-4 space-y-1'}>
            {/* Character */}
            <Skeleton className={'h-6 w-48'} />
            {/* Series */}
            <Skeleton className={'h-4 w-32'} />
          </div>

          {/* Tags */}
          <div className={'mb-6 flex flex-wrap gap-2'}>
            <Skeleton className={'h-6 w-16 rounded-full'} />
            <Skeleton className={'h-6 w-20 rounded-full'} />
            <Skeleton className={'h-6 w-14 rounded-full'} />
            <Skeleton className={'h-6 w-12 rounded-full'} />
          </div>

          {/* Key Details */}
          <div className={'space-y-3 border-t pt-6'}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div className={'flex justify-between'} key={i}>
                <Skeleton className={'h-4 w-20'} />
                <Skeleton className={'h-4 w-24'} />
              </div>
            ))}
          </div>
        </div>

        {/* Like Button */}
        <div className={'mt-6'}>
          <Skeleton className={'h-10 w-full'} />
        </div>
      </div>
    </div>
  </Card>
);
