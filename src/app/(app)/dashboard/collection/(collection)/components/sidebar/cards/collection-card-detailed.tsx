import type { MouseEvent } from 'react';

import {
  EditIcon,
  GlobeIcon,
  HeartIcon,
  LockIcon,
  MoreVerticalIcon,
  StarIcon,
  TrashIcon,
} from 'lucide-react';

import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card';
import { formatCurrency } from '@/lib/utils/currency.utils';
import { cn } from '@/utils/tailwind-utils';

import { CollectionHoverCardContent } from './collection-card-hovercard';

export type CollectionCardDetailedProps = {
  collection: CollectionDashboardListRecord;
  isActive: boolean;
  isHoverCardEnabled?: boolean;
  onClick: (slug: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export const CollectionCardDetailed = ({
  collection,
  isActive,
  isHoverCardEnabled = false,
  onClick,
  onDelete,
  onEdit,
}: CollectionCardDetailedProps) => {
  const formattedValue = formatCurrency(collection.totalValue);

  const handleClick = () => {
    onClick(collection.slug);
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit(collection.id);
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(collection.id);
  };

  return (
    <HoverCard open={isHoverCardEnabled ? undefined : false} openDelay={300}>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            'group relative cursor-pointer rounded-md border p-3 transition-all',
            'hover:border-primary hover:bg-accent',
            isActive ?
              'border-primary bg-linear-to-r from-primary/10 to-primary/5 shadow-md'
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
              <AvatarImage
                alt={collection.name}
                src={collection.coverImageUrl ?? '/images/placeholders/collection-cover-placeholder.png'}
              />
              <AvatarFallback>{collection.name.charAt(0)}</AvatarFallback>
            </Avatar>

            {/* Collection Info */}
            <div className={'min-w-0 flex-1'} data-slot={'collection-info'}>
              <h3 className={'truncate text-sm font-semibold'}>{collection.name}</h3>
              <p className={'mt-0.5 line-clamp-2 text-xs text-muted-foreground'}>{collection.description}</p>

              {/* Stats Row */}
              <div className={'mt-2 flex items-center gap-3 text-xs text-muted-foreground'}>
                <span className={'font-medium'}>{collection.bobbleheadCount} items</span>
                <span className={'font-medium text-primary'}>{formattedValue}</span>
                {collection.isPublic ?
                  <GlobeIcon aria-label={'Public'} className={'size-3'} />
                : <LockIcon aria-label={'Private'} className={'size-3'} />}
              </div>

              {/* Engagement Stats */}
              <div className={'mt-1.5 flex items-center gap-3 text-xs text-muted-foreground'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-3'} />
                  {collection.likeCount}
                </span>
                <span className={'flex items-center gap-1'}>
                  <StarIcon aria-hidden className={'size-3'} />
                  {collection.featuredCount}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div
              className={
                'flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'
              }
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={'icon'} variant={'ghost'}>
                    <MoreVerticalIcon aria-hidden className={'size-4'} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={'end'}>
                  <DropdownMenuItem onClick={handleEdit}>
                    <EditIcon aria-hidden className={'size-4'} />
                    Edit Collection
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} variant={'destructive'}>
                    <TrashIcon aria-hidden className={'size-4'} />
                    Delete Collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Active Indicator */}
          <Conditional isCondition={isActive}>
            <div
              className={'absolute top-0 left-0 h-full w-1 rounded-l-md bg-primary'}
              data-slot={'active-indicator'}
            >
              <div className={'absolute inset-0 animate-pulse bg-primary/50'} />
            </div>
          </Conditional>
        </div>
      </HoverCardTrigger>

      <CollectionHoverCardContent collection={collection} />
    </HoverCard>
  );
};
