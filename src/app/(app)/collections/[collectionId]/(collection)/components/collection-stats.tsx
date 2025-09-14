import 'server-only';
import { CalendarIcon, FolderIcon, StarIcon } from 'lucide-react';

import type { PublicCollection } from '@/lib/facades/collections/collections.facade';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CollectionStatsProps {
  collection: PublicCollection;
}

export const CollectionStats = ({ collection }: CollectionStatsProps) => {
  if (!collection) throw new Error('Collection is required');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className={'space-y-3'}>
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
              {collection.lastUpdatedAt?.toLocaleDateString() ?? 'N/A'}
            </span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};