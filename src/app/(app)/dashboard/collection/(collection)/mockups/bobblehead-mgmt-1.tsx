'use client';

import type { ChangeEvent, ComponentProps } from 'react';

import {
  CheckIcon,
  EditIcon,
  FilterIcon,
  GripVerticalIcon,
  MoreVerticalIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  ShareIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Avatar } from '@/components/ui/avatar';
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
// MOCK DATA
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
  commentCount: number;
  coverImageUrl: string;
  description: string;
  featuredBobbleheads: number;
  id: string;
  isPublic: boolean;
  likeCount: number;
  name: string;
  slug: string;
  totalBobbleheads: number;
  totalValue: number;
  viewCount: number;
}

const MOCK_COLLECTION: Collection = {
  commentCount: 42,
  coverImageUrl: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800',
  description: 'My carefully curated collection of sports bobbleheads from the 2000s era',
  featuredBobbleheads: 3,
  id: 'col-1',
  isPublic: true,
  likeCount: 156,
  name: 'Classic Sports Collection',
  slug: 'classic-sports-collection',
  totalBobbleheads: 12,
  totalValue: 2450,
  viewCount: 892,
};

const MOCK_BOBBLEHEADS: Array<Bobblehead> = [
  {
    acquisitionDate: new Date('2021-03-15'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Derek Jeter',
    commentCount: 5,
    createdAt: new Date('2021-03-16'),
    currentCondition: 'mint',
    height: 8,
    id: 'bob-1',
    isFeatured: true,
    isPublic: true,
    likeCount: 23,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Derek Jeter Yankees Bobblehead',
    photos: [
      {
        altText: 'Derek Jeter Yankees Bobblehead front view',
        id: 'ph-1',
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
    id: 'bob-2',
    isFeatured: true,
    isPublic: true,
    likeCount: 31,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Tom Brady Patriots Bobblehead',
    photos: [
      {
        altText: 'Tom Brady Patriots Bobblehead',
        id: 'ph-2',
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
    id: 'bob-3',
    isFeatured: true,
    isPublic: true,
    likeCount: 45,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Kobe Bryant Lakers Bobblehead',
    photos: [
      {
        altText: 'Kobe Bryant Lakers Bobblehead',
        id: 'ph-3',
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
  {
    acquisitionDate: new Date('2023-01-05'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Michael Jordan',
    commentCount: 6,
    createdAt: new Date('2023-01-06'),
    currentCondition: 'good',
    height: 8.5,
    id: 'bob-4',
    isFeatured: false,
    isPublic: true,
    likeCount: 18,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Michael Jordan Bulls Bobblehead',
    photos: [
      {
        altText: 'Michael Jordan Bulls Bobblehead',
        id: 'ph-4',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400',
      },
    ],
    purchaseLocation: 'Local Card Shop',
    purchasePrice: 175,
    series: 'NBA Classics',
    status: 'active',
    updatedAt: new Date('2023-01-06'),
    viewCount: 98,
    weight: 11,
    year: 2010,
  },
  {
    acquisitionDate: new Date('2021-08-12'),
    acquisitionMethod: 'Trade',
    category: 'Sports',
    characterName: 'Wayne Gretzky',
    commentCount: 3,
    createdAt: new Date('2021-08-13'),
    currentCondition: 'mint',
    height: 7,
    id: 'bob-5',
    isFeatured: false,
    isPublic: true,
    likeCount: 14,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Wayne Gretzky Oilers Bobblehead',
    photos: [
      {
        altText: 'Wayne Gretzky Oilers Bobblehead',
        id: 'ph-5',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=400',
      },
    ],
    purchaseLocation: null,
    purchasePrice: null,
    series: 'NHL Legends',
    status: 'active',
    updatedAt: new Date('2021-08-13'),
    viewCount: 67,
    weight: 9,
    year: 2016,
  },
  {
    acquisitionDate: new Date('2022-02-28'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Babe Ruth',
    commentCount: 9,
    createdAt: new Date('2022-03-01'),
    currentCondition: 'near-mint',
    height: 8,
    id: 'bob-6',
    isFeatured: false,
    isPublic: true,
    likeCount: 27,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Babe Ruth Yankees Bobblehead',
    photos: [
      {
        altText: 'Babe Ruth Yankees Bobblehead',
        id: 'ph-6',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400',
      },
    ],
    purchaseLocation: 'Sports Collectibles Store',
    purchasePrice: 320,
    series: 'MLB Classics',
    status: 'active',
    updatedAt: new Date('2022-03-01'),
    viewCount: 112,
    weight: 13,
    year: 2014,
  },
  {
    acquisitionDate: new Date('2023-06-15'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'LeBron James',
    commentCount: 7,
    createdAt: new Date('2023-06-16'),
    currentCondition: 'excellent',
    height: 9.5,
    id: 'bob-7',
    isFeatured: false,
    isPublic: true,
    likeCount: 22,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'LeBron James Cavaliers Bobblehead',
    photos: [
      {
        altText: 'LeBron James Cavaliers Bobblehead',
        id: 'ph-7',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400',
      },
    ],
    purchaseLocation: 'Online Auction',
    purchasePrice: 210,
    series: 'NBA Modern Stars',
    status: 'active',
    updatedAt: new Date('2023-06-16'),
    viewCount: 89,
    weight: 15,
    year: 2019,
  },
  {
    acquisitionDate: new Date('2020-09-10'),
    acquisitionMethod: 'Gift',
    category: 'Sports',
    characterName: 'Serena Williams',
    commentCount: 4,
    createdAt: new Date('2020-09-11'),
    currentCondition: 'good',
    height: 7.5,
    id: 'bob-8',
    isFeatured: false,
    isPublic: true,
    likeCount: 16,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Serena Williams Tennis Bobblehead',
    photos: [
      {
        altText: 'Serena Williams Tennis Bobblehead',
        id: 'ph-8',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400',
      },
    ],
    purchaseLocation: null,
    purchasePrice: null,
    series: 'Tennis Greats',
    status: 'active',
    updatedAt: new Date('2020-09-11'),
    viewCount: 54,
    weight: 8,
    year: 2017,
  },
  {
    acquisitionDate: new Date('2021-12-05'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Tiger Woods',
    commentCount: 5,
    createdAt: new Date('2021-12-06'),
    currentCondition: 'fair',
    height: 8,
    id: 'bob-9',
    isFeatured: false,
    isPublic: true,
    likeCount: 11,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Tiger Woods Golf Bobblehead',
    photos: [
      {
        altText: 'Tiger Woods Golf Bobblehead',
        id: 'ph-9',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
      },
    ],
    purchaseLocation: 'Garage Sale',
    purchasePrice: 45,
    series: 'Golf Legends',
    status: 'active',
    updatedAt: new Date('2021-12-06'),
    viewCount: 43,
    weight: 10,
    year: 2011,
  },
  {
    acquisitionDate: new Date('2022-07-22'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Muhammad Ali',
    commentCount: 10,
    createdAt: new Date('2022-07-23'),
    currentCondition: 'mint',
    height: 9,
    id: 'bob-10',
    isFeatured: false,
    isPublic: true,
    likeCount: 38,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Muhammad Ali Boxing Bobblehead',
    photos: [
      {
        altText: 'Muhammad Ali Boxing Bobblehead',
        id: 'ph-10',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=400',
      },
    ],
    purchaseLocation: 'Specialty Collectibles',
    purchasePrice: 385,
    series: 'Boxing Legends',
    status: 'active',
    updatedAt: new Date('2022-07-23'),
    viewCount: 156,
    weight: 16,
    year: 2013,
  },
  {
    acquisitionDate: new Date('2023-03-18'),
    acquisitionMethod: 'Trade',
    category: 'Sports',
    characterName: 'Lionel Messi',
    commentCount: 6,
    createdAt: new Date('2023-03-19'),
    currentCondition: 'excellent',
    height: 7.5,
    id: 'bob-11',
    isFeatured: false,
    isPublic: true,
    likeCount: 19,
    manufacturer: 'Funko',
    material: 'Vinyl',
    name: 'Lionel Messi Barcelona Bobblehead',
    photos: [
      {
        altText: 'Lionel Messi Barcelona Bobblehead',
        id: 'ph-11',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      },
    ],
    purchaseLocation: null,
    purchasePrice: null,
    series: 'Soccer Stars',
    status: 'active',
    updatedAt: new Date('2023-03-19'),
    viewCount: 78,
    weight: 9,
    year: 2020,
  },
  {
    acquisitionDate: new Date('2020-04-30'),
    acquisitionMethod: 'Purchased',
    category: 'Sports',
    characterName: 'Alex Rodriguez',
    commentCount: 2,
    createdAt: new Date('2020-05-01'),
    currentCondition: 'poor',
    height: 8,
    id: 'bob-12',
    isFeatured: false,
    isPublic: false,
    likeCount: 7,
    manufacturer: 'NECA',
    material: 'Resin',
    name: 'Alex Rodriguez Yankees Bobblehead',
    photos: [
      {
        altText: 'Alex Rodriguez Yankees Bobblehead',
        id: 'ph-12',
        isPrimary: true,
        url: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400',
      },
    ],
    purchaseLocation: 'Thrift Store',
    purchasePrice: 15,
    series: 'MLB Stars',
    status: 'active',
    updatedAt: new Date('2020-05-01'),
    viewCount: 32,
    weight: 11,
    year: 2009,
  },
];

// ========================================
// SUB-COMPONENTS
// ========================================

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

type BobbleheadManagementDashboardProps = ComponentProps<'div'> & ComponentTestIdProps;

export const BobbleheadManagementDashboard = ({
  className,
  testId,
  ...props
}: BobbleheadManagementDashboardProps) => {
  // 1. useState hooks
  const [isSelectionMode, setIsSelectionMode] = useToggle(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [gridDensity, setGridDensity] = useState<'comfortable' | 'compact'>('compact');

  // 2. Other hooks
  // (none needed for mock)

  // 3. useMemo hooks
  const filteredBobbleheads = useMemo(() => {
    let result = [...MOCK_BOBBLEHEADS];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
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
  }, [searchQuery, filterCategory, filterCondition, filterFeatured, sortBy]);

  const categories = useMemo(() => {
    const cats = new Set(MOCK_BOBBLEHEADS.map((b) => b.category).filter(Boolean));
    return Array.from(cats) as Array<string>;
  }, []);

  const conditions = useMemo(() => {
    const conds = new Set(MOCK_BOBBLEHEADS.map((b) => b.currentCondition));
    return Array.from(conds);
  }, []);

  // 4. useEffect hooks
  // (none needed for mock)

  // 5. Utility functions
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(value);
  };

  // 6. Event handlers
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode.toggle();
    if (isSelectionMode) {
      setSelectedIds(new Set());
    }
  }, [isSelectionMode, setIsSelectionMode]);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === filteredBobbleheads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBobbleheads.map((b) => b.id)));
    }
  }, [filteredBobbleheads, selectedIds.size]);

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleEditClick = useCallback((id: string) => {
    console.log('Edit bobblehead:', id);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    console.log('Delete bobblehead:', id);
  }, []);

  const handleFeatureToggle = useCallback((id: string) => {
    console.log('Toggle feature for bobblehead:', id);
  }, []);

  const handleBulkDelete = useCallback(() => {
    console.log('Bulk delete:', Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkFeature = useCallback(() => {
    console.log('Bulk feature:', Array.from(selectedIds));
  }, [selectedIds]);

  const handleAddNew = useCallback(() => {
    console.log('Add new bobblehead');
  }, []);

  const handleEditCollection = useCallback(() => {
    console.log('Edit collection');
  }, []);

  const handleShareCollection = useCallback(() => {
    console.log('Share collection');
  }, []);

  const handleCollectionSettings = useCallback(() => {
    console.log('Collection settings');
  }, []);

  const handleToggleGridDensity = useCallback(() => {
    setGridDensity((prev) => (prev === 'compact' ? 'comfortable' : 'compact'));
  }, []);

  // 7. Derived variables
  const _hasResults = filteredBobbleheads.length > 0;
  const _hasNoResults = !_hasResults && (!!searchQuery || filterCategory !== 'all');
  const _hasSelection = selectedIds.size > 0;
  const _isAllSelected = selectedIds.size === filteredBobbleheads.length && filteredBobbleheads.length > 0;

  const dashboardTestId = testId || generateTestId('feature', 'bobblehead-grid', 'management-1');

  const gridCols =
    gridDensity === 'compact' ?
      'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4';

  return (
    <div
      className={cn('space-y-6', className)}
      data-slot={'bobblehead-mgmt-dashboard'}
      data-testid={dashboardTestId}
      {...props}
    >
      {/* Collection Header Section */}
      <Card>
        <CardHeader className={'border-b'}>
          <div className={'flex items-start justify-between'}>
            <div className={'flex items-start gap-4'}>
              {/* Cover Image */}
              <Avatar className={'size-20 rounded-lg'}>
                <img alt={MOCK_COLLECTION.name} src={MOCK_COLLECTION.coverImageUrl} />
              </Avatar>

              {/* Collection Info */}
              <div className={'flex-1 space-y-2'}>
                <CardTitle className={'text-2xl'}>{MOCK_COLLECTION.name}</CardTitle>
                <CardDescription>{MOCK_COLLECTION.description}</CardDescription>

                {/* Quick Stats */}
                <div className={'flex items-center gap-4 text-sm text-muted-foreground'}>
                  <span className={'font-medium'}>{MOCK_COLLECTION.totalBobbleheads} items</span>
                  <span>{MOCK_COLLECTION.featuredBobbleheads} featured</span>
                  <span className={'font-semibold text-primary'}>
                    {formatCurrency(MOCK_COLLECTION.totalValue)} total value
                  </span>
                  <Separator className={'h-4'} orientation={'vertical'} />
                  <span>{MOCK_COLLECTION.likeCount} likes</span>
                  <span>{MOCK_COLLECTION.viewCount} views</span>
                </div>
              </div>
            </div>

            {/* Collection Actions */}
            <div className={'flex items-center gap-2'}>
              <Button
                onClick={handleEditCollection}
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
              <Button
                onClick={handleCollectionSettings}
                size={'icon'}
                testId={`${dashboardTestId}-settings`}
                variant={'ghost'}
              >
                <SettingsIcon aria-hidden className={'size-4'} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Toolbar Section */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
        {/* Left Side - Search and Filters */}
        <div className={'flex flex-1 items-center gap-2'}>
          {/* Search */}
          <div className={'w-full max-w-sm'}>
            <Input
              isClearable
              leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              placeholder={'Search bobbleheads...'}
              testId={`${dashboardTestId}-search`}
              value={searchQuery}
            />
          </div>

          {/* Filters Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size={'sm'} testId={`${dashboardTestId}-filters`} variant={'outline'}>
                <FilterIcon aria-hidden className={'size-4'} />
                Filters
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
                Sort
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

        {/* Right Side - Actions */}
        <div className={'flex items-center gap-2'}>
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
          <Button onClick={handleAddNew} size={'sm'} testId={`${dashboardTestId}-add-new`}>
            <PlusIcon aria-hidden className={'size-4'} />
            Add Bobblehead
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <Conditional isCondition={_hasSelection}>
        <Card className={'border-primary'}>
          <CardContent className={'flex items-center justify-between py-3'}>
            <div className={'flex items-center gap-4'}>
              <span className={'text-sm font-medium'}>
                {selectedIds.size} item{selectedIds.size === 1 ? '' : 's'} selected
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
                Feature Selected
              </Button>
              <Button
                onClick={handleBulkDelete}
                size={'sm'}
                testId={`${dashboardTestId}-bulk-delete`}
                variant={'destructive'}
              >
                <TrashIcon aria-hidden className={'size-4'} />
                Delete Selected
              </Button>
            </div>
          </CardContent>
        </Card>
      </Conditional>

      {/* Bobblehead Grid */}
      <Conditional isCondition={_hasResults}>
        <div className={cn('grid gap-4', gridCols)} data-testid={`${dashboardTestId}-grid`}>
          {filteredBobbleheads.map((bobblehead) => (
            <BobbleheadCard
              bobblehead={bobblehead}
              isSelected={selectedIds.has(bobblehead.id)}
              isSelectionMode={isSelectionMode}
              key={bobblehead.id}
              onDeleteClick={handleDeleteClick}
              onEditClick={handleEditClick}
              onFeatureToggle={handleFeatureToggle}
              onSelectionChange={handleSelectionChange}
              testId={`${dashboardTestId}-card-${bobblehead.id}`}
            />
          ))}
        </div>
      </Conditional>

      {/* Empty States */}
      <Conditional isCondition={_hasNoResults}>
        <EmptyState
          action={
            <Button onClick={handleSearchClear} variant={'outline'}>
              <XIcon aria-hidden className={'size-4'} />
              Clear Filters
            </Button>
          }
          description={'Try adjusting your search or filters to find what you are looking for.'}
          icon={SearchIcon}
          title={'No Bobbleheads Found'}
        />
      </Conditional>

      <Conditional isCondition={!_hasResults && !_hasNoResults}>
        <EmptyState
          action={
            <Button onClick={handleAddNew} testId={`${dashboardTestId}-empty-add`}>
              <PlusIcon aria-hidden className={'size-4'} />
              Add Your First Bobblehead
            </Button>
          }
          description={'Start building your collection by adding your first bobblehead.'}
          icon={PlusIcon}
          title={'No Bobbleheads Yet'}
        />
      </Conditional>
    </div>
  );
};
