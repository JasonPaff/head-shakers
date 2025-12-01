import { CheckIcon, FilterIcon, GripVerticalIcon, LayoutListIcon, PlusIcon, SearchIcon } from 'lucide-react';
import { $path } from 'next-typesafe-url';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export type ToolbarProps = {
  categories?: Array<string>;
  collectionId?: string;
  conditions?: Array<string>;
  filterCategory: string;
  filterCondition: string;
  filterFeatured: string;
  gridDensity: 'comfortable' | 'compact';
  isSelectionMode: boolean;
  onFilterCategoryChange: (value: string) => void;
  onFilterConditionChange: (value: string) => void;
  onFilterFeaturedChange: (value: string) => void;
  onGridDensityToggle: () => void;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onSelectionModeToggle: () => void;
  onSortChange: (value: string) => void;
  searchValue: string;
  sortBy: string;
};

export const Toolbar = ({
  categories = [],
  collectionId,
  conditions = [],
  filterCategory,
  filterCondition,
  filterFeatured,
  gridDensity,
  isSelectionMode,
  onFilterCategoryChange,
  onFilterConditionChange,
  onFilterFeaturedChange,
  onGridDensityToggle,
  onSearchChange,
  onSearchClear,
  onSelectionModeToggle,
  onSortChange,
  searchValue,
  sortBy,
}: ToolbarProps) => {
  const hasActiveFilters = filterCategory !== 'all' || filterCondition !== 'all' || filterFeatured !== 'all';

  return (
    <div
      className={'m-4 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'}
      data-slot={'toolbar'}
    >
      {/* Left Side - Search and Filters */}
      <div className={'flex flex-1 items-center gap-2'}>
        {/* Search */}
        <div className={'w-full max-w-sm'}>
          <Input
            isClearable
            leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
            onChange={(e) => {
              onSearchChange(e.target.value);
            }}
            onClear={onSearchClear}
            placeholder={'Search bobbleheads...'}
            value={searchValue}
          />
        </div>

        {/* Filters Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className={'relative'} size={'sm'} variant={'outline'}>
              <FilterIcon aria-hidden className={'size-4'} />
              <span className={'hidden sm:inline'}>Filters</span>
              {hasActiveFilters && (
                <span
                  aria-label={'Filters active'}
                  className={'absolute -top-1 -right-1 size-2 rounded-full bg-primary'}
                />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'start'} className={'w-56'}>
            <DropdownMenuLabel>Category</DropdownMenuLabel>
            <DropdownMenuRadioGroup onValueChange={onFilterCategoryChange} value={filterCategory}>
              <DropdownMenuRadioItem value={'all'}>All Categories</DropdownMenuRadioItem>
              {categories.map((cat) => (
                <DropdownMenuRadioItem key={cat} value={cat}>
                  {cat}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Condition</DropdownMenuLabel>
            <DropdownMenuRadioGroup onValueChange={onFilterConditionChange} value={filterCondition}>
              <DropdownMenuRadioItem value={'all'}>All Conditions</DropdownMenuRadioItem>
              {conditions.map((cond) => (
                <DropdownMenuRadioItem key={cond} value={cond}>
                  {cond.replace('-', ' ').toUpperCase()}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>

            <DropdownMenuSeparator />

            <DropdownMenuLabel>Featured</DropdownMenuLabel>
            <DropdownMenuRadioGroup onValueChange={onFilterFeaturedChange} value={filterFeatured}>
              <DropdownMenuRadioItem value={'all'}>All Items</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={'featured'}>Featured Only</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value={'not-featured'}>Not Featured</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size={'sm'} variant={'outline'}>
              <span className={'hidden sm:inline'}>Sort</span>
              <span className={'sm:hidden'}>•••</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align={'start'}>
            <DropdownMenuRadioGroup onValueChange={onSortChange} value={sortBy}>
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
        <Button onClick={onGridDensityToggle} size={'icon'} variant={'outline'}>
          {gridDensity === 'compact' ?
            <GripVerticalIcon aria-hidden className={'size-4'} />
          : <LayoutListIcon aria-hidden className={'size-4'} />}
        </Button>

        {/* Selection Mode Toggle */}
        <Button onClick={onSelectionModeToggle} size={'sm'} variant={isSelectionMode ? 'default' : 'outline'}>
          <CheckIcon aria-hidden className={'size-4'} />
          {isSelectionMode ? 'Cancel' : 'Select'}
        </Button>

        {/* Add New Button */}
        <Button asChild size={'sm'}>
          <Link href={$path({ route: '/bobbleheads/add', searchParams: { collectionId } })}>
            <PlusIcon aria-hidden className={'size-4'} />
            Add Bobblehead
          </Link>
        </Button>
      </div>

      {/* Mobile Actions Row */}
      <div className={'flex items-center gap-2 lg:hidden'}>
        <Button onClick={onSelectionModeToggle} size={'sm'} variant={isSelectionMode ? 'default' : 'outline'}>
          <CheckIcon aria-hidden className={'size-4'} />
          {isSelectionMode ? 'Cancel' : 'Select'}
        </Button>
      </div>
    </div>
  );
};
