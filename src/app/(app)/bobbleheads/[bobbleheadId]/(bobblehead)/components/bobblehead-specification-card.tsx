import { RulerIcon, WeightIcon } from 'lucide-react';

import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BobbleheadSpecificationCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

export const BobbleheadSpecificationCard = ({ bobblehead }: BobbleheadSpecificationCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-accent'}></div>
          Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'flex items-center gap-3'}>
          <RulerIcon aria-hidden className={'size-5 text-primary'} />
          <div>
            <span className={'text-sm text-muted-foreground'}>Height</span>
            <p className={'font-medium'}>{bobblehead.height} inches</p>
          </div>
        </div>
        <div className={'flex items-center gap-3'}>
          <WeightIcon aria-hidden className={'size-5 text-primary'} />
          <div>
            <span className={'text-sm text-muted-foreground'}>Weight</span>
            <p className={'font-medium'}>{bobblehead.weight} oz</p>
          </div>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Material</span>
          <p className={'font-medium'}>{bobblehead.material}</p>
        </div>
      </CardContent>
    </Card>
  );
};
