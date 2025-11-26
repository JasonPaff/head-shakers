'use client';

import type { ComponentProps } from 'react';

import type {
  BobbleheadSearchResult,
  CollectionSearchResult,
  PublicSearchCounts,
} from '@/lib/queries/content-search/content-search.query';
import type { ComponentTestIdProps } from '@/lib/test-ids';

import { Badge } from '@/components/ui/badge';
import { Conditional } from '@/components/ui/conditional';
import { Separator } from '@/components/ui/separator';
import { ENUMS, type SearchViewMode } from '@/lib/constants/enums';
import { generateTestId } from '@/lib/test-ids';
import { cn } from '@/utils/tailwind-utils';

import { SearchResultCard } from './search-result-card';
import { SearchResultsList } from './search-results-list';
import { ViewModeToggle } from './view-mode-toggle';

type SearchResultsProps = ComponentProps<'div'> &
  ComponentTestIdProps & {
    bobbleheads: Array<BobbleheadSearchResult>;
    collections: Array<CollectionSearchResult>;
    counts: PublicSearchCounts;
    onViewModeChange?: (viewMode: SearchViewMode) => void;
    viewMode?: SearchViewMode;
  };

export const SearchResults = ({
  bobbleheads,
  className,
  collections,
  counts: _counts,
  onViewModeChange,
  testId,
  viewMode = ENUMS.SEARCH.VIEW_MODE[0],
  ...props
}: SearchResultsProps) => {
  // Note: _counts is intentionally unused - we calculate displayed counts from actual array lengths
  void _counts;
  // Generate testId
  const searchResultsTestId = testId || generateTestId('feature', 'search-results');

  // Derived variables for conditional rendering
  const _hasCollections = collections.length > 0;
  const _hasBobbleheads = bobbleheads.length > 0;
  // Calculate displayed results count based on actual array lengths (respects entityTypes filter)
  const _displayedResultsCount = collections.length + bobbleheads.length;
  // Use displayed count for the header, but keep counts prop for individual badges
  const _totalResults = _displayedResultsCount;
  const _isGridView = viewMode === ENUMS.SEARCH.VIEW_MODE[0];
  const _isListView = viewMode === ENUMS.SEARCH.VIEW_MODE[1];
  const _hasViewModeControl = !!onViewModeChange;

  // Event handlers
  const handleViewModeChange = (newViewMode: SearchViewMode) => {
    onViewModeChange?.(newViewMode);
  };

  // Prepare list items for list view - combining all result types
  const listItems = [
    ...collections.map((collection) => ({
      entityType: 'collection' as const,
      result: collection,
    })),
    ...bobbleheads.map((bobblehead) => ({
      entityType: 'bobblehead' as const,
      result: bobblehead,
    })),
  ];

  return (
    <div
      className={cn('space-y-8', className)}
      data-slot={'search-results'}
      data-testid={searchResultsTestId}
      {...props}
    >
      {/* Results Header */}
      <div
        className={'flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4'}
        data-slot={'search-results-header'}
      >
        {/* Results Summary */}
        <div
          className={'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center'}
          data-slot={'search-results-summary'}
        >
          <h2 className={'text-lg font-semibold sm:text-xl'}>
            {_totalResults} {_totalResults === 1 ? 'Result' : 'Results'} Found
          </h2>
          <div className={'flex flex-wrap gap-1.5 sm:gap-2'}>
            <Conditional isCondition={_hasCollections}>
              <Badge className={'text-xs'} variant={'outline'}>
                {collections.length} Collections
              </Badge>
            </Conditional>
            <Conditional isCondition={_hasBobbleheads}>
              <Badge className={'text-xs'} variant={'outline'}>
                {bobbleheads.length} Bobbleheads
              </Badge>
            </Conditional>
          </div>
        </div>

        {/* View Mode Toggle */}
        <Conditional isCondition={_hasViewModeControl}>
          <ViewModeToggle
            onViewModeChange={handleViewModeChange}
            testId={`${searchResultsTestId}-view-toggle`}
            viewMode={viewMode}
          />
        </Conditional>
      </div>

      {/* Grid View Content */}
      <Conditional isCondition={_isGridView}>
        <div
          className={cn('space-y-8 transition-opacity duration-200', 'animate-in fade-in-0')}
          data-slot={'search-results-grid-content'}
        >
          {/* Collections Section */}
          <Conditional isCondition={_hasCollections}>
            <div className={'space-y-3 sm:space-y-4'} data-slot={'search-results-collections-section'}>
              <div className={'flex items-center gap-2'}>
                <h3 className={'text-base font-semibold sm:text-lg'}>Collections</h3>
                <Badge className={'text-xs'} variant={'secondary'}>
                  {collections.length}
                </Badge>
              </div>
              <div className={'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'}>
                {collections.map((collection) => (
                  <SearchResultCard
                    entityType={'collection'}
                    key={collection.id}
                    result={collection}
                    testId={`${searchResultsTestId}-card-collection-${collection.id}`}
                  />
                ))}
              </div>
            </div>
          </Conditional>

          {/* Separator between Collections and Bobbleheads */}
          <Conditional isCondition={_hasCollections && _hasBobbleheads}>
            <Separator />
          </Conditional>

          {/* Bobbleheads Section */}
          <Conditional isCondition={_hasBobbleheads}>
            <div className={'space-y-3 sm:space-y-4'} data-slot={'search-results-bobbleheads-section'}>
              <div className={'flex items-center gap-2'}>
                <h3 className={'text-base font-semibold sm:text-lg'}>Bobbleheads</h3>
                <Badge className={'text-xs'} variant={'secondary'}>
                  {bobbleheads.length}
                </Badge>
              </div>
              <div className={'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4'}>
                {bobbleheads.map((bobblehead) => (
                  <SearchResultCard
                    entityType={'bobblehead'}
                    key={bobblehead.id}
                    result={bobblehead}
                    testId={`${searchResultsTestId}-card-bobblehead-${bobblehead.id}`}
                  />
                ))}
              </div>
            </div>
          </Conditional>
        </div>
      </Conditional>

      {/* List View Content */}
      <Conditional isCondition={_isListView}>
        <div
          className={cn('transition-opacity duration-200', 'animate-in fade-in-0')}
          data-slot={'search-results-list-content'}
        >
          <SearchResultsList items={listItems} testId={`${searchResultsTestId}-list`} />
        </div>
      </Conditional>
    </div>
  );
};

/**
 * Export the old name as an alias for backwards compatibility
 * @deprecated Use SearchResults instead
 */
export const SearchResultsGrid = SearchResults;
