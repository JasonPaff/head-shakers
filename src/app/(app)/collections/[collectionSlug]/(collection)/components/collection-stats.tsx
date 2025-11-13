import 'server-only';
import { CalendarIcon, EyeIcon, FolderIcon, StarIcon } from 'lucide-react';
import { Suspense } from 'react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { ViewCountAsync } from '@/components/analytics/async/view-count-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CollectionStatsProps {
  collection: PublicCollection;
  collectionId: string;
}

export const CollectionStats = ({ collection, collectionId }: CollectionStatsProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={'space-y-3'}>
          <li className={'flex items-center gap-3'}>
            <EyeIcon aria-hidden className={'size-4 text-muted-foreground'} />
            <span className={'text-sm text-muted-foreground'}>Views:</span>
            <span className={'font-medium'}>
              <Suspense fallback={'-- views'}>
                <ViewCountAsync targetId={collectionId} targetType={'collection'} />
              </Suspense>
            </span>
          </li>
          <li className={'flex items-center gap-3'}>
            <StarIcon aria-hidden className={'size-4 text-muted-foreground'} />
            <span className={'text-sm text-muted-foreground'}>Total Bobbleheads:</span>
            <span className={'font-medium'}>{collection.totalBobbleheadCount}</span>
          </li>
          <li className={'flex items-center gap-3'}>
            <FolderIcon aria-hidden className={'size-4 text-muted-foreground'} />
            <span className={'text-sm text-muted-foreground'}>Subcollections:</span>
            <span className={'font-medium'}>{collection.subCollectionCount}</span>
          </li>
          <li className={'flex items-center gap-3'}>
            <CalendarIcon aria-hidden className={'size-4 text-muted-foreground'} />
            <span className={'text-sm text-muted-foreground'}>Last Updated:</span>
            <span className={'text-sm font-medium'}>
              {collection.lastUpdatedAt ? new Date(collection.lastUpdatedAt).toLocaleDateString() : 'N/A'}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};
