'use client';

import type { ComponentProps } from 'react';

import {
  EyeIcon,
  HeartIcon,
  MessageCircleIcon,
  MoreVerticalIcon,
  SparklesIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

// Mock Data Types
interface MockCollection {
  commentCount: number;
  coverImageUrl: null | string;
  createdAt: Date;
  description: null | string;
  featuredBobbleheads: number;
  firstBobbleheadPhoto: null | string;
  id: string;
  isLiked: boolean;
  isPublic: boolean;
  lastUpdated: Date;
  likeCount: number;
  name: string;
  owner: {
    avatarUrl: null | string;
    id: string;
    username: string;
  };
  slug: string;
  totalBobbleheads: number;
  totalValue: number;
  uniqueViewers: number;
  viewCount: number;
}

// Mock Collections Data
const MOCK_COLLECTIONS: Array<MockCollection> = [
  {
    commentCount: 12,
    coverImageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=600&fit=crop',
    createdAt: new Date('2024-01-15'),
    description: 'My personal collection of vintage baseball bobbleheads from the 1960s and 1970s.',
    featuredBobbleheads: 8,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop',
    id: '1',
    isLiked: true,
    isPublic: true,
    lastUpdated: new Date('2024-11-20'),
    likeCount: 124,
    name: 'Vintage Baseball Collection',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      id: 'owner-1',
      username: 'bobblehead_collector',
    },
    slug: 'vintage-baseball',
    totalBobbleheads: 42,
    totalValue: 3250.5,
    uniqueViewers: 156,
    viewCount: 892,
  },
  {
    commentCount: 8,
    coverImageUrl: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&h=600&fit=crop',
    createdAt: new Date('2024-02-20'),
    description: 'Star Wars bobbleheads from various eras and manufacturers.',
    featuredBobbleheads: 5,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop',
    id: '2',
    isLiked: false,
    isPublic: true,
    lastUpdated: new Date('2024-11-25'),
    likeCount: 89,
    name: 'Star Wars Galaxy',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      id: 'owner-2',
      username: 'force_collector',
    },
    slug: 'star-wars-galaxy',
    totalBobbleheads: 28,
    totalValue: 1890.0,
    uniqueViewers: 234,
    viewCount: 1245,
  },
  {
    commentCount: 23,
    coverImageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=600&fit=crop',
    createdAt: new Date('2024-03-10'),
    description: 'NBA legends and current stars bobblehead collection.',
    featuredBobbleheads: 12,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=400&h=400&fit=crop',
    id: '3',
    isLiked: true,
    isPublic: true,
    lastUpdated: new Date('2024-11-26'),
    likeCount: 201,
    name: 'NBA Legends',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      id: 'owner-3',
      username: 'hoops_fanatic',
    },
    slug: 'nba-legends',
    totalBobbleheads: 67,
    totalValue: 4567.25,
    uniqueViewers: 412,
    viewCount: 2156,
  },
  {
    commentCount: 5,
    coverImageUrl: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=800&h=600&fit=crop',
    createdAt: new Date('2024-04-05'),
    description: 'Marvel superheroes from classic comics to MCU.',
    featuredBobbleheads: 6,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1574607383476-f517f260d30b?w=400&h=400&fit=crop',
    id: '4',
    isLiked: false,
    isPublic: true,
    lastUpdated: new Date('2024-11-18'),
    likeCount: 145,
    name: 'Marvel Universe',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      id: 'owner-4',
      username: 'marvel_master',
    },
    slug: 'marvel-universe',
    totalBobbleheads: 35,
    totalValue: 2340.75,
    uniqueViewers: 298,
    viewCount: 1534,
  },
  {
    commentCount: 15,
    coverImageUrl: 'https://images.unsplash.com/photo-1546422401-b6c9a44e3e88?w=800&h=600&fit=crop',
    createdAt: new Date('2024-05-12'),
    description: 'Rare and limited edition Disney character bobbleheads.',
    featuredBobbleheads: 9,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1546422401-b6c9a44e3e88?w=400&h=400&fit=crop',
    id: '5',
    isLiked: true,
    isPublic: true,
    lastUpdated: new Date('2024-11-22'),
    likeCount: 178,
    name: 'Disney Magic',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      id: 'owner-5',
      username: 'disney_dreams',
    },
    slug: 'disney-magic',
    totalBobbleheads: 51,
    totalValue: 3890.0,
    uniqueViewers: 345,
    viewCount: 1876,
  },
  {
    commentCount: 3,
    coverImageUrl: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=800&h=600&fit=crop',
    createdAt: new Date('2024-06-08'),
    description: 'NFL team mascots and player bobbleheads.',
    featuredBobbleheads: 4,
    firstBobbleheadPhoto: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=400&fit=crop',
    id: '6',
    isLiked: false,
    isPublic: true,
    lastUpdated: new Date('2024-11-15'),
    likeCount: 67,
    name: 'NFL Gridiron',
    owner: {
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      id: 'owner-6',
      username: 'football_fan',
    },
    slug: 'nfl-gridiron',
    totalBobbleheads: 23,
    totalValue: 1245.5,
    uniqueViewers: 123,
    viewCount: 678,
  },
];

