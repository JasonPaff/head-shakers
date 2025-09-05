import 'server-only';
import { CalendarIcon, EyeIcon, StarIcon } from 'lucide-react';

import type { CollectionById } from '@/lib/queries/collections.queries';

import { Card, CardContent } from '@/components/ui/card';

interface CollectionMetricsProps {
  collection: CollectionById;
}

export const CollectionMetrics = ({ collection }: CollectionMetricsProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <div className={'mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'}>
      {/* Total Items Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Total Bobbleheads</p>
              <p className={'text-2xl font-bold text-primary'}>{collection.totalBobbleheadCount}</p>
            </div>
            <StarIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>

      {/* Example Metric Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Subcollections</p>
              <p className={'text-2xl font-bold text-primary'}>{collection.subCollectionCount}</p>
            </div>
            <EyeIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>

      {/* Last Updated Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Last Updated</p>
              <p className={'text-sm font-medium text-foreground'}>
                {collection.lastUpdatedAt?.toLocaleDateString() ?? 'N/A'}
              </p>
            </div>
            <CalendarIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
