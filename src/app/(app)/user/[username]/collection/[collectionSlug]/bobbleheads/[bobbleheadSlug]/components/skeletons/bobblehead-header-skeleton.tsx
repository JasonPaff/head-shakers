import { Fragment } from 'react';

import { Skeleton } from '@/components/ui/skeleton';

export const BobbleheadHeaderSkeleton = () => (
  <Fragment>
    <div className={'flex flex-col gap-6'}>
      {/* Title and Description */}
      <div>
        <Skeleton className={'mb-3 h-10 w-80'} /> {/* Title */}
        <Skeleton className={'h-6 w-96'} /> {/* Description */}
      </div>

      {/* Metadata */}
      <div className={'flex items-center gap-4'}>
        {/* Creation Date */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'size-4'} /> {/* Calendar icon */}
        </div>

        {/* View Count */}
        <div className={'flex items-center gap-2'}>
          <Skeleton className={'h-4 w-16'} /> {/* View count */}
        </div>
      </div>
    </div>
  </Fragment>
);
