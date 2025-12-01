import type { VariantProps } from 'class-variance-authority';

import { cva } from 'class-variance-authority';
import { EditIcon, MoreVerticalIcon, StarIcon, TrashIcon } from 'lucide-react';

import type { BobbleheadListRecord } from '@/lib/queries/collections/collections.query';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/tailwind-utils';

const conditionVariants = cva('inline-block rounded-md px-2 py-0.5 text-xs font-medium', {
  defaultVariants: {
    condition: 'good',
  },
  variants: {
    condition: {
      excellent: 'bg-primary text-primary-foreground',
      fair: 'bg-muted text-muted-foreground',
      good: 'bg-secondary text-secondary-foreground',
      mint: 'bg-gradient-to-r from-success to-new text-new-foreground',
      'near-mint': 'bg-gradient-to-r from-warning to-yellow-500 text-warning-foreground',
      poor: 'bg-destructive text-white',
    },
  },
});

export type BobbleheadCardProps = {
  bobblehead: BobbleheadListRecord & {
    collectionId: string;
    featurePhoto?: null | string;
    likeData?: {
      isLiked: boolean;
      likeCount: number;
      likeId: null | string;
    };
  };
  isHoverCardEnabled?: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onFeatureToggle: (id: string) => void;
  onSelectionChange: (id: string, checked: boolean) => void;
};

type ConditionVariantProps = VariantProps<typeof conditionVariants>;

export const BobbleheadCard = ({
  bobblehead,
  isHoverCardEnabled = false,
  isSelected,
  isSelectionMode,
  onDelete,
  onEdit,
  onFeatureToggle,
  onSelectionChange,
}: BobbleheadCardProps) => {
  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(bobblehead.id, checked);
  };

  const handleEdit = () => onEdit(bobblehead.id);
  const handleDelete = () => onDelete(bobblehead.id);
  const handleFeatureToggle = () => onFeatureToggle(bobblehead.id);

  const handleCardClick = () => {
    if (isSelectionMode) {
      onSelectionChange(bobblehead.id, !isSelected);
    }
  };

  const _isHoverCardDisabled = isSelectionMode || !isHoverCardEnabled;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg',
        isSelected && 'ring-2 ring-primary',
      )}
      data-slot={'bobblehead-card'}
    >
      <HoverCard open={_isHoverCardDisabled ? false : undefined} openDelay={200}>
        <HoverCardTrigger asChild>
          <div
            aria-checked={isSelectionMode ? isSelected : undefined}
            className={'cursor-pointer'}
            onClick={handleCardClick}
            onKeyDown={(e) => {
              if (isSelectionMode && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                handleCardClick();
              }
            }}
            role={isSelectionMode ? 'checkbox' : undefined}
            tabIndex={isSelectionMode ? 0 : undefined}
          >
            {/* Image Container */}
            <div className={'relative aspect-square overflow-hidden bg-muted'}>
              {bobblehead.featurePhoto && (
                <img
                  alt={bobblehead.name!}
                  className={'size-full object-cover transition-transform group-hover:scale-105'}
                  data-slot={'bobblehead-image'}
                  src={bobblehead.featurePhoto}
                />
              )}

              {/* Featured Badge */}
              <Conditional isCondition={bobblehead.isFeatured}>
                <div className={'absolute top-2 left-2'}>
                  <Badge className={'shadow-lg'} variant={'editor_pick'}>
                    <StarIcon aria-hidden className={'size-3'} />
                    Featured
                  </Badge>
                </div>
              </Conditional>

              {/* Selection Checkbox Overlay */}
              <Conditional isCondition={isSelectionMode}>
                <div className={'absolute top-2 right-2'}>
                  <div
                    className={'rounded-md bg-background/90 p-1.5 backdrop-blur-sm'}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    role={'button'}
                    tabIndex={0}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={handleCheckboxChange} />
                  </div>
                </div>
              </Conditional>

              {/* Hover Actions Overlay */}
              <Conditional isCondition={!isSelectionMode}>
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center gap-2',
                    'bg-black/50 opacity-0 backdrop-blur-sm transition-opacity',
                    'group-hover:opacity-100',
                  )}
                >
                  <Button onClick={handleEdit} size={'sm'} variant={'default'}>
                    <EditIcon aria-hidden className={'size-4'} />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size={'sm'} variant={'secondary'}>
                        <MoreVerticalIcon aria-hidden className={'size-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={'end'}>
                      <DropdownMenuItem onClick={handleFeatureToggle}>
                        <StarIcon aria-hidden className={'size-4'} />
                        {bobblehead.isFeatured ? 'Un-feature' : 'Feature'}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDelete} variant={'destructive'}>
                        <TrashIcon aria-hidden className={'size-4'} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Conditional>
            </div>

            {/* Card Info */}
            <div className={'p-2'}>
              <h3 className={'truncate text-sm font-semibold'}>{bobblehead.name}</h3>
              <div className={'mt-1'}>
                <span
                  className={conditionVariants({
                    condition: bobblehead.condition as ConditionVariantProps['condition'],
                  })}
                >
                  {bobblehead.condition?.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </HoverCardTrigger>

        {/* Hover Card Content with Full Details */}
        <HoverCardContent align={'start'} className={'w-80'} side={'right'}>
          <div className={'space-y-3'}>
            <div className={'space-y-1'}>
              <h4 className={'leading-none font-semibold'}>{bobblehead.name}</h4>
              <Conditional isCondition={!!bobblehead.characterName}>
                <p className={'text-sm text-muted-foreground'}>{bobblehead.characterName}</p>
              </Conditional>
            </div>

            <Separator />

            <div className={'grid grid-cols-2 gap-2 text-xs'}>
              <Conditional isCondition={!!bobblehead.manufacturer}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Manufacturer:</span>
                  <p className={'mt-0.5'}>{bobblehead.manufacturer}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!bobblehead.year}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Year:</span>
                  <p className={'mt-0.5'}>{bobblehead.year}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!bobblehead.series}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Series:</span>
                  <p className={'mt-0.5'}>{bobblehead.series}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!bobblehead.material}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Material:</span>
                  <p className={'mt-0.5'}>{bobblehead.material}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!bobblehead.height}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Height:</span>
                  <p className={'mt-0.5'}>{bobblehead.height}&quot;</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!bobblehead.purchasePrice}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Value:</span>
                  <p className={'mt-0.5'}>${bobblehead.purchasePrice}</p>
                </div>
              </Conditional>
            </div>

            <Separator />

            <div className={'flex items-center gap-4 text-xs text-muted-foreground'}>
              <span>{bobblehead.likeData?.likeCount} likes</span>
              <span>0 comments</span>
              <span>0 views</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
