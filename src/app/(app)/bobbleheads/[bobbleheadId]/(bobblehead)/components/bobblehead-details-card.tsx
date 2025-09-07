import type { LucideIcon } from 'lucide-react';

import { FolderIcon, HashIcon, TagIcon, UserIcon } from 'lucide-react';

import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface BobbleheadDetailsCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

const DetailItem = ({
  icon: Icon,
  label,
  value,
  variant = 'default',
}: {
  icon?: LucideIcon;
  label: string;
  value: null | number | string | undefined;
  variant?: 'badge' | 'default';
}) => {
  if (!value && value !== 0) {
    return (
      <div className={'flex items-center gap-3 opacity-60'}>
        {Icon && <Icon className={'size-4 text-muted-foreground'} />}
        <div>
          <span className={'text-sm text-muted-foreground'}>{label}</span>
          <p className={'text-sm text-muted-foreground italic'}>Not specified</p>
        </div>
      </div>
    );
  }

  return (
    <div className={'flex items-center gap-3'}>
      {Icon && <Icon className={'size-4 text-primary'} />}
      <div className={'flex-1'}>
        <span className={'text-sm text-muted-foreground'}>{label}</span>
        {variant === 'badge' ?
          <Badge className={'mt-1'} variant={'secondary'}>
            {value}
          </Badge>
        : <p className={'font-medium'}>{value}</p>}
      </div>
    </div>
  );
};

export const BobbleheadDetailsCard = ({ bobblehead }: BobbleheadDetailsCardProps) => {
  const _hasBasicInfo =
    bobblehead.characterName ||
    bobblehead.series ||
    bobblehead.manufacturer ||
    bobblehead.year ||
    bobblehead.category ||
    bobblehead.description;

  const _hasTags = bobblehead.tags && bobblehead.tags.length > 0;

  if (!_hasBasicInfo) {
    return (
      <Card className={'border-dashed'}>
        <CardHeader>
          <CardTitle className={'flex items-center gap-2 text-muted-foreground'}>
            <div className={'size-2 rounded-full bg-muted'}></div>
            Item Details
          </CardTitle>
        </CardHeader>
        <CardContent className={'py-8 text-center'}>
          <div className={'mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-muted/50'}>
            <TagIcon className={'size-6 text-muted-foreground'} />
          </div>
          <p className={'text-sm text-muted-foreground'}>No additional details have been added yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-primary'}></div>
          Item Details
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-4'}>
        <DetailItem icon={UserIcon} label={'Character'} value={bobblehead.characterName} />
        <DetailItem icon={HashIcon} label={'Series'} value={bobblehead.series} />
        <DetailItem icon={TagIcon} label={'Manufacturer'} value={bobblehead.manufacturer} />
        <DetailItem label={'Year'} value={bobblehead.year} />
        <DetailItem icon={FolderIcon} label={'Category'} value={bobblehead.category} />
        <DetailItem label={'Condition'} value={bobblehead.currentCondition} variant={'badge'} />
        <Conditional isCondition={!!bobblehead.description}>
          <div>
            <span className={'text-sm text-muted-foreground'}>Description</span>
            <p className={'mt-1 leading-relaxed font-medium text-pretty'}>{bobblehead.description}</p>
          </div>
        </Conditional>
        <Conditional isCondition={_hasTags}>
          <div>
            <span className={'text-sm text-muted-foreground'}>Tags</span>
            <div className={'mt-1 flex flex-wrap gap-2'}>
              {bobblehead.tags.map((tag) => (
                <Badge className={'text-xs'} key={tag.id} variant={'outline'}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        </Conditional>
      </CardContent>
    </Card>
  );
};
