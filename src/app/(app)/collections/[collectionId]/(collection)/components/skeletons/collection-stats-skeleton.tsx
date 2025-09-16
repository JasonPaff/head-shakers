import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const CollectionStatsSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className={'h-6 w-32'} />
    </CardHeader>
    <CardContent>
      <ul className={'space-y-3'}>
        {Array.from({ length: 3 }).map((_, i) => (
          <li className={'flex items-center gap-3'} key={i}>
            <Skeleton className={'h-4 w-4 rounded'} />
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'ml-auto h-4 w-8'} />
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);