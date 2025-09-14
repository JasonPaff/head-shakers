import { EyeIcon, LockIcon, StarIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface CollectionCardProps {
  bobblehead: {
    characterName: string;
    currentCondition: string;
    id: string;
    isFeatured: boolean;
    isPublic: boolean;
    manufacturer: string;
    name: string;
    photos: Array<string>;
    purchasePrice?: string;
    year?: string;
  };
}

export const CollectionCard = ({ bobblehead }: CollectionCardProps) => {
  return (
    <Card className={'group transition-shadow hover:shadow-md'}>
      <CardContent className={'p-4'}>
        <div className={'relative mb-3'}>
          <img
            alt={bobblehead.name}
            className={'h-32 w-full rounded-md bg-muted object-cover'}
            src={bobblehead.photos[0] || '/placeholder.svg'}
          />
          <div className={'absolute top-2 right-2 flex gap-1'}>
            <Conditional isCondition={bobblehead.isFeatured}>
              <StarIcon aria-hidden className={'size-4 fill-accent text-accent'} />{' '}
            </Conditional>
            <Conditional isCondition={bobblehead.isPublic}>
              <EyeIcon aria-hidden className={'size-4 text-white drop-shadow-sm'} />
            </Conditional>
            <Conditional isCondition={!bobblehead.isPublic}>
              <LockIcon aria-hidden className={'size-4 text-white drop-shadow-sm'} />
            </Conditional>
          </div>
        </div>

        <div className={'space-y-2'}>
          <h4 className={'text-sm font-medium text-balance text-foreground'}>{bobblehead.name}</h4>
          <p className={'text-xs text-muted-foreground'}>{bobblehead.characterName}</p>
          <div className={'flex items-center justify-between'}>
            <Badge className={'text-xs'} variant={'secondary'}>
              {bobblehead.currentCondition}
            </Badge>
            <span className={'text-xs text-muted-foreground'}>{bobblehead.manufacturer}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
