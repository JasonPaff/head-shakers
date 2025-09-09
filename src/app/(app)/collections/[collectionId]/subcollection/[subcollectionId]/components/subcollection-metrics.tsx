import 'server-only';
import { CalendarIcon, EyeIcon, StarIcon } from 'lucide-react';

import type { PublicSubcollection } from '@/lib/queries/collections/collections-facade';

import { Card, CardContent } from '@/components/ui/card';

interface SubcollectionMetricsProps {
  subcollection: PublicSubcollection;
}

export const SubcollectionMetrics = ({ subcollection }: SubcollectionMetricsProps) => {
  if (!subcollection) throw new Error('Subcollection is required');

  return (
    <div className={'mb-8 grid grid-cols-1 gap-6 md:grid-cols-3'}>
      {/* Total Items Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Total Bobbleheads</p>
              <p className={'text-2xl font-bold text-primary'}>{subcollection.bobbleheadCount}</p>
            </div>
            <StarIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>

      {/* Feature Items Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Feature Items</p>
              <p className={'text-2xl font-bold text-primary'}>{subcollection.featuredBobbleheadCount}</p>
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
                {subcollection.lastUpdatedAt?.toLocaleDateString() ?? 'N/A'}
              </p>
            </div>
            <CalendarIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
