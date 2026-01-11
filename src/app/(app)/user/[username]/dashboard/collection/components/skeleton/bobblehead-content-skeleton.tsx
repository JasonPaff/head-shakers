import { Fragment } from 'react';

import { BobbleheadGridSkeleton } from './bobblehead-grid-skeleton';
import { ToolbarSkeleton } from './toolbar-skeleton';

/**
 * Combined skeleton for the bobblehead content area.
 * Includes toolbar and grid skeletons (but not the collection header).
 */
export const BobbleheadContentSkeleton = () => {
  return (
    <Fragment>
      <ToolbarSkeleton />
      <BobbleheadGridSkeleton />
    </Fragment>
  );
};