// Component Types
type CollectionCardProps = ComponentTestIdProps & {
  collection: MockCollection;
  onLikeToggle?: (collectionId: string) => void;
  onMenuAction?: (action: string, collectionId: string) => void;
};

type FilterOption = 'all' | 'liked' | 'most-viewed' | 'recently-updated';

type Mockup1Props = ComponentProps<'div'> & ComponentTestIdProps;

type SortOption = 'most-liked' | 'most-viewed' | 'newest' | 'oldest';

// Collection Card Component
const CollectionCard = ({ collection, onLikeToggle, onMenuAction, testId }: CollectionCardProps) => {
  const cardTestId = testId || generateTestId('feature', 'collection-card', collection.id);

  const handleLikeClick = useCallback(() => {
    onLikeToggle?.(collection.id);
  }, [collection.id, onLikeToggle]);

  const handleMenuAction = useCallback(
    (action: string) => {
      onMenuAction?.(action, collection.id);
    },
    [collection.id, onMenuAction],
  );

  // Derived variables
  const _isFeatured = collection.featuredBobbleheads > 7;
  const _isTrending = collection.viewCount > 1000 && collection.likeCount > 100;
  const _hasDescription = Boolean(collection.description);
  const _hasCoverImage = Boolean(collection.coverImageUrl);

  const formattedValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(collection.totalValue);

  const coverImageUrl = collection.coverImageUrl || collection.firstBobbleheadPhoto || '';

  return (
    <Card
      className={cn('group overflow-hidden transition-all hover:scale-[1.02] hover:shadow-lg')}
      data-slot={'collection-card'}
      testId={cardTestId}
    >
      {/* Cover Image */}
      <Conditional isCondition={_hasCoverImage}>
        <div className={'relative h-48 w-full overflow-hidden bg-muted'} data-slot={'card-cover'}>
          <img
            alt={collection.name}
            className={'size-full object-cover transition-transform group-hover:scale-105'}
            loading={'lazy'}
            src={coverImageUrl}
          />
          {/* Overlay Badges */}
          <div className={'absolute top-3 left-3 flex gap-2'} data-slot={'card-badges'}>
            <Conditional isCondition={_isFeatured}>
              <Badge icon={<SparklesIcon />} variant={'editor_pick'}>
                Featured
              </Badge>
            </Conditional>
            <Conditional isCondition={_isTrending}>
              <Badge icon={<TrendingUpIcon />} variant={'trending'}>
                Trending
              </Badge>
            </Conditional>
          </div>
          {/* Card Menu */}
          <div className={'absolute top-3 right-3'} data-slot={'card-menu'}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={'Collection menu'}
                  className={'bg-background/80 backdrop-blur-sm hover:bg-background'}
                  size={'icon'}
                  variant={'ghost'}
                >
                  <MoreVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuItem onClick={() => handleMenuAction('view')}>View Details</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuAction('edit')}>Edit Collection</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuAction('share')}>Share</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuAction('duplicate')}>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuAction('delete')} variant={'destructive'}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Conditional>

      {/* Card Header */}
      <CardHeader data-slot={'card-header'}>
        <div className={'flex items-start justify-between gap-3'} data-slot={'header-content'}>
          <div className={'flex-1 space-y-1'} data-slot={'title-section'}>
            <CardTitle className={'line-clamp-1 text-xl'}>{collection.name}</CardTitle>
            <Conditional isCondition={_hasDescription}>
              <p className={'line-clamp-2 text-sm text-muted-foreground'}>{collection.description}</p>
            </Conditional>
          </div>
        </div>
      </CardHeader>

      {/* Card Content */}
      <CardContent className={'space-y-4'} data-slot={'card-content'}>
        {/* Owner Info */}
        <div className={'flex items-center gap-3'} data-slot={'owner-info'}>
          <Avatar>
            <AvatarImage alt={collection.owner.username} src={collection.owner.avatarUrl || ''} />
            <AvatarFallback>{collection.owner.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className={'min-w-0 flex-1'} data-slot={'owner-details'}>
            <p className={'truncate text-sm font-medium'}>@{collection.owner.username}</p>
            <p className={'text-xs text-muted-foreground'}>
              Updated {new Date(collection.lastUpdated).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={'grid grid-cols-2 gap-3'} data-slot={'stats-grid'}>
          <div className={'rounded-lg border bg-muted/50 p-3'} data-slot={'stat-item'}>
            <p className={'text-2xl font-bold text-primary'}>{collection.totalBobbleheads}</p>
            <p className={'text-xs text-muted-foreground'}>Bobbleheads</p>
          </div>
          <div className={'rounded-lg border bg-muted/50 p-3'} data-slot={'stat-item'}>
            <p className={'text-2xl font-bold text-primary'}>{formattedValue}</p>
            <p className={'text-xs text-muted-foreground'}>Total Value</p>
          </div>
        </div>
      </CardContent>

      {/* Card Footer */}
      <CardFooter className={'justify-between border-t pt-4'} data-slot={'card-footer'}>
        {/* Engagement Metrics */}
        <div
          className={'flex items-center gap-4 text-sm text-muted-foreground'}
          data-slot={'engagement-metrics'}
        >
          <button
            aria-label={collection.isLiked ? 'Unlike collection' : 'Like collection'}
            className={'flex items-center gap-1.5 transition-colors hover:text-primary'}
            data-slot={'like-button'}
            onClick={handleLikeClick}
            type={'button'}
          >
            <HeartIcon className={cn('size-4', collection.isLiked && 'fill-primary text-primary')} />
            <span className={'font-medium'}>{collection.likeCount}</span>
          </button>
          <div className={'flex items-center gap-1.5'} data-slot={'comments-count'}>
            <MessageCircleIcon className={'size-4'} />
            <span>{collection.commentCount}</span>
          </div>
          <div className={'flex items-center gap-1.5'} data-slot={'views-count'}>
            <EyeIcon className={'size-4'} />
            <span>{collection.viewCount}</span>
          </div>
        </div>

        {/* View Button */}
        <Button onClick={() => handleMenuAction('view')} size={'sm'} variant={'outline'}>
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

// Main Dashboard Component
export const Mockup1 = ({ className, testId, ...props }: Mockup1Props) => {
  // 1. useState hooks
  const [filter, setFilter] = useState<FilterOption>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [likedCollections, setLikedCollections] = useState<Set<string>>(
    new Set(MOCK_COLLECTIONS.filter((c) => c.isLiked).map((c) => c.id)),
  );

  // 2. Other hooks
  // (None for this mockup)

  // 3. useMemo hooks
  const filteredCollections = useMemo(() => {
    let filtered = MOCK_COLLECTIONS.map((c) => ({
      ...c,
      isLiked: likedCollections.has(c.id),
    }));

    // Apply filter
    if (filter === 'liked') {
      filtered = filtered.filter((c) => c.isLiked);
    } else if (filter === 'most-viewed') {
      filtered = filtered.filter((c) => c.viewCount > 1000);
    } else if (filter === 'recently-updated') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter((c) => c.lastUpdated >= thirtyDaysAgo);
    }

    // Apply sort
    if (sort === 'newest') {
      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sort === 'oldest') {
      filtered.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    } else if (sort === 'most-liked') {
      filtered.sort((a, b) => b.likeCount - a.likeCount);
    } else if (sort === 'most-viewed') {
      filtered.sort((a, b) => b.viewCount - a.viewCount);
    }

    return filtered;
  }, [filter, likedCollections, sort]);

  const totalStats = useMemo(() => {
    const displayedCollections = filteredCollections;
    return {
      avgViews: Math.round(
        displayedCollections.reduce((sum, c) => sum + c.viewCount, 0) / displayedCollections.length || 0,
      ),
      totalBobbleheads: displayedCollections.reduce((sum, c) => sum + c.totalBobbleheads, 0),
      totalCollections: displayedCollections.length,
      totalValue: displayedCollections.reduce((sum, c) => sum + c.totalValue, 0),
    };
  }, [filteredCollections]);

  // 4. useEffect hooks
  // (None for this mockup)

  // 5. Utility functions
  // (None for this mockup)

  // 6. Event handlers
  const handleFilterChange = useCallback((newFilter: FilterOption) => {
    setFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSort: SortOption) => {
    setSort(newSort);
  }, []);

  const handleLikeToggle = useCallback((collectionId: string) => {
    setLikedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(collectionId)) {
        next.delete(collectionId);
      } else {
        next.add(collectionId);
      }
      return next;
    });
  }, []);

  const handleMenuAction = useCallback((action: string, collectionId: string) => {
    console.log(`Action: ${action} on collection: ${collectionId}`);
  }, []);

  // 7. Derived variables
  const _hasNoCollections = filteredCollections.length === 0;
  const _isFilterActive = filter !== 'all';

  const dashboardTestId = testId || generateTestId('feature', 'collection-grid', 'mockup-1');

  const formattedTotalValue = new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(totalStats.totalValue);

  return (
    <div
      className={cn('min-h-screen bg-gradient-to-br from-background to-muted/20', className)}
      data-slot={'collection-dashboard'}
      data-testid={dashboardTestId}
      {...props}
    >
      <div className={'container mx-auto space-y-8 px-4 py-8'} data-slot={'dashboard-container'}>
        {/* Dashboard Header */}
        <div className={'space-y-4'} data-slot={'dashboard-header'}>
          <div className={'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}>
            <div className={'space-y-1'} data-slot={'header-text'}>
              <h1 className={'text-3xl font-bold tracking-tight lg:text-4xl'}>My Collections</h1>
              <p className={'text-muted-foreground'}>Manage and explore your bobblehead collections</p>
            </div>
            <Button size={'lg'}>
              <SparklesIcon />
              Create Collection
            </Button>
          </div>

          {/* Stats Overview */}
          <div className={'grid grid-cols-2 gap-4 lg:grid-cols-4'} data-slot={'stats-overview'}>
            <div className={'rounded-lg border bg-card p-4 shadow-sm'} data-slot={'stat-card'}>
              <p className={'text-sm text-muted-foreground'}>Collections</p>
              <p className={'text-2xl font-bold text-primary'}>{totalStats.totalCollections}</p>
            </div>
            <div className={'rounded-lg border bg-card p-4 shadow-sm'} data-slot={'stat-card'}>
              <p className={'text-sm text-muted-foreground'}>Total Items</p>
              <p className={'text-2xl font-bold text-primary'}>{totalStats.totalBobbleheads}</p>
            </div>
            <div className={'rounded-lg border bg-card p-4 shadow-sm'} data-slot={'stat-card'}>
              <p className={'text-sm text-muted-foreground'}>Total Value</p>
              <p className={'text-2xl font-bold text-primary'}>{formattedTotalValue}</p>
            </div>
            <div className={'rounded-lg border bg-card p-4 shadow-sm'} data-slot={'stat-card'}>
              <p className={'text-sm text-muted-foreground'}>Avg Views</p>
              <p className={'text-2xl font-bold text-primary'}>{totalStats.avgViews}</p>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div
          className={
            'flex flex-col gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between'
          }
          data-slot={'filters-section'}
        >
          {/* Filter Buttons */}
          <div className={'flex flex-wrap gap-2'} data-slot={'filter-buttons'}>
            <Button
              onClick={() => handleFilterChange('all')}
              size={'sm'}
              variant={filter === 'all' ? 'default' : 'outline'}
            >
              All
            </Button>
            <Button
              onClick={() => handleFilterChange('liked')}
              size={'sm'}
              variant={filter === 'liked' ? 'default' : 'outline'}
            >
              <HeartIcon className={'size-3.5'} />
              Liked
            </Button>
            <Button
              onClick={() => handleFilterChange('most-viewed')}
              size={'sm'}
              variant={filter === 'most-viewed' ? 'default' : 'outline'}
            >
              <EyeIcon className={'size-3.5'} />
              Most Viewed
            </Button>
            <Button
              onClick={() => handleFilterChange('recently-updated')}
              size={'sm'}
              variant={filter === 'recently-updated' ? 'default' : 'outline'}
            >
              Recently Updated
            </Button>
          </div>

          {/* Sort Dropdown */}
          <div className={'flex items-center gap-2'} data-slot={'sort-dropdown'}>
            <span className={'text-sm text-muted-foreground'}>Sort by:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size={'sm'} variant={'outline'}>
                  {sort === 'newest' && 'Newest'}
                  {sort === 'oldest' && 'Oldest'}
                  {sort === 'most-liked' && 'Most Liked'}
                  {sort === 'most-viewed' && 'Most Viewed'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={'end'}>
                <DropdownMenuItem onClick={() => handleSortChange('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('oldest')}>Oldest</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('most-liked')}>Most Liked</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('most-viewed')}>
                  Most Viewed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Collections Grid */}
        <Conditional isCondition={!_hasNoCollections}>
          <div
            className={'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'}
            data-slot={'collections-grid'}
          >
            {filteredCollections.map((collection) => (
              <CollectionCard
                collection={collection}
                key={collection.id}
                onLikeToggle={handleLikeToggle}
                onMenuAction={handleMenuAction}
              />
            ))}
          </div>
        </Conditional>

        {/* Empty State */}
        <Conditional isCondition={_hasNoCollections}>
          <div className={'flex min-h-[400px] items-center justify-center'} data-slot={'empty-state'}>
            <div className={'space-y-4 text-center'}>
              <div className={'mx-auto flex size-20 items-center justify-center rounded-full bg-muted'}>
                <SparklesIcon className={'size-10 text-muted-foreground'} />
              </div>
              <div className={'space-y-2'}>
                <h3 className={'text-xl font-semibold'}>
                  {_isFilterActive ? 'No collections match your filter' : 'No collections yet'}
                </h3>
                <p className={'text-muted-foreground'}>
                  {_isFilterActive ?
                    'Try adjusting your filters to see more results'
                  : 'Create your first collection to get started'}
                </p>
              </div>
              <Conditional isCondition={_isFilterActive}>
                <Button onClick={() => handleFilterChange('all')} variant={'outline'}>
                  Clear Filters
                </Button>
              </Conditional>
            </div>
          </div>
        </Conditional>
      </div>
    </div>
  );
};
