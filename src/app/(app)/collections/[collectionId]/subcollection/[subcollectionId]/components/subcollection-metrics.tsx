import 'server-only';
import { CalendarIcon, EyeIcon, StarIcon, ZapIcon } from 'lucide-react';
import { Suspense } from 'react';

import type { PublicSubcollection } from '@/lib/facades/collections/subcollections.facade';

import { ViewCountAsync } from '@/components/analytics/async/view-count-async';
import { Card, CardContent } from '@/components/ui/card';

interface SubcollectionMetricsProps {
  currentUserId?: string;
  subcollection: PublicSubcollection;
  subcollectionId: string;
}

export const SubcollectionMetrics = ({
  currentUserId,
  subcollection,
  subcollectionId,
}: SubcollectionMetricsProps) => {
  if (!subcollection) throw new Error('Subcollection is required');

  return (
    <div className={'mb-8 grid grid-cols-1 gap-6'}>
      {/* View Count Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Views</p>
              <p className={'text-2xl font-bold'}>
                <Suspense fallback={'--'}>
                  <ViewCountAsync
                    currentUserId={currentUserId}
                    isShowingLabel={false}
                    targetId={subcollectionId}
                    targetType={'subcollection'}
                  />
                </Suspense>
              </p>
            </div>
            <EyeIcon aria-hidden className={'size-8 text-primary'} />
          </div>
        </CardContent>
      </Card>

      {/* Total Items Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Total Bobbleheads</p>
              <p className={'text-2xl font-bold'}>{subcollection.bobbleheadCount}</p>
            </div>
            <StarIcon aria-hidden className={'size-8 text-primary'} />
          </div>
        </CardContent>
      </Card>

      {/* Feature Items Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Feature Items</p>
              <p className={'text-2xl font-bold'}>{subcollection.featuredBobbleheadCount}</p>
            </div>
            <ZapIcon aria-hidden className={'size-8 text-primary'} />
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
            <CalendarIcon aria-hidden className={'size-8 text-primary'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
