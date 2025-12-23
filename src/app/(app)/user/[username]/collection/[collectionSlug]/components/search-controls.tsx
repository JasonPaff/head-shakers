'use client';

import type { ComponentProps } from 'react';

import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/tailwind-utils';

type SortOption = 'name_asc' | 'name_desc' | 'newest' | 'oldest';

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: 'Date Added - Newest First', value: 'newest' },
  { label: 'Date Added - Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name_asc' },
  { label: 'Name Z-A', value: 'name_desc' },
];

type SearchControlsProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchControls = ({ className, testId, ...props }: SearchControlsProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const [{ search, sort }, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      sort: parseAsStringEnum(['newest', 'oldest', 'name_asc', 'name_desc'] as const).withDefault('newest'),
    },
    {
      shallow: false,
    },
  );
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    setSearchQuery(search);
  }, [search]);

  useEffect(() => {
    void setParams({ search: debouncedSearchQuery || null });
  }, [debouncedSearchQuery, setParams]);

  const handleSortChange = (newSort: SortOption) => {
    void setParams({ sort: newSort });
  };

  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}
      data-slot={'search-controls'}
      data-testid={testId}
      {...props}
    >
      {/* Search Input */}
      <div className={'w-full sm:max-w-sm'} data-slot={'search-input-container'}>
        <Input
          aria-label={'Search bobbleheads'}
          className={'w-full'}
          data-slot={'search-input'}
          isClearable
          leftIcon={<SearchIcon aria-hidden className={'size-4'} />}
          name={'search'}
          onChange={(e) => {
            setSearchQuery(e.target.value);
          }}
          placeholder={'Search bobbleheads...'}
          type={'search'}
          value={searchQuery}
        />
      </div>

      {/* Sort Select */}
      <Select data-slot={'sort-select'} name={'sort'} onValueChange={handleSortChange} value={sort}>
        <SelectTrigger className={'w-full sm:w-55'} data-slot={'sort-trigger'}>
          <SelectValue placeholder={'Sort by...'} />
        </SelectTrigger>
        <SelectContent data-slot={'sort-content'}>
          {sortOptions.map((option) => (
            <SelectItem data-slot={'sort-option'} key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
