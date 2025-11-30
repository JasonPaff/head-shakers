import type { MouseEvent } from 'react';

import { EditIcon, HeartIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

export type CollectionCardCoverProps = {
  bobbleheadCount: number;
  coverImageUrl: null | string;
  description: null | string;
  id: string;
  isActive: boolean;
  likeCount: number;
  name: string;
  onClick: (id: string) => void;
  onEdit: (id: string) => void;
  totalValue: number;
};

export const CollectionCardCover = ({
  bobbleheadCount,
  coverImageUrl,
  description,
  id,
  isActive,
  likeCount,
  name,
  onClick,
  onEdit,
  totalValue,
}: CollectionCardCoverProps) => {
  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(totalValue);

  const handleClick = () => onClick(id);

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit(id);
  };

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border transition-all',
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
      <div className={'relative aspect-[4/3] overflow-hidden bg-muted'}>
        <img
          alt={name}
          className={'size-full object-cover transition-transform group-hover:scale-105'}
          data-slot={'collection-cover'}
          src={coverImageUrl ?? '/collection-cover-placeholder.png'}
        />

        {/* Gradient Overlay */}
        <div className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'} />

        {/* Collection Info Overlay */}
        <div className={'absolute right-0 bottom-0 left-0 p-4 text-white'}>
          <h3 className={'mb-1 text-base leading-tight font-bold'}>{name}</h3>
          <p className={'line-clamp-2 text-xs opacity-90'}>{description}</p>

          {/* Stats */}
          <div className={'mt-2 flex items-center gap-3 text-xs font-medium'}>
            <span>{bobbleheadCount} items</span>
            <span>•</span>
            <span>{formattedValue}</span>
            <span>•</span>
            <span className={'flex items-center gap-1'}>
              <HeartIcon aria-hidden className={'size-3'} /> {likeCount}
            </span>
          </div>
        </div>

        {/* Edit Button */}
        <Button
          className={cn(
            'absolute top-2 right-2 size-8 opacity-0 transition-opacity',
            'group-hover:opacity-100',
          )}
          onClick={handleEdit}
          size={'icon'}
          variant={'secondary'}
        >
          <EditIcon aria-hidden className={'size-3.5'} />
        </Button>

        {/* Active Indicator */}
        <Conditional isCondition={isActive}>
          <div className={'absolute top-0 right-0 left-0 h-1 bg-primary'} data-slot={'active-indicator'} />
        </Conditional>
      </div>
    </div>
  );
};
