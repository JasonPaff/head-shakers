import 'server-only';
import { DollarSignIcon, HeartIcon, PackageIcon, ShieldCheckIcon } from 'lucide-react';

import type { BobbleheadWithCollections } from '@/lib/queries/bobbleheads/bobbleheads-facade';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/utils/tailwind-utils';

interface BobbleheadMetricsProps {
  bobblehead: BobbleheadWithCollections;
}

const getConditionColor = (condition: null | string) => {
  if (!condition) return 'text-muted-foreground';

  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('mint') || conditionLower.includes('excellent')) return 'text-green-600';
  if (conditionLower.includes('good') || conditionLower.includes('very good')) return 'text-blue-600';
  if (conditionLower.includes('fair')) return 'text-yellow-600';
  if (conditionLower.includes('poor')) return 'text-red-600';
  return 'text-muted-foreground';
};

export const BobbleheadMetrics = ({ bobblehead }: BobbleheadMetricsProps) => {
  const conditionColor = getConditionColor(bobblehead.currentCondition);

  return (
    <div className={'mb-8 grid grid-cols-1 gap-6 md:grid-cols-4'}>
      {/* Condition Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Condition</p>
              <p className={cn('text-lg font-semibold', conditionColor)}>
                {bobblehead.currentCondition || 'Not specified'}
              </p>
            </div>
            <ShieldCheckIcon aria-hidden className={cn('size-8', conditionColor)} />
          </div>
        </CardContent>
      </Card>

      {/* Value Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Purchase Price</p>
              <p className={'text-2xl font-bold text-primary'}>
                ${bobblehead.purchasePrice?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSignIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>

      {/* Engagement Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Engagement</p>
              <div className={'flex items-center gap-3'}>
                <span className={'text-sm font-medium'}>{bobblehead.viewCount} views</span>
                <span className={'text-sm font-medium'}>{bobblehead.likeCount} likes</span>
              </div>
            </div>
            <HeartIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>

      {/* Collection Position Card */}
      <Card>
        <CardContent className={'p-6'}>
          <div className={'flex items-center justify-between'}>
            <div>
              <p className={'text-sm text-muted-foreground'}>Collection</p>
              <p className={'truncate text-sm font-medium'}>
                {bobblehead.subcollectionName || bobblehead.collectionName}
              </p>
            </div>
            <PackageIcon aria-hidden className={'size-8 text-muted-foreground'} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
