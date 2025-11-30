import type { MouseEvent } from 'react';

import { EditIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Conditional } from '@/components/ui/conditional';
import { cn } from '@/utils/tailwind-utils';

export type CollectionCardCompactProps = {
  bobbleheadCount: number;
  coverImageUrl: null | string;
  id: string;
  isActive: boolean;
  name: string;
  onClick: (id: string) => void;
  onEdit: (id: string) => void;
  totalValue: number;
};

export const CollectionCardCompact = ({
  bobbleheadCount,
  coverImageUrl,
  id,
  isActive,
  name,
  onClick,
  onEdit,
  totalValue,
}: CollectionCardCompactProps) => {
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
        'group relative cursor-pointer rounded-lg border p-3 transition-all',
        'hover:border-primary hover:bg-accent',
        isActive ?
          'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md'
        : 'border-border bg-card',
      )}
      data-slot={'collection-card-compact'}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role={'button'}
      tabIndex={0}
    >
      <div className={'flex items-start gap-3 sm:gap-4'} data-slot={'item-content'}>
        {/* Collection Thumbnail */}
        <Avatar className={'size-14 rounded-md sm:size-16 md:size-12'}>
          <AvatarImage alt={name} src={coverImageUrl ?? '/collection-cover-placeholder.png'} />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Collection Info */}
        <div className={'min-w-0 flex-1'} data-slot={'collection-info'}>
          <h3 className={'truncate text-sm font-semibold sm:text-base md:text-sm'}>{name}</h3>
          <div className={'mt-1 flex items-center gap-2 text-xs text-muted-foreground'}>
            <span>{bobbleheadCount} items</span>
            <span>•</span>
            <span className={'font-medium text-primary'}>{formattedValue}</span>
          </div>
        </div>

        {/* Edit Button (visible on hover) */}
        <Button
          className={'opacity-0 transition-opacity group-hover:opacity-100 md:block'}
          onClick={handleEdit}
          size={'icon'}
          variant={'ghost'}
        >
          <EditIcon aria-hidden className={'size-3.5'} />
        </Button>
      </div>

      {/* Active Indicator with Animated Pulse */}
      <Conditional isCondition={isActive}>
        <div
          className={'absolute top-0 left-0 h-full w-1 rounded-l-lg bg-primary'}
          data-slot={'active-indicator'}
        >
          <div className={'absolute inset-0 animate-pulse bg-primary/50'} />
        </div>
      </Conditional>
    </div>
  );
};
