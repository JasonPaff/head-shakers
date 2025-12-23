import type { MouseEvent } from 'react';

import { EditIcon, GlobeIcon, HeartIcon, LockIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';

import type { CollectionDashboardListRecord } from '@/lib/queries/collections/collections.query';

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

export type CollectionCardCoverProps = {
  collection: CollectionDashboardListRecord;
  isActive: boolean;
  isHoverCardEnabled?: boolean;
  onClick: (slug: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
};

export const CollectionCardCover = ({
  collection,
  isActive,
  isHoverCardEnabled = false,
  onClick,
  onDelete,
  onEdit,
}: CollectionCardCoverProps) => {
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
            'group relative cursor-pointer overflow-hidden rounded-lg border transition-all',
            'hover:shadow-lg',
            isActive && 'border-primary shadow-lg ring-2 ring-primary/20',
            !isActive && 'border-border hover:border-primary/50',
          )}
          data-slot={'collection-card-cover'}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleClick();
            }
          }}
          role={'button'}
          tabIndex={0}
        >
          {/* Cover Image with Gradient Overlay */}
          <div className={'relative aspect-4/3 overflow-hidden bg-muted'}>
            <img
              alt={collection.name}
              className={'size-full object-cover transition-transform group-hover:scale-105'}
              data-slot={'collection-cover'}
              src={collection.coverImageUrl ?? '/images/placeholders/collection-cover-placeholder.png'}
            />

            {/* Gradient Overlay */}
            <div className={'absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent'} />

            {/* Collection Info Overlay */}
            <div className={'absolute right-0 bottom-0 left-0 p-4 text-white'}>
              <h3 className={'mb-1 text-base leading-tight font-bold'}>{collection.name}</h3>
              <p className={'line-clamp-2 text-xs opacity-90'}>{collection.description}</p>

              {/* Stats */}
              <div className={'mt-2 flex items-center gap-3 text-xs font-medium'}>
                <span>{collection.bobbleheadCount} items</span>
                <span>•</span>
                <span>{formattedValue}</span>
                <span>•</span>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-3'} /> {collection.likeCount}
                </span>
              </div>
            </div>

            {/* Visibility Indicator */}
            <div className={'absolute top-2 left-2 rounded-full bg-black/50 p-1.5 text-white'}>
              {collection.isPublic ?
                <GlobeIcon aria-label={'Public'} className={'size-3.5'} />
              : <LockIcon aria-label={'Private'} className={'size-3.5'} />}
            </div>

            {/* Actions Menu */}
            <div
              className={cn('absolute top-2 right-2 opacity-0 transition-opacity', 'group-hover:opacity-100')}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size={'icon'} variant={'secondary'}>
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

            {/* Active Indicator */}
            <Conditional isCondition={isActive}>
              <div
                className={'absolute top-0 right-0 left-0 h-1 bg-primary'}
                data-slot={'active-indicator'}
              />
            </Conditional>
          </div>
        </div>
      </HoverCardTrigger>

      <CollectionHoverCardContent collection={collection} />
    </HoverCard>
  );
};
