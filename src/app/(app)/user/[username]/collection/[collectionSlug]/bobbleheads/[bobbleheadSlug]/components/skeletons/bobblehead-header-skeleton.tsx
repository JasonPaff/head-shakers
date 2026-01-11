import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadHeaderSkeleton = () => (
  <Fragment>
    {/* Navigation and Actions Row */}
    <div className={'mb-6 flex items-center justify-between gap-4'}>
      {/* Back Button */}
      <Skeleton className={'h-9 w-40'} />

      {/* Action Buttons */}
      <div className={'flex items-center gap-2'}>
        <Skeleton className={'h-9 w-20'} /> {/* Share button */}
        <Skeleton className={'h-9 w-16'} /> {/* Edit button */}
        <Skeleton className={'h-9 w-20'} /> {/* Delete button */}
      </div>
    </div>

    {/* Collection Breadcrumb */}
    <div className={'mb-4'}>
      <Skeleton className={'h-5 w-56'} />
    </div>

    <div className={'flex flex-col gap-6'}>
      {/* Title and Description */}
      <div>
        <Skeleton className={'mb-3 h-10 w-80'} /> {/* Title */}
        <Skeleton className={'h-6 w-96'} /> {/* Description */}
      </div>

      {/* Metadata & Like Button */}
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        {/* Like Button */}
        <Skeleton className={'h-8 w-24'} /> {/* Like button */}
        <div className={'flex items-center gap-4'}>
          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'size-4'} /> {/* Calendar icon */}
            <Skeleton className={'h-5 w-32'} /> {/* Date */}
          </div>

          {/* View Count */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'size-4'} /> {/* Eye icon */}
            <Skeleton className={'h-5 w-20'} /> {/* View count */}
          </div>
        </div>
      </div>
    </div>
  </Fragment>
);
