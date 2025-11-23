import type { ComponentProps } from 'react';

import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

/**
 * SearchCardSkeleton - Skeleton for grid view result cards
 * Matches dimensions of SearchResultCard component
 */
type SearchCardSkeletonProps = ComponentProps<'div'> & ComponentTestIdProps;

export const SearchCardSkeleton = ({ className, testId, ...props }: SearchCardSkeletonProps) => {
  const searchCardSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'search-card');

  return (
    <Card
      className={cn('relative h-full overflow-hidden', className)}
      data-slot={'search-card-skeleton'}
      data-testid={searchCardSkeletonTestId}
      {...props}
    >
      {/* Card Image Skeleton - Matches aspect-[4/3] from SearchResultCard */}
      <div
        className={'relative aspect-[4/3] w-full overflow-hidden'}
        data-slot={'search-card-skeleton-image'}
      >
        <Skeleton className={'size-full rounded-none'} />
        {/* Badge Skeleton Overlay */}
        <div className={'absolute top-3 left-3 z-10'} data-slot={'search-card-skeleton-badge'}>
          <Skeleton className={'h-5 w-20 rounded-full'} />
        </div>
      </div>

      {/* Card Header Skeleton - Matches padding from SearchResultCard */}
      <CardHeader className={'space-y-1.5 p-4'} data-slot={'search-card-skeleton-header'}>
        {/* Title Skeleton */}
        <Skeleton className={'h-5 w-3/4'} />
        {/* Owner Skeleton */}
        <Skeleton className={'h-4 w-1/2'} />
      </CardHeader>

      {/* Card Content Skeleton - Description */}
      <CardContent className={'px-4 pt-0 pb-4'} data-slot={'search-card-skeleton-content'}>
        <div className={'space-y-1.5'}>
          <Skeleton className={'h-3.5 w-full'} />
          <Skeleton className={'h-3.5 w-2/3'} />
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * SearchListRowSkeleton - Skeleton for list view table rows
 * Matches dimensions of SearchResultsList table rows
 */
type SearchListRowSkeletonProps = ComponentProps<'tr'> & ComponentTestIdProps;

export const SearchListRowSkeleton = ({ className, testId, ...props }: SearchListRowSkeletonProps) => {
  const searchListRowSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'search-list-row');

  return (
    <tr
      className={cn('border-b', className)}
      data-slot={'search-list-row-skeleton'}
      data-testid={searchListRowSkeletonTestId}
      {...props}
    >
      {/* Thumbnail Cell - size-12 (48px) from list component */}
      <td className={'p-4'} data-slot={'search-list-row-skeleton-thumbnail'}>
        <Skeleton className={'size-12 rounded-md'} />
      </td>

      {/* Name/Description Cell */}
      <td className={'p-4'} data-slot={'search-list-row-skeleton-name'}>
        <div className={'flex flex-col gap-1.5'}>
          <Skeleton className={'h-4 w-48'} />
          <Skeleton className={'h-3 w-32'} />
        </div>
      </td>

      {/* Entity Type Badge Cell */}
      <td className={'p-4'} data-slot={'search-list-row-skeleton-type'}>
        <Skeleton className={'h-5 w-24 rounded-full'} />
      </td>

      {/* Owner Cell */}
      <td className={'p-4'} data-slot={'search-list-row-skeleton-owner'}>
        <Skeleton className={'h-4 w-20'} />
      </td>

      {/* Actions Cell */}
      <td className={'p-4'} data-slot={'search-list-row-skeleton-actions'}>
        <Skeleton className={'size-8 rounded-md'} />
      </td>
    </tr>
  );
};

/**
 * SearchFiltersSkeleton - Skeleton for filters section
 * Matches structure of SearchFilters component
 */
type SearchFiltersSkeletonProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    isExpanded?: boolean;
  };

