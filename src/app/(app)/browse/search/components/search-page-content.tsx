'use client';

import { AlertCircle, Search } from 'lucide-react';
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { Fragment, useEffect, useState, useTransition } from 'react';

import type { SearchViewMode } from '@/lib/constants/enums';
import type { PublicSearchPageResponse } from '@/lib/facades/content-search/content-search.facade';

import { SearchFilters } from '@/app/(app)/browse/search/components/search-filters';
import { SearchPagination } from '@/app/(app)/browse/search/components/search-pagination';
import { SearchResults } from '@/app/(app)/browse/search/components/search-results-grid';
import { SearchResultsSkeleton } from '@/app/(app)/browse/search/components/search-skeletons';
import { EmptyState } from '@/components/ui/empty-state';
import { searchPublicContentAction } from '@/lib/actions/content-search/content-search.actions';
import { CONFIG, ENUMS } from '@/lib/constants';

export const SearchPageContent = () => {
  // useState hooks
  const [searchResults, setSearchResults] = useState<null | PublicSearchPageResponse>(null);
  const [error, setError] = useState<null | string>(null);

  // Other hooks
  const [isPending, startTransition] = useTransition();

  const [queryParams, setQueryParams] = useQueryStates(
    {
      category: parseAsString.withDefault(''),
      dateFrom: parseAsString.withDefault(''),
      dateTo: parseAsString.withDefault(''),
      entityTypes: parseAsArrayOf(parseAsStringEnum(['collection', 'bobblehead'] as const)).withDefault([
        'collection',
        'bobblehead',
      ]),
      page: parseAsInteger.withDefault(1),
      pageSize: parseAsInteger.withDefault(CONFIG.PAGINATION.SEARCH_RESULTS.DEFAULT),
      q: parseAsString.withDefault(''),
      sortBy: parseAsStringEnum([...ENUMS.SEARCH.SORT_BY]).withDefault('relevance'),
      sortOrder: parseAsStringEnum([...ENUMS.SEARCH.SORT_ORDER]).withDefault('desc'),
      tagIds: parseAsArrayOf(parseAsString).withDefault([]),
      viewMode: parseAsStringEnum([...ENUMS.SEARCH.VIEW_MODE]).withDefault('grid'),
    },
    {
      clearOnDefault: true,
      history: 'push',
    },
  );

  // useEffect hooks
  useEffect(() => {
    const executeSearch = () => {
      // Don't search if query is empty or too short
      if (!queryParams.q || queryParams.q.length < CONFIG.SEARCH.MIN_QUERY_LENGTH) {
        setSearchResults(null);
        setError(null);
        return;
      }

      startTransition(async () => {
        try {
          const result = await searchPublicContentAction({
            filters: {
              category: queryParams.category || undefined,
              dateFrom: queryParams.dateFrom || undefined,
              dateTo: queryParams.dateTo || undefined,
              entityTypes: queryParams.entityTypes,
              sortBy: queryParams.sortBy,
              sortOrder: queryParams.sortOrder,
              tagIds: queryParams.tagIds,
            },
            pagination: {
              page: queryParams.page,
              pageSize: queryParams.pageSize,
            },
            query: queryParams.q,
          });

          if (result?.data) {
            setSearchResults(result.data);
            setError(null);
          } else if (result?.serverError) {
            setError(result.serverError);
            setSearchResults(null);
          }
        } catch {
          setError('An unexpected error occurred while searching');
          setSearchResults(null);
        }
      });
    };

    executeSearch();
  }, [
    queryParams.q,
    queryParams.entityTypes,
    queryParams.tagIds,
    queryParams.sortBy,
    queryParams.sortOrder,
    queryParams.page,
    queryParams.pageSize,
    queryParams.category,
    queryParams.dateFrom,
    queryParams.dateTo,
  ]);

  // Event handlers
  const handleQueryChange = (query: string) => {
    void setQueryParams({ page: 1, q: query });
  };

  const handleFiltersChange = (filters: {
    category?: null | string;
    dateFrom?: null | string;
    dateTo?: null | string;
    entityTypes?: Array<'bobblehead' | 'collection'>;
    sortBy?: (typeof ENUMS.SEARCH.SORT_BY)[number];
    sortOrder?: (typeof ENUMS.SEARCH.SORT_ORDER)[number];
    tagIds?: Array<string>;
  }) => {
    void setQueryParams({ ...filters, page: 1 });
  };

  const handleViewModeChange = (viewMode: SearchViewMode) => {
    void setQueryParams({ viewMode });
  };

  const handlePageChange = (page: number) => {
    void setQueryParams({ page });
  };

  // Derived variables for conditional rendering
  const _hasQuery = queryParams.q.length >= CONFIG.SEARCH.MIN_QUERY_LENGTH;
  const _isLoading = isPending;
  const _hasError = !!error;
  const _hasResults = searchResults && searchResults.counts.total > 0;
  const _hasNoResults = searchResults && searchResults.counts.total === 0;
  const _isShowEmptyState = !_hasQuery && !_isLoading && !searchResults;
  const _isShowResultsWithPagination = _hasResults && !_isLoading && searchResults;

  return (
    <div className={'space-y-6'}>
      {/* Search Filters */}
      <SearchFilters
        category={queryParams.category}
        dateFrom={queryParams.dateFrom}
        dateTo={queryParams.dateTo}
        entityTypes={queryParams.entityTypes}
        onFiltersChange={handleFiltersChange}
        onQueryChange={handleQueryChange}
        query={queryParams.q}
        sortBy={queryParams.sortBy}
        sortOrder={queryParams.sortOrder}
        tagIds={queryParams.tagIds}
      />

      {/* Loading State */}
      {_isLoading && <SearchResultsSkeleton viewMode={queryParams.viewMode} />}

      {/* Error State */}
      {_hasError && !_isLoading && (
        <EmptyState description={error || 'Please try again'} icon={AlertCircle} title={'Search Error'} />
      )}

      {/* Empty State - No Query */}
      {_isShowEmptyState && (
        <EmptyState
          description={'Enter a search query to find collections and bobbleheads'}
          icon={Search}
          title={'Start Searching'}
        />
      )}

      {/* No Results State */}
      {_hasNoResults && !_isLoading && (
        <EmptyState
          description={'Try different keywords or adjust your filters'}
          icon={Search}
          title={'No Results Found'}
        />
      )}

      {/* Search Results */}
      {_isShowResultsWithPagination && (
        <Fragment>
          {/* Results Grid */}
          <SearchResults
            bobbleheads={searchResults.bobbleheads}
            collections={searchResults.collections}
            counts={searchResults.counts}
            onViewModeChange={handleViewModeChange}
            viewMode={queryParams.viewMode}
          />

          {/* Pagination */}
          <SearchPagination
            hasNextPage={searchResults.pagination.hasNextPage}
            hasPreviousPage={searchResults.pagination.hasPreviousPage}
            onPageChange={handlePageChange}
            page={searchResults.pagination.page}
            totalPages={searchResults.pagination.totalPages}
          />
        </Fragment>
      )}
    </div>
  );
};
