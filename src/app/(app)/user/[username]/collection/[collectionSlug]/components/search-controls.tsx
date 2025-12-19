'use client';

import { SearchIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/tailwind-utils';

import type { SortOption } from '../mock-data';

import { sortOptions } from '../mock-data';

interface SearchControlsProps {
  className?: string;
  onSearchChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  searchValue: string;
  sortValue: SortOption;
}

export const SearchControls = ({
  className,
  onSearchChange,
  onSortChange,
  searchValue,
  sortValue,
}: SearchControlsProps) => {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      <div className={'w-full sm:max-w-sm'}>
        <Input
          isClearable
          leftIcon={<SearchIcon className={'size-4'} />}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder={'Search bobbleheads...'}
          value={searchValue}
        />
      </div>

      <Select onValueChange={(value) => onSortChange(value as SortOption)} value={sortValue}>
        <SelectTrigger className={'w-full sm:w-[220px]'}>
          <SelectValue placeholder={'Sort by...'} />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
