'use client';

import type { ChangeEvent, ComponentProps, TouchEvent } from 'react';

import {
  CheckIcon,
  EditIcon,
  FilterIcon,
  GripVerticalIcon,
  HeartIcon,
  LayoutListIcon,
  MenuIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  SquareIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToggle } from '@/hooks/use-toggle';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

// ========================================
// MOCK DATA TYPES
// ========================================

interface Bobblehead {
  acquisitionDate: Date | null;
  acquisitionMethod: null | string;
  category: null | string;
  characterName: null | string;
  commentCount: number;
  createdAt: Date;
  currentCondition: BobbleheadCondition;
  height: null | number;
  id: string;
  isFeatured: boolean;
  isPublic: boolean;
  likeCount: number;
  manufacturer: null | string;
  material: null | string;
  name: string;
  photos: Array<BobbleheadPhoto>;
  purchaseLocation: null | string;
  purchasePrice: null | number;
  series: null | string;
  status: BobbleheadStatus;
  updatedAt: Date;
  viewCount: number;
  weight: null | number;
  year: null | number;
}

type BobbleheadCondition = 'excellent' | 'fair' | 'good' | 'mint' | 'near-mint' | 'poor';

interface BobbleheadPhoto {
  altText?: string;
  caption?: string;
  id: string;
  isPrimary: boolean;
  url: string;
}

type BobbleheadStatus = 'active' | 'archived';

interface Collection {
  bobbleheadCount: number;
  commentCount: number;
  coverImageUrl: string;
  createdAt: Date;
  description: string;
  featuredBobbleheads: number;
  id: string;
  isPublic: boolean;
  likeCount: number;
  name: string;
  slug: string;
  totalValue: number;
  viewCount: number;
}

type CollectionCardStyle = 'compact' | 'cover' | 'detailed';

// ========================================
// MOCK DATA
// ========================================

const MOCK_COLLECTIONS: Array<Collection> = [
  {
    bobbleheadCount: 12,
    commentCount: 42,
    coverImageUrl: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=400',
    createdAt: new Date('2024-01-15'),
    description: 'My carefully curated collection of sports bobbleheads from the 2000s era',
    featuredBobbleheads: 3,
    id: 'col-1',
    isPublic: true,
    likeCount: 156,
    name: 'Classic Sports Collection',
    slug: 'classic-sports-collection',
    totalValue: 2450,
    viewCount: 892,
  },
  {
    bobbleheadCount: 8,
    commentCount: 23,
    coverImageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400',
    createdAt: new Date('2024-02-20'),
    description: 'Star Wars bobbleheads from various eras and manufacturers',
    featuredBobbleheads: 2,
    id: 'col-2',
    isPublic: true,
    likeCount: 89,
    name: 'Star Wars Galaxy',
    slug: 'star-wars-galaxy',
    totalValue: 1890,
    viewCount: 1245,
  },
  {
    bobbleheadCount: 15,
    commentCount: 67,
    coverImageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
    createdAt: new Date('2024-03-10'),
    description: 'NBA legends and current stars bobblehead collection',
    featuredBobbleheads: 5,
    id: 'col-3',
    isPublic: true,
    likeCount: 201,
    name: 'NBA Legends',
    slug: 'nba-legends',
    totalValue: 4567,
    viewCount: 2156,
  },
  {
    bobbleheadCount: 6,
    commentCount: 12,
    coverImageUrl: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=400',
    createdAt: new Date('2024-04-05'),
    description: 'Marvel superheroes from classic comics to MCU',
    featuredBobbleheads: 1,
    id: 'col-4',
    isPublic: true,
    likeCount: 145,
    name: 'Marvel Universe',
    slug: 'marvel-universe',
    totalValue: 2340,
    viewCount: 1534,
  },
  {
    bobbleheadCount: 20,
    commentCount: 89,
    coverImageUrl: 'https://images.unsplash.com/photo-1546422401-b6c9a44e3e88?w=400',
    createdAt: new Date('2024-05-12'),
    description: 'Rare and limited edition Disney character bobbleheads',
    featuredBobbleheads: 4,
    id: 'col-5',
    isPublic: true,
    likeCount: 178,
    name: 'Disney Magic',
    slug: 'disney-magic',
    totalValue: 3890,
    viewCount: 1876,
  },
];

