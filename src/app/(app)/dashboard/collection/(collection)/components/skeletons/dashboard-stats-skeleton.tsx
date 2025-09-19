import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const DashboardStatsSkeleton = () => {
  return (
    <div className={'grid grid-cols-1 gap-4 sm:grid-cols-3'}>
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardContent className={'flex items-center gap-3 p-4'}>
            <div className={'rounded-md bg-muted/50 p-2'}>
              <Skeleton className={'size-5'} />
            </div>
            <div className={'space-y-2'}>
              <Skeleton className={'h-3 w-20'} />
              <Skeleton className={'h-6 w-8'} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
