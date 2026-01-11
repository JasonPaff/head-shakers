import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCardContent } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/currency.utils';

export type CollectionHoverCardContentProps = {
  collection: CollectionDashboardListRecord;
};

export const CollectionHoverCardContent = ({ collection }: CollectionHoverCardContentProps) => {
  const formattedValue = formatCurrency(collection.totalValue);

  return (
    <HoverCardContent align={'start'} className={'w-72'} side={'right'}>
      <div className={'space-y-3'}>
        <div className={'flex items-start gap-3'}>
          <Avatar className={'size-12 rounded-md'}>
            <AvatarImage
              alt={collection.name}
              src={collection.coverImageUrl ?? '/images/placeholders/collection-cover-placeholder.png'}
            />
            <AvatarFallback>{collection.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className={'font-semibold'}>{collection.name}</h4>
            <p className={'text-xs text-muted-foreground'}>{collection.bobbleheadCount} bobbleheads</p>
          </div>
        </div>

        <Separator />

        <div className={'grid grid-cols-2 gap-2 text-xs'}>
          <div>
            <span className={'text-muted-foreground'}>Total Value:</span>
            <p className={'font-medium text-primary'}>{formattedValue}</p>
          </div>
          <div>
            <span className={'text-muted-foreground'}>Featured:</span>
            <p className={'font-medium'}>{collection.featuredCount}</p>
          </div>
          <div>
            <span className={'text-muted-foreground'}>Views:</span>
            <p className={'font-medium'}>{collection.viewCount}</p>
          </div>
          <div>
            <span className={'text-muted-foreground'}>Likes:</span>
            <p className={'font-medium'}>{collection.likeCount}</p>
          </div>
          <div>
            <span className={'text-muted-foreground'}>Visibility:</span>
            <p className={'font-medium'}>{collection.isPublic ? 'Public' : 'Private'}</p>
          </div>
        </div>

        <Separator />

        <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
          <span>{collection.commentCount} comments</span>
        </div>
      </div>
    </HoverCardContent>
  );
};
