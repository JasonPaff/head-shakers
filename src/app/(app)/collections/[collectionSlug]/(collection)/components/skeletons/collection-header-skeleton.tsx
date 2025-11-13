import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const CollectionHeaderSkeleton = () => (
  <Fragment>
    {/* Back to Collections Button and Edit Button */}
    <div className={'mb-6 flex items-center justify-between gap-4'}>
      <Skeleton className={'h-9 w-40'} />

      {/* Share, Edit, Delete Buttons */}
      <div className={'flex items-center gap-2'}>
        <Skeleton className={'h-9 w-20'} />
        <Skeleton className={'h-9 w-16'} />
        <Skeleton className={'h-9 w-16'} />
      </div>
    </div>

    <div className={'flex flex-col gap-6'}>
      {/* Collection Info */}
      <div>
        <Skeleton className={'mb-3 h-10 w-64'} />
        <Skeleton className={'h-6 w-96'} />
      </div>

      {/* Collection Metadata & Like Button */}
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        {/* Like Button */}
        <Skeleton className={'h-8 w-20'} />

        <div className={'flex items-center gap-4'}>
          {/* Bobblehead Count */}
          <Skeleton className={'h-5 w-24'} />

          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'h-4 w-4'} />
            <Skeleton className={'h-5 w-32'} />
          </div>
        </div>
      </div>
    </div>
  </Fragment>
);