const MOCK_BOBBLEHEADS_BY_COLLECTION: Record<string, Array<Bobblehead>> = {
  'col-1': [
    {
      acquisitionDate: new Date('2021-03-15'),
      acquisitionMethod: 'Purchased',
      category: 'Sports',
      characterName: 'Derek Jeter',
      commentCount: 5,
      createdAt: new Date('2021-03-16'),
      currentCondition: 'mint',
      height: 8,
      id: 'bob-1-1',
      isFeatured: true,
      isPublic: true,
      likeCount: 23,
      manufacturer: 'Funko',
      material: 'Vinyl',
      name: 'Derek Jeter Yankees Bobblehead',
      photos: [
        {
          altText: 'Derek Jeter Yankees Bobblehead front view',
          id: 'ph-1-1',
          isPrimary: true,
          url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400',
        },
      ],
      purchaseLocation: 'eBay',
      purchasePrice: 299,
      series: 'MLB Legends',
      status: 'active',
      updatedAt: new Date('2021-03-16'),
      viewCount: 145,
      weight: 12,
      year: 2015,
    },
    {
      acquisitionDate: new Date('2022-05-10'),
      acquisitionMethod: 'Gift',
      category: 'Sports',
      characterName: 'Tom Brady',
      commentCount: 8,
      createdAt: new Date('2022-05-11'),
      currentCondition: 'near-mint',
      height: 7.5,
      id: 'bob-1-2',
      isFeatured: true,
      isPublic: true,
      likeCount: 31,
      manufacturer: 'NECA',
      material: 'Resin',
      name: 'Tom Brady Patriots Bobblehead',
      photos: [
        {
          altText: 'Tom Brady Patriots Bobblehead',
          id: 'ph-1-2',
          isPrimary: true,
          url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400',
        },
      ],
      purchaseLocation: null,
      purchasePrice: null,
      series: 'NFL Stars',
      status: 'active',
      updatedAt: new Date('2022-05-11'),
      viewCount: 178,
      weight: 10,
      year: 2018,
    },
    {
      acquisitionDate: new Date('2020-11-20'),
      acquisitionMethod: 'Purchased',
      category: 'Sports',
      characterName: 'Kobe Bryant',
      commentCount: 12,
      createdAt: new Date('2020-11-21'),
      currentCondition: 'excellent',
      height: 9,
      id: 'bob-1-3',
      isFeatured: true,
      isPublic: true,
      likeCount: 45,
      manufacturer: 'Funko',
      material: 'Vinyl',
      name: 'Kobe Bryant Lakers Bobblehead',
      photos: [
        {
          altText: 'Kobe Bryant Lakers Bobblehead',
          id: 'ph-1-3',
          isPrimary: true,
          url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400',
        },
      ],
      purchaseLocation: 'Amazon',
      purchasePrice: 450,
      series: 'NBA Legends',
      status: 'active',
      updatedAt: new Date('2020-11-21'),
      viewCount: 234,
      weight: 14,
      year: 2012,
    },
  ],
  'col-2': [
    {
      acquisitionDate: new Date('2023-01-05'),
      acquisitionMethod: 'Purchased',
      category: 'Sci-Fi',
      characterName: 'Darth Vader',
      commentCount: 6,
      createdAt: new Date('2023-01-06'),
      currentCondition: 'mint',
      height: 8.5,
      id: 'bob-2-1',
      isFeatured: true,
      isPublic: true,
      likeCount: 18,
      manufacturer: 'Funko',
      material: 'Vinyl',
      name: 'Darth Vader Bobblehead',
      photos: [
        {
          altText: 'Darth Vader Bobblehead',
          id: 'ph-2-1',
          isPrimary: true,
          url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
        },
      ],
      purchaseLocation: 'Local Card Shop',
      purchasePrice: 175,
      series: 'Star Wars Classics',
      status: 'active',
      updatedAt: new Date('2023-01-06'),
      viewCount: 98,
      weight: 11,
      year: 2010,
    },
    {
      acquisitionDate: new Date('2021-08-12'),
      acquisitionMethod: 'Trade',
      category: 'Sci-Fi',
      characterName: 'Yoda',
      commentCount: 3,
      createdAt: new Date('2021-08-13'),
      currentCondition: 'near-mint',
      height: 7,
      id: 'bob-2-2',
      isFeatured: true,
      isPublic: true,
      likeCount: 14,
      manufacturer: 'Funko',
      material: 'Vinyl',
      name: 'Yoda Bobblehead',
      photos: [
        {
          altText: 'Yoda Bobblehead',
          id: 'ph-2-2',
          isPrimary: true,
          url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
        },
      ],
      purchaseLocation: null,
      purchasePrice: null,
      series: 'Star Wars Legends',
      status: 'active',
      updatedAt: new Date('2021-08-13'),
      viewCount: 67,
      weight: 9,
      year: 2016,
    },
  ],
  'col-3': [],
  'col-4': [],
  'col-5': [],
};

// ========================================
// SUB-COMPONENTS
// ========================================

type CollectionSidebarItemProps = ComponentTestIdProps & {
  collection: Collection;
  isActive: boolean;
  onClick: (collectionId: string) => void;
  onEdit: (collectionId: string) => void;
};

