'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CONFIG } from '@/lib/constants';

interface BrowseCollectionsFiltersProps {
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  onClearFilters: () => void;
  onFiltersChange: (filters: {
    categoryId?: string;
    dateFrom?: string;
    dateTo?: string;
    ownerId?: string;
  }) => void;
  onSearchChange: (search: string) => void;
  ownerId?: string;
  searchQuery: string;
}

export function BrowseCollectionsFilters({
  onClearFilters,
  onSearchChange,
  searchQuery,
}: BrowseCollectionsFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSearchChange(localSearch);
      }
    }, CONFIG.SEARCH.DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSearchChange]);

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const hasFilters = searchQuery.length > 0;

  return (
    <div className={'space-y-4'}>
      <div className={'flex flex-col gap-4 sm:flex-row'}>
        {/* Search Input */}
        <div className={'relative flex-1'}>
          <Search className={'absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'} />
          <Input
            className={'pr-10 pl-10'}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder={'Search collections...'}
            type={'text'}
            value={localSearch}
          />
          {localSearch && (
            <button
              className={
                'absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground'
              }
              onClick={() => setLocalSearch('')}
              type={'button'}
            >
              <X className={'size-4'} />
            </button>
          )}
        </div>

        {/* Clear Filters Button */}
        {hasFilters && (
          <Button onClick={onClearFilters} size={'default'} variant={'outline'}>
            <X className={'mr-2 size-4'} />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
