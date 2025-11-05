'use client';

import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONFIG, ENUMS } from '@/lib/constants';

interface SearchFiltersProps {
  entityTypes: Array<'bobblehead' | 'collection' | 'subcollection'>;
  onFiltersChange: (filters: {
    entityTypes?: Array<'bobblehead' | 'collection' | 'subcollection'>;
    sortBy?: (typeof ENUMS.SEARCH.SORT_BY)[number];
    sortOrder?: (typeof ENUMS.SEARCH.SORT_ORDER)[number];
    tagIds?: Array<string>;
  }) => void;
  onQueryChange: (query: string) => void;
  query: string;
  sortBy: (typeof ENUMS.SEARCH.SORT_BY)[number];
  sortOrder: (typeof ENUMS.SEARCH.SORT_ORDER)[number];
  tagIds: Array<string>;
}

export const SearchFilters = ({
  entityTypes,
  onFiltersChange,
  onQueryChange,
  query,
  sortBy,
  sortOrder,
  tagIds,
}: SearchFiltersProps) => {
  // useState hooks
  const [searchInput, setSearchInput] = useState(query);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  // useEffect hooks
  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== query) {
        onQueryChange(searchInput);
      }
    }, CONFIG.SEARCH.DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [searchInput, query, onQueryChange]);

  // Event handlers
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleEntityTypeToggle = (entityType: 'bobblehead' | 'collection' | 'subcollection') => {
    const _isSelected = entityTypes.includes(entityType);
    const newEntityTypes = _isSelected ?
      entityTypes.filter((type) => type !== entityType)
    : [...entityTypes, entityType];

    // Ensure at least one entity type is selected
    if (newEntityTypes.length > 0) {
      onFiltersChange({ entityTypes: newEntityTypes });
    }
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      sortBy: value as (typeof ENUMS.SEARCH.SORT_BY)[number],
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      sortOrder: value as (typeof ENUMS.SEARCH.SORT_ORDER)[number],
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      entityTypes: ['collection', 'subcollection', 'bobblehead'],
      sortBy: 'relevance',
      sortOrder: 'desc',
      tagIds: [],
    });
  };

  const handleFiltersToggle = () => {
    setIsFiltersExpanded((prev) => !prev);
  };

  // Derived variables for conditional rendering
  const _hasActiveFilters =
    entityTypes.length < 3 || sortBy !== 'relevance' || sortOrder !== 'desc' || tagIds.length > 0;

  return (
    <div className={'space-y-4'}>
      {/* Search Input */}
      <div className={'flex gap-2'}>
        <Input
          className={'flex-1'}
          onChange={handleSearchInputChange}
          placeholder={'Search for collections, subcollections, or bobbleheads...'}
          type={'search'}
          value={searchInput}
        />
        <Button onClick={handleFiltersToggle} variant={'outline'}>
          {isFiltersExpanded ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Advanced Filters */}
      <Conditional isCondition={isFiltersExpanded}>
        <Card className={'p-6'}>
          <div className={'space-y-6'}>
            {/* Filter Header */}
            <div className={'flex items-center justify-between'}>
              <h3 className={'text-lg font-semibold'}>Filters</h3>
              <Conditional isCondition={_hasActiveFilters}>
                <Button onClick={handleClearFilters} size={'sm'} variant={'ghost'}>
                  Clear All
                </Button>
              </Conditional>
            </div>

            {/* Entity Type Filters */}
            <div className={'space-y-3'}>
              <Label className={'text-sm font-medium'}>Content Type</Label>
              <div className={'flex flex-wrap gap-4'}>
                <div className={'flex items-center space-x-2'}>
                  <Checkbox
                    checked={entityTypes.includes('collection')}
                    id={'filter-collection'}
                    onCheckedChange={() => handleEntityTypeToggle('collection')}
                  />
                  <Label className={'cursor-pointer text-sm font-normal'} htmlFor={'filter-collection'}>
                    Collections
                  </Label>
                </div>
                <div className={'flex items-center space-x-2'}>
                  <Checkbox
                    checked={entityTypes.includes('subcollection')}
                    id={'filter-subcollection'}
                    onCheckedChange={() => handleEntityTypeToggle('subcollection')}
                  />
                  <Label
                    className={'cursor-pointer text-sm font-normal'}
                    htmlFor={'filter-subcollection'}
                  >
                    Subcollections
                  </Label>
                </div>
                <div className={'flex items-center space-x-2'}>
                  <Checkbox
                    checked={entityTypes.includes('bobblehead')}
                    id={'filter-bobblehead'}
                    onCheckedChange={() => handleEntityTypeToggle('bobblehead')}
                  />
                  <Label className={'cursor-pointer text-sm font-normal'} htmlFor={'filter-bobblehead'}>
                    Bobbleheads
                  </Label>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className={'grid gap-4 sm:grid-cols-2'}>
              <div className={'space-y-2'}>
                <Label className={'text-sm font-medium'} htmlFor={'sort-by'}>
                  Sort By
                </Label>
                <Select onValueChange={handleSortByChange} value={sortBy}>
                  <SelectTrigger id={'sort-by'}>
                    <SelectValue placeholder={'Select sort option'} />
                  </SelectTrigger>
                  <SelectContent>
                    {ENUMS.SEARCH.SORT_BY.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={'space-y-2'}>
                <Label className={'text-sm font-medium'} htmlFor={'sort-order'}>
                  Sort Order
                </Label>
                <Select onValueChange={handleSortOrderChange} value={sortOrder}>
                  <SelectTrigger id={'sort-order'}>
                    <SelectValue placeholder={'Select order'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={'asc'}>Ascending</SelectItem>
                    <SelectItem value={'desc'}>Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters Summary */}
            <Conditional isCondition={_hasActiveFilters}>
              <div className={'space-y-2'}>
                <Label className={'text-sm font-medium'}>Active Filters</Label>
                <div className={'flex flex-wrap gap-2'}>
                  {entityTypes.length < 3 && (
                    <Badge variant={'secondary'}>
                      {entityTypes.length} {entityTypes.length === 1 ? 'type' : 'types'} selected
                    </Badge>
                  )}
                  {sortBy !== 'relevance' && <Badge variant={'secondary'}>Sort: {sortBy}</Badge>}
                  {sortOrder !== 'desc' && <Badge variant={'secondary'}>Order: {sortOrder}</Badge>}
                  {tagIds.length > 0 && (
                    <Badge variant={'secondary'}>{tagIds.length} tags selected</Badge>
                  )}
                </div>
              </div>
            </Conditional>
          </div>
        </Card>
      </Conditional>
    </div>
  );
};
