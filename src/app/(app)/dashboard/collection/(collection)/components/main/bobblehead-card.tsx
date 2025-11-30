import { EditIcon, MoreVerticalIcon, StarIcon, TrashIcon } from 'lucide-react';
import { useMemo } from 'react';

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

export type BobbleheadCardProps = {
  characterName?: string;
  commentCount: number;
  condition: string;
  height?: number;
  id: string;
  imageUrl?: string;
  isFeatured: boolean;
  isSelected: boolean;
  isSelectionMode: boolean;
  likeCount: number;
  manufacturer?: string;
  material?: string;
  name: string;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onFeatureToggle: (id: string) => void;
  onSelectionChange: (id: string, checked: boolean) => void;
  purchasePrice?: number;
  series?: string;
  viewCount: number;
  year?: number;
};

export const BobbleheadCard = ({
  characterName,
  commentCount,
  condition,
  height,
  id,
  imageUrl,
  isFeatured,
  isSelected,
  isSelectionMode,
  likeCount,
  manufacturer,
  material,
  name,
  onDelete,
  onEdit,
  onFeatureToggle,
  onSelectionChange,
  purchasePrice,
  series,
  viewCount,
  year,
}: BobbleheadCardProps) => {
  const conditionColor = useMemo(() => {
    switch (condition) {
      case 'excellent':
        return 'bg-primary text-primary-foreground';
      case 'fair':
        return 'bg-muted text-muted-foreground';
      case 'good':
        return 'bg-secondary text-secondary-foreground';
      case 'mint':
        return 'bg-gradient-to-r from-success to-new text-new-foreground';
      case 'near-mint':
        return 'bg-gradient-to-r from-warning to-yellow-500 text-warning-foreground';
      case 'poor':
        return 'bg-destructive text-white';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  }, [condition]);

  const handleCheckboxChange = (checked: boolean) => {
    onSelectionChange(id, checked);
  };

  const handleEdit = () => onEdit(id);
  const handleDelete = () => onDelete(id);
  const handleFeatureToggle = () => onFeatureToggle(id);

  return (
    <div
      className={'group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg'}
      data-slot={'bobblehead-card'}
    >
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className={'cursor-pointer'}>
            {/* Image Container */}
            <div className={'relative aspect-square overflow-hidden bg-muted'}>
              {imageUrl && (
                <img
                  alt={name}
                  className={'size-full object-cover transition-transform group-hover:scale-105'}
                  data-slot={'bobblehead-image'}
                  src={imageUrl}
                />
              )}

              {/* Featured Badge */}
              <Conditional isCondition={isFeatured}>
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
                        {isFeatured ? 'Un-feature' : 'Feature'}
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
              <h3 className={'truncate text-sm font-semibold'}>{name}</h3>
              <div className={'mt-1'}>
                <span
                  className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', conditionColor)}
                >
                  {condition.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </HoverCardTrigger>

        {/* Hover Card Content with Full Details */}
        <HoverCardContent align={'start'} className={'w-80'} side={'right'}>
          <div className={'space-y-3'}>
            <div className={'space-y-1'}>
              <h4 className={'leading-none font-semibold'}>{name}</h4>
              <Conditional isCondition={!!characterName}>
                <p className={'text-sm text-muted-foreground'}>{characterName}</p>
              </Conditional>
            </div>

            <Separator />

            <div className={'grid grid-cols-2 gap-2 text-xs'}>
              <Conditional isCondition={!!manufacturer}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Manufacturer:</span>
                  <p className={'mt-0.5'}>{manufacturer}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!year}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Year:</span>
                  <p className={'mt-0.5'}>{year}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!series}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Series:</span>
                  <p className={'mt-0.5'}>{series}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!material}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Material:</span>
                  <p className={'mt-0.5'}>{material}</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!height}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Height:</span>
                  <p className={'mt-0.5'}>{height}&quot;</p>
                </div>
              </Conditional>

              <Conditional isCondition={!!purchasePrice}>
                <div>
                  <span className={'font-medium text-muted-foreground'}>Value:</span>
                  <p className={'mt-0.5'}>${purchasePrice}</p>
                </div>
              </Conditional>
            </div>

            <Separator />

            <div className={'flex items-center gap-4 text-xs text-muted-foreground'}>
              <span>{likeCount} likes</span>
              <span>{commentCount} comments</span>
              <span>{viewCount} views</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};
