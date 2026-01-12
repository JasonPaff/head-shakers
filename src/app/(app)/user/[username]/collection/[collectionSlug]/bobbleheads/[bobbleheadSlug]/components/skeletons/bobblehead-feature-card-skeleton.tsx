import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

const QuickInfoSkeleton = () => (
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
);

const SocialBarSkeleton = () => (
  <div className={'flex items-center gap-4'} data-slot={'skeleton-social'}>
    <Skeleton className={'h-9 w-20'} />
    <Skeleton className={'h-9 w-24'} />
    <Skeleton className={'h-9 w-16'} />
  </div>
);

const CollapsibleSectionsSkeleton = () => (
  <div className={'space-y-4'} data-slot={'skeleton-sections'}>
    {/* Description Section */}
    <div className={'rounded-lg border p-4'}>
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-5 w-28'} />
        <Skeleton className={'h-5 w-5'} />
      </div>
    </div>

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

    {/* Status Section */}
    <div className={'rounded-lg border p-4'}>
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-5 w-20'} />
        <Skeleton className={'h-5 w-5'} />
      </div>
    </div>

    {/* Custom Fields Section */}
    <div className={'rounded-lg border p-4'}>
      <div className={'flex items-center justify-between'}>
        <Skeleton className={'h-5 w-36'} />
        <Skeleton className={'h-5 w-5'} />
      </div>
    </div>
  </div>
);

export const BobbleheadFeatureCardSkeleton = () => (
  <Card className={'overflow-hidden'} data-slot={'bobblehead-feature-card-skeleton'}>
    {/* Two-column layout on desktop, single column on mobile */}
    <div className={'flex flex-col lg:flex-row'}>
      {/* Left Column: Image Section */}
      <div className={'lg:w-[55%] xl:w-[50%]'}>
        {/* Primary Image Section */}
        <div className={'relative aspect-[3/4] lg:aspect-[4/5] xl:aspect-[3/4]'} data-slot={'skeleton-image'}>
          <Skeleton className={'size-full'} />

          {/* Featured Badge */}
          <Skeleton className={'absolute top-4 left-4 h-6 w-20 rounded-full'} />

          {/* Condition Badge */}
          <Skeleton className={'absolute top-4 right-4 h-6 w-16 rounded-full'} />
        </div>

        {/* Thumbnail Gallery Skeleton */}
        <div className={'flex gap-2 p-4'} data-slot={'skeleton-gallery'}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton className={'size-16 shrink-0 rounded-md'} key={i} />
          ))}
        </div>
      </div>

      {/* Right Column: Info Sidebar (desktop only) */}
      <div
        className={'hidden border-l border-border lg:flex lg:w-[45%] lg:flex-col xl:w-[50%]'}
        data-slot={'skeleton-sidebar'}
      >
        <div className={'flex flex-1 flex-col space-y-6 p-6'}>
          <QuickInfoSkeleton />
          <Separator />
          <SocialBarSkeleton />
          <Separator />
          <div className={'flex-1'}>
            <CollapsibleSectionsSkeleton />
          </div>
        </div>
      </div>
    </div>

    {/* Mobile Content Section (hidden on desktop) */}
    <div className={'space-y-6 p-4 lg:hidden'} data-slot={'skeleton-content'}>
      <QuickInfoSkeleton />
      <Separator />
      <SocialBarSkeleton />
      <Separator />
      <CollapsibleSectionsSkeleton />
    </div>
  </Card>
);