const CollectionSidebarItem = ({
  collection,
  isActive,
  onClick,
  onEdit,
  testId,
}: CollectionSidebarItemProps) => {
  const itemTestId = testId || generateTestId('feature', 'collection-card', collection.id);

  const handleClick = useCallback(() => {
    onClick(collection.id);
  }, [collection.id, onClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(collection.id);
    },
    [collection.id, onEdit],
  );

  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(collection.totalValue);

  return (
    <div
      className={cn(
        'group relative cursor-pointer rounded-lg border p-3 transition-all',
        'hover:border-primary hover:bg-accent',
        isActive ?
          'border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-md'
        : 'border-border bg-card',
      )}
      data-slot={'collection-sidebar-item'}
      data-testid={itemTestId}
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
          <AvatarImage alt={collection.name} src={collection.coverImageUrl} />
          <AvatarFallback>{collection.name.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Collection Info */}
        <div className={'min-w-0 flex-1'} data-slot={'collection-info'}>
          <h3 className={'truncate text-sm font-semibold sm:text-base md:text-sm'}>{collection.name}</h3>
          <div className={'mt-1 flex items-center gap-2 text-xs text-muted-foreground'}>
            <span>{collection.bobbleheadCount} items</span>
            <span>•</span>
            <span className={'font-medium text-primary'}>{formattedValue}</span>
          </div>
        </div>

        {/* Edit Button (visible on hover on desktop) */}
        <Button
          className={'opacity-0 transition-opacity group-hover:opacity-100 md:block'}
          onClick={handleEdit}
          size={'icon'}
          variant={'ghost'}
        >
          <EditIcon className={'size-3.5'} />
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

// ========================================
// DETAILED CARD STYLE (from demo1c)
// ========================================

type CollectionDetailedCardProps = ComponentTestIdProps & {
  collection: Collection;
  isActive: boolean;
  onClick: (collectionId: string) => void;
  onEdit: (collectionId: string) => void;
};

const CollectionDetailedCard = ({
  collection,
  isActive,
  onClick,
  onEdit,
  testId,
}: CollectionDetailedCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'collection-card', collection.id);

  const handleClick = useCallback(() => {
    onClick(collection.id);
  }, [collection.id, onClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(collection.id);
    },
    [collection.id, onEdit],
  );

  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(collection.totalValue);

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
          data-slot={'collection-detailed-card'}
          data-testid={cardTestId}
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
              <AvatarImage alt={collection.name} src={collection.coverImageUrl} />
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
              </div>

              {/* Engagement Stats */}
              <div className={'mt-1.5 flex items-center gap-3 text-xs text-muted-foreground'}>
                <span className={'flex items-center gap-1'}>
                  <HeartIcon aria-hidden className={'size-3'} />
                  {collection.likeCount}
                </span>
                <span className={'flex items-center gap-1'}>
                  <StarIcon aria-hidden className={'size-3'} />
                  {collection.featuredBobbleheads}
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
              <AvatarImage alt={collection.name} src={collection.coverImageUrl} />
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
              <p className={'font-medium'}>{collection.featuredBobbleheads}</p>
            </div>
            <div>
              <span className={'text-muted-foreground'}>Views:</span>
              <p className={'font-medium'}>{collection.viewCount}</p>
            </div>
            <div>
              <span className={'text-muted-foreground'}>Likes:</span>
              <p className={'font-medium'}>{collection.likeCount}</p>
            </div>
          </div>

          <Separator />

          <div className={'flex items-center gap-2 text-xs text-muted-foreground'}>
            <span>{collection.commentCount} comments</span>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

// ========================================
// COVER CARD STYLE (from demo1d)
// ========================================

type CollectionCoverCardProps = ComponentTestIdProps & {
  collection: Collection;
  isActive: boolean;
  onClick: (collectionId: string) => void;
  onEdit: (collectionId: string) => void;
};

const CollectionCoverCard = ({ collection, isActive, onClick, onEdit, testId }: CollectionCoverCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'collection-card', collection.id);

  const handleClick = useCallback(() => {
    onClick(collection.id);
  }, [collection.id, onClick]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(collection.id);
    },
    [collection.id, onEdit],
  );

  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(collection.totalValue);

  return (
    <div
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-xl border transition-all',
        'hover:shadow-lg',
        isActive && 'border-primary shadow-lg ring-2 ring-primary/20',
        !isActive && 'border-border hover:border-primary/50',
      )}
      data-slot={'collection-cover-card'}
      data-testid={cardTestId}
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
          alt={collection.name}
          className={'size-full object-cover transition-transform group-hover:scale-105'}
          data-slot={'collection-cover'}
          src={collection.coverImageUrl}
        />

        {/* Gradient Overlay */}
        <div className={'absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent'} />

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
          <EditIcon className={'size-3.5'} />
        </Button>

        {/* Active Indicator */}
        <Conditional isCondition={isActive}>
          <div className={'absolute top-0 right-0 left-0 h-1 bg-primary'} data-slot={'active-indicator'} />
        </Conditional>
      </div>
    </div>
  );
};

type BobbleheadCardProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobblehead: Bobblehead;
    isSelected: boolean;
    isSelectionMode: boolean;
    onDeleteClick: (id: string) => void;
    onEditClick: (id: string) => void;
    onFeatureToggle: (id: string) => void;
    onSelectionChange: (id: string, checked: boolean) => void;
  };

