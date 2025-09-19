import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsSkeleton = () => (
  <div className={'space-y-6'}>
    {/* Overview Stats */}
    <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <Skeleton className={'h-4 w-20'} />
            <Skeleton className={'h-4 w-4'} />
          </CardHeader>
          <CardContent>
            <Skeleton className={'mb-1 h-8 w-16'} />
            <Skeleton className={'h-3 w-24'} />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Performance Charts */}
    <div className={'grid gap-6 lg:grid-cols-2'}>
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <Skeleton className={'h-6 w-40'} />
            <Skeleton className={'h-10 w-[120px]'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={'space-y-4'}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div className={'flex items-center justify-between'} key={i}>
                <div className={'flex items-center gap-3'}>
                  <Skeleton className={'h-8 w-8 rounded-full'} />
                  <div>
                    <Skeleton className={'mb-1 h-4 w-32'} />
                    <Skeleton className={'h-3 w-16'} />
                  </div>
                </div>
                <div className={'text-right'}>
                  <Skeleton className={'mb-1 h-4 w-16'} />
                  <Skeleton className={'h-3 w-12'} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className={'flex items-center justify-between'}>
            <Skeleton className={'h-6 w-32'} />
            <Skeleton className={'h-10 w-[120px]'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className={'space-y-4'}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div className={'flex items-center justify-between'} key={i}>
                <div className={'flex items-center gap-3'}>
                  <Skeleton className={'h-2 w-2 rounded-full'} />
                  <div>
                    <Skeleton className={'mb-1 h-4 w-20'} />
                    <Skeleton className={'h-3 w-16'} />
                  </div>
                </div>
                <div className={'text-right'}>
                  <Skeleton className={'mb-1 h-4 w-12'} />
                  <Skeleton className={'h-3 w-8'} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Feature Type Breakdown */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-48'} />
      </CardHeader>
      <CardContent>
        <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div className={'rounded-lg bg-muted p-4'} key={i}>
              <div className={'mb-2 flex items-center gap-2'}>
                <Skeleton className={'h-3 w-3 rounded-full'} />
                <Skeleton className={'h-4 w-24'} />
              </div>
              <Skeleton className={'mb-1 h-8 w-16'} />
              <Skeleton className={'h-3 w-32'} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
