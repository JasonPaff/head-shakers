import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SubcollectionsSkeleton = () => (
  <Card>
    {/* Header Section */}
    <CardHeader className={'flex-row items-center justify-between space-y-0 pb-3'}>
      <Skeleton className={'h-6 w-28'} />
      <Skeleton className={'h-8 w-8 rounded'} />
    </CardHeader>

    {/* Grid Content */}
    <CardContent>
      <div className={'grid grid-cols-1 gap-4 sm:grid-cols-2'}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Card className={'overflow-hidden py-0'} key={i}>
            {/* Image Skeleton */}
            <Skeleton className={'aspect-[4/3] w-full rounded-none'} />

            {/* Content Skeleton */}
            <CardContent className={'p-4'}>
              {/* Header with Title and Badge */}
              <div className={'mb-2 flex items-start justify-between gap-2'}>
                <div className={'min-w-0 flex-1'}>
                  <Skeleton className={'h-[44px] w-3/4'} />
                </div>
                <Skeleton className={'h-5 w-16 flex-shrink-0'} />
              </div>

              {/* Description Skeleton */}
              <div className={'space-y-1'}>
                <Skeleton className={'h-4 w-full'} />
                <Skeleton className={'h-4 w-2/3'} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </CardContent>
  </Card>
);
