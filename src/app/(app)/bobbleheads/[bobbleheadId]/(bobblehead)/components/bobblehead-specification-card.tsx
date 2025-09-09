import type { LucideIcon } from 'lucide-react';

import { PackageIcon, RulerIcon, WeightIcon } from 'lucide-react';

import type { BobbleheadWithCollections } from '@/lib/facades/bobbleheads-facade';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BobbleheadSpecificationCardProps {
  bobblehead: BobbleheadWithCollections;
}

const SpecificationItem = ({
  icon: Icon,
  label,
  unit,
  value,
}: {
  icon: LucideIcon;
  label: string;
  unit?: string;
  value: null | number | string | undefined;
}) => {
  if (!value && value !== 0) {
    return (
      <div className={'flex items-center gap-3 opacity-60'}>
        <Icon aria-hidden className={'size-5 text-muted-foreground'} />
        <div>
          <span className={'text-sm text-muted-foreground'}>{label}</span>
          <p className={'text-sm text-muted-foreground italic'}>Not specified</p>
        </div>
      </div>
    );
  }

  return (
    <div className={'flex items-center gap-3'}>
      <Icon aria-hidden className={'size-5 text-primary'} />
      <div>
        <span className={'text-sm text-muted-foreground'}>{label}</span>
        <p className={'font-medium'}>
          {value}
          {unit ? ` ${unit}` : ''}
        </p>
      </div>
    </div>
  );
};

export const BobbleheadSpecificationCard = ({ bobblehead }: BobbleheadSpecificationCardProps) => {
  // check if we have any specifications to display
  const _hasSpecificationData = bobblehead.height || bobblehead.weight || bobblehead.material;

  if (!_hasSpecificationData) {
    return (
      <Card className={'border-dashed'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-muted-foreground'}>
            <div className={'size-2 rounded-full bg-muted'}></div>
            Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className={'py-8 text-center'}>
          <div className={'mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50'}>
            <RulerIcon aria-hidden className={'size-6 text-muted-foreground'} />
          </div>
          <p className={'text-sm text-muted-foreground'}>No specifications have been added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-accent'}></div>
          Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <SpecificationItem icon={RulerIcon} label={'Height'} unit={'inches'} value={bobblehead.height} />
        <SpecificationItem icon={WeightIcon} label={'Weight'} unit={'oz'} value={bobblehead.weight} />
        <SpecificationItem icon={PackageIcon} label={'Material'} value={bobblehead.material} />
      </CardContent>
    </Card>
  );
};
