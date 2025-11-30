'use client';

import { EditIcon, GripVerticalIcon, HeartIcon, StarIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/tailwind-utils';

export type CollectionCardDetailedProps = {
  bobbleheadCount: number;
  commentCount: number;
  coverImageUrl: string;
  description: string;
  featuredCount: number;
  id: string;
  isActive: boolean;
  likeCount: number;
  name: string;
  onClick: (id: string) => void;
  onEdit: (id: string) => void;
  totalValue: number;
  viewCount: number;
};

export const CollectionCardDetailed = ({
  bobbleheadCount,
  commentCount,
  coverImageUrl,
  description,
  featuredCount,
  id,
  isActive,
  likeCount,
  name,
  onClick,
  onEdit,
  totalValue,
  viewCount,
}: CollectionCardDetailedProps) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(totalValue);

  const handleClick = () => onClick(id);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'group relative cursor-pointer rounded-lg border p-3 transition-all',
            'hover:border-primary hover:bg-accent',
            isActive ?
              'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md'
            : 'border-border bg-card',
          )}
          data-slot={'collection-card-detailed'}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleClick();
            }
          }}
          role={'button'}
          tabIndex={0}
        >
          <div className={'flex items-start gap-3'} data-slot={'card-content'}>
            {/* Collection Thumbnail */}
            <Avatar className={'size-16 rounded-md'}>
              <AvatarImage alt={name} src={coverImageUrl} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Collection Info */}
            <div className={'min-w-0 flex-1'} data-slot={'collection-info'}>
              <h3 className={'truncate text-sm font-semibold'}>{name}</h3>
              <p className={'mt-0.5 line-clamp-2 text-xs text-muted-foreground'}>{description}</p>

              {/* Stats Row */}
              <div className={'mt-2 flex items-center gap-3 text-xs text-muted-foreground'}>
                <span className={'font-medium'}>{bobbleheadCount} items</span>
                <span className={'font-medium text-primary'}>{formattedValue}</span>
              </div>

              {/* Engagement Stats */}
              <div className={'mt-1.5 flex items-center gap-3 text-xs text-muted-foreground'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-3'} />
                  {likeCount}
                </span>
                <span className={'flex items-center gap-1'}>
                  <StarIcon aria-hidden className={'size-3'} />
                  {featuredCount}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div
              className={
                'flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'
              }
            >
              <Button onClick={handleEdit} size={'icon'} variant={'ghost'}>
                <EditIcon className={'size-3.5'} />
              </Button>
              <GripVerticalIcon className={'size-4 cursor-grab text-muted-foreground'} />
            </div>
          </div>

          {/* Active Indicator */}
          <Conditional isCondition={isActive}>
            <div
              className={'absolute top-0 left-0 h-full w-1 rounded-l-lg bg-primary'}
              data-slot={'active-indicator'}
            >
              <div className={'absolute inset-0 animate-pulse bg-primary/50'} />
            </div>
          </Conditional>
        </div>
      </HoverCardTrigger>

      {/* Hover Preview Card */}
      <HoverCardContent align={'start'} className={'w-72'} side={'right'}>
        <div className={'space-y-3'}>
          <div className={'flex items-start gap-3'}>
            <Avatar className={'size-12 rounded-md'}>
              <AvatarImage alt={name} src={coverImageUrl} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className={'font-semibold'}>{name}</h4>
              <p className={'text-xs text-muted-foreground'}>{bobbleheadCount} bobbleheads</p>
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
              <p className={'font-medium'}>{featuredCount}</p>
            </div>
            <div>
              <span className={'text-muted-foreground'}>Views:</span>
              <p className={'font-medium'}>{viewCount}</p>
            </div>
            <div>
              <span className={'text-muted-foreground'}>Likes:</span>
              <p className={'font-medium'}>{likeCount}</p>
            </div>
          </div>

          <Separator />

          <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
            <span>{commentCount} comments</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
