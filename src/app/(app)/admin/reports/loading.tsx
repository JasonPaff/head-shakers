import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsLoadingPage() {
  return (
    <div className={'container mx-auto py-8'}>
      {/* Page Header */}
      <div className={'mb-8'}>
        <Skeleton className={'mb-2 h-9 w-64'} />
        <Skeleton className={'h-5 w-96'} />
      </div>

      {/* Quick Stats Skeleton */}
      <div className={'mb-6 grid gap-4 md:grid-cols-4'}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card className={'p-4'} key={index}>
            <Skeleton className={'mb-2 h-4 w-24'} />
            <Skeleton className={'h-8 w-16'} />
          </Card>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className={'mb-6'}>
        <Card className={'p-6'}>
          <div className={'mb-4 flex items-center justify-between'}>
            <Skeleton className={'h-6 w-32'} />
            <Skeleton className={'h-9 w-24'} />
          </div>
          <div className={'grid gap-4 md:grid-cols-3'}>
            <Skeleton className={'h-10 w-full'} />
            <Skeleton className={'h-10 w-full'} />
            <Skeleton className={'h-10 w-full'} />
          </div>
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card className={'overflow-hidden'}>
        {/* Table Header */}
        <div className={'border-b bg-muted/50 p-4'}>
          <div className={'flex gap-4'}>
            <Skeleton className={'size-4'} />
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-32'} />
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-4 w-20'} />
            <Skeleton className={'ml-auto h-4 w-16'} />
          </div>
        </div>

        {/* Table Rows */}
        <div className={'divide-y'}>
          {Array.from({ length: 10 }).map((_, index) => (
            <div className={'flex gap-4 p-4'} key={index}>
              <Skeleton className={'size-4'} />
              <div className={'flex-1 space-y-2'}>
                <Skeleton className={'h-4 w-full max-w-md'} />
                <Skeleton className={'h-3 w-full max-w-xs'} />
              </div>
              <Skeleton className={'h-6 w-24'} />
              <Skeleton className={'h-4 w-32'} />
              <Skeleton className={'h-4 w-32'} />
              <Skeleton className={'h-4 w-24'} />
              <Skeleton className={'h-6 w-20'} />
              <Skeleton className={'size-8 rounded'} />
            </div>
          ))}
        </div>

        {/* Pagination Skeleton */}
        <div className={'border-t p-4'}>
          <div className={'flex items-center justify-between'}>
            <Skeleton className={'h-4 w-48'} />
            <div className={'flex gap-2'}>
              <Skeleton className={'h-8 w-20'} />
              <Skeleton className={'h-8 w-20'} />
              <Skeleton className={'h-8 w-20'} />
              <Skeleton className={'h-8 w-20'} />
            </div>
            <div className={'flex gap-2'}>
              <Skeleton className={'h-8 w-20'} />
              <Skeleton className={'h-8 w-24'} />
              <Skeleton className={'h-8 w-16'} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
