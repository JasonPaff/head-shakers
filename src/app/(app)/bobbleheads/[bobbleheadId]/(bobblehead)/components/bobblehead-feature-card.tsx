import { EditIcon, HeartIcon, Share2Icon } from 'lucide-react';

import type { GetBobbleheadById } from '@/lib/queries/bobbleheads.queries';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';

interface BobbleheadFeatureCardProps {
  bobblehead: NonNullable<GetBobbleheadById>;
}

export const BobbleheadFeatureCard = ({ bobblehead }: BobbleheadFeatureCardProps) => {
  const _primaryPhoto = bobblehead.photos.find((photo) => photo.isPrimary) || bobblehead.photos[0];
  const _hasMoreThanThreeTags = bobblehead.tags.length > 3;
  const _topThreeTags = bobblehead.tags.slice(0, 3);

  return (
    <Card className={'overflow-hidden'}>
      <div className={'grid grid-cols-1 md:grid-cols-2'}>
        {/* Image Section */}
        <div className={'relative aspect-[4/5] md:aspect-square'}>
          <img
            alt={_primaryPhoto?.altText ?? bobblehead.name}
            className={'object-cover'}
            src={_primaryPhoto?.url || '/placeholder.svg'}
          />
          {/* Featured Badge */}
          <Conditional isCondition={bobblehead.isFeatured}>
            <Badge className={'absolute top-4 left-4 bg-accent text-accent-foreground'}>Featured</Badge>
          </Conditional>
        </div>

        {/* Details Section */}
        <div className={'flex flex-col justify-between p-6'}>
          <div>
            {/* Collection Information */}
            <div className={'mb-2 flex items-center gap-2 text-sm text-muted-foreground'}>
              <span>{bobblehead.collectionName}</span>
              <span>•</span>
              <span>{bobblehead.subcollectionName}</span>
            </div>
            <h1 className={'mb-3 text-2xl font-bold text-balance text-foreground'}>{bobblehead.name}</h1>
            <p className={'mb-4 text-pretty text-muted-foreground'}>{bobblehead.description}</p>

            {/* Tags */}
            <div className={'mb-4 flex flex-wrap gap-2'}>
              {_topThreeTags.map((tag) => (
                <Badge key={tag.id} variant={'outline'}>
                  {tag.name}
                </Badge>
              ))}
              <Conditional isCondition={_hasMoreThanThreeTags}>
                <Badge variant={'outline'}>+{bobblehead.tags.length - 3} more</Badge>
              </Conditional>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={'flex gap-2'}>
            <Button className={'flex-1'}>
              <HeartIcon aria-hidden className={'mr-2 size-4'} />
              {bobblehead.likeCount}
            </Button>
            <Button variant={'outline'}>
              <Share2Icon aria-hidden className={'size-4'} />
            </Button>
            <Button variant={'outline'}>
              <EditIcon aria-hidden className={'size-4'} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
