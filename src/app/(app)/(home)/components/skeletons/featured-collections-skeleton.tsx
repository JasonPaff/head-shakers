import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedCollectionsSkeleton = () => {
  return (
    <div className={'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card className={'overflow-hidden'} key={index}>
          <Skeleton className={'aspect-[4/3] w-full rounded-none'} />
          <CardContent className={'p-4'}>
            <div className={'mb-3'}>
              <Skeleton className={'mb-2 h-6 w-3/4'} />
              <Skeleton className={'h-4 w-1/2'} />
            </div>
            <div className={'mb-4 space-y-2'}>
              <Skeleton className={'h-4 w-full'} />
              <Skeleton className={'h-4 w-5/6'} />
            </div>
            <div className={'flex items-center justify-between'}>
              <Skeleton className={'h-8 w-16'} />
              <Skeleton className={'h-9 w-32'} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