export const SearchFiltersSkeleton = ({
  className,
  isExpanded = false,
  testId,
  ...props
}: SearchFiltersSkeletonProps) => {
  const searchFiltersSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'search-filters');

  return (
    <div
      className={cn('space-y-4', className)}
      data-slot={'search-filters-skeleton'}
      data-testid={searchFiltersSkeletonTestId}
      {...props}
    >
      {/* Search Input and Filter Toggle Skeleton */}
      <div className={'flex flex-wrap items-center gap-2'} data-slot={'search-filters-skeleton-input-row'}>
        <Skeleton className={'h-11 min-w-0 flex-1 sm:max-w-96'} />
        <Skeleton className={'h-11 w-28'} />
      </div>

      {/* Expanded Filters Panel Skeleton */}
      {isExpanded && (
        <Card className={'p-4 sm:p-6'} data-slot={'search-filters-skeleton-panel'}>
          <div className={'space-y-4'}>
            {/* Filter Header Skeleton */}
            <div className={'flex items-center justify-between'} data-slot={'search-filters-skeleton-header'}>
              <Skeleton className={'h-6 w-16'} />
              <Skeleton className={'h-8 w-20'} />
            </div>

            {/* Content Type Section Skeleton */}
            <div className={'space-y-2'} data-slot={'search-filters-skeleton-content-type'}>
              <Skeleton className={'h-11 w-full'} />
              <div className={'flex flex-wrap gap-4 px-2 pt-2'}>
                <Skeleton className={'h-6 w-24'} />
                <Skeleton className={'h-6 w-28'} />
                <Skeleton className={'h-6 w-24'} />
              </div>
            </div>

            {/* Category Section Skeleton */}
            <div className={'space-y-2'} data-slot={'search-filters-skeleton-category'}>
              <Skeleton className={'h-11 w-full'} />
            </div>

            {/* Date Range Section Skeleton */}
            <div className={'space-y-2'} data-slot={'search-filters-skeleton-date-range'}>
              <Skeleton className={'h-11 w-full'} />
            </div>

            {/* Sorting Section Skeleton */}
            <div className={'space-y-2'} data-slot={'search-filters-skeleton-sorting'}>
              <Skeleton className={'h-11 w-full'} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

/**
 * SearchResultsSkeleton - Combined skeleton for search results
 * Renders appropriate skeletons based on view mode
 */
type SearchResultsSkeletonProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    count?: number;
    viewMode: 'grid' | 'list';
  };

export const SearchResultsSkeleton = ({
  className,
  count = 6,
  testId,
  viewMode,
  ...props
}: SearchResultsSkeletonProps) => {
  const searchResultsSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'search-results');

  // Derived conditional variables
  const _isGridView = viewMode === 'grid';
  const _isListView = viewMode === 'list';

  return (
    <div
      className={cn('w-full', className)}
      data-slot={'search-results-skeleton'}
      data-testid={searchResultsSkeletonTestId}
      {...props}
    >
      {/* Grid View Skeleton */}
      {_isGridView && (
        <div
          className={'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'}
          data-slot={'search-results-skeleton-grid'}
        >
          {Array.from({ length: count }).map((_, index) => (
            <SearchCardSkeleton
              key={`grid-skeleton-${index}`}
              testId={`${searchResultsSkeletonTestId}-card-${index}`}
            />
          ))}
        </div>
      )}

      {/* List View Skeleton */}
      {_isListView && (
        <div className={'overflow-x-auto rounded-md border'} data-slot={'search-results-skeleton-list'}>
          <table className={'w-full'}>
            <thead>
              <tr className={'border-b bg-muted/50'}>
                <th className={'p-4'} style={{ width: 64 }}>
                  <Skeleton className={'h-4 w-0'} />
                </th>
                <th className={'p-4 text-left'} style={{ width: 300 }}>
                  <Skeleton className={'h-4 w-12'} />
                </th>
                <th className={'p-4 text-left'} style={{ width: 130 }}>
                  <Skeleton className={'h-4 w-10'} />
                </th>
                <th className={'p-4 text-left'} style={{ width: 150 }}>
                  <Skeleton className={'h-4 w-14'} />
                </th>
                <th className={'p-4'} style={{ width: 60 }}>
                  <Skeleton className={'h-4 w-0'} />
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: count }).map((_, index) => (
                <SearchListRowSkeleton
                  key={`list-skeleton-${index}`}
                  testId={`${searchResultsSkeletonTestId}-row-${index}`}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * SearchPageSkeleton - Full page skeleton combining all elements
 * Use for initial page load state
 */
type SearchPageSkeletonProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    isFiltersExpanded?: boolean;
    resultCount?: number;
    viewMode?: 'grid' | 'list';
  };

export const SearchPageSkeleton = ({
  className,
  isFiltersExpanded = false,
  resultCount = 6,
  testId,
  viewMode = 'grid',
  ...props
}: SearchPageSkeletonProps) => {
  const searchPageSkeletonTestId = testId || generateTestId('ui', 'skeleton', 'search-page');

  return (
    <div
      className={cn('space-y-6', className)}
      data-slot={'search-page-skeleton'}
      data-testid={searchPageSkeletonTestId}
      {...props}
    >
      {/* Filters Skeleton */}
      <SearchFiltersSkeleton isExpanded={isFiltersExpanded} testId={`${searchPageSkeletonTestId}-filters`} />

      {/* Results Header Skeleton */}
      <div className={'flex items-center justify-between'} data-slot={'search-page-skeleton-header'}>
        <Skeleton className={'h-5 w-32'} />
        <Skeleton className={'h-9 w-24'} />
      </div>

      {/* Results Skeleton */}
      <SearchResultsSkeleton
        count={resultCount}
        testId={`${searchPageSkeletonTestId}-results`}
        viewMode={viewMode}
      />

      {/* Pagination Skeleton */}
      <div
        className={'flex items-center justify-center gap-2 pt-4'}
        data-slot={'search-page-skeleton-pagination'}
      >
        <Skeleton className={'size-9'} />
        <Skeleton className={'size-9'} />
        <Skeleton className={'size-9'} />
        <Skeleton className={'size-9'} />
        <Skeleton className={'size-9'} />
      </div>
    </div>
  );
};
