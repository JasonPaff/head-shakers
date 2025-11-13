import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const SubcollectionHeaderSkeleton = () => (
  <Fragment>
    {/* Back to Collection Button and Action Buttons */}
    <div className={'mb-6 flex items-center justify-between gap-4'}>
      <Skeleton className={'h-9 w-48'} /> {/* Back button */}
      {/* Share, Edit, Delete Buttons */}
      <div className={'flex items-center gap-2'}>
        <Skeleton className={'h-9 w-20'} /> {/* Share */}
        <Skeleton className={'h-9 w-16'} /> {/* Edit */}
        <Skeleton className={'h-9 w-16'} /> {/* Delete */}
      </div>
    </div>

    <div className={'flex flex-col gap-6'}>
      {/* Subcollection Info */}
      <div>
        <Skeleton className={'mb-3 h-10 w-64'} /> {/* Title */}
        <Skeleton className={'h-6 w-96'} /> {/* Description */}
      </div>

      {/* Subcollection Metadata & Like Button */}
      <div className={'flex flex-wrap items-center justify-between gap-4'}>
        {/* Like Button */}
        <Skeleton className={'h-8 w-20'} />

        <div className={'flex items-center gap-4'}>
          {/* Bobblehead Count */}
          <Skeleton className={'h-5 w-28'} />

          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <Skeleton className={'size-4'} />
            <Skeleton className={'h-5 w-32'} />
          </div>
        </div>
      </div>
    </div>
  </Fragment>
);
