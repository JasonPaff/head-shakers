import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadCardSkeleton = () => (
  <Card className={'relative overflow-hidden'}>
    <CardHeader className={'pb-2'}>
      {/* Feature Image */}
      <Skeleton className={'aspect-square w-full rounded-md'} />
    </CardHeader>

    <CardContent className={'pb-2'}>
      {/* Title */}
      <Skeleton className={'mb-2 h-6 w-full'} />

      {/* Description */}
      <Skeleton className={'h-4 w-3/4'} />
    </CardContent>

    <CardFooter className={'pt-2'}>
      <div className={'flex w-full items-center justify-between'}>
        {/* Action Buttons */}
        <div className={'flex gap-2'}>
          <Skeleton className={'h-8 w-12'} />  {/* Like */}
          <Skeleton className={'h-8 w-8'} />   {/* Share */}
          <Skeleton className={'h-8 w-8'} />   {/* More */}
        </div>

        {/* View Details Button */}
        <Skeleton className={'h-8 w-20'} />
      </div>
    </CardFooter>
  </Card>
);