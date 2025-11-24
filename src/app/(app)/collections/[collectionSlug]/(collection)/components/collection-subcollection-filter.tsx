'use client';

import { FilterIcon } from 'lucide-react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

interface CollectionSubcollectionFilterProps extends ComponentTestIdProps {
  onFilterChange: (subcollectionId: null | string) => void;
  subcollections: Array<SubcollectionOption>;
  value: null | string | undefined;
}

interface SubcollectionOption {
  id: string;
  name: string;
}

export const CollectionSubcollectionFilter = ({
  onFilterChange,
  subcollections,
  testId,
  value,
}: CollectionSubcollectionFilterProps) => {
  const filterTestId = testId || generateTestId('feature', 'select', 'subcollection-filter');
  const filterTriggerTestId = `${filterTestId}-trigger`;
  const filterContentTestId = `${filterTestId}-content`;
  const filterBadgeTestId = `${filterTestId}-badge`;

  const handleValueChange = (newValue: string) => {
    if (newValue === 'all') {
      onFilterChange(null);
    } else {
      onFilterChange(newValue);
    }
  };

  const _currentValue = value || 'all';
  const _hasSubcollections = subcollections.length > 0;
  const _isFilterActive = _currentValue !== 'all';
  const _selectedSubcollection = subcollections.find((sub) => sub.id === _currentValue);
  const _filterLabel =
    _currentValue === 'collection' ? 'Main Collection Only'
    : _selectedSubcollection ? _selectedSubcollection.name
    : 'All Bobbleheads';

  if (!_hasSubcollections) {
    return null;
  }

  return (
    <div className={'flex items-center gap-2'} data-slot={'filter-container'}>
      {/* Filter Icon with Visual Indicator */}
      <div
        aria-hidden
        className={cn(
          'flex items-center justify-center rounded-md p-2',
          _isFilterActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
        data-slot={'filter-icon'}
      >
        <FilterIcon className={'size-4'} />
      </div>

      <Select
        name={'subcollectionFilter'}
        onValueChange={handleValueChange}
        testId={filterTestId}
        value={_currentValue}
      >
        <SelectTrigger
          aria-label={_isFilterActive ? `Filtered by: ${_filterLabel}` : 'Filter by subcollection'}
          className={cn(_isFilterActive && 'border-primary')}
          testId={filterTriggerTestId}
        >
          <SelectValue placeholder={'Filter by subcollection'} />
        </SelectTrigger>
        <SelectContent testId={filterContentTestId}>
          {/* All Bobbleheads Option */}
          <SelectItem testId={generateTestId('feature', 'select', 'filter-all')} value={'all'}>
            All Bobbleheads
          </SelectItem>

          {/* Main Collection Only Option */}
          <SelectItem testId={generateTestId('feature', 'select', 'filter-collection')} value={'collection'}>
            Main Collection Only
          </SelectItem>

          {/* Individual Subcollection Options */}
          {subcollections.map((subcollection) => (
            <SelectItem
              key={subcollection.id}
              testId={generateTestId('feature', 'select', `filter-${subcollection.id}`)}
              value={subcollection.id}
            >
              {subcollection.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Active Filter Badge */}
      <Conditional isCondition={_isFilterActive}>
        <Badge
          aria-live={'polite'}
          className={'bg-primary/10 text-primary'}
          data-slot={'filter-badge'}
          testId={filterBadgeTestId}
          variant={'secondary'}
        >
          {_filterLabel}
        </Badge>
      </Conditional>

      {/* Screen Reader Announcement */}
      <span aria-live={'polite'} className={'sr-only'}>
        {_isFilterActive ? `Filtering by: ${_filterLabel}` : 'Showing all bobbleheads'}
      </span>
    </div>
  );
};
