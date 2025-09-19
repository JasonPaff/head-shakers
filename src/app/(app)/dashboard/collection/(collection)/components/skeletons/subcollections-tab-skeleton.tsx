import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SubcollectionsTabSkeleton = () => {
  return (
    <div className={'mt-6 space-y-6'}>
      {/* Header Section */}
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-6 w-40'} />
        <div className={'flex items-center gap-3'}>
          <Skeleton className={'h-8 w-24'} />
          <Skeleton className={'h-10 w-72'} />
        </div>
      </div>

      {/* Collection Groups */}
      <div className={'space-y-4'}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card className={'border-border/50 shadow-sm'} key={i}>
            <CardHeader className={'pb-3'}>
              <div className={'flex items-center justify-between'}>
                <div className={'flex items-center gap-3'}>
                  <div className={'flex flex-col gap-1'}>
                    <div className={'flex items-center gap-2'}>
                      <Skeleton className={'size-5'} />
                      <Skeleton className={'h-5 w-32'} />
                    </div>
                    <Skeleton className={'ml-7 h-4 w-80'} />
                  </div>
                  <div className={'flex items-center gap-2'}>
                    <Skeleton className={'h-6 w-24'} />
                    <Skeleton className={'size-4'} />
                  </div>
                </div>
                <Skeleton className={'h-8 w-8'} />
              </div>
            </CardHeader>

            {/* Subcollections Items */}
            <div className={'space-y-2 px-6 pb-4'}>
              {Array.from({ length: 2 + i }).map((_, j) => (
                <div className={'flex items-center justify-between rounded-md border p-3'} key={j}>
                  <div className={'flex items-center gap-3'}>
                    <Skeleton className={'size-4'} />
                    <div className={'space-y-1'}>
                      <Skeleton className={'h-4 w-24'} />
                      <Skeleton className={'h-3 w-40'} />
                    </div>
                  </div>
                  <div className={'flex items-center gap-2'}>
                    <Skeleton className={'h-5 w-8'} />
                    <Skeleton className={'h-8 w-8'} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
