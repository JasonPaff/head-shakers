import 'server-only';
import { CalendarIcon } from 'lucide-react';
import { Fragment, Suspense } from 'react';

import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { ViewCountAsync } from '@/components/analytics/async/view-count-async';
import { Skeleton } from '@/components/ui/skeleton';

interface BobbleheadHeaderProps {
  bobblehead: BobbleheadWithRelations;
}

export const BobbleheadHeader = ({ bobblehead }: BobbleheadHeaderProps) => {
  return (
    <Fragment>
      <div className={'flex flex-col gap-6'}>
        {/* Title and Description */}
        <div>
          <h1 className={'mb-3 text-4xl font-bold text-balance text-primary'}>{bobblehead.name}</h1>
          <p className={'text-lg text-pretty text-muted-foreground'}>{bobblehead.description}</p>
        </div>

        {/* Metadata */}
        <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
          {/* Creation Date */}
          <div className={'flex items-center gap-2'}>
            <CalendarIcon aria-hidden className={'size-4'} />
            {/*Added {bobblehead.createdAt.toLocaleDateString()}*/}
          </div>

          {/* View Count */}
          <div className={'flex items-center gap-2'}>
            <span className={'text-sm font-medium'}>
              <Suspense fallback={<Skeleton className={'h-4 w-16'} />}>
                <ViewCountAsync targetId={bobblehead.id} targetType={'bobblehead'} />
              </Suspense>
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
};
