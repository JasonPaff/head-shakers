'use client';

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { CollectionSubcollectionFilter } from './collection-subcollection-filter';

const viewOptions = ['all', 'collection', 'subcollection'] as const;
const sortOptions = ['newest', 'oldest', 'name_asc', 'name_desc'] as const;

interface CollectionBobbleheadControlsProps {
  subcollections?: Array<{ id: string; name: string }>;
}

export const CollectionBobbleheadControls = ({
  subcollections = [],
}: CollectionBobbleheadControlsProps) => {
  const [{ search, sort, subcollectionId, view }, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      sort: parseAsStringEnum([...sortOptions]).withDefault('newest'),
      subcollectionId: parseAsString,
      view: parseAsStringEnum([...viewOptions]).withDefault('all'),
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

  const handleViewChange = (newView: 'all' | 'collection') => {
    void setParams({ subcollectionId: null, view: newView });
  };

  const handleSortChange = (newSort: (typeof sortOptions)[number]) => {
    void setParams({ sort: newSort });
  };

  const handleSubcollectionFilterChange = (newSubcollectionId: null | string) => {
    if (newSubcollectionId === null) {
      void setParams({ subcollectionId: null, view: 'all' });
    } else if (newSubcollectionId === 'collection') {
      void setParams({ subcollectionId: null, view: 'collection' });
    } else {
      void setParams({ subcollectionId: newSubcollectionId, view: 'subcollection' });
    }
  };

  const _subcollectionFilterValue = subcollectionId || (view === 'collection' ? 'collection' : null);
  const _isAllBobbleheadsActive = view === 'all';
  const _isCollectionOnlyActive = view === 'collection';

  return (
    <div className={'space-y-4'}>
      {/* View Toggle */}
      <div className={'flex gap-2'}>
        <Button
          onClick={() => {
            handleViewChange('all');
          }}
          variant={_isAllBobbleheadsActive ? 'default' : 'secondary'}
        >
          All Bobbleheads
        </Button>

        {/* Collection Button */}
        <Button
          onClick={() => {
            handleViewChange('collection');
          }}
          variant={_isCollectionOnlyActive ? 'default' : 'secondary'}
        >
          In Collection Only
        </Button>
      </div>

      {/* Subcollection Filter */}
      <CollectionSubcollectionFilter
        onFilterChange={handleSubcollectionFilterChange}
        subcollections={subcollections}
        value={_subcollectionFilterValue}
      />

      {/* Search/Sort Form */}
      <div className={'flex flex-col gap-4 sm:flex-row sm:items-end'}>
        <div className={'flex-1'}>
          {/* Search Input */}
          <Input
            aria-label={'search bobbleheads'}
            className={'w-full'}
            isClearable
            isSearch
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
    </div>
  );
};
