'use client';

import type { ChangeEvent, ComponentProps } from 'react';

import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { useDebounce } from 'use-debounce';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CONFIG } from '@/lib/constants';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { LayoutSwitcher } from './layout-switcher';

const SORT_VALUES = ['newest', 'oldest', 'name_asc', 'name_desc'] as const;

type SortOption = (typeof SORT_VALUES)[number];

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: 'Date Added - Newest First', value: 'newest' },
  { label: 'Date Added - Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
];

type SearchControlsProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchControls = ({ className, testId, ...props }: SearchControlsProps) => {
  // useState hooks
  const [searchInput, setSearchInput] = useState('');

  // Other hooks
  const [isPending, startTransition] = useTransition();
  const [debouncedSearchInput] = useDebounce(searchInput, CONFIG.SEARCH.DEBOUNCE_MS);

  const [{ search, sort }, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      sort: parseAsStringEnum([...SORT_VALUES]).withDefault('newest'),
    },
    {
      shallow: false,
    },
  );

  // useEffect hooks
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    if (debouncedSearchInput !== search) {
      startTransition(() => {
        void setParams({ search: debouncedSearchInput || null });
      });
    }
  }, [debouncedSearchInput, search, setParams]);

  // Event handlers
  const handleSearchInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchInput('');
    startTransition(() => {
      void setParams({ search: null });
    });
  }, [setParams]);

  const handleSortChange = useCallback(
    (value: string) => {
      startTransition(() => {
        void setParams({ sort: value as (typeof SORT_VALUES)[number] });
      });
    },
    [setParams],
  );

  // Derived variables for conditional rendering
  const _isInputDisabled = isPending;

  const componentTestId = testId || generateTestId('feature', 'search-results', 'controls');

  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
      data-slot={'search-controls'}
      data-testid={componentTestId}
      {...props}
    >
      {/* Search Input Section */}
      <div className={'w-full sm:max-w-sm'}>
        <Input
          aria-label={'Search bobbleheads'}
          data-slot={'search-controls-input'}
          data-testid={`${componentTestId}-input`}
          disabled={_isInputDisabled}
          isClearable
          leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
          onChange={handleSearchInputChange}
          onClear={handleSearchClear}
          placeholder={'Search bobbleheads...'}
          value={searchInput}
        />
      </div>

      {/* Sort and Layout Section */}
      <div className={'flex items-center gap-2'}>
        {/* Sort Dropdown */}
        <Select disabled={isPending} onValueChange={handleSortChange} value={sort}>
          <SelectTrigger
            className={'w-full sm:w-[220px]'}
            data-slot={'search-controls-sort-trigger'}
            data-testid={`${componentTestId}-sort-trigger`}
          >
            <SelectValue placeholder={'Sort by...'} />
          </SelectTrigger>
          <SelectContent data-slot={'search-controls-sort-content'} data-testid={`${componentTestId}-sort-content`}>
            {sortOptions.map((option) => (
              <SelectItem
                data-testid={`${componentTestId}-sort-option-${option.value}`}
                key={option.value}
                value={option.value}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Layout Switcher */}
        <LayoutSwitcher testId={`${componentTestId}-layout`} />
      </div>
    </div>
  );
};
