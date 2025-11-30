'use client';

import { SearchIcon } from 'lucide-react';
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sortOptions = ['newest', 'oldest', 'name_asc', 'name_desc'] as const;

export const CollectionBobbleheadControls = () => {
  const [{ search, sort }, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      sort: parseAsStringEnum([...sortOptions]).withDefault('newest'),
    },
    {
      shallow: false,
    },
  );

  const [searchQuery, setSearchQuery] = useState(search);
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  useEffect(() => {
    void setParams({ search: debouncedSearchQuery || null });
  }, [debouncedSearchQuery, setParams]);

  const handleSortChange = (newSort: (typeof sortOptions)[number]) => {
    void setParams({ sort: newSort });
  };

  return (
    <div className={'flex flex-col gap-4 sm:flex-row sm:items-end'}>
      <div className={'flex-1'}>
        {/* Search Input */}
        <Input
          aria-label={'search bobbleheads'}
          className={'w-full'}
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
      <Select name={'sort'} onValueChange={handleSortChange} value={sort}>
        <SelectTrigger>
          <SelectValue placeholder={'Sort by...'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={'newest'}>Date Added (Newest)</SelectItem>
          <SelectItem value={'oldest'}>Date Added (Oldest)</SelectItem>
          <SelectItem value={'name_asc'}>Name (A-Z)</SelectItem>
          <SelectItem value={'name_desc'}>Name (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
