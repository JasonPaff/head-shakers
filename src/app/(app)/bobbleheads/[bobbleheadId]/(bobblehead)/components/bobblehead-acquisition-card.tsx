import type { LucideIcon } from 'lucide-react';

import { CalendarIcon, DollarSignIcon, MapPinIcon, ShoppingCartIcon } from 'lucide-react';

import type { BobbleheadWithCollections } from '@/lib/facades/bobbleheads-facade';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BobbleheadAcquisitionCardProps {
  bobblehead: BobbleheadWithCollections;
}

const AcquisitionItem = ({
  formatter,
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  formatter?: (val: unknown) => string;
  icon: LucideIcon;
  label: string;
  value: unknown;
  variant?: 'badge' | 'default';
}) => {
  if (!value && value !== 0) {
    return (
      <div className={'flex items-center gap-3 opacity-60'}>
        <Icon className={'size-5 text-muted-foreground'} />
        <div>
          <span className={'text-sm text-muted-foreground'}>{label}</span>
          <p className={'text-sm text-muted-foreground italic'}>Not specified</p>
        </div>
      </div>
    );
  }

  const displayValue = formatter ? formatter(value) : (value as string);

  return (
    <div className={'flex items-center gap-3'}>
      <Icon className={'size-5 text-primary'} />
      <div className={'flex-1'}>
        <span className={'text-sm text-muted-foreground'}>{label}</span>
        {variant === 'badge' ?
          <Badge className={'mt-1'} variant={'outline'}>
            {displayValue}
          </Badge>
        : <p className={'font-medium text-pretty'}>{displayValue}</p>}
      </div>
    </div>
  );
};

export const BobbleheadAcquisitionCard = ({ bobblehead }: BobbleheadAcquisitionCardProps) => {
  // check if we have any acquisition data to display
  const _hasAcquisitionData =
    bobblehead.purchasePrice ||
    bobblehead.acquisitionDate ||
    bobblehead.purchaseLocation ||
    bobblehead.acquisitionMethod;

  if (!_hasAcquisitionData) {
    return (
      <Card className={'border-dashed'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-muted-foreground'}>
            <div className={'size-2 rounded-full bg-muted'}></div>
            Acquisition
          </CardTitle>
        </CardHeader>
        <CardContent className={'py-8 text-center'}>
          <div className={'mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50'}>
            <ShoppingCartIcon aria-hidden className={'size-6 text-muted-foreground'} />
          </div>
          <p className={'text-sm text-muted-foreground'}>No acquisition information has been added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-secondary'}></div>
          Acquisition
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <AcquisitionItem
          icon={ShoppingCartIcon}
          label={'Method'}
          value={bobblehead.acquisitionMethod}
          variant={'badge'}
        />
        <AcquisitionItem
          formatter={(price) => {
            return `$${parseFloat(price as string).toFixed(2)}`;
          }}
          icon={DollarSignIcon}
          label={'Price'}
          value={bobblehead.purchasePrice}
        />
        <AcquisitionItem
          formatter={(date) => {
            if (!date) return '';
            const parsedDate = Date.parse(date as string);
            if (isNaN(parsedDate)) return date as string;
            const newDate = new Date(parsedDate);
            return newDate.toLocaleDateString();
          }}
          icon={CalendarIcon}
          label={'Date'}
          value={bobblehead.acquisitionDate}
        />
        <AcquisitionItem icon={MapPinIcon} label={'Location'} value={bobblehead.purchaseLocation} />
      </CardContent>
    </Card>
  );
};
