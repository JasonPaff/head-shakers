import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadFeatureCardSkeleton = () => (
  <Card className={'overflow-hidden'} data-slot={'bobblehead-feature-card-skeleton'}>
    {/* Primary Image Section */}
    <div className={'relative aspect-[3/4] lg:aspect-square'} data-slot={'skeleton-image'}>
      <Skeleton className={'size-full'} />

      {/* Featured Badge */}
      <Skeleton className={'absolute top-4 left-4 h-6 w-20 rounded-full'} />

      {/* Condition Badge */}
      <Skeleton className={'absolute top-4 right-4 h-6 w-16 rounded-full'} />
    </div>

    {/* Thumbnail Gallery Skeleton */}
    <div className={'flex gap-2 px-4 pt-4'} data-slot={'skeleton-gallery'}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton className={'size-16 shrink-0 rounded-md'} key={i} />
      ))}
    </div>

    {/* Content Section */}
    <div className={'space-y-6 p-4'} data-slot={'skeleton-content'}>
      {/* Quick Info Skeleton */}
      <div className={'space-y-4'} data-slot={'skeleton-quick-info'}>
        {/* Character & Series */}
        <div className={'space-y-2'}>
          <Skeleton className={'h-7 w-48'} />
          <Skeleton className={'h-4 w-32'} />
        </div>

        {/* Manufacturer & Year */}
        <div className={'space-y-2'}>
          <div className={'flex justify-between'}>
            <Skeleton className={'h-4 w-24'} />
            <Skeleton className={'h-4 w-20'} />
          </div>
          <div className={'flex justify-between'}>
            <Skeleton className={'h-4 w-16'} />
            <Skeleton className={'h-4 w-12'} />
          </div>
        </div>

        {/* Category Badge */}
        <Skeleton className={'h-6 w-24 rounded-full'} />

        {/* Tags */}
        <div className={'flex flex-wrap gap-2'}>
          <Skeleton className={'h-6 w-16 rounded-full'} />
          <Skeleton className={'h-6 w-20 rounded-full'} />
          <Skeleton className={'h-6 w-14 rounded-full'} />
        </div>
      </div>

      <Separator />

      {/* Social Bar Skeleton */}
      <div className={'flex items-center gap-4'} data-slot={'skeleton-social'}>
        <Skeleton className={'h-9 w-20'} />
        <Skeleton className={'h-9 w-24'} />
        <Skeleton className={'h-9 w-16'} />
      </div>

      <Separator />

      {/* Collapsible Sections Skeleton */}
      <div className={'space-y-4'} data-slot={'skeleton-sections'}>
        {/* Specifications Section */}
        <div className={'rounded-lg border p-4'}>
          <div className={'flex items-center justify-between'}>
            <Skeleton className={'h-5 w-32'} />
            <Skeleton className={'h-5 w-5'} />
          </div>
        </div>

        {/* Acquisition Section */}
        <div className={'rounded-lg border p-4'}>
          <div className={'flex items-center justify-between'}>
            <Skeleton className={'h-5 w-40'} />
            <Skeleton className={'h-5 w-5'} />
          </div>
        </div>
      </div>
    </div>
  </Card>
);
