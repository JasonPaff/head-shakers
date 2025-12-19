'use client';

import { PackageIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/utils/tailwind-utils';

import type { MockBobblehead, SortOption } from '../mock-data';

import { BobbleheadCard } from './bobblehead-card';
import { SearchControls } from './search-controls';

export type LayoutVariant = 'gallery' | 'grid' | 'list';

interface BobbleheadGridProps {
  bobbleheads: Array<MockBobblehead>;
  layoutVariant: LayoutVariant;
}

/**
 * BobbleheadGrid component with 3 layout variations:
 * 1. Grid - Traditional card grid with search/sort bar (default)
 * 2. Gallery - Larger images, masonry-like layout, minimal text
 * 3. List - Compact horizontal cards with more metadata visible
 */
export const BobbleheadGrid = ({ bobbleheads, layoutVariant }: BobbleheadGridProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [sortValue, setSortValue] = useState<SortOption>('newest');

  // Filter and sort bobbleheads
  const filteredAndSortedBobbleheads = useMemo(() => {
    let result = [...bobbleheads];

    // Filter by search
    if (searchValue.trim()) {
      const search = searchValue.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(search) ||
          (b.description && b.description.toLowerCase().includes(search)),
      );
    }

    // Sort
    switch (sortValue) {
      case 'name_asc':
        result = result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        result = result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        // Mock: keep original order (assuming newest first)
        break;
      case 'oldest':
        result = result.reverse();
        break;
    }

    return result;
  }, [bobbleheads, searchValue, sortValue]);

  const _isGalleryLayout = layoutVariant === 'gallery';
  const _matchingText = searchValue ? ` matching "${searchValue}"` : '';

  // Grid layout classes based on variant
  const gridClasses = useMemo(() => {
    switch (layoutVariant) {
      case 'gallery':
        // Masonry-like: varying sizes for visual interest
        return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'list':
        // Single column list
        return 'flex flex-col gap-4';
      case 'grid':
      default:
        // Standard responsive grid
        return 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3';
    }
  }, [layoutVariant]);

  return (
    <div>
      {/* Search and Sort Controls */}
      <SearchControls
        className={'mb-6'}
        onSearchChange={setSearchValue}
        onSortChange={setSortValue}
        searchValue={searchValue}
        sortValue={sortValue}
      />

      {/* Results Count */}
      <p className={'mb-4 text-sm text-muted-foreground'}>
        {filteredAndSortedBobbleheads.length} bobblehead{filteredAndSortedBobbleheads.length !== 1 ? 's' : ''}
        {_matchingText}
      </p>

      {/* Empty State */}
      {filteredAndSortedBobbleheads.length === 0 ?
        <EmptyState
          description={'Try adjusting your search or filters.'}
          icon={PackageIcon}
          title={'No bobbleheads found'}
        />
      : <div className={cn(gridClasses)}>
          {filteredAndSortedBobbleheads.map((bobblehead, index) => (
            <div
              className={cn(
                // Add size variations for gallery layout
                _isGalleryLayout && index % 5 === 0 && 'sm:col-span-2 sm:row-span-2',
              )}
              key={bobblehead.id}
            >
              <BobbleheadCard bobblehead={bobblehead} variant={layoutVariant} />
            </div>
          ))}
        </div>
      }
    </div>
  );
};
