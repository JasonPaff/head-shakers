import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BobbleheadDetailsCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

export const BobbleheadDetailsCard = ({ bobblehead }: BobbleheadDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={'flex items-center gap-2'}>
          <div className={'size-2 rounded-full bg-primary'}></div>
          Item Details
        </CardTitle>
      </CardHeader>
      <CardContent className={'space-y-3'}>
        <div>
          <span className={'text-sm text-muted-foreground'}>Character</span>
          <p className={'font-medium'}>{bobblehead.characterName}</p>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Series</span>
          <p className={'font-medium'}>{bobblehead.series}</p>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Manufacturer</span>
          <p className={'font-medium'}>{bobblehead.manufacturer}</p>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Year</span>
          <p className={'font-medium'}>{bobblehead.year}</p>
        </div>
        <div>
          <span className={'text-sm text-muted-foreground'}>Condition</span>
          <Badge variant={'secondary'}>{bobblehead.currentCondition}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
