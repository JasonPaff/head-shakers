import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const AnalyticsLoading = () => (
  <div className={'space-y-6'}>
    {/* Overview Cards Loading */}
    <div className={'grid gap-4 md:grid-cols-2 lg:grid-cols-4'}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className={'flex flex-row items-center justify-between space-y-0 pb-2'}>
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-4 w-4'} />
          </CardHeader>
          <CardContent>
            <Skeleton className={'mb-2 h-8 w-16'} />
            <Skeleton className={'h-3 w-20'} />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Charts Loading */}
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className={'h-6 w-32'} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className={'h-[400px] w-full'} />
      </CardContent>
    </Card>

    {/* Table Loading */}
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className={'h-6 w-40'} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={'space-y-2'}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton className={'h-12 w-full'} key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);
