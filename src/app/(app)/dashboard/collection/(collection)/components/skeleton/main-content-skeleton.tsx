import { Fragment } from 'react';

import { BobbleheadGridSkeleton } from './bobblehead-grid-skeleton';
import { CollectionHeaderSkeleton } from './collection-header-skeleton';
import { ToolbarSkeleton } from './toolbar-skeleton';

export const MainContentSkeleton = () => {
  return (
    <Fragment>
      <CollectionHeaderSkeleton />
      <ToolbarSkeleton />
      <BobbleheadGridSkeleton />
    </Fragment>
  );
};
