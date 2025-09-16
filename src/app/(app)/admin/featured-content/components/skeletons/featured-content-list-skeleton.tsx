import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { FeaturedContentListItemSkeleton } from './featured-content-list-item-skeleton';

export const FeaturedContentListSkeleton = () => (
  <div className={'space-y-4'}>
    {/* Filters Section */}
    <Card>
      <CardHeader>
        <Skeleton className={'h-6 w-16'} />
      </CardHeader>
      <CardContent>
        <div className={'flex gap-4'}>
          <Skeleton className={'h-10 flex-1'} />
          <Skeleton className={'h-10 w-[180px]'} />
          <Skeleton className={'h-10 w-[140px]'} />
          <Skeleton className={'h-10 w-[140px]'} />
        </div>
      </CardContent>
    </Card>

    {/* Content List */}
    <div className={'space-y-4'}>
      {Array.from({ length: 3 }).map((_, i) => (
        <FeaturedContentListItemSkeleton key={i} />
      ))}
    </div>
  </div>
);