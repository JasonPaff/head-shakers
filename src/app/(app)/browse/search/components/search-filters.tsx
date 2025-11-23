'use client';

import type { ChangeEvent } from 'react';

import { CalendarIcon, ChevronDownIcon, FilterIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Conditional } from '@/components/ui/conditional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CONFIG, ENUMS } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

// Category options for filtering
const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Sports', value: 'sports' },
  { label: 'Movies & TV', value: 'movies-tv' },
  { label: 'Music', value: 'music' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Anime & Manga', value: 'anime-manga' },
  { label: 'Historical', value: 'historical' },
  { label: 'Custom', value: 'custom' },
] as const;

type SearchFiltersProps = ComponentTestIdProps & {
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  entityTypes: Array<'bobblehead' | 'collection' | 'subcollection'>;
  onFiltersChange: (filters: {
    category?: string;
    dateFrom?: string;
    dateTo?: string;
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
};

export const SearchFilters = ({
  category = '',
  dateFrom = '',
  dateTo = '',
  entityTypes,
  onFiltersChange,
  onQueryChange,
  query,
  sortBy,
  sortOrder,
  tagIds,
  testId,
}: SearchFiltersProps) => {
  // useState hooks
  const [searchInput, setSearchInput] = useState(query);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isContentTypeOpen, setIsContentTypeOpen] = useState(true);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSortingOpen, setIsSortingOpen] = useState(false);

  // Test ID generation
  const filtersTestId = testId || generateTestId('feature', 'search-results', 'filters');

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

  // useMemo hooks - Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (entityTypes.length < 3) count += 1;
    if (sortBy !== 'relevance') count += 1;
    if (sortOrder !== 'desc') count += 1;
    if (tagIds.length > 0) count += 1;
    if (dateFrom) count += 1;
    if (dateTo) count += 1;
    if (category) count += 1;
    return count;
  }, [entityTypes, sortBy, sortOrder, tagIds, dateFrom, dateTo, category]);

  // Event handlers
  const handleSearchInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleEntityTypeToggle = useCallback(
    (entityType: 'bobblehead' | 'collection' | 'subcollection') => {
      const _isSelected = entityTypes.includes(entityType);
      const newEntityTypes = _isSelected
        ? entityTypes.filter((type) => type !== entityType)
        : [...entityTypes, entityType];

      // Ensure at least one entity type is selected
      if (newEntityTypes.length > 0) {
        onFiltersChange({ entityTypes: newEntityTypes });
      }
    },
    [entityTypes, onFiltersChange],
  );

  const handleSortByChange = useCallback(
    (value: string) => {
      onFiltersChange({
        sortBy: value as (typeof ENUMS.SEARCH.SORT_BY)[number],
      });
    },
    [onFiltersChange],
  );

  const handleSortOrderChange = useCallback(
    (value: string) => {
      onFiltersChange({
        sortOrder: value as (typeof ENUMS.SEARCH.SORT_ORDER)[number],
      });
    },
    [onFiltersChange],
  );

  const handleDateFromChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ dateFrom: e.target.value || undefined });
    },
    [onFiltersChange],
  );

  const handleDateToChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ dateTo: e.target.value || undefined });
    },
    [onFiltersChange],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      onFiltersChange({ category: value || undefined });
    },
    [onFiltersChange],
  );

  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      category: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      entityTypes: ['collection', 'subcollection', 'bobblehead'],
      sortBy: 'relevance',
      sortOrder: 'desc',
      tagIds: [],
    });
  }, [onFiltersChange]);

  const handleFiltersToggle = useCallback(() => {
    setIsFiltersExpanded((prev) => !prev);
  }, []);

  const handleMobileDrawerOpenChange = useCallback((isOpen: boolean) => {
    setIsMobileDrawerOpen(isOpen);
  }, []);

  // Derived variables for conditional rendering
  const _hasActiveFilters =
    entityTypes.length < 3 ||
    sortBy !== 'relevance' ||
    sortOrder !== 'desc' ||
    tagIds.length > 0 ||
    Boolean(dateFrom) ||
    Boolean(dateTo) ||
    Boolean(category);

  const _hasDateFilters = Boolean(dateFrom) || Boolean(dateTo);

  // Filter content - shared between desktop and mobile
  const filterContent = (
    <div className={'space-y-4'}>
      {/* Content Type Filters - Collapsible Section */}
      <Collapsible onOpenChange={setIsContentTypeOpen} open={isContentTypeOpen}>
        <CollapsibleTrigger asChild>
          <button
            aria-expanded={isContentTypeOpen}
            className={cn(
              'flex w-full items-center justify-between rounded-md p-2',
              'min-h-11 text-left hover:bg-muted/50',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            data-slot={'search-filters-content-type-trigger'}
            data-testid={`${filtersTestId}-content-type-trigger`}
            type={'button'}
          >
            <Label className={'cursor-pointer text-sm font-medium'}>Content Type</Label>
            <ChevronDownIcon
              aria-hidden
              className={cn('size-4 transition-transform', isContentTypeOpen && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={'flex flex-wrap gap-4 px-2 pt-2'}
            data-slot={'search-filters-content-type'}
            data-testid={`${filtersTestId}-content-type`}
          >
            <div className={'flex min-h-11 items-center space-x-2'}>
              <Checkbox
                checked={entityTypes.includes('collection')}
                data-testid={`${filtersTestId}-collection`}
                id={'filter-collection'}
                onCheckedChange={() => handleEntityTypeToggle('collection')}
              />
              <Label className={'cursor-pointer text-sm font-normal'} htmlFor={'filter-collection'}>
                Collections
              </Label>
            </div>
            <div className={'flex min-h-11 items-center space-x-2'}>
              <Checkbox
                checked={entityTypes.includes('subcollection')}
                data-testid={`${filtersTestId}-subcollection`}
                id={'filter-subcollection'}
                onCheckedChange={() => handleEntityTypeToggle('subcollection')}
              />
              <Label className={'cursor-pointer text-sm font-normal'} htmlFor={'filter-subcollection'}>
                Subcollections
              </Label>
            </div>
            <div className={'flex min-h-11 items-center space-x-2'}>
              <Checkbox
                checked={entityTypes.includes('bobblehead')}
                data-testid={`${filtersTestId}-bobblehead`}
                id={'filter-bobblehead'}
                onCheckedChange={() => handleEntityTypeToggle('bobblehead')}
              />
              <Label className={'cursor-pointer text-sm font-normal'} htmlFor={'filter-bobblehead'}>
                Bobbleheads
              </Label>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Category Filter - Collapsible Section */}
      <Collapsible onOpenChange={setIsCategoryOpen} open={isCategoryOpen}>
        <CollapsibleTrigger asChild>
          <button
            aria-expanded={isCategoryOpen}
            className={cn(
              'flex w-full items-center justify-between rounded-md p-2',
              'min-h-11 text-left hover:bg-muted/50',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            data-slot={'search-filters-category-trigger'}
            data-testid={`${filtersTestId}-category-trigger`}
            type={'button'}
          >
            <div className={'flex items-center gap-2'}>
              <Label className={'cursor-pointer text-sm font-medium'}>Category</Label>
              <Conditional isCondition={Boolean(category)}>
                <Badge className={'px-1.5 py-0 text-xs'} variant={'secondary'}>
                  1
                </Badge>
              </Conditional>
            </div>
            <ChevronDownIcon
              aria-hidden
              className={cn('size-4 transition-transform', isCategoryOpen && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={'px-2 pt-2'}
            data-slot={'search-filters-category'}
            data-testid={`${filtersTestId}-category`}
          >
            <Select onValueChange={handleCategoryChange} value={category}>
              <SelectTrigger
                className={'min-h-11 w-full'}
                data-testid={`${filtersTestId}-category-select`}
                id={'filter-category'}
              >
                <SelectValue placeholder={'Select a category'} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Date Range Filter - Collapsible Section */}
      <Collapsible onOpenChange={setIsDateRangeOpen} open={isDateRangeOpen}>
        <CollapsibleTrigger asChild>
          <button
            aria-expanded={isDateRangeOpen}
            className={cn(
              'flex w-full items-center justify-between rounded-md p-2',
              'min-h-11 text-left hover:bg-muted/50',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            data-slot={'search-filters-date-range-trigger'}
            data-testid={`${filtersTestId}-date-range-trigger`}
            type={'button'}
          >
            <div className={'flex items-center gap-2'}>
              <Label className={'cursor-pointer text-sm font-medium'}>Date Range</Label>
              <Conditional isCondition={_hasDateFilters}>
                <Badge className={'px-1.5 py-0 text-xs'} variant={'secondary'}>
                  {(dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                </Badge>
              </Conditional>
            </div>
            <ChevronDownIcon
              aria-hidden
              className={cn('size-4 transition-transform', isDateRangeOpen && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={'grid gap-4 px-2 pt-2 sm:grid-cols-2'}
            data-slot={'search-filters-date-range'}
            data-testid={`${filtersTestId}-date-range`}
          >
            <div className={'space-y-2'}>
              <Label className={'text-sm font-normal'} htmlFor={'filter-date-from'}>
                From
              </Label>
              <div className={'relative'}>
                <CalendarIcon
                  aria-hidden
                  className={'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
                />
                <Input
                  className={'min-h-11 pl-10'}
                  data-testid={`${filtersTestId}-date-from`}
                  id={'filter-date-from'}
                  onChange={handleDateFromChange}
                  type={'date'}
                  value={dateFrom}
                />
              </div>
            </div>
            <div className={'space-y-2'}>
              <Label className={'text-sm font-normal'} htmlFor={'filter-date-to'}>
                To
              </Label>
              <div className={'relative'}>
                <CalendarIcon
                  aria-hidden
                  className={'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground'}
                />
                <Input
                  className={'min-h-11 pl-10'}
                  data-testid={`${filtersTestId}-date-to`}
                  id={'filter-date-to'}
                  min={dateFrom}
                  onChange={handleDateToChange}
                  type={'date'}
                  value={dateTo}
                />
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Sort Options - Collapsible Section */}
      <Collapsible onOpenChange={setIsSortingOpen} open={isSortingOpen}>
        <CollapsibleTrigger asChild>
          <button
            aria-expanded={isSortingOpen}
            className={cn(
              'flex w-full items-center justify-between rounded-md p-2',
              'min-h-11 text-left hover:bg-muted/50',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
            )}
            data-slot={'search-filters-sorting-trigger'}
            data-testid={`${filtersTestId}-sorting-trigger`}
            type={'button'}
          >
            <div className={'flex items-center gap-2'}>
              <Label className={'cursor-pointer text-sm font-medium'}>Sorting</Label>
              <Conditional isCondition={sortBy !== 'relevance' || sortOrder !== 'desc'}>
                <Badge className={'px-1.5 py-0 text-xs'} variant={'secondary'}>
                  {(sortBy !== 'relevance' ? 1 : 0) + (sortOrder !== 'desc' ? 1 : 0)}
                </Badge>
              </Conditional>
            </div>
            <ChevronDownIcon
              aria-hidden
              className={cn('size-4 transition-transform', isSortingOpen && 'rotate-180')}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div
            className={'grid gap-4 px-2 pt-2 sm:grid-cols-2'}
            data-slot={'search-filters-sorting'}
            data-testid={`${filtersTestId}-sorting`}
          >
            <div className={'space-y-2'}>
              <Label className={'text-sm font-normal'} htmlFor={'sort-by'}>
                Sort By
              </Label>
              <Select onValueChange={handleSortByChange} value={sortBy}>
                <SelectTrigger className={'min-h-11'} data-testid={`${filtersTestId}-sort-by`} id={'sort-by'}>
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
              <Label className={'text-sm font-normal'} htmlFor={'sort-order'}>
                Sort Order
              </Label>
              <Select onValueChange={handleSortOrderChange} value={sortOrder}>
                <SelectTrigger
                  className={'min-h-11'}
                  data-testid={`${filtersTestId}-sort-order`}
                  id={'sort-order'}
                >
                  <SelectValue placeholder={'Select order'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={'asc'}>Ascending</SelectItem>
                  <SelectItem value={'desc'}>Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters Summary */}
      <Conditional isCondition={_hasActiveFilters}>
        <div
          className={'space-y-2 border-t pt-4'}
          data-slot={'search-filters-summary'}
          data-testid={`${filtersTestId}-summary`}
        >
          <Label className={'text-sm font-medium'}>Active Filters</Label>
          <div className={'flex flex-wrap gap-2'}>
            <Conditional isCondition={entityTypes.length < 3}>
              <Badge variant={'secondary'}>
                {entityTypes.length} {entityTypes.length === 1 ? 'type' : 'types'} selected
              </Badge>
            </Conditional>
            <Conditional isCondition={Boolean(category)}>
              <Badge variant={'secondary'}>
                Category: {CATEGORY_OPTIONS.find((opt) => opt.value === category)?.label || category}
              </Badge>
            </Conditional>
            <Conditional isCondition={Boolean(dateFrom)}>
              <Badge variant={'secondary'}>From: {dateFrom}</Badge>
            </Conditional>
            <Conditional isCondition={Boolean(dateTo)}>
              <Badge variant={'secondary'}>To: {dateTo}</Badge>
            </Conditional>
            <Conditional isCondition={sortBy !== 'relevance'}>
              <Badge variant={'secondary'}>Sort: {sortBy}</Badge>
            </Conditional>
            <Conditional isCondition={sortOrder !== 'desc'}>
              <Badge variant={'secondary'}>Order: {sortOrder}</Badge>
            </Conditional>
            <Conditional isCondition={tagIds.length > 0}>
              <Badge variant={'secondary'}>{tagIds.length} tags selected</Badge>
            </Conditional>
          </div>
        </div>
      </Conditional>
    </div>
  );

  return (
    <div className={'space-y-4'} data-slot={'search-filters'} data-testid={filtersTestId}>
      {/* Search Input and Filter Toggle */}
      <div className={'flex flex-wrap items-center gap-2'}>
        <Input
          className={'min-h-11 min-w-0 flex-1 sm:max-w-96'}
          data-slot={'search-filters-input'}
          data-testid={`${filtersTestId}-input`}
          onChange={handleSearchInputChange}
          placeholder={'Search for collections, subcollections, or bobbleheads...'}
          type={'search'}
          value={searchInput}
        />

        {/* Mobile Filter Button - Opens Sheet Drawer */}
        <Sheet onOpenChange={handleMobileDrawerOpenChange} open={isMobileDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              aria-label={'Open search filters'}
              className={'min-h-11 min-w-11 gap-2 px-3 sm:hidden'}
              data-slot={'search-filters-mobile-toggle'}
              data-testid={`${filtersTestId}-mobile-toggle`}
              variant={'outline'}
            >
              <FilterIcon aria-hidden className={'size-4'} />
              <Conditional isCondition={activeFilterCount > 0}>
                <Badge
                  className={'ml-1 min-w-5 justify-center px-1.5 py-0.5 text-xs'}
                  data-slot={'search-filters-count'}
                  data-testid={`${filtersTestId}-mobile-count`}
                  variant={'default'}
                >
                  {activeFilterCount}
                </Badge>
              </Conditional>
            </Button>
          </SheetTrigger>
          <SheetContent
            className={'flex h-[85vh] flex-col overflow-hidden'}
            data-slot={'search-filters-mobile-drawer'}
            data-testid={`${filtersTestId}-mobile-drawer`}
            side={'bottom'}
          >
            <SheetHeader className={'flex-shrink-0 border-b pb-4'}>
              <div className={'flex items-center justify-between'}>
                <SheetTitle>Search Filters</SheetTitle>
                <Conditional isCondition={_hasActiveFilters}>
                  <Button
                    className={'min-h-11 gap-1.5'}
                    data-slot={'search-filters-mobile-clear'}
                    data-testid={`${filtersTestId}-mobile-clear`}
                    onClick={handleClearFilters}
                    size={'sm'}
                    variant={'ghost'}
                  >
                    <XIcon aria-hidden className={'size-3.5'} />
                    <span>Clear All</span>
                  </Button>
                </Conditional>
              </div>
              <SheetDescription>
                Filter and sort your search results. {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'} active.` : 'No filters active.'}
              </SheetDescription>
            </SheetHeader>
            <div className={'flex-1 overflow-y-auto overscroll-contain py-4'}>
              {filterContent}
            </div>
            <SheetFooter className={'flex-shrink-0 border-t pt-4'}>
              <Button
                className={'min-h-11 w-full'}
                data-slot={'search-filters-mobile-apply'}
                data-testid={`${filtersTestId}-mobile-apply`}
                onClick={() => setIsMobileDrawerOpen(false)}
              >
                Apply Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Desktop Filter Button - Toggles inline panel */}
        <Button
          aria-expanded={isFiltersExpanded}
          aria-label={isFiltersExpanded ? 'Hide search filters' : 'Show search filters'}
          className={'hidden min-h-11 min-w-11 gap-2 px-3 sm:inline-flex'}
          data-slot={'search-filters-toggle'}
          data-testid={`${filtersTestId}-toggle`}
          onClick={handleFiltersToggle}
          variant={'outline'}
        >
          <FilterIcon aria-hidden className={'size-4'} />
          <span>{isFiltersExpanded ? 'Hide Filters' : 'Filters'}</span>
          <Conditional isCondition={activeFilterCount > 0}>
            <Badge
              className={'ml-1 min-w-5 justify-center px-1.5 py-0.5 text-xs'}
              data-slot={'search-filters-count'}
              data-testid={`${filtersTestId}-count`}
              variant={'default'}
            >
              {activeFilterCount}
            </Badge>
          </Conditional>
        </Button>
      </div>

      {/* Desktop Advanced Filters Panel */}
      <Conditional isCondition={isFiltersExpanded}>
        <Card
          className={'hidden p-4 sm:block sm:p-6'}
          data-slot={'search-filters-panel'}
          data-testid={`${filtersTestId}-panel`}
        >
          <div className={'space-y-4'}>
            {/* Filter Header */}
            <div className={'flex items-center justify-between'}>
              <h3 className={'text-lg font-semibold'}>Filters</h3>
              <Conditional isCondition={_hasActiveFilters}>
                <Button
                  className={'min-h-9 gap-1.5'}
                  data-slot={'search-filters-clear'}
                  data-testid={`${filtersTestId}-clear`}
                  onClick={handleClearFilters}
                  size={'sm'}
                  variant={'ghost'}
                >
                  <XIcon aria-hidden className={'size-3.5'} />
                  <span>Clear All</span>
                </Button>
              </Conditional>
            </div>

            {filterContent}
          </div>
        </Card>
      </Conditional>
    </div>
  );
};