const BobbleheadCard = ({
  bobblehead,
  isSelected,
  isSelectionMode,
  onDeleteClick,
  onEditClick,
  onFeatureToggle,
  onSelectionChange,
  testId,
  ...props
}: BobbleheadCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'bobblehead-card', bobblehead.id);

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      onSelectionChange(bobblehead.id, checked);
    },
    [bobblehead.id, onSelectionChange],
  );

  const handleEdit = useCallback(() => {
    onEditClick(bobblehead.id);
  }, [bobblehead.id, onEditClick]);

  const handleDelete = useCallback(() => {
    onDeleteClick(bobblehead.id);
  }, [bobblehead.id, onDeleteClick]);

  const handleFeatureToggle = useCallback(() => {
    onFeatureToggle(bobblehead.id);
  }, [bobblehead.id, onFeatureToggle]);

  const primaryPhoto = useMemo(
    () => bobblehead.photos.find((p) => p.isPrimary) || bobblehead.photos[0],
    [bobblehead.photos],
  );

  const conditionColor = useMemo(() => {
    switch (bobblehead.currentCondition) {
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
  }, [bobblehead.currentCondition]);

  const _isShowCheckbox = isSelectionMode;
  const _isShowFeatureBadge = bobblehead.isFeatured;

  return (
    <div
      className={'group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg'}
      data-slot={'bobblehead-card'}
      data-testid={cardTestId}
      {...props}
    >
      {/* Hover Card with Details */}
      <HoverCard openDelay={200}>
        <HoverCardTrigger asChild>
          <div className={'cursor-pointer'}>
            {/* Image Container */}
            <div className={'relative aspect-square overflow-hidden bg-muted'}>
              {primaryPhoto && (
                <img
                  alt={primaryPhoto.altText || bobblehead.name}
                  className={'size-full object-cover transition-transform group-hover:scale-105'}
                  data-slot={'bobblehead-image'}
                  data-testid={`${cardTestId}-image`}
                  src={primaryPhoto.url}
                />
              )}

              {/* Featured Badge */}
              <Conditional isCondition={_isShowFeatureBadge}>
                <div className={'absolute top-2 left-2'}>
                  <Badge className={'shadow-lg'} variant={'editor_pick'}>
                    <StarIcon aria-hidden className={'size-3'} />
                    Featured
                  </Badge>
                </div>
              </Conditional>

              {/* Selection Checkbox Overlay */}
              <Conditional isCondition={_isShowCheckbox}>
                <div className={'absolute top-2 right-2'}>
                  <div
                    className={'rounded-md bg-background/90 p-1.5 backdrop-blur-sm'}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                      }
                    }}
                    role={'button'}
                    tabIndex={0}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={handleCheckboxChange}
                      testId={`${cardTestId}-checkbox`}
                    />
                  </div>
                </div>
              </Conditional>

              {/* Hover Actions Overlay */}
              <Conditional isCondition={!_isShowCheckbox}>
                <div
                  className={cn(
                    'absolute inset-0 flex items-center justify-center gap-2',
                    'bg-black/50 opacity-0 backdrop-blur-sm transition-opacity',
                    'group-hover:opacity-100',
                  )}
                >
                  <Button
                    onClick={handleEdit}
                    size={'sm'}
                    testId={`${cardTestId}-edit-btn`}
                    variant={'default'}
                  >
                    <EditIcon aria-hidden className={'size-4'} />
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size={'sm'} testId={`${cardTestId}-more-btn`} variant={'secondary'}>
                        <MoreVerticalIcon aria-hidden className={'size-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={'end'}>
                      <DropdownMenuItem onClick={handleFeatureToggle}>
                        <StarIcon aria-hidden className={'size-4'} />
                        {bobblehead.isFeatured ? 'Unfeature' : 'Feature'}
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
              {/* Name */}
              <h3 className={'truncate text-sm font-semibold'} data-testid={`${cardTestId}-name`}>
                {bobblehead.name}
              </h3>

              {/* Condition Badge */}
              <div className={'mt-1'}>
                <span
                  className={cn('inline-block rounded-md px-2 py-0.5 text-xs font-medium', conditionColor)}
                  data-testid={`${cardTestId}-condition`}
                >
                  {bobblehead.currentCondition.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </HoverCardTrigger>

        {/* Hover Card Content with Full Details */}
        <HoverCardContent align={'start'} className={'w-80'} side={'right'}>
          <div className={'space-y-3'}>
            {/* Header */}
            <div className={'space-y-1'}>
              <h4 className={'leading-none font-semibold'}>{bobblehead.name}</h4>
              <Conditional isCondition={!!bobblehead.characterName}>
                <p className={'text-sm text-muted-foreground'}>{bobblehead.characterName}</p>
              </Conditional>
            </div>

            <Separator />

            {/* Details Grid */}
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

            {/* Stats */}
            <div className={'flex items-center gap-4 text-xs text-muted-foreground'}>
              <span>{bobblehead.likeCount} likes</span>
              <span>{bobblehead.commentCount} comments</span>
              <span>{bobblehead.viewCount} views</span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================

type OffCanvasDrawerDashboardProps = ComponentProps<'div'> & ComponentTestIdProps;

export function OffCanvasDrawerDashboard({ className, testId, ...props }: OffCanvasDrawerDashboardProps) {
  // 1. useState hooks
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    MOCK_COLLECTIONS[0]?.id || 'col-1',
  );
  const [isDrawerOpen, setIsDrawerOpen] = useToggle(false);
  const [collectionSearchQuery, setCollectionSearchQuery] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useToggle(false);
  const [selectedBobbleheadIds, setSelectedBobbleheadIds] = useState<Set<string>>(new Set());
  const [bobbleheadSearchQuery, setBobbleheadSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('compact');
  const [collectionCardStyle, setCollectionCardStyle] = useState<CollectionCardStyle>('compact');

  // 2. Other hooks
  const drawerRef = useRef<HTMLDivElement>(null);
  const touchStartXRef = useRef<number>(0);

  // 3. useMemo hooks
  const filteredCollections = useMemo(() => {
    if (!collectionSearchQuery.trim()) {
      return MOCK_COLLECTIONS;
    }
    const query = collectionSearchQuery.toLowerCase();
    return MOCK_COLLECTIONS.filter(
      (c) => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query),
    );
  }, [collectionSearchQuery]);

  const selectedCollection = useMemo(() => {
    return MOCK_COLLECTIONS.find((c) => c.id === selectedCollectionId);
  }, [selectedCollectionId]);

  const bobbleheads = useMemo(() => {
    return MOCK_BOBBLEHEADS_BY_COLLECTION[selectedCollectionId] || [];
  }, [selectedCollectionId]);

  const filteredBobbleheads = useMemo(() => {
    let result = [...bobbleheads];

    // Search filter
    if (bobbleheadSearchQuery.trim()) {
      const query = bobbleheadSearchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(query) ||
          b.characterName?.toLowerCase().includes(query) ||
          b.manufacturer?.toLowerCase().includes(query),
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((b) => b.category === filterCategory);
    }

    // Condition filter
    if (filterCondition !== 'all') {
      result = result.filter((b) => b.currentCondition === filterCondition);
    }

    // Featured filter
    if (filterFeatured === 'featured') {
      result = result.filter((b) => b.isFeatured);
    } else if (filterFeatured === 'not-featured') {
      result = result.filter((b) => !b.isFeatured);
    }

    // Sort
    switch (sortBy) {
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'value-high':
        result.sort((a, b) => (b.purchasePrice || 0) - (a.purchasePrice || 0));
        break;
      case 'value-low':
        result.sort((a, b) => (a.purchasePrice || 0) - (b.purchasePrice || 0));
        break;
      default:
        break;
    }

    return result;
  }, [bobbleheads, bobbleheadSearchQuery, filterCategory, filterCondition, filterFeatured, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(bobbleheads.map((b) => b.category).filter(Boolean));
    return Array.from(cats) as Array<string>;
  }, [bobbleheads]);

  const conditions = useMemo(() => {
    const conds = new Set(bobbleheads.map((b) => b.currentCondition));
    return Array.from(conds);
  }, [bobbleheads]);

  // 4. useEffect hooks
  // (none needed)

  // 5. Utility functions
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(value);
  };

  // 6. Event handlers
  const handleCollectionSelect = useCallback(
    (collectionId: string) => {
      setSelectedCollectionId(collectionId);
      setSelectedBobbleheadIds(new Set());
      void setIsSelectionMode.off();
      void setIsDrawerOpen.off(); // Auto-close drawer on mobile
    },
    [setIsSelectionMode, setIsDrawerOpen],
  );

  const handleCreateCollection = useCallback(() => {
    console.log('Create new collection');
  }, []);

  const handleEditCollection = useCallback((collectionId: string) => {
    console.log('Edit collection:', collectionId);
  }, []);

  const handleDeleteCollection = useCallback(() => {
    console.log('Delete collection:', selectedCollectionId);
  }, [selectedCollectionId]);

  const handleShareCollection = useCallback(() => {
    console.log('Share collection:', selectedCollectionId);
  }, [selectedCollectionId]);

  const handleCollectionSettings = useCallback(() => {
    console.log('Collection settings:', selectedCollectionId);
  }, [selectedCollectionId]);

  const handleCollectionSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setCollectionSearchQuery(e.target.value);
  }, []);

  const handleCollectionSearchClear = useCallback(() => {
    setCollectionSearchQuery('');
  }, []);

  const handleBobbleheadSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setBobbleheadSearchQuery(e.target.value);
  }, []);

  const handleBobbleheadSearchClear = useCallback(() => {
    setBobbleheadSearchQuery('');
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode.toggle();
    if (isSelectionMode) {
      setSelectedBobbleheadIds(new Set());
    }
  }, [isSelectionMode, setIsSelectionMode]);

  const handleSelectAll = useCallback(() => {
    if (selectedBobbleheadIds.size === filteredBobbleheads.length) {
      setSelectedBobbleheadIds(new Set());
    } else {
      setSelectedBobbleheadIds(new Set(filteredBobbleheads.map((b) => b.id)));
    }
  }, [filteredBobbleheads, selectedBobbleheadIds.size]);

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedBobbleheadIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleEditBobblehead = useCallback((id: string) => {
    console.log('Edit bobblehead:', id);
  }, []);

  const handleDeleteBobblehead = useCallback((id: string) => {
    console.log('Delete bobblehead:', id);
  }, []);

  const handleFeatureToggle = useCallback((id: string) => {
    console.log('Toggle feature for bobblehead:', id);
  }, []);

  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', Array.from(selectedBobbleheadIds));
    setSelectedBobbleheadIds(new Set());
  }, [selectedBobbleheadIds]);

  const handleBulkFeature = useCallback(() => {
    console.log('Bulk feature:', Array.from(selectedBobbleheadIds));
  }, [selectedBobbleheadIds]);

  const handleAddBobblehead = useCallback(() => {
    console.log('Add new bobblehead to collection:', selectedCollectionId);
  }, [selectedCollectionId]);

  const handleToggleGridDensity = useCallback(() => {
    setGridDensity((prev) => (prev === 'compact' ? 'comfortable' : 'compact'));
  }, []);

  const handleDrawerBackdropClick = useCallback(() => {
    void setIsDrawerOpen.off();
  }, [setIsDrawerOpen]);

  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartXRef.current = touch.clientX;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      const touch = e.changedTouches[0];
      if (!touch) return;

      const diff = touch.clientX - touchStartXRef.current;

      // Swipe right to close (minimum 50px threshold)
      if (diff < -50) {
        void setIsDrawerOpen.off();
      }
    },
    [setIsDrawerOpen],
  );

  // 7. Derived variables
  const _hasCollections = filteredCollections.length > 0;
  const _hasBobbleheads = filteredBobbleheads.length > 0;
  const _hasNoBobbleheads = !_hasBobbleheads && (!!bobbleheadSearchQuery || filterCategory !== 'all');
  const _hasSelection = selectedBobbleheadIds.size > 0;
  const _isAllSelected =
    selectedBobbleheadIds.size === filteredBobbleheads.length && filteredBobbleheads.length > 0;

  const dashboardTestId = testId || generateTestId('feature', 'bobblehead-grid', 'demo1b');

  const gridCols =
    gridDensity === 'compact' ?
      'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';

  return (
    <div
      className={cn('flex h-screen overflow-hidden bg-background', className)}
      data-slot={'off-canvas-dashboard'}
      data-testid={dashboardTestId}
      {...props}
    >
      {/* Desktop Sidebar (lg+) - Persistent with glassmorphism */}
      <div
        className={cn(
          'hidden flex-col border-r lg:flex lg:w-80',
          'bg-gradient-to-br from-muted/50 via-background/80 to-muted/30',
          'backdrop-blur-sm',
        )}
        data-slot={'desktop-sidebar'}
      >
        {/* Sidebar Header */}
        <div
          className={'flex items-center justify-between border-b bg-background/50 p-4 backdrop-blur-md'}
          data-slot={'sidebar-header'}
        >
          <h2
            className={
              'bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent'
            }
          >
            Collections
          </h2>
          <Button
            onClick={handleCreateCollection}
            size={'sm'}
            testId={`${dashboardTestId}-create-collection`}
          >
            <PlusIcon className={'size-4'} />
            New
          </Button>
        </div>

        {/* Sidebar Search & Card Style Picker */}
        <div
          className={'space-y-2 border-b bg-background/30 p-3 backdrop-blur-sm'}
          data-slot={'sidebar-search'}
        >
          <Input
            isClearable
            leftIcon={<SearchIcon className={'size-4'} />}
            onChange={handleCollectionSearchChange}
            onClear={handleCollectionSearchClear}
            placeholder={'Search collections...'}
            testId={`${dashboardTestId}-collection-search`}
            value={collectionSearchQuery}
          />
          {/* Card Style Picker */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className={'w-full justify-between'} size={'sm'} variant={'outline'}>
                <span className={'flex items-center gap-2'}>
                  {collectionCardStyle === 'compact' && <LayoutListIcon aria-hidden className={'size-4'} />}
                  {collectionCardStyle === 'detailed' && <LayoutListIcon aria-hidden className={'size-4'} />}
                  {collectionCardStyle === 'cover' && <SquareIcon aria-hidden className={'size-4'} />}
                  <span className={'text-xs'}>
                    {collectionCardStyle === 'compact' && 'Compact View'}
                    {collectionCardStyle === 'detailed' && 'Detailed View'}
                    {collectionCardStyle === 'cover' && 'Cover View'}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'start'} className={'w-56'}>
              <DropdownMenuLabel>Card Style</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                onValueChange={(value) => setCollectionCardStyle(value as CollectionCardStyle)}
                value={collectionCardStyle}
              >
                <DropdownMenuRadioItem value={'compact'}>
                  <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
                  Compact
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'detailed'}>
                  <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
                  Detailed
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'cover'}>
                  <SquareIcon aria-hidden className={'mr-2 size-4'} />
                  Cover
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sidebar Content - Collections List */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-3',
            collectionCardStyle === 'cover' ? 'space-y-3' : 'space-y-2',
          )}
          data-slot={'sidebar-content'}
        >
          <Conditional isCondition={_hasCollections}>
            {filteredCollections.map((collection) => {
              if (collectionCardStyle === 'compact') {
                return (
                  <CollectionSidebarItem
                    collection={collection}
                    isActive={collection.id === selectedCollectionId}
                    key={collection.id}
                    onClick={handleCollectionSelect}
                    onEdit={handleEditCollection}
                  />
                );
              }
              if (collectionCardStyle === 'detailed') {
                return (
                  <CollectionDetailedCard
                    collection={collection}
                    isActive={collection.id === selectedCollectionId}
                    key={collection.id}
                    onClick={handleCollectionSelect}
                    onEdit={handleEditCollection}
                  />
                );
              }
              return (
                <CollectionCoverCard
                  collection={collection}
                  isActive={collection.id === selectedCollectionId}
                  key={collection.id}
                  onClick={handleCollectionSelect}
                  onEdit={handleEditCollection}
                />
              );
            })}
          </Conditional>

          <Conditional isCondition={!_hasCollections}>
            <div className={'flex items-center justify-center py-8 text-center'}>
              <p className={'text-sm text-muted-foreground'}>No collections found</p>
            </div>
          </Conditional>
        </div>

        {/* Sidebar Footer */}
        <div className={'border-t bg-background/30 p-3 backdrop-blur-sm'} data-slot={'sidebar-footer'}>
          <div className={'text-xs text-muted-foreground'}>{MOCK_COLLECTIONS.length} total collections</div>
        </div>
      </div>

      {/* Mobile Drawer Backdrop (sm and below) */}
      <Conditional isCondition={isDrawerOpen}>
        <div
          className={'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden'}
          data-slot={'drawer-backdrop'}
          data-testid={`${dashboardTestId}-drawer-backdrop`}
          onClick={handleDrawerBackdropClick}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              void setIsDrawerOpen.off();
            }
          }}
          role={'button'}
          tabIndex={0}
        />
      </Conditional>

      {/* Mobile Drawer (sm and below) - Off-Canvas Left Slide */}
      <div
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full w-[85%] max-w-sm flex-col bg-background shadow-2xl transition-transform duration-300 ease-out',
          'lg:hidden',
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        data-slot={'mobile-drawer'}
        data-testid={`${dashboardTestId}-drawer`}
        onTouchEnd={handleTouchEnd}
        onTouchStart={handleTouchStart}
        ref={drawerRef}
      >
        {/* Drawer Header with Close Button */}
        <div className={'flex items-center justify-between border-b p-4'} data-slot={'drawer-header'}>
          <h2 className={'text-lg font-semibold'}>Collections</h2>
          <div className={'flex items-center gap-2'}>
            <Button
              onClick={handleCreateCollection}
              size={'sm'}
              testId={`${dashboardTestId}-drawer-create-collection`}
            >
              <PlusIcon className={'size-4'} />
              New
            </Button>
            <Button
              onClick={() => setIsDrawerOpen.off()}
              size={'icon'}
              testId={`${dashboardTestId}-drawer-close`}
              variant={'ghost'}
            >
              <XIcon className={'size-5'} />
            </Button>
          </div>
        </div>

        {/* Drawer Search & Card Style Picker - Sticky */}
        <div className={'sticky top-0 z-10 space-y-2 border-b bg-background p-3'} data-slot={'drawer-search'}>
          <Input
            isClearable
            leftIcon={<SearchIcon className={'size-4'} />}
            onChange={handleCollectionSearchChange}
            onClear={handleCollectionSearchClear}
            placeholder={'Search collections...'}
            testId={`${dashboardTestId}-drawer-collection-search`}
            value={collectionSearchQuery}
          />
          {/* Card Style Picker for Mobile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className={'w-full justify-between'} size={'sm'} variant={'outline'}>
                <span className={'flex items-center gap-2'}>
                  {collectionCardStyle === 'compact' && <LayoutListIcon aria-hidden className={'size-4'} />}
                  {collectionCardStyle === 'detailed' && <LayoutListIcon aria-hidden className={'size-4'} />}
                  {collectionCardStyle === 'cover' && <SquareIcon aria-hidden className={'size-4'} />}
                  <span className={'text-xs'}>
                    {collectionCardStyle === 'compact' && 'Compact View'}
                    {collectionCardStyle === 'detailed' && 'Detailed View'}
                    {collectionCardStyle === 'cover' && 'Cover View'}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={'start'} className={'w-56'}>
              <DropdownMenuLabel>Card Style</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                onValueChange={(value) => setCollectionCardStyle(value as CollectionCardStyle)}
                value={collectionCardStyle}
              >
                <DropdownMenuRadioItem value={'compact'}>
                  <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
                  Compact
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'detailed'}>
                  <LayoutListIcon aria-hidden className={'mr-2 size-4'} />
                  Detailed
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value={'cover'}>
                  <SquareIcon aria-hidden className={'mr-2 size-4'} />
                  Cover
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Drawer Content - Collections List */}
        <div
          className={cn(
            'flex-1 overflow-y-auto p-4',
            collectionCardStyle === 'cover' ? 'space-y-4' : 'space-y-3',
          )}
          data-slot={'drawer-content'}
        >
          <Conditional isCondition={_hasCollections}>
            {filteredCollections.map((collection) => {
              if (collectionCardStyle === 'compact') {
                return (
                  <CollectionSidebarItem
                    collection={collection}
                    isActive={collection.id === selectedCollectionId}
                    key={collection.id}
                    onClick={handleCollectionSelect}
                    onEdit={handleEditCollection}
                  />
                );
              }
              if (collectionCardStyle === 'detailed') {
                return (
                  <CollectionDetailedCard
                    collection={collection}
                    isActive={collection.id === selectedCollectionId}
                    key={collection.id}
                    onClick={handleCollectionSelect}
                    onEdit={handleEditCollection}
                  />
                );
              }
              return (
                <CollectionCoverCard
                  collection={collection}
                  isActive={collection.id === selectedCollectionId}
                  key={collection.id}
                  onClick={handleCollectionSelect}
                  onEdit={handleEditCollection}
                />
              );
            })}
          </Conditional>

          <Conditional isCondition={!_hasCollections}>
            <div className={'flex items-center justify-center py-8 text-center'}>
              <p className={'text-sm text-muted-foreground'}>No collections found</p>
            </div>
          </Conditional>
        </div>

        {/* Drawer Footer */}
        <div className={'border-t p-3'} data-slot={'drawer-footer'}>
          <div className={'text-xs text-muted-foreground'}>{MOCK_COLLECTIONS.length} total collections</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={'flex flex-1 flex-col overflow-hidden'} data-slot={'main-content'}>
        {/* Mobile Header with Hamburger Menu */}
        <div
          className={cn(
            'sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 p-4 backdrop-blur-sm',
            'lg:hidden',
          )}
          data-slot={'mobile-header'}
        >
          <Button
            onClick={() => setIsDrawerOpen.toggle()}
            size={'icon'}
            testId={`${dashboardTestId}-hamburger-menu`}
            variant={'ghost'}
          >
            <MenuIcon className={'size-5'} />
          </Button>
          <h1 className={'flex-1 truncate text-lg font-semibold'}>{selectedCollection?.name}</h1>
          <Button onClick={handleAddBobblehead} size={'sm'} testId={`${dashboardTestId}-mobile-add-new`}>
            <PlusIcon aria-hidden className={'size-4'} />
          </Button>
        </div>

        {/* Main Content Header - Collection Details (Desktop) */}
        <Conditional isCondition={!!selectedCollection}>
          <Card className={'m-4 mb-0 hidden lg:block'}>
            <CardHeader className={'border-b'}>
              <div className={'flex items-start justify-between'}>
                <div className={'flex items-start gap-4'}>
                  {/* Cover Image */}
                  <Avatar className={'size-20 rounded-lg'}>
                    <AvatarImage alt={selectedCollection?.name} src={selectedCollection?.coverImageUrl} />
                    <AvatarFallback>{selectedCollection?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Collection Info */}
                  <div className={'flex-1 space-y-2'}>
                    <CardTitle className={'text-2xl'}>{selectedCollection?.name}</CardTitle>
                    <CardDescription>{selectedCollection?.description}</CardDescription>

                    {/* Quick Stats */}
                    <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
                      <span className={'font-medium'}>{selectedCollection?.bobbleheadCount} items</span>
                      <span>{selectedCollection?.featuredBobbleheads} featured</span>
                      <span className={'font-semibold text-primary'}>
                        {formatCurrency(selectedCollection?.totalValue || 0)} total value
                      </span>
                      <Separator className={'h-4'} orientation={'vertical'} />
                      <span>
                        <HeartIcon className={'inline size-3.5'} /> {selectedCollection?.likeCount}
                      </span>
                      <span>{selectedCollection?.viewCount} views</span>
                    </div>
                  </div>
                </div>

                {/* Collection Actions */}
                <div className={'flex items-center gap-2'}>
                  <Button
                    onClick={() => handleEditCollection(selectedCollectionId)}
                    size={'sm'}
                    testId={`${dashboardTestId}-edit-collection`}
                    variant={'outline'}
                  >
                    <EditIcon aria-hidden className={'size-4'} />
                    Edit
                  </Button>
                  <Button
                    onClick={handleShareCollection}
                    size={'sm'}
                    testId={`${dashboardTestId}-share-collection`}
                    variant={'outline'}
                  >
                    <ShareIcon aria-hidden className={'size-4'} />
                    Share
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size={'icon'} testId={`${dashboardTestId}-collection-menu`} variant={'ghost'}>
                        <MoreVerticalIcon aria-hidden className={'size-4'} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={'end'}>
                      <DropdownMenuItem onClick={handleCollectionSettings}>
                        <SettingsIcon aria-hidden className={'size-4'} />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleDeleteCollection} variant={'destructive'}>
                        <TrashIcon aria-hidden className={'size-4'} />
                        Delete Collection
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Conditional>

        {/* Toolbar Section */}
        <div className={'m-4 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
          {/* Left Side - Search and Filters */}
          <div className={'flex flex-1 items-center gap-2'}>
            {/* Search */}
            <div className={'w-full max-w-sm'}>
              <Input
                isClearable
                leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
                onChange={handleBobbleheadSearchChange}
                onClear={handleBobbleheadSearchClear}
                placeholder={'Search bobbleheads...'}
                testId={`${dashboardTestId}-bobblehead-search`}
                value={bobbleheadSearchQuery}
              />
            </div>

            {/* Filters Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'sm'} testId={`${dashboardTestId}-filters`} variant={'outline'}>
                  <FilterIcon aria-hidden className={'size-4'} />
                  <span className={'hidden sm:inline'}>Filters</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'start'} className={'w-56'}>
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuRadioGroup onValueChange={setFilterCategory} value={filterCategory}>
                  <DropdownMenuRadioItem value={'all'}>All Categories</DropdownMenuRadioItem>
                  {categories.map((cat) => (
                    <DropdownMenuRadioItem key={cat} value={cat}>
                      {cat}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Condition</DropdownMenuLabel>
                <DropdownMenuRadioGroup onValueChange={setFilterCondition} value={filterCondition}>
                  <DropdownMenuRadioItem value={'all'}>All Conditions</DropdownMenuRadioItem>
                  {conditions.map((cond) => (
                    <DropdownMenuRadioItem key={cond} value={cond}>
                      {cond.replace('-', ' ').toUpperCase()}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Featured</DropdownMenuLabel>
                <DropdownMenuRadioGroup onValueChange={setFilterFeatured} value={filterFeatured}>
                  <DropdownMenuRadioItem value={'all'}>All Items</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'featured'}>Featured Only</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'not-featured'}>Not Featured</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'sm'} testId={`${dashboardTestId}-sort`} variant={'outline'}>
                  <span className={'hidden sm:inline'}>Sort</span>
                  <span className={'sm:hidden'}>•••</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'start'}>
                <DropdownMenuRadioGroup onValueChange={setSortBy} value={sortBy}>
                  <DropdownMenuRadioItem value={'newest'}>Newest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'oldest'}>Oldest First</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'name-asc'}>Name (A-Z)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'name-desc'}>Name (Z-A)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'value-high'}>Value (High-Low)</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value={'value-low'}>Value (Low-High)</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side - Actions (Desktop) */}
          <div className={'hidden items-center gap-2 lg:flex'}>
            {/* Grid Density Toggle */}
            <Button
              onClick={handleToggleGridDensity}
              size={'icon'}
              testId={`${dashboardTestId}-density`}
              variant={'outline'}
            >
              <GripVerticalIcon aria-hidden className={'size-4'} />
            </Button>

            {/* Selection Mode Toggle */}
            <Button
              onClick={handleToggleSelectionMode}
              size={'sm'}
              testId={`${dashboardTestId}-selection-mode`}
              variant={isSelectionMode ? 'default' : 'outline'}
            >
              <CheckIcon aria-hidden className={'size-4'} />
              {isSelectionMode ? 'Cancel' : 'Select'}
            </Button>

            {/* Add New Button */}
            <Button onClick={handleAddBobblehead} size={'sm'} testId={`${dashboardTestId}-add-new`}>
              <PlusIcon aria-hidden className={'size-4'} />
              Add Bobblehead
            </Button>
          </div>

          {/* Mobile Actions Row */}
          <div className={'flex items-center gap-2 lg:hidden'}>
            <Button
              onClick={handleToggleSelectionMode}
              size={'sm'}
              testId={`${dashboardTestId}-mobile-selection-mode`}
              variant={isSelectionMode ? 'default' : 'outline'}
            >
              <CheckIcon aria-hidden className={'size-4'} />
              {isSelectionMode ? 'Cancel' : 'Select'}
            </Button>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        <Conditional isCondition={_hasSelection}>
          <div className={'mx-4'}>
            <Card className={'border-primary'}>
              <CardContent className={'flex items-center justify-between py-3'}>
                <div className={'flex items-center gap-4'}>
                  <span className={'text-sm font-medium'}>
                    {selectedBobbleheadIds.size} item{selectedBobbleheadIds.size === 1 ? '' : 's'} selected
                  </span>
                  <Button
                    onClick={handleSelectAll}
                    size={'sm'}
                    testId={`${dashboardTestId}-select-all`}
                    variant={'ghost'}
                  >
                    {_isAllSelected ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>

                <div className={'flex items-center gap-2'}>
                  <Button
                    onClick={handleBulkFeature}
                    size={'sm'}
                    testId={`${dashboardTestId}-bulk-feature`}
                    variant={'outline'}
                  >
                    <StarIcon aria-hidden className={'size-4'} />
                    <span className={'hidden sm:inline'}>Feature Selected</span>
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    size={'sm'}
                    testId={`${dashboardTestId}-bulk-delete`}
                    variant={'destructive'}
                  >
                    <TrashIcon aria-hidden className={'size-4'} />
                    <span className={'hidden sm:inline'}>Delete Selected</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </Conditional>

        {/* Main Content - Bobblehead Grid */}
        <div className={'flex-1 overflow-y-auto px-4 pb-4'} data-slot={'bobblehead-grid-container'}>
          <Conditional isCondition={_hasBobbleheads}>
            <div className={cn('grid gap-4', gridCols)} data-testid={`${dashboardTestId}-grid`}>
              {filteredBobbleheads.map((bobblehead) => (
                <BobbleheadCard
                  bobblehead={bobblehead}
                  isSelected={selectedBobbleheadIds.has(bobblehead.id)}
                  isSelectionMode={isSelectionMode}
                  key={bobblehead.id}
                  onDeleteClick={handleDeleteBobblehead}
                  onEditClick={handleEditBobblehead}
                  onFeatureToggle={handleFeatureToggle}
                  onSelectionChange={handleSelectionChange}
                  testId={`${dashboardTestId}-card-${bobblehead.id}`}
                />
              ))}
            </div>
          </Conditional>

          {/* Empty States */}
          <Conditional isCondition={_hasNoBobbleheads}>
            <EmptyState
              action={
                <Button onClick={handleBobbleheadSearchClear} variant={'outline'}>
                  <XIcon aria-hidden className={'size-4'} />
                  Clear Filters
                </Button>
              }
              description={'Try adjusting your search or filters to find what you are looking for.'}
              icon={SearchIcon}
              title={'No Bobbleheads Found'}
            />
          </Conditional>

          <Conditional isCondition={!_hasBobbleheads && !_hasNoBobbleheads}>
            <EmptyState
              action={
                <Button onClick={handleAddBobblehead} testId={`${dashboardTestId}-empty-add`}>
                  <PlusIcon aria-hidden className={'size-4'} />
                  Add Your First Bobblehead
                </Button>
              }
              description={'Start building this collection by adding your first bobblehead.'}
              icon={PlusIcon}
              title={'No Bobbleheads Yet'}
            />
          </Conditional>
        </div>
      </div>
    </div>
  );
}
