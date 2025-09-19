import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface FeaturedCardSkeletonProps {
  isHero?: boolean;
}

export const FeaturedCardSkeleton = ({ isHero = false }: FeaturedCardSkeletonProps) => {
  const cardClasses = isHero ? 'col-span-full lg:col-span-2' : 'col-span-1';
  const imageHeight = isHero ? 'h-64 lg:h-80' : 'h-48';

  return (
    <Card className={cardClasses}>
      {/* Image area */}
      <div className={'relative'}>
        <Skeleton className={`w-full rounded-t-lg ${imageHeight}`} />
        {/* Badges overlay */}
        <div className={'absolute top-4 left-4 flex gap-2'}>
          <Skeleton className={'h-6 w-20'} /> {/* Content type badge */}
          {isHero && <Skeleton className={'h-6 w-16'} />} {/* Featured badge */}
        </div>
      </div>

      {/* Card header */}
      <CardHeader className={'pb-3'}>
        <Skeleton className={`mb-3 ${isHero ? 'h-8 w-64' : 'h-6 w-48'}`} /> {/* Title */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-4 w-16'} /> {/* "by Owner" */}
          <span className={'text-muted-foreground'}>•</span>
          <Skeleton className={'h-4 w-24'} /> {/* Date */}
        </div>
      </CardHeader>

      {/* Card content */}
      <CardContent className={'pt-0'}>
        <Skeleton className={`mb-4 ${isHero ? 'h-5 w-full' : 'h-4 w-full'}`} /> {/* Description line 1 */}
        <Skeleton className={`mb-4 ${isHero ? 'h-5 w-3/4' : 'h-4 w-2/3'}`} /> {/* Description line 2 */}
        {/* Stats and actions */}
        <div className={'flex items-center justify-between'}>
          <div className={'flex items-center gap-4 text-sm'}>
            <Skeleton className={'h-4 w-12'} /> {/* Views */}
            <Skeleton className={'h-4 w-8'} /> {/* Comments */}
            <Skeleton className={'h-4 w-8'} /> {/* Likes */}
          </div>
          <Skeleton className={'h-9 w-24'} /> {/* View button */}
        </div>
      </CardContent>
    </Card>
  );
};
