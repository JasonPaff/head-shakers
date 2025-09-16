import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const SubcollectionsSkeleton = () => (
  <Card>
    <CardHeader className={'flex-row items-center justify-between space-y-0 pb-3'}>
      <Skeleton className={'h-6 w-28'} />
      <Skeleton className={'h-8 w-8 rounded'} />
    </CardHeader>
    <CardContent>
      <div className={'space-y-3'}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div className={'flex items-center gap-3 rounded-lg border p-3'} key={i}>
            <Skeleton className={'h-12 w-12 rounded'} />
            <div className={'flex-1'}>
              <Skeleton className={'mb-1 h-4 w-24'} />
              <Skeleton className={'h-3 w-16'} />
            </div>
            <Skeleton className={'h-4 w-4'} />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);