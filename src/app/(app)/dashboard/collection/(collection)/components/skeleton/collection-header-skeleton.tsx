import { Card, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CollectionHeaderSkeleton = () => {
  return (
    <Card
      aria-busy={'true'}
      aria-label={'Loading collection header'}
      className={'m-4 mb-0 hidden lg:block'}
      data-slot={'collection-header-skeleton'}
      role={'status'}
    >
      <span className={'sr-only'}>Loading collection details...</span>
      <CardHeader className={'border-b'}>
        <div className={'flex items-start justify-between'}>
          <div className={'flex items-start gap-4'}>
            {/* Cover Image Skeleton */}
            <Skeleton className={'size-20 rounded-md'} />

            {/* Collection Info Skeleton */}
            <div className={'flex-1 space-y-2'}>
              <Skeleton className={'h-8 w-48'} />
              <Skeleton className={'h-4 w-full max-w-md'} />
              <Skeleton className={'h-4 w-3/4 max-w-sm'} />

              {/* Stats Row Skeleton */}
              <div className={'flex items-center gap-4'}>
                <Skeleton className={'h-4 w-16'} />
                <Skeleton className={'h-4 w-20'} />
                <Skeleton className={'h-4 w-24'} />
                <Skeleton className={'h-4 w-16'} />
                <Skeleton className={'h-4 w-20'} />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'h-8 w-16'} />
            <Skeleton className={'h-8 w-16'} />
            <Skeleton className={'size-8'} />
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
