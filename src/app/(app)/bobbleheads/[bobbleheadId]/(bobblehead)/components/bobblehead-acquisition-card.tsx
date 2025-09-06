import { CalendarIcon, DollarSignIcon } from 'lucide-react';

import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BobbleheadAcquisitionCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

export const BobbleheadAcquisitionCard = ({ bobblehead }: BobbleheadAcquisitionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-secondary'}></div>
          Acquisition
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <div className={'flex items-center gap-3'}>
          <DollarSignIcon className={'size-5 text-primary'} />
          <div>
            <span className={'text-sm text-muted-foreground'}>Price</span>
            <p className={'font-medium'}>${bobblehead.purchasePrice}</p>
          </div>
        </div>
        <div className={'flex items-center gap-3'}>
          <CalendarIcon aria-hidden className={'size-5 text-primary'} />
          <div>
            <span className={'text-sm text-muted-foreground'}>Date</span>
            <p className={'font-medium'}>{bobblehead.acquisitionDate?.toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Location</span>
          <p className={'font-medium text-pretty'}>{bobblehead.purchaseLocation}</p>
        </div>
      </CardContent>
    </Card>
  );
};
