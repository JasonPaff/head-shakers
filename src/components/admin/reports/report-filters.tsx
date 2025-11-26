'use client';

import type { ComponentPropsWithRef } from 'react';

import { format } from 'date-fns';
import { CalendarIcon, FilterIcon, XIcon } from 'lucide-react';
import { parseAsArrayOf, parseAsIsoDateTime, parseAsStringEnum, useQueryStates } from 'nuqs';

import type { ReportFiltersState } from '@/components/admin/reports/admin-reports-client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Conditional } from '@/components/ui/conditional';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ENUMS } from '@/lib/constants';
import { cn } from '@/utils/tailwind-utils';

interface ReportFiltersProps extends ComponentPropsWithRef<'div'> {
  onFiltersChange?: (filters: ReportFiltersState) => void;
}

export const ReportFilters = ({ className, onFiltersChange, ...props }: ReportFiltersProps) => {
  // useState hooks
  // (none for this component - using nuqs for state)

  // Other hooks
  const [filters, setFilters] = useQueryStates(
    {
      dateFrom: parseAsIsoDateTime,
      dateTo: parseAsIsoDateTime,
      reason: parseAsArrayOf(parseAsStringEnum([...ENUMS.CONTENT_REPORT.REASON])),
      status: parseAsArrayOf(parseAsStringEnum([...ENUMS.CONTENT_REPORT.STATUS])),
      targetType: parseAsArrayOf(parseAsStringEnum(['bobblehead', 'collection', 'comment'] as const)),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // useEffect hooks
  // (none needed for this component)

  // Helper to notify parent of filter changes
  const notifyFiltersChange = (updatedFilters: typeof filters) => {
    onFiltersChange?.({
      dateFrom: updatedFilters.dateFrom,
      dateTo: updatedFilters.dateTo,
      reason: updatedFilters.reason,
      status: updatedFilters.status,
      targetType: updatedFilters.targetType,
    });
  };

  // Event handlers
  const handleStatusChange = async (value: string) => {
    const currentStatus = filters.status || [];
    const newStatus =
      currentStatus.includes(value as (typeof ENUMS.CONTENT_REPORT.STATUS)[number]) ?
        currentStatus.filter((s) => s !== value)
      : [...currentStatus, value as (typeof ENUMS.CONTENT_REPORT.STATUS)[number]];

    const newFilters = { ...filters, status: newStatus.length > 0 ? newStatus : null };
    await setFilters({ status: newFilters.status });
    notifyFiltersChange(newFilters);
  };

  const handleTargetTypeChange = async (value: string) => {
    const currentTypes = filters.targetType || [];
    const newTypes =
      currentTypes.includes(value as 'bobblehead' | 'collection' | 'comment') ?
        currentTypes.filter((t) => t !== value)
      : [...currentTypes, value as 'bobblehead' | 'collection' | 'comment'];

    const newFilters = { ...filters, targetType: newTypes.length > 0 ? newTypes : null };
    await setFilters({ targetType: newFilters.targetType });
    notifyFiltersChange(newFilters);
  };

  const handleReasonChange = async (value: string) => {
    const currentReasons = filters.reason || [];
    const newReasons =
      currentReasons.includes(value as (typeof ENUMS.CONTENT_REPORT.REASON)[number]) ?
        currentReasons.filter((r) => r !== value)
      : [...currentReasons, value as (typeof ENUMS.CONTENT_REPORT.REASON)[number]];

    const newFilters = { ...filters, reason: newReasons.length > 0 ? newReasons : null };
    await setFilters({ reason: newFilters.reason });
    notifyFiltersChange(newFilters);
  };

  const handleDateFromSelect = async (date: Date | undefined) => {
    const newFilters = { ...filters, dateFrom: date || null };
    await setFilters({ dateFrom: newFilters.dateFrom });
    notifyFiltersChange(newFilters);
  };

  const handleDateToSelect = async (date: Date | undefined) => {
    const newFilters = { ...filters, dateTo: date || null };
    await setFilters({ dateTo: newFilters.dateTo });
    notifyFiltersChange(newFilters);
  };

  const handleClearFilters = async () => {
    const newFilters = {
      dateFrom: null,
      dateTo: null,
      reason: null,
      status: null,
      targetType: null,
    };
    await setFilters(newFilters);
    notifyFiltersChange(newFilters);
  };

  const handleRemoveStatus = async (value: string) => {
    const newStatus = (filters.status || []).filter((s) => s !== value);
    const newFilters = { ...filters, status: newStatus.length > 0 ? newStatus : null };
    await setFilters({ status: newFilters.status });
    notifyFiltersChange(newFilters);
  };

  const handleRemoveTargetType = async (value: string) => {
    const newTypes = (filters.targetType || []).filter((t) => t !== value);
    const newFilters = { ...filters, targetType: newTypes.length > 0 ? newTypes : null };
    await setFilters({ targetType: newFilters.targetType });
    notifyFiltersChange(newFilters);
  };

  const handleRemoveReason = async (value: string) => {
    const newReasons = (filters.reason || []).filter((r) => r !== value);
    const newFilters = { ...filters, reason: newReasons.length > 0 ? newReasons : null };
    await setFilters({ reason: newFilters.reason });
    notifyFiltersChange(newFilters);
  };

  const handleClearDateFrom = async () => {
    const newFilters = { ...filters, dateFrom: null };
    await setFilters({ dateFrom: null });
    notifyFiltersChange(newFilters);
  };

  const handleClearDateTo = async () => {
    const newFilters = { ...filters, dateTo: null };
    await setFilters({ dateTo: null });
    notifyFiltersChange(newFilters);
  };

  // Derived variables for conditional rendering
  const _hasActiveFilters =
    (filters.status?.length ?? 0) > 0 ||
    (filters.targetType?.length ?? 0) > 0 ||
    (filters.reason?.length ?? 0) > 0 ||
    !!filters.dateFrom ||
    !!filters.dateTo;

  const _hasStatusFilter = (filters.status?.length ?? 0) > 0;
  const _hasTargetTypeFilter = (filters.targetType?.length ?? 0) > 0;
  const _hasReasonFilter = (filters.reason?.length ?? 0) > 0;
  const _hasDateFromFilter = !!filters.dateFrom;
  const _hasDateToFilter = !!filters.dateTo;

  return (
    <Card className={cn('p-6', className)} {...props}>
      <div className={'space-y-6'}>
        {/* Filter Header */}
        <div className={'flex items-center justify-between'}>
          <div className={'flex items-center gap-2'}>
            <FilterIcon className={'size-5 text-muted-foreground'} />
            <h3 className={'text-lg font-semibold'}>Filters</h3>
          </div>
          <Conditional isCondition={_hasActiveFilters}>
            <Button onClick={handleClearFilters} size={'sm'} variant={'ghost'}>
              Clear All
            </Button>
          </Conditional>
        </div>

        {/* Filter Controls */}
        <div className={'grid gap-6 md:grid-cols-2 lg:grid-cols-4'}>
          {/* Status Filter */}
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'} htmlFor={'status-filter'}>
              Status
            </Label>
            <Select onValueChange={handleStatusChange} value={''}>
              <SelectTrigger className={'w-full'} id={'status-filter'}>
                <SelectValue placeholder={'Select status'} />
              </SelectTrigger>
              <SelectContent>
                {ENUMS.CONTENT_REPORT.STATUS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Type Filter */}
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'} htmlFor={'target-type-filter'}>
              Content Type
            </Label>
            <Select onValueChange={handleTargetTypeChange} value={''}>
              <SelectTrigger className={'w-full'} id={'target-type-filter'}>
                <SelectValue placeholder={'Select type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={'bobblehead'}>Bobblehead</SelectItem>
                <SelectItem value={'collection'}>Collection</SelectItem>
                <SelectItem value={'comment'}>Comment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason Filter */}
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'} htmlFor={'reason-filter'}>
              Reason
            </Label>
            <Select onValueChange={handleReasonChange} value={''}>
              <SelectTrigger className={'w-full'} id={'reason-filter'}>
                <SelectValue placeholder={'Select reason'} />
              </SelectTrigger>
              <SelectContent>
                {ENUMS.CONTENT_REPORT.REASON.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter - From */}
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'}>Date From</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.dateFrom && 'text-muted-foreground',
                  )}
                  variant={'outline'}
                >
                  <CalendarIcon className={'mr-2 size-4'} />
                  {filters.dateFrom ? format(filters.dateFrom, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align={'start'} className={'w-auto p-0'}>
                <Calendar
                  mode={'single'}
                  onSelect={handleDateFromSelect}
                  selected={filters.dateFrom || undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date Range Filter - To */}
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'}>Date To</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !filters.dateTo && 'text-muted-foreground',
                  )}
                  variant={'outline'}
                >
                  <CalendarIcon className={'mr-2 size-4'} />
                  {filters.dateTo ? format(filters.dateTo, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align={'start'} className={'w-auto p-0'}>
                <Calendar
                  mode={'single'}
                  onSelect={handleDateToSelect}
                  selected={filters.dateTo || undefined}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Active Filters Display */}
        <Conditional isCondition={_hasActiveFilters}>
          <div className={'space-y-2'}>
            <Label className={'text-sm font-medium'}>Active Filters</Label>
            <div className={'flex flex-wrap gap-2'}>
              {/* Status badges */}
              <Conditional isCondition={_hasStatusFilter}>
                {filters.status?.map((status) => (
                  <Badge className={'gap-1'} key={status} variant={'secondary'}>
                    Status: {status.charAt(0).toUpperCase() + status.slice(1)}
                    <Button
                      className={'size-4'}
                      onClick={() => handleRemoveStatus(status)}
                      size={'icon'}
                      variant={'outline'}
                    >
                      <XIcon className={'size-3 cursor-pointer'} />
                    </Button>
                  </Badge>
                ))}
              </Conditional>

              {/* Target Type badges */}
              <Conditional isCondition={_hasTargetTypeFilter}>
                {filters.targetType?.map((type) => (
                  <Badge className={'gap-1'} key={type} variant={'secondary'}>
                    Type: {type.charAt(0).toUpperCase() + type.slice(1)}
                    <Button
                      className={'size-4'}
                      onClick={() => handleRemoveTargetType(type)}
                      size={'icon'}
                      variant={'outline'}
                    >
                      <XIcon className={'size-3 cursor-pointer'} />
                    </Button>
                  </Badge>
                ))}
              </Conditional>

              {/* Reason badges */}
              <Conditional isCondition={_hasReasonFilter}>
                {filters.reason?.map((reason) => (
                  <Badge className={'gap-1'} key={reason} variant={'secondary'}>
                    Reason:{' '}
                    {reason
                      .split('_')
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')}
                    <Button
                      className={'size-4'}
                      onClick={() => handleRemoveReason(reason)}
                      size={'icon'}
                      variant={'outline'}
                    >
                      <XIcon className={'size-3 cursor-pointer'} />
                    </Button>
                  </Badge>
                ))}
              </Conditional>

              {/* Date From badge */}
              <Conditional isCondition={_hasDateFromFilter}>
                <Badge className={'gap-1'} variant={'secondary'}>
                  From: {filters.dateFrom && format(filters.dateFrom, 'PP')}
                  <Button
                    className={'size-4'}
                    onClick={handleClearDateFrom}
                    size={'icon'}
                    variant={'outline'}
                  >
                    <XIcon className={'size-3 cursor-pointer'} />
                  </Button>
                </Badge>
              </Conditional>

              {/* Date To badge */}
              <Conditional isCondition={_hasDateToFilter}>
                <Badge className={'gap-1'} variant={'secondary'}>
                  To: {filters.dateTo && format(filters.dateTo, 'PP')}
                  <Button className={'size-4'} onClick={handleClearDateTo} size={'icon'} variant={'outline'}>
                    <XIcon className={'size-3 cursor-pointer'} />
                  </Button>
                </Badge>
              </Conditional>
            </div>
          </div>
        </Conditional>
      </div>
    </Card>
  );
};
