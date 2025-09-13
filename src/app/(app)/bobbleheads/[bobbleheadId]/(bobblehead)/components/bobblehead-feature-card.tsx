import type { BobbleheadWithRelations } from '@/lib/queries/bobbleheads/bobbleheads-query';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface BobbleheadFeatureCardProps {
  bobblehead: BobbleheadWithRelations;
}

export const BobbleheadFeatureCard = ({ bobblehead }: BobbleheadFeatureCardProps) => {
  const _primaryPhoto = bobblehead.photos.find((photo) => photo.isPrimary) || bobblehead.photos[0];
  const _hasMoreThanThreeTags = bobblehead.tags.length > 3;
  const _topThreeTags = bobblehead.tags.slice(0, 3);

  return (
    <Card className={'overflow-hidden'}>
      <div className={'grid grid-cols-1 lg:grid-cols-2'}>
        {/* Image Section */}
        <div className={'relative aspect-[3/4] lg:aspect-square'}>
          <img
            alt={_primaryPhoto?.altText ?? bobblehead.name}
            className={'size-full object-cover'}
            src={_primaryPhoto?.url || '/placeholder.svg'}
          />

          {/* Featured Badge */}
          <Conditional isCondition={bobblehead.isFeatured}>
            <Badge className={'absolute top-4 left-4 bg-accent text-accent-foreground shadow-lg'}>
              Featured
            </Badge>
          </Conditional>

          {/* Condition Badge */}
          <Conditional isCondition={!!bobblehead.currentCondition}>
            <Badge
              className={'absolute top-4 right-4 shadow-lg'}
              variant={
                bobblehead.currentCondition?.toLowerCase().includes('mint') ? 'default'
                : bobblehead.currentCondition?.toLowerCase().includes('good') ?
                  'secondary'
                : 'outline'
              }
            >
              {bobblehead.currentCondition}
            </Badge>
          </Conditional>
        </div>

        {/* Details Section */}
        <div className={'flex flex-col justify-between p-8'}>
          <div>
            {/* Character and Series Info */}
            <div className={'mb-4 space-y-1'}>
              <Conditional isCondition={!!bobblehead.characterName}>
                <p className={'text-lg font-medium text-primary'}>{bobblehead.characterName}</p>
              </Conditional>
              <Conditional isCondition={!!bobblehead.series}>
                <p className={'text-sm text-muted-foreground'}>{bobblehead.series}</p>
              </Conditional>
            </div>

            {/* Tags */}
            <div className={'mb-6 flex flex-wrap gap-2'}>
              {_topThreeTags.map((tag) => (
                <Badge key={tag.id} variant={'outline'}>
                  {tag.name}
                </Badge>
              ))}
              <Conditional isCondition={_hasMoreThanThreeTags}>
                <Badge variant={'outline'}>+{bobblehead.tags.length - 3} more</Badge>
              </Conditional>
            </div>

            {/* Key Details */}
            <div className={'space-y-3 border-t pt-6'}>
              {/* Manufacturer */}
              <div className={'flex justify-between'}>
                <span className={'text-sm text-muted-foreground'}>Manufacturer</span>
                <span className={'text-sm font-medium'}>{bobblehead.manufacturer || 'Unknown'}</span>
              </div>

              {/* Year */}
              <div className={'flex justify-between'}>
                <span className={'text-sm text-muted-foreground'}>Year</span>
                <span className={'text-sm font-medium'}>{bobblehead.year || 'Unknown'}</span>
              </div>

              {/* Category */}
              <Conditional isCondition={!!bobblehead.category}>
                <div className={'flex justify-between'}>
                  <span className={'text-sm text-muted-foreground'}>Category</span>
                  <span className={'text-sm font-medium'}>{bobblehead.category}</span>
                </div>
              </Conditional>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
